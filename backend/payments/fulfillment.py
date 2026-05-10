import ast
import json
import os
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import requests
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from reloady import reloady, urls


TWO_DP = Decimal("0.01")


def normalize_money(value, fallback="0.00"):
    try:
        return str(Decimal(str(value)).quantize(TWO_DP, rounding=ROUND_HALF_UP))
    except (InvalidOperation, TypeError, ValueError):
        return fallback


def extract_product_image(value):
    if isinstance(value, (list, tuple)):
        for item in value:
            image = extract_product_image(item)
            if image:
                return image
        return ""

    if isinstance(value, dict):
        for key in ("img", "image", "src", "url"):
            image = extract_product_image(value.get(key))
            if image:
                return image
        return ""

    if value is None:
        return ""

    if isinstance(value, str):
        normalized = value.strip()
        if not normalized or normalized.lower() == "none":
            return ""

        if normalized.startswith("[") or normalized.startswith("{"):
            try:
                return extract_product_image(json.loads(normalized))
            except (TypeError, ValueError, json.JSONDecodeError):
                try:
                    return extract_product_image(ast.literal_eval(normalized))
                except (SyntaxError, ValueError):
                    pass

        return normalized

    return ""


def get_product_value(source, *keys, default=None):
    for key in keys:
        if isinstance(source, dict):
            value = source.get(key)
        else:
            value = getattr(source, key, None)

        if value is not None:
            return value
    return default


def serialize_giftcard_product(source):
    return {
        "product_name": get_product_value(source, "productName", "product_name"),
        "product_id": get_product_value(source, "productId", "product_id"),
        "quantity": get_product_value(source, "quantity", default=1),
        "recipient_amount": get_product_value(source, "recipientAmount", "recipient_amount"),
        "recipient_currency": get_product_value(
            source,
            "recipientCurrency",
            "recipient_currency",
        ),
        "amount_to_pay": get_product_value(source, "AmountToPay", "amount_to_pay"),
        "currency_to_pay_in": get_product_value(
            source,
            "currencyToPayIn",
            "currency_to_pay_in",
        ),
        "product_image": extract_product_image(
            get_product_value(source, "img", "product_image", "image")
        ),
    }


def send_topup_completion_email(
    send_order_update_email,
    *,
    email,
    reference,
    operator_name,
    edited_number,
    receiver_amount,
    receiver_currency,
    paid_amount,
    payment_currency,
):
    send_order_update_email(
        email=email,
        subject="Order update: top-up completed",
        heading="Your airtime top-up is complete",
        preheader="Your top-up order was completed successfully.",
        status_label="Completed",
        rows=[
            {"label": "Reference", "value": reference},
            {"label": "Operator", "value": operator_name},
            {"label": "Phone", "value": edited_number},
            {
                "label": "Recipient receives",
                "value": f"{receiver_amount} {receiver_currency}",
            },
            {
                "label": "You paid",
                "value": f"{paid_amount} {payment_currency}",
            },
        ],
    )


def build_giftcard_email_entries(transaction_products):
    entries = []

    for item in transaction_products:
        product_payload = {}
        if item.product:
            try:
                product_payload = json.loads(item.product)
            except (TypeError, ValueError, json.JSONDecodeError):
                product_payload = {}

        redeem_payload = []
        if item.redeem_data:
            try:
                redeem_payload = json.loads(item.redeem_data)
            except (TypeError, ValueError, json.JSONDecodeError):
                redeem_payload = []

        if not isinstance(redeem_payload, list):
            redeem_payload = []

        for index, redeem in enumerate(redeem_payload, start=1):
            entries.append(
                {
                    "product_name": product_payload.get("productName") or "Gift card",
                    "product_image": extract_product_image(product_payload.get("img")),
                    "sequence": index,
                    "card_number": redeem.get("cardNumber") or "",
                    "pin_code": redeem.get("pinCode") or "",
                }
            )

    return entries


def send_giftcard_codes_email(
    send_order_update_email,
    *,
    email,
    reference,
    paid_amount,
    payment_currency,
    card_entries,
    product_items=None,
):
    rows = [
        {"label": "Reference", "value": reference},
        {"label": "You paid", "value": f"{paid_amount} {payment_currency}"},
        {"label": "Cards ready", "value": str(len(card_entries))},
    ]

    for entry in card_entries:
        label_base = f"{entry['product_name']} #{entry['sequence']}"
        rows.append(
            {"label": f"{label_base} card", "value": entry["card_number"] or "N/A"}
        )
        rows.append(
            {"label": f"{label_base} pin", "value": entry["pin_code"] or "N/A"}
        )

    send_order_update_email(
        email=email,
        subject="Order update: your gift card details are ready",
        heading="Your gift card details are ready",
        preheader="Your gift-card order has been completed. Your card number and pin are included below.",
        status_label="Completed",
        rows=rows,
        product_items=product_items,
    )


def get_platform_config():
    from api.models import DigiShelfData

    config, _ = DigiShelfData.objects.get_or_create(
        id=1,
        defaults={
            "profit_percentage": 5,
            "processing_fee": 2,
            "giftcard_processing_fee": 5,
            "order_mode": "auto",
        },
    )
    return config


def summarize_fulfillment_payload(fulfillment_type, payload, *, amount=None, token_symbol=None):
    payload = payload or {}

    if fulfillment_type == "topup":
        operator = payload.get("oparatorData", {}).get("data", {})
        return {
            "type": "topup",
            "reference": payload.get("transaction", {}).get("reference"),
            "recipient": payload.get("editNumber"),
            "operator": operator.get("name"),
            "operator_logo": (operator.get("logoUrls") or [None])[0],
            "receiver_amount": payload.get("receiverAmount"),
            "receiver_currency": payload.get("receiverCurrency"),
            "processing_fee": payload.get("ProcessingFee"),
            "total_paid": payload.get("amountPaid"),
            "payment_currency": payload.get("PaymentCurreuncy") or "USD",
            "email": payload.get("email"),
            "country": payload.get("country"),
        }

    if fulfillment_type == "giftcard":
        transaction = payload.get("transaction", {})
        products = transaction.get("products") or []
        return {
            "type": "giftcard",
            "reference": transaction.get("reference"),
            "email": transaction.get("email"),
            "country": transaction.get("country"),
            "total_paid": str(amount) if amount is not None else payload.get("amount"),
            "payment_currency": payload.get("payment_currency") or token_symbol or "USD",
            "product_count": len(products),
            "products": [serialize_giftcard_product(item) for item in products],
        }

    return {"type": fulfillment_type or "none"}


def build_order_summary(order):
    snapshot = order.summary_snapshot or {}
    if snapshot:
        if order.fulfillment_type == order.FulfillmentType.GIFTCARD:
            snapshot_products = snapshot.get("products") or []
            payload_products = (
                (order.fulfillment_payload or {}).get("transaction", {}).get("products")
                or []
            )
            if snapshot_products and payload_products:
                merged_products = []
                for index, item in enumerate(snapshot_products):
                    payload_item = payload_products[index] if index < len(payload_products) else {}
                    merged_item = {
                        **serialize_giftcard_product(payload_item),
                        **item,
                    }
                    merged_item["product_image"] = (
                        item.get("product_image")
                        or serialize_giftcard_product(payload_item).get("product_image")
                        or ""
                    )
                    merged_products.append(merged_item)

                if merged_products:
                    return {
                        **snapshot,
                        "products": merged_products,
                    }
        return snapshot

    return summarize_fulfillment_payload(
        order.fulfillment_type,
        order.fulfillment_payload,
        amount=order.amount,
        token_symbol=order.token_symbol,
    )


def extract_customer_email(fulfillment_type, payload):
    summary = summarize_fulfillment_payload(fulfillment_type, payload)
    return (summary.get("email") or "").strip()


def attach_customer_email(fulfillment_type, payload, email):
    normalized_email = (email or "").strip()
    if not normalized_email:
        return payload or {}

    payload = dict(payload or {})

    if fulfillment_type == "topup":
        payload["email"] = normalized_email
        return payload

    if fulfillment_type == "giftcard":
        transaction = dict(payload.get("transaction") or {})
        transaction["email"] = normalized_email
        payload["transaction"] = transaction
        return payload

    return payload


def complete_order(order, *, actor="auto"):
    if order.fulfillment_type == order.FulfillmentType.TOPUP:
        return complete_topup_order(order, actor=actor)
    if order.fulfillment_type == order.FulfillmentType.GIFTCARD:
        return complete_giftcard_order(order, actor=actor)
    raise ValidationError("Unsupported fulfillment type.")


def complete_topup_order(order, *, actor="auto"):
    from api import models, serializers
    from api.views import send_order_update_email

    if order.fulfillment_type != order.FulfillmentType.TOPUP:
        raise ValidationError("Only top-up orders can be completed here.")

    if order.status != order.Status.PAID:
        raise ValidationError("Payment is not confirmed yet.")

    if order.fulfillment_status == order.FulfillmentStatus.COMPLETED:
        return {"status": "already_completed"}

    payload = order.fulfillment_payload or {}
    required_fields = [
        "transaction",
        "receiverAmount",
        "receiverCurrency",
        "ProcessingFee",
        "amountPaid",
        "PaymentCurreuncy",
        "PaymentMethod",
        "oparatorData",
        "editNumber",
        "country",
    ]
    missing = [field for field in required_fields if field not in payload]
    if missing:
        raise ValidationError(f"Missing fulfillment fields: {', '.join(missing)}")

    transaction_data = payload.get("transaction") or {}
    reference = transaction_data.get("reference")
    if not reference:
        raise ValidationError("Missing fulfillment reference.")

    with transaction.atomic():
        order.fulfillment_status = order.FulfillmentStatus.PROCESSING
        order.fulfillment_error = ""
        order.save(update_fields=["fulfillment_status", "fulfillment_error"])

    try:
        operator_data = payload.get("oparatorData") or {}
        operator = operator_data.get("data") or {}
        country = operator.get("country") or {}
        receiver_amount = payload.get("receiverAmount")
        receiver_currency = payload.get("receiverCurrency")
        payment_currency = payload.get("PaymentCurreuncy")
        amount_paid = payload.get("amountPaid")
        processing_fee = payload.get("ProcessingFee")
        email = payload.get("email")
        edited_number = payload.get("editNumber")
        user_type = payload.get("userType")

        reloady_object = reloady.Reloady(
            os.getenv("api_clien"),
            os.getenv("api_client_secret"),
            urls.token_url,
        )

        request_payload = {
            "operatorId": operator.get("operatorId"),
            "amount": receiver_amount,
            "useLocalAmount": True,
            "customIdentifier": reference,
            "recipientEmail": email,
            "recipientPhone": {
                "countryCode": country.get("isoName"),
                "number": edited_number,
            },
        }

        user = ""
        normalized_user_type = user_type
        if user_type and user_type != "guest":
            user = user_type.get("id")
            normalized_user_type = "user"

        base_transaction_record = {
            "user": user,
            "user_type": normalized_user_type or "guest",
            "reference": reference,
            "operator": operator.get("name"),
            "phone_number": edited_number,
            "receiver_amount": receiver_amount,
            "receiver_country": country.get("name"),
            "receiver_currency_code": receiver_currency,
            "total_paid": normalize_money(amount_paid, fallback=normalize_money(order.amount)),
            "sender_currency": payment_currency,
            "sender_country": payload.get("country"),
            "processing_fee": normalize_money(processing_fee),
            "payment_method": payload.get("PaymentMethod"),
            "email": email,
            "paystack_very_transaction": {
                "provider": "erc20_stablecoin",
                "order_id": str(order.public_id),
                "wallet_address": order.wallet_address,
                "amount": str(order.amount),
                "token_symbol": order.token_symbol,
                "status": order.status,
                "transaction_hash": order.paid_transaction_hash,
                "paid_at": order.paid_at.isoformat() if order.paid_at else None,
                "completed_by": actor,
            },
            "country": payload.get("country"),
        }

        response = reloady_object.make_api_request(
            urls.airtime_top_up,
            "application/com.reloadly.topups-v1+json",
            "https://topups-sandbox.reloadly.com",
            "POST",
            request_payload,
        )

        if not response:
            raise ValidationError("Reloadly did not return a completion response.")

        existing = models.TopupTransaction.objects.filter(reference=reference).first()
        if existing:
            order.fulfillment_status = order.FulfillmentStatus.COMPLETED
            order.fulfilled_at = timezone.now()
            order.save(update_fields=["fulfillment_status", "fulfilled_at"])
            return {"status": "already_completed", "reference": reference}

        transaction_record = {
            **base_transaction_record,
            "reloader_transaction": response,
            "status": response.get("status"),
        }

        serializer = serializers.AirtimTopUpSerializer(data=transaction_record)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        order.fulfillment_status = order.FulfillmentStatus.COMPLETED
        order.fulfillment_error = ""
        order.fulfilled_at = timezone.now()
        order.save(
            update_fields=[
                "fulfillment_status",
                "fulfillment_error",
                "fulfilled_at",
            ]
        )

        send_topup_completion_email(
            send_order_update_email,
            email=email,
            reference=reference,
            operator_name=operator.get("name"),
            edited_number=edited_number,
            receiver_amount=receiver_amount,
            receiver_currency=receiver_currency,
            paid_amount=normalize_money(amount_paid, fallback=normalize_money(order.amount)),
            payment_currency=payment_currency,
        )

        return {"status": "completed", "reference": reference, "reloadly": response}
    except requests.exceptions.HTTPError as exc:
        response = exc.response
        error_payload = {}
        if response is not None:
            try:
                error_payload = response.json()
            except ValueError:
                error_payload = {}

        if error_payload.get("errorCode") == "CUSTOM_IDENTIFIER_ALREADY_USED":
            existing = models.TopupTransaction.objects.filter(reference=reference).first()
            if not existing:
                duplicate_record = {
                    **base_transaction_record,
                    "reloader_transaction": {
                        **error_payload,
                        "status": "SUCCESSFUL",
                        "customIdentifier": reference,
                        "reconciled_duplicate": True,
                    },
                    "status": "SUCCESSFUL",
                }
                serializer = serializers.AirtimTopUpSerializer(data=duplicate_record)
                serializer.is_valid(raise_exception=True)
                serializer.save()

            order.fulfillment_status = order.FulfillmentStatus.COMPLETED
            order.fulfillment_error = ""
            order.fulfilled_at = timezone.now()
            order.save(
                update_fields=[
                    "fulfillment_status",
                    "fulfillment_error",
                    "fulfilled_at",
                ]
            )

            send_topup_completion_email(
                send_order_update_email,
                email=email,
                reference=reference,
                operator_name=operator.get("name"),
                edited_number=edited_number,
                receiver_amount=receiver_amount,
                receiver_currency=receiver_currency,
                paid_amount=normalize_money(amount_paid, fallback=normalize_money(order.amount)),
                payment_currency=payment_currency,
            )

            return {
                "status": "completed_duplicate",
                "reference": reference,
                "reloadly": error_payload,
            }

        order.fulfillment_status = order.FulfillmentStatus.FAILED
        order.fulfillment_error = str(exc)
        order.save(update_fields=["fulfillment_status", "fulfillment_error"])
        raise
    except Exception as exc:
        order.fulfillment_status = order.FulfillmentStatus.FAILED
        order.fulfillment_error = str(exc)
        order.save(update_fields=["fulfillment_status", "fulfillment_error"])
        raise


def complete_giftcard_order(order, *, actor="auto"):
    from api import models, serializers, tasks
    from api.views import send_order_update_email

    if order.fulfillment_type != order.FulfillmentType.GIFTCARD:
        raise ValidationError("Only gift card orders can be completed here.")

    if order.status != order.Status.PAID:
        raise ValidationError("Payment is not confirmed yet.")

    if order.fulfillment_status == order.FulfillmentStatus.COMPLETED:
        return {"status": "already_completed"}

    payload = order.fulfillment_payload or {}
    transaction_data = dict(payload.get("transaction") or {})
    payment_details_data = payload.get("payment_details") or {}
    user_device_data = payload.get("user_device") or {}
    order_products = transaction_data.get("products") or []
    product_items = [serialize_giftcard_product(product) for product in order_products]
    reference = transaction_data.get("reference")

    if not reference:
        raise ValidationError("Missing gift card reference.")
    if not order_products:
        raise ValidationError("Missing gift card products.")

    with transaction.atomic():
        order.fulfillment_status = order.FulfillmentStatus.PROCESSING
        order.fulfillment_error = ""
        order.save(update_fields=["fulfillment_status", "fulfillment_error"])

    try:
        existing = models.GiftCardTransaction.objects.filter(reference=reference).first()
        if existing:
            order.fulfillment_status = order.FulfillmentStatus.COMPLETED
            order.fulfilled_at = timezone.now()
            order.save(update_fields=["fulfillment_status", "fulfilled_at"])
            return {"status": "already_completed", "reference": reference}

        user_type = transaction_data.get("user_type")
        if isinstance(user_type, dict):
            transaction_data["user"] = user_type.get("id")
            transaction_data["user_type"] = "user"
        elif user_type == "guest" or not user_type:
            transaction_data["user_type"] = "guest"
        else:
            transaction_data["user_type"] = str(user_type)

        transaction_serializer = serializers.GiftCardTransactionSerializer(
            data=transaction_data
        )
        transaction_serializer.is_valid(raise_exception=True)
        transaction_instance = transaction_serializer.save()
        transaction_instance.refresh_from_db()

        for product_data in order_products:
            product_payload = {
                **product_data,
                "GiftCardTransaction": transaction_instance.id,
                "img": str(product_data.get("img")),
            }
            product_payload.pop("id", None)
            product_serializer = serializers.GiftCardTransactionOrderProductSerialixer(
                data=product_payload
            )
            product_serializer.is_valid(raise_exception=True)
            product_serializer.save()

        payment_details_data["GiftCardTransaction"] = transaction_instance.id
        payment_details_serializer = serializers.PaymentDetailsSerializer(
            data=payment_details_data
        )
        payment_details_serializer.is_valid(raise_exception=True)
        payment_details_serializer.save()

        user_device_data["GiftCardTransaction"] = transaction_instance.id
        user_device_serializer = serializers.UserDeviceGiftCardPaymentSerializer(
            data=user_device_data
        )
        user_device_serializer.is_valid(raise_exception=True)
        user_device_serializer.save()

        for index, product_request in enumerate(order_products):
            tasks.make_api_requests.run(
                product_request,
                index,
                transaction_data,
                transaction_instance.id,
            )

        completed_transactions = list(
            transaction_instance.transactions_details_completed.all()
        )
        card_entries = build_giftcard_email_entries(completed_transactions)

        order.fulfillment_status = order.FulfillmentStatus.COMPLETED
        order.fulfillment_error = ""
        order.fulfilled_at = timezone.now()
        order.save(
            update_fields=[
                "fulfillment_status",
                "fulfillment_error",
                "fulfilled_at",
            ]
        )

        if card_entries:
            send_giftcard_codes_email(
                send_order_update_email,
                email=transaction_data.get("email"),
                reference=reference,
                paid_amount=transaction_data.get("amount"),
                payment_currency="USD",
                card_entries=card_entries,
                product_items=product_items,
            )
        else:
            send_order_update_email(
                email=transaction_data.get("email"),
                subject="Order update: gift card request received",
                heading="Your gift card order is being processed",
                preheader="We received your order and started processing your gift card purchase.",
                status_label="Processing",
                rows=[
                    {"label": "Reference", "value": reference},
                    {"label": "Amount", "value": transaction_data.get("amount")},
                    {
                        "label": "Payment method",
                        "value": (transaction_data.get("payment_method") or "crypto").upper(),
                    },
                    {"label": "Items", "value": str(len(order_products))},
                    {"label": "Handled by", "value": actor},
                ],
                product_items=product_items,
            )

        return {"status": "completed", "reference": reference}
    except Exception as exc:
        order.fulfillment_status = order.FulfillmentStatus.FAILED
        order.fulfillment_error = str(exc)
        order.save(update_fields=["fulfillment_status", "fulfillment_error"])
        raise
