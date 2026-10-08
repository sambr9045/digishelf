"""Paystack checkout: server-priced orders and verified, idempotent settlement."""
import hashlib
import hmac
import ipaddress
import json
import logging
import os
import secrets
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import requests
from django.core.cache import cache
from django.core import signing
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from reloady import reloady, urls
from .models import Order, WalletIndex
from .provider_pricing import provider_cost
from .fulfillment import complete_order, get_platform_config, summarize_fulfillment_payload
from .views import make_completion_token
from .notifications import send_admin_new_order_notification, send_admin_order_paid_notification


logger = logging.getLogger(__name__)


def secret_key(country):
    return os.getenv(f"PAYSTACK_SECRET_KEY_{country}") or os.getenv("PAYSTACK_SECRET_KEY", "")


def visitor_country(request):
    # nginx overwrites X-Real-IP. A public IP hint supports local/private proxies;
    # the country is always resolved by the server, never supplied by the browser.
    raw_ip = request.META.get("HTTP_X_REAL_IP") or request.META.get("REMOTE_ADDR", "")
    try:
        address = ipaddress.ip_address(raw_ip)
    except ValueError:
        return ""
    if not address.is_global:
        hint = request.query_params.get("visitor_ip") if request.method == "GET" else request.data.get("visitor_ip")
        try:
            address = ipaddress.ip_address(hint or "")
        except ValueError:
            return ""
        if not address.is_global:
            return ""
    key = f"paystack:geo:{address}"
    cached = cache.get(key)
    if cached is not None:
        return cached
    try:
        response = requests.get(f"https://ipapi.co/{address}/json/", timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("Payment country lookup failed (%s)", type(exc).__name__)
        raise ValueError("We could not confirm your payment country. Please retry shortly.") from None
    data = response.json()
    country = str(data.get("country_code") or "").upper()
    if data.get("error") or len(country) != 2:
        return ""
    cache.set(key, country, 3600)
    return country


def payment_options(country):
    enabled = country in {"GH", "NG"}
    return {
        "country": country,
        "configured": enabled and bool(secret_key(country)),
        "currency": "GHS" if country == "GH" else "NGN" if country == "NG" else None,
        "channels": (["card", "mobile_money"] if country == "GH" else ["card"]) if enabled else [],
    }


def paystack_request(country, path, payload=None):
    key = secret_key(country)
    if not key:
        raise ValueError("Paystack is not configured for this country.")
    response = requests.request(
        "POST" if payload is not None else "GET",
        f"https://api.paystack.co/{path}",
        headers={"Authorization": f"Bearer {key}"}, json=payload, timeout=20,
    )
    data = response.json()
    if not response.ok or not data.get("status"):
        raise ValueError(data.get("message") or "Paystack could not process this request.")
    return data["data"]


def exchange_rates():
    rates = cache.get("paystack:exchange-rates")
    if rates:
        return rates
    endpoints = ["https://open.er-api.com/v6/latest/USD"]
    api_key = os.getenv("FIA_CURRENCY_EXCHANGE_API_KEY")
    if api_key:
        endpoints.append(urls.get_exchange_fiat_url(api_key))
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            response.raise_for_status()
            data = response.json()
            rates = data.get("conversion_rates") or data.get("rates")
            if data.get("result") != "success" or not isinstance(rates, dict):
                continue
            required = [Decimal(str(rates[currency])) for currency in ("USD", "EUR", "GHS", "NGN")]
            if any(not rate.is_finite() or rate <= 0 for rate in required):
                continue
            cache.set("paystack:exchange-rates", rates, 24 * 60 * 60)
            return rates
        except (requests.RequestException, ValueError, KeyError, TypeError, InvalidOperation):
            continue
    raise ValueError("Exchange rates are temporarily unavailable. Please retry your payment quote.")


def catalog_product(client, product_id, *, verify_live=False):
    cached_product = None if verify_live else cache.get(f"giftcard:product:{product_id}")
    if isinstance(cached_product, dict):
        return cached_product
    # Reuse the same server-owned catalog cache that supplies the product page.
    for params in (() if verify_live else (
        {"type": None, "productId": str(product_id), "page": "1", "size": "60"},
        {"type": None, "productId": None, "page": "1", "size": "60"},
    )):
        key = "giftcards:" + hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()
        cached = cache.get(key)
        if isinstance(cached, dict):
            candidates = cached.get("content", []) if params["productId"] is None else [cached]
            for product in candidates:
                if str(product.get("productId")) == str(product_id):
                    return product
    try:
        product = client.make_api_request(urls.gift_card_product_id(product_id), "application/com.reloadly.giftcards-v1+json", urls.giftcards_audience)
    except requests.RequestException as exc:
        provider_status = getattr(getattr(exc, "response", None), "status_code", None)
        logger.warning("Gift card pricing lookup failed: product=%s status=%s kind=%s", product_id, provider_status, type(exc).__name__)
        if provider_status in {401, 403}:
            raise ValueError("Gift card payments are temporarily unavailable because product verification failed. Please contact support.") from None
        raise ValueError("We could not verify this gift card's current price. Please retry shortly.") from None
    cache.set(f"giftcard:product:{product_id}", product, 3600)
    return product


def price_cart(items, rates, *, verify_live=False):
    if not isinstance(items, list) or not items or len(items) > 50:
        raise ValueError("Choose between 1 and 50 gift card products.")
    client = reloady.Reloady(os.getenv("api_clien"), os.getenv("api_client_secret"), urls.token_url)
    config = get_platform_config()
    products, total = [], Decimal("0")
    for item in items:
        product_id = int(item["productId"])
        quantity = int(item.get("quantity", 1))
        if str(quantity) != str(item.get("quantity", 1)) or not 1 <= quantity <= 20:
            raise ValueError("Gift card quantity must be between 1 and 20.")
        product = catalog_product(client, product_id, verify_live=verify_live)
        value = Decimal(str(item["recipientAmount"]))
        if not value.is_finite() or value <= 0:
            raise ValueError("Invalid gift card value.")
        if product.get("denominationType") == "FIXED":
            allowed = [Decimal(str(v)) for v in product.get("fixedRecipientDenominations", [])]
            if value not in allowed:
                raise ValueError("This gift card value is unavailable.")
        elif not Decimal(str(product["minRecipientDenomination"])) <= value <= Decimal(str(product["maxRecipientDenomination"])):
            raise ValueError("Gift card value is outside the available range.")
        currency = product["recipientCurrencyCode"]
        price, cost_snapshot = provider_cost(client, product, value, rates)
        fee = (price * Decimal(str(config.giftcard_processing_fee)) / 100 + (Decimal("2") if price < 500 else Decimal("-2"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total += (price + fee) * quantity
        products.append({
            "productId": product_id, "productName": product["productName"],
            "recipientAmount": str(value), "recipientCurrency": currency,
            "quantity": quantity, "AmountToPay": str(price), "currencyToPayIn": "USD",
            "processing_fee": "2", "img": product.get("logoUrls", []),
            "provider_cost": cost_snapshot,
        })
    if not total.is_finite() or total <= 0:
        raise ValueError("Invalid order total.")
    return products, total


def quote(request, country):
    options = payment_options(country)
    channel = request.data.get("channel", "card")
    if not options["channels"] or (channel != "paystack" and channel not in options["channels"]):
        raise ValueError("This payment method is unavailable in your location.")
    if not options["configured"]:
        raise ValueError("Paystack payments are being set up. Please use crypto for now.")
    rates = exchange_rates()
    products, usd_total = price_cart(request.data.get("products"), rates, verify_live=True)
    local_total = (usd_total * Decimal(str(rates[options["currency"]]))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return options, channel, products, usd_total, local_total


class PaystackOptionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            return Response(payment_options("GH"))
        except requests.RequestException:
            return Response(payment_options(""))


class PaystackQuoteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            options, channel, products, usd_total, local_total = quote(request, "GH")
            token = signing.dumps({"products": products, "usd_total": str(usd_total), "amount": str(local_total),
                "currency": options["currency"], "channel": channel}, salt="paystack.price-quote", compress=True)
            usd_subtotal = sum((Decimal(product["AmountToPay"]) * product["quantity"] for product in products), Decimal("0"))
            local_subtotal = (usd_subtotal * local_total / usd_total).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            return Response({"subtotal": str(local_subtotal), "fees": str(local_total - local_subtotal),
                "amount": str(local_total), "currency": options["currency"], "usd_amount": str(usd_total),
                "quote_token": token, "expires_in": 600})
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        except requests.RequestException:
            logger.warning("Paystack quote provider request failed", exc_info=False)
            return Response({"error": "Payment pricing is temporarily unavailable. Please retry shortly."}, status=503)
        except (KeyError, TypeError, InvalidOperation):
            logger.warning("Paystack quote invalid product or currency data", exc_info=False)
            return Response({"error": "This cart contains unavailable product or currency details. Please remove the item and add it again."}, status=400)


class PaystackInitializeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            country = "GH"
            options = payment_options(country)
            quote_token = request.data.get("quote_token")
            if quote_token:
                try:
                    saved_quote = signing.loads(quote_token, salt="paystack.price-quote", max_age=600)
                except signing.BadSignature:
                    raise ValueError("Your payment quote expired. Please refresh the quote.") from None
                channel = saved_quote["channel"]
                if channel != request.data.get("channel") or saved_quote["currency"] != options["currency"]:
                    raise ValueError("Refresh your payment quote after changing the payment method.")
                products = saved_quote["products"]
                usd_total = Decimal(saved_quote["usd_total"])
                local_total = Decimal(saved_quote["amount"])
            else:
                options, channel, products, usd_total, local_total = quote(request, country)
            if (str(request.data.get("expected_amount")) != str(local_total)
                    or request.data.get("expected_currency") != options["currency"]):
                raise ValueError("The payment total changed. Please refresh the quote.")
            local_rate = local_total / usd_total
            products = [{**product,
                "AmountToPay": str((Decimal(product["AmountToPay"]) * local_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
                "currencyToPayIn": options["currency"],
            } for product in products]
            email = str(request.data.get("email") or "").strip()
            validate_email(email)
            reference = f"DSP-{secrets.token_hex(16)}"
            minor = int(local_total * 100)
            user = request.user if request.user.is_authenticated else None
            payload = {
                "transaction": {"reference": reference, "products": products, "amount": str(local_total), "country": country, "email": email, "user": user.pk if user else None, "user_type": "user" if user else "guest", "payment_method": "paystack"},
                "payment_details": {"message": "Awaiting Paystack payment", "status": "pending", "transaction": reference, "trxref": reference},
                "user_device": {"ip_address": request.META.get("HTTP_X_REAL_IP") or request.META.get("REMOTE_ADDR", "")},
                "payment_currency": options["currency"],
            }
            with transaction.atomic():
                state, _ = WalletIndex.objects.select_for_update().get_or_create(pk=1, defaults={"next_index": 0})
                maximum = Order.objects.order_by("-wallet_index").values_list("wallet_index", flat=True).first()
                index = max(state.next_index, (maximum + 1) if maximum is not None else 0)
                order = Order.objects.create(amount=usd_total, wallet_address="", wallet_index=index,
                    payment_provider="paystack", provider_reference=reference,
                    payment_currency=options["currency"], payment_amount_minor=minor,
                    fulfillment_type="giftcard", customer_email=email, fulfillment_payload=payload,
                    summary_snapshot=summarize_fulfillment_payload("giftcard", payload, amount=local_total))
                state.next_index = index + 1
                state.save(update_fields=["next_index", "updated_at"])
            site_url = os.getenv("PUBLIC_SITE_URL", "https://digishelves.com").rstrip("/")
            data = paystack_request(country, "transaction/initialize", {
                "reference": reference, "email": email, "amount": minor,
                "currency": options["currency"], "channels": options["channels"] if channel == "paystack" else [channel],
                "callback_url": f"{site_url}/gift-card/paystack/{reference}",
            })
            send_admin_new_order_notification(order, order.summary_snapshot)
            return Response({"authorization_url": data["authorization_url"], "access_code": data.get("access_code", ""), "reference": reference, "order_id": order.payment_code}, status=201)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        except Exception:
            return Response({"error": "Unable to start Paystack payment. Please try again."}, status=400)


def settle(reference):
    order = Order.objects.get(payment_provider="paystack", provider_reference=reference)
    country = order.fulfillment_payload["transaction"]["country"]
    data = paystack_request(country, f"transaction/verify/{reference}")
    if data.get("status") != "success":
        return order
    if (data.get("reference") != reference or data.get("currency") != order.payment_currency
            or int(data.get("amount", -1)) != order.payment_amount_minor
            or str(data.get("customer", {}).get("email", "")).lower() != order.customer_email.lower()):
        raise ValueError("Payment details do not match the order.")
    newly_paid = False
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.status != Order.Status.PAID:
            newly_paid = True
            order.status = Order.Status.PAID
            order.paid_at = timezone.now()
            payload = order.fulfillment_payload
            payload["payment_details"].update(message="Paystack payment verified", status="success")
            order.fulfillment_payload = payload
            order.save(update_fields=["status", "paid_at", "fulfillment_payload"])
    if newly_paid:
        send_admin_order_paid_notification(order, order.summary_snapshot)
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.fulfillment_status == Order.FulfillmentStatus.PENDING and get_platform_config().order_mode == "auto":
            complete_order(order, actor="paystack")
    return order


class PaystackVerifyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            order = settle(reference)
            return Response({"status": order.status, "fulfillment_status": order.fulfillment_status,
                "completion_token": make_completion_token(order) if order.status == Order.Status.PAID else ""})
        except Order.DoesNotExist:
            return Response({"error": "Payment order not found."}, status=404)
        except Exception:
            return Response({"error": "Payment verification is temporarily unavailable. Please retry."}, status=400)


class PaystackWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        body = request.body
        signature = request.headers.get("X-Paystack-Signature", "")
        keys = {secret_key(country) for country in ("GH", "NG")} - {""}
        if not any(hmac.compare_digest(hmac.new(key.encode(), body, hashlib.sha512).hexdigest(), signature) for key in keys):
            return Response(status=401)
        if request.data.get("event") == "charge.success":
            try:
                settle(request.data["data"]["reference"])
            except Order.DoesNotExist:
                pass
            except Exception:
                return Response(status=503)
        return Response({"received": True})
