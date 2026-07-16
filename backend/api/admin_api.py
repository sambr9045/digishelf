import os
import hashlib
import secrets
from pathlib import Path
from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta
from collections import defaultdict

from django.core import signing
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.db.models import Count, Q
from dotenv import dotenv_values, load_dotenv
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
import requests

from payments.fulfillment import (
    build_order_summary,
    complete_order,
    serialize_giftcard_product,
)
from payments.models import Order as PaymentOrder
from payments.views import serialize_payment_activity

from .models import Account, AdminLoginAudit, AnalyticsEvent, BlockedUrl, Cart, Contact, DigiShelfData, GiftCardTransaction, TopupTransaction
from . import serializers
from .views import SITEMAP_GIFTCARD_MAX_PAGES

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"

load_dotenv(ENV_PATH, override=True)

ADMIN_TOKEN_SALT = "digishelf.admin"
ADMIN_TOKEN_MAX_AGE_SECONDS = int(os.getenv("ADMIN_TOKEN_MAX_AGE_SECONDS", "43200"))
ADMIN_LOGIN_CODE_TTL_SECONDS = int(os.getenv("ADMIN_LOGIN_CODE_TTL_SECONDS", "600"))
ADMIN_LOGIN_LOCKOUT_SECONDS = int(os.getenv("ADMIN_LOGIN_LOCKOUT_SECONDS", "180"))
ADMIN_LOGIN_MAX_FAILURES = int(os.getenv("ADMIN_LOGIN_MAX_FAILURES", "3"))
ADMIN_RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
ANALYTICS_TRAFFIC_WINDOW_DAYS = int(os.getenv("ANALYTICS_TRAFFIC_WINDOW_DAYS", "7"))
ANALYTICS_ABANDONED_CART_MINUTES = int(os.getenv("ANALYTICS_ABANDONED_CART_MINUTES", "180"))
ADMIN_PAGE_TRAFFIC_PAGE_SIZE = int(os.getenv("ADMIN_PAGE_TRAFFIC_PAGE_SIZE", "25"))


def get_env_value(*names):
    file_values = dotenv_values(ENV_PATH)
    for name in names:
        value = file_values.get(name)
        if value:
            return str(value).strip()

        value = os.getenv(name)
        if value:
            return value.strip()
    return None


def get_admin_credentials(*, require_secret=True):
    email = get_env_value("ADMIN_EMAIL")
    password = get_env_value("ADMIN_AppaS", "ADMIN_APP_PASSWORD", "ADMIN_PASSWORD")
    secret_code = get_env_value("ADMI_SECRET_Code", "ADMIN_SECRET_CODE")
    missing = []
    if not email:
        missing.append("ADMIN_EMAIL")
    if not password:
        missing.append("ADMIN_AppaS or ADMIN_APP_PASSWORD")
    if require_secret and not secret_code:
        missing.append("ADMI_SECRET_Code or ADMIN_SECRET_CODE")
    if missing:
        raise ValueError(f"Missing admin environment variables: {', '.join(missing)}")
    return email, password, secret_code


def get_admin_notification_email():
    return (
        get_env_value("ADMIN_NOTIFICATION_EMAIL", "ADMIN_NOTIFICTION_EMAIL")
        or settings.DEFAULT_FROM_ADDRESS
    )


def make_admin_token(email, *, login_ip="", login_at=None, audit_id=None):
    issued_at = login_at or timezone.now()
    return signing.dumps(
        {
            "email": email,
            "scope": "admin",
            "issued_at": issued_at.isoformat(),
            "login_ip": login_ip or "",
            "audit_id": audit_id,
        },
        salt=ADMIN_TOKEN_SALT,
    )


def normalize_admin_identity(email):
    return (email or "").strip().lower()


def get_admin_attempts_cache_key(email):
    return f"digishelf.admin.attempts:{normalize_admin_identity(email)}"


def get_admin_lockout_cache_key(email):
    return f"digishelf.admin.lockout:{normalize_admin_identity(email)}"


def get_admin_pending_code_cache_key(email):
    return f"digishelf.admin.pending_code:{normalize_admin_identity(email)}"


def mask_email_address(email):
    normalized = normalize_admin_identity(email)
    local_part, _, domain = normalized.partition("@")
    if not local_part or not domain:
        return normalized

    if len(local_part) <= 2:
        masked_local = f"{local_part[:1]}*"
    else:
        masked_local = f"{local_part[:2]}{'*' * max(len(local_part) - 2, 1)}"

    return f"{masked_local}@{domain}"


def get_admin_code_digest(email, code):
    payload = f"{normalize_admin_identity(email)}:{code}:{ADMIN_TOKEN_SALT}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def get_admin_lockout_seconds_remaining(email):
    locked_until = cache.get(get_admin_lockout_cache_key(email))
    if not locked_until:
        return 0

    try:
        remaining = int(locked_until - timezone.now().timestamp())
    except (TypeError, ValueError):
        cache.delete(get_admin_lockout_cache_key(email))
        return 0

    if remaining <= 0:
        cache.delete(get_admin_lockout_cache_key(email))
        return 0

    return remaining


def clear_admin_login_state(email):
    cache.delete(get_admin_attempts_cache_key(email))
    cache.delete(get_admin_lockout_cache_key(email))
    cache.delete(get_admin_pending_code_cache_key(email))


def register_admin_failure(email):
    attempts_key = get_admin_attempts_cache_key(email)
    lockout_key = get_admin_lockout_cache_key(email)
    pending_key = get_admin_pending_code_cache_key(email)

    attempts = int(cache.get(attempts_key, 0)) + 1
    if attempts >= ADMIN_LOGIN_MAX_FAILURES:
        locked_until = timezone.now().timestamp() + ADMIN_LOGIN_LOCKOUT_SECONDS
        cache.set(lockout_key, locked_until, timeout=ADMIN_LOGIN_LOCKOUT_SECONDS)
        cache.delete(attempts_key)
        cache.delete(pending_key)
        return {
            "locked": True,
            "attempts_remaining": 0,
            "retry_after": ADMIN_LOGIN_LOCKOUT_SECONDS,
        }

    cache.set(attempts_key, attempts, timeout=ADMIN_LOGIN_LOCKOUT_SECONDS)
    return {
        "locked": False,
        "attempts_remaining": max(ADMIN_LOGIN_MAX_FAILURES - attempts, 0),
        "retry_after": 0,
    }


def get_recaptcha_secret():
    secret = get_env_value("RECAPTCHA_SECRET_KEY", "GOOGLE_RECAPTCHA_SECRET_KEY")
    if not secret:
        raise ValueError(
            "Missing admin environment variables: RECAPTCHA_SECRET_KEY or GOOGLE_RECAPTCHA_SECRET_KEY"
        )
    return secret


def verify_recaptcha_token(token, remote_ip=None):
    if not token:
        return False

    payload = {
        "secret": get_recaptcha_secret(),
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    response = requests.post(
        ADMIN_RECAPTCHA_VERIFY_URL,
        data=payload,
        timeout=10,
    )
    response.raise_for_status()
    result = response.json()
    return bool(result.get("success"))


def send_admin_verification_code(email, code):
    expires_in_minutes = max(ADMIN_LOGIN_CODE_TTL_SECONDS // 60, 1)
    subject = "Your Digishelves admin verification code"
    text_content = (
        f"Your Digishelves admin verification code is {code}.\n\n"
        f"This code expires in {expires_in_minutes} minute(s).\n"
        "If you did not request this code, you can ignore this message."
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    message.send(fail_silently=False)


def get_admin_from_request(request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise ValueError("Missing admin token")

    token = header.removeprefix("Bearer ").strip()
    data = signing.loads(
        token,
        salt=ADMIN_TOKEN_SALT,
        max_age=ADMIN_TOKEN_MAX_AGE_SECONDS,
    )
    email, _, _ = get_admin_credentials(require_secret=False)
    if data.get("scope") != "admin" or data.get("email") != email:
        raise ValueError("Invalid admin token")
    return data


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or ""


def require_admin(view_func):
    def wrapped(self, request, *args, **kwargs):
        try:
            get_admin_from_request(request)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(self, request, *args, **kwargs)

    return wrapped


def serialize_payment_order(order):
    profit = get_payment_order_profit(order)
    summary = build_order_summary(order)
    return {
        "order_id": str(order.public_id),
        "payment_code": order.payment_code,
        "amount": str(order.amount),
        "token_symbol": order.token_symbol,
        "wallet_address": order.wallet_address,
        "status": order.status,
        "fulfillment_type": order.fulfillment_type,
        "fulfillment_status": order.fulfillment_status,
        "fulfillment_error": order.fulfillment_error,
        "paid_transaction_hash": order.paid_transaction_hash,
        "paid_block_number": order.paid_block_number,
        "created_at": order.created_at,
        "paid_at": order.paid_at,
        "fulfilled_at": order.fulfilled_at,
        "admin_approved": order.admin_approved,
        "admin_approved_at": order.admin_approved_at,
        "admin_approved_by": order.admin_approved_by,
        "summary": summary,
        "customer_email": order.customer_email,
        "customer_type": get_payment_order_customer_type(order),
        "can_delete": order.fulfillment_status != PaymentOrder.FulfillmentStatus.COMPLETED,
        "processing_fee": str(profit["processing_fee"]),
        "discount_percentage": str(profit["discount_percentage"]),
        "discount_profit": str(profit["discount_profit"]),
        "profit": str(profit["total_profit"]),
        "profit_currency": profit["profit_currency"],
        "debug": serialize_payment_order_debug(order, summary=summary),
    }


def normalize_customer_type(value, *, has_user=False, has_email=False):
    if has_user or isinstance(value, dict):
        return "Logged-in user"

    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"user", "logged_in", "logged-in", "authenticated", "member"}:
            return "Logged-in user"
        if lowered in {"guest", "email", "email_only", "email-only"}:
            return "Email only"

    if has_email:
        return "Email only"

    return "Unknown"


def get_payment_order_customer_type(order):
    payload = order.fulfillment_payload or {}

    if order.fulfillment_type == PaymentOrder.FulfillmentType.TOPUP:
        user_value = payload.get("userType")
        return normalize_customer_type(
            user_value,
            has_email=bool(order.customer_email),
        )

    if order.fulfillment_type == PaymentOrder.FulfillmentType.GIFTCARD:
        transaction = payload.get("transaction") or {}
        return normalize_customer_type(
            transaction.get("user_type"),
            has_user=bool(transaction.get("user")),
            has_email=bool(order.customer_email),
        )

    return normalize_customer_type(None, has_email=bool(order.customer_email))


def decimal_or_zero(value):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0")


def get_value(source, *keys, default=None):
    for key in keys:
        if isinstance(source, dict):
            value = source.get(key)
        else:
            value = getattr(source, key, None)

        if value is not None:
            return value
    return default


def get_topup_discount_percentage(order):
    payload = order.reloader_transaction or {}

    direct_percentage = payload.get("discountPercentage")
    if direct_percentage is not None:
        return decimal_or_zero(direct_percentage)

    promotion = payload.get("promotion") or {}
    if promotion.get("discountPercentage") is not None:
        return decimal_or_zero(promotion.get("discountPercentage"))

    discount_amount = decimal_or_zero(payload.get("discount"))
    requested_amount = decimal_or_zero(
        payload.get("requestedAmount")
        or payload.get("deliveredAmount")
        or (payload.get("balanceInfo") or {}).get("cost")
    )

    if requested_amount <= 0 or discount_amount <= 0:
        return Decimal("0")

    return (discount_amount / requested_amount) * Decimal("100")


def get_topup_profit(order):
    processing_fee = decimal_or_zero(order.processing_fee)
    total_paid = decimal_or_zero(order.total_paid)
    discount_percentage = get_topup_discount_percentage(order)
    base_amount = max(total_paid - processing_fee, Decimal("0"))
    discount_profit = (base_amount * discount_percentage) / Decimal("100")

    return {
        "processing_fee": processing_fee.quantize(Decimal("0.01")),
        "discount_percentage": discount_percentage.quantize(Decimal("0.01")),
        "discount_profit": discount_profit.quantize(Decimal("0.01")),
        "total_profit": (processing_fee + discount_profit).quantize(Decimal("0.01")),
    }


def get_giftcard_products_subtotal(products):
    total = Decimal("0")
    for product in products:
        quantity = decimal_or_zero(get_value(product, "quantity", default=1) or 1)
        amount_to_pay = decimal_or_zero(get_value(product, "AmountToPay", "amountToPay", default=0))
        total += amount_to_pay * quantity
    return total


def get_giftcard_profit(order):
    products = list(order.transactions_order_product.all())
    completed_products = list(order.transactions_details_completed.all())
    total_paid = decimal_or_zero(order.amount)
    subtotal = get_giftcard_products_subtotal(products)
    processing_fee = max(total_paid - subtotal, Decimal("0"))
    discount_profit = sum((decimal_or_zero(item.discount) for item in completed_products), Decimal("0"))
    profit_currency = (
        (products[0].currencyToPayIn if products else None)
        or (completed_products[0].currencyCode if completed_products else None)
        or "USD"
    )

    return {
        "processing_fee": processing_fee.quantize(Decimal("0.01")),
        "discount_percentage": Decimal("0.00"),
        "discount_profit": discount_profit.quantize(Decimal("0.01")),
        "total_profit": (processing_fee + discount_profit).quantize(Decimal("0.01")),
        "profit_currency": profit_currency,
    }


def get_payment_order_profit(order):
    summary = build_order_summary(order)

    if order.fulfillment_type == PaymentOrder.FulfillmentType.TOPUP:
        reference = summary.get("reference")
        topup = TopupTransaction.objects.filter(reference=reference).first() if reference else None
        if topup:
            profit = get_topup_profit(topup)
            profit["profit_currency"] = topup.sender_currency or summary.get("payment_currency") or order.token_symbol
            return profit

        processing_fee = decimal_or_zero(summary.get("processing_fee"))
        return {
            "processing_fee": processing_fee.quantize(Decimal("0.01")),
            "discount_percentage": Decimal("0.00"),
            "discount_profit": Decimal("0.00"),
            "total_profit": processing_fee.quantize(Decimal("0.01")),
            "profit_currency": summary.get("payment_currency") or order.token_symbol,
        }

    if order.fulfillment_type == PaymentOrder.FulfillmentType.GIFTCARD:
        reference = summary.get("reference")
        giftcard = (
            GiftCardTransaction.objects.prefetch_related(
                "transactions_order_product",
                "transactions_details_completed",
            ).filter(reference=reference).first()
            if reference
            else None
        )
        if giftcard:
            return get_giftcard_profit(giftcard)

        products = (order.fulfillment_payload or {}).get("transaction", {}).get("products") or []
        subtotal = get_giftcard_products_subtotal(products)
        total_paid = decimal_or_zero(order.amount)
        processing_fee = max(total_paid - subtotal, Decimal("0"))
        profit_currency = (
            (products[0].get("currencyToPayIn") if products else None)
            or summary.get("payment_currency")
            or order.token_symbol
        )
        return {
            "processing_fee": processing_fee.quantize(Decimal("0.01")),
            "discount_percentage": Decimal("0.00"),
            "discount_profit": Decimal("0.00"),
            "total_profit": processing_fee.quantize(Decimal("0.01")),
            "profit_currency": profit_currency,
        }

    return {
        "processing_fee": Decimal("0.00"),
        "discount_percentage": Decimal("0.00"),
        "discount_profit": Decimal("0.00"),
        "total_profit": Decimal("0.00"),
        "profit_currency": order.token_symbol,
    }


def serialize_processed_transfer(transfer):
    return {
        "transaction_hash": transfer.transaction_hash,
        "log_index": transfer.log_index,
        "token_symbol": transfer.token_symbol,
        "token_contract_address": transfer.token_contract_address,
        "from_address": transfer.from_address,
        "to_address": transfer.to_address,
        "amount": str(transfer.amount),
        "block_number": transfer.block_number,
        "confirmations": transfer.confirmations,
        "confirmed": transfer.confirmed,
        "created_at": transfer.created_at,
        "updated_at": transfer.updated_at,
    }


def serialize_topup_debug_record(record):
    if not record:
        return None

    return {
        "reference": record.reference,
        "operator": record.operator,
        "phone_number": record.phone_number,
        "receiver_amount": str(record.receiver_amount),
        "receiver_currency_code": record.receiver_currency_code,
        "total_paid": str(record.total_paid),
        "sender_currency": record.sender_currency,
        "processing_fee": str(record.processing_fee),
        "status": record.status,
        "email": record.email,
        "created_at": record.created_at,
        "reloader_transaction": record.reloader_transaction,
        "payment_trace": record.paystack_very_transaction,
    }


def serialize_giftcard_debug_record(record):
    if not record:
        return None

    return {
        "reference": record.reference,
        "amount": str(record.amount),
        "country": record.country,
        "email": record.email,
        "payment_method": record.payment_method,
        "created_at": record.created_at,
        "products": [
            serialize_giftcard_product(product)
            for product in record.transactions_order_product.all()
        ],
        "payment_details": [
            {
                "message": detail.message,
                "status": detail.status,
                "transaction": detail.transaction,
                "trxref": detail.trxref,
                "created_at": detail.created_at,
            }
            for detail in record.transactions_details.all()
        ],
        "user_devices": [
            {
                "ip_address": device.ip_address,
            }
            for device in record.transactions_details_user_device.all()
        ],
        "reloadly_transactions": [
            {
                "transaction_id": item.transactionId,
                "amount": str(item.amount),
                "discount": str(item.discount),
                "currency_code": item.currencyCode,
                "fee": str(item.fee),
                "status": item.status,
                "product": item.product,
                "transaction_created_at": item.transaction_created_at,
                "redeem_data": item.redeem_data,
                "created_at": item.created_at,
            }
            for item in record.transactions_details_completed.all()
        ],
    }


def serialize_payment_order_debug(order, *, summary=None):
    summary = summary or build_order_summary(order)
    reference = summary.get("reference")
    topup_record = None
    giftcard_record = None

    if order.fulfillment_type == PaymentOrder.FulfillmentType.TOPUP and reference:
        topup_record = TopupTransaction.objects.filter(reference=reference).first()
    elif order.fulfillment_type == PaymentOrder.FulfillmentType.GIFTCARD and reference:
        giftcard_record = GiftCardTransaction.objects.prefetch_related(
            "transactions_order_product",
            "transactions_details",
            "transactions_details_user_device",
            "transactions_details_completed",
        ).filter(reference=reference).first()

    return {
        "payment_activity": serialize_payment_activity(order),
        "processed_transfers": [
            serialize_processed_transfer(transfer)
            for transfer in order.processed_transfers.order_by("-block_number", "-log_index")
        ],
        "fulfillment_payload": order.fulfillment_payload,
        "summary_snapshot": order.summary_snapshot,
        "topup_transaction": serialize_topup_debug_record(topup_record),
        "giftcard_transaction": serialize_giftcard_debug_record(giftcard_record),
    }


def serialize_topup(order):
    profit = get_topup_profit(order)
    return {
        "reference": order.reference,
        "operator": order.operator,
        "phone_number": order.phone_number,
        "receiver_amount": str(order.receiver_amount),
        "receiver_currency_code": order.receiver_currency_code,
        "total_paid": str(order.total_paid),
        "sender_currency": order.sender_currency,
        "payment_method": order.payment_method,
        "status": order.status,
        "email": order.email,
        "created_at": order.created_at,
        "processing_fee": str(profit["processing_fee"]),
        "discount_percentage": str(profit["discount_percentage"]),
        "discount_profit": str(profit["discount_profit"]),
        "profit": str(profit["total_profit"]),
        "profit_currency": order.sender_currency,
    }


def serialize_giftcard(order):
    profit = get_giftcard_profit(order)
    return {
        "reference": order.reference,
        "amount": str(order.amount),
        "country": order.country,
        "email": order.email,
        "user_type": order.user_type,
        "payment_method": order.payment_method,
        "created_at": order.created_at,
        "products": [
            serialize_giftcard_product(product)
            for product in order.transactions_order_product.all()
        ],
        "processing_fee": str(profit["processing_fee"]),
        "discount_profit": str(profit["discount_profit"]),
        "profit": str(profit["total_profit"]),
        "profit_currency": profit["profit_currency"],
    }


def serialize_contact(contact):
    return serializers.AdminContactSerializer(contact).data


def get_user_display_name(user):
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return full_name or user.email


def _set_latest_activity(target, candidate):
    if candidate and (target is None or candidate > target):
        return candidate
    return target


def serialize_admin_cart_item(item):
    return {
        "id": item.id,
        "product_id": item.productId,
        "product_name": item.productName,
        "quantity": item.quantity,
        "recipient_amount": str(item.recipientAmount),
        "recipient_currency": item.recipientCurrency,
        "amount_to_pay": str(item.AmountToPay),
        "currency_to_pay_in": item.currencyToPayIn,
        "processing_fee": str(item.processing_fee),
        "image": item.img,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def serialize_admin_analytics_event(event):
    return {
        "id": event.id,
        "event_type": event.event_type,
        "page_path": event.page_path,
        "page_title": event.page_title,
        "product_id": event.product_id,
        "product_name": event.product_name,
        "quantity": event.quantity,
        "duration_seconds": event.duration_seconds,
        "cart_item_count": event.cart_item_count,
        "cart_total_quantity": event.cart_total_quantity,
        "cart_total_value": str(event.cart_total_value),
        "metadata": event.metadata or {},
        "ip_address": event.ip_address,
        "created_at": event.created_at,
    }


def build_user_timeline(user, *, payment_orders, topups, giftcards, cart_items, contacts, analytics_events):
    timeline = []

    for order in payment_orders:
        summary = order.get("summary") or {}
        timeline.append(
            {
                "kind": "payment_order",
                "title": f"{order.get('fulfillment_type', 'order').replace('_', ' ').title()} payment order",
                "subtitle": summary.get("reference") or summary.get("recipient") or order.get("customer_email") or "",
                "status": order.get("fulfillment_status") or order.get("status") or "",
                "created_at": order.get("created_at"),
            }
        )

    for order in topups:
        timeline.append(
            {
                "kind": "topup",
                "title": f"Top-up {order.get('receiver_amount')} {order.get('receiver_currency_code')}".strip(),
                "subtitle": order.get("phone_number") or order.get("reference") or "",
                "status": order.get("status") or "",
                "created_at": order.get("created_at"),
            }
        )

    for order in giftcards:
        timeline.append(
            {
                "kind": "giftcard",
                "title": f"Gift card order {order.get('amount')} {order.get('profit_currency') or ''}".strip(),
                "subtitle": order.get("reference") or order.get("email") or "",
                "status": order.get("payment_method") or "",
                "created_at": order.get("created_at"),
            }
        )

    for item in cart_items:
        timeline.append(
            {
                "kind": "cart",
                "title": f"Cart item: {item.get('product_name') or 'Gift card'}",
                "subtitle": f"Qty {item.get('quantity') or 0} · {item.get('recipient_amount')} {item.get('recipient_currency')}",
                "status": "cart",
                "created_at": item.get("updated_at") or item.get("created_at"),
            }
        )

    for contact in contacts:
        timeline.append(
            {
                "kind": "contact",
                "title": "Contact message sent",
                "subtitle": (contact.get("message") or "")[:120],
                "status": "replied" if contact.get("is_replied") else "new",
                "created_at": contact.get("created_at"),
            }
        )

    for event in analytics_events:
        timeline.append(
            {
                "kind": "analytics",
                "title": event.get("page_title") or event.get("event_type") or "Activity",
                "subtitle": event.get("page_path") or event.get("product_name") or "",
                "status": event.get("event_type") or "",
                "created_at": event.get("created_at"),
            }
        )

    return sorted(
        timeline,
        key=lambda item: item.get("created_at") or timezone.make_aware(datetime(1970, 1, 1)),
        reverse=True,
    )[:120]


def build_admin_user_detail(user):
    payment_orders = [
        serialize_payment_order(order)
        for order in PaymentOrder.objects.filter(customer_email__iexact=user.email).order_by("-created_at")[:100]
    ]
    topups = [
        serialize_topup(order)
        for order in TopupTransaction.objects.filter(Q(user=user) | Q(email__iexact=user.email)).order_by("-created_at")[:50]
    ]
    giftcards = [
        serialize_giftcard(order)
        for order in GiftCardTransaction.objects.prefetch_related(
            "transactions_order_product",
            "transactions_details_completed",
        ).filter(Q(user=user) | Q(email__iexact=user.email)).order_by("-created_at")[:50]
    ]
    cart_items = [
        serialize_admin_cart_item(item)
        for item in Cart.objects.filter(user=user).order_by("-updated_at")[:50]
    ]
    contacts = [
        serialize_contact(contact)
        for contact in Contact.objects.filter(email__iexact=user.email).order_by("-created_at")[:30]
    ]
    analytics_queryset = AnalyticsEvent.objects.filter(user=user).order_by("-created_at")
    analytics_events = [
        serialize_admin_analytics_event(event)
        for event in analytics_queryset[:150]
    ]

    page_view_map = {}
    for event in analytics_events:
        if event["event_type"] != "page_view" or not event["page_path"]:
            continue

        entry = page_view_map.setdefault(
            event["page_path"],
            {
                "path": event["page_path"],
                "title": event["page_title"] or event["page_path"],
                "views": 0,
            },
        )
        entry["views"] += 1

    timeline = build_user_timeline(
        user,
        payment_orders=payment_orders,
        topups=topups,
        giftcards=giftcards,
        cart_items=cart_items,
        contacts=contacts,
        analytics_events=analytics_events,
    )

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": get_user_display_name(user),
            "phone_number": user.phone_number,
            "country": user.country,
            "device": user.device,
            "auth_type": user.auth_type,
            "email_verified": user.email_verified,
            "is_active": user.is_active,
            "suspended": user.suspended,
            "deleted": user.deleted,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        },
        "summary": {
            "payment_orders": len(payment_orders),
            "topups": len(topups),
            "giftcards": len(giftcards),
            "cart_items": len(cart_items),
            "contacts": len(contacts),
            "page_views": sum(1 for event in analytics_events if event["event_type"] == "page_view"),
            "tracked_events": len(analytics_events),
        },
        "page_views": sorted(
            page_view_map.values(),
            key=lambda item: (-item["views"], item["path"]),
        ),
        "payment_orders": payment_orders,
        "topups": topups,
        "giftcards": giftcards,
        "cart_items": cart_items,
        "contacts": contacts,
        "analytics_events": analytics_events,
        "activity_timeline": timeline,
    }


def build_admin_users(limit=200):
    users = list(Account.objects.order_by("-date_joined")[:limit])
    email_to_user = {user.email.strip().lower(): user for user in users if user.email}
    user_stats = {
        user.id: {
            "payment_orders": 0,
            "topups": 0,
            "giftcards": 0,
            "cart_items": 0,
            "page_views": 0,
            "tracked_events": 0,
            "contacts": 0,
            "last_activity_at": user.last_login or user.date_joined,
        }
        for user in users
    }

    for order in PaymentOrder.objects.filter(customer_email__in=list(email_to_user.keys())).values(
        "customer_email",
        "created_at",
    ):
        email = (order.get("customer_email") or "").strip().lower()
        user = email_to_user.get(email)
        if not user:
            continue
        stats = user_stats[user.id]
        stats["payment_orders"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], order.get("created_at"))

    for order in TopupTransaction.objects.filter(
        Q(user_id__in=user_stats.keys()) | Q(email__in=list(email_to_user.keys()))
    ).values("user_id", "email", "created_at"):
        user_id = order.get("user_id")
        if user_id in user_stats:
            stats = user_stats[user_id]
        else:
            email = (order.get("email") or "").strip().lower()
            matched_user = email_to_user.get(email)
            if not matched_user:
                continue
            stats = user_stats[matched_user.id]
        stats["topups"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], order.get("created_at"))

    for order in GiftCardTransaction.objects.filter(
        Q(user_id__in=user_stats.keys()) | Q(email__in=list(email_to_user.keys()))
    ).values("user_id", "email", "created_at"):
        user_id = order.get("user_id")
        if user_id in user_stats:
            stats = user_stats[user_id]
        else:
            email = (order.get("email") or "").strip().lower()
            matched_user = email_to_user.get(email)
            if not matched_user:
                continue
            stats = user_stats[matched_user.id]
        stats["giftcards"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], order.get("created_at"))

    for item in Cart.objects.filter(user_id__in=user_stats.keys()).values("user_id", "updated_at"):
        user_id = item.get("user_id")
        stats = user_stats.get(user_id)
        if not stats:
            continue
        stats["cart_items"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], item.get("updated_at"))

    for event in AnalyticsEvent.objects.filter(user_id__in=user_stats.keys()).values(
        "user_id",
        "event_type",
        "created_at",
    ):
        user_id = event.get("user_id")
        stats = user_stats.get(user_id)
        if not stats:
            continue
        stats["tracked_events"] += 1
        if event.get("event_type") == "page_view":
            stats["page_views"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], event.get("created_at"))

    for contact in Contact.objects.filter(email__in=list(email_to_user.keys())).values("email", "created_at"):
        email = (contact.get("email") or "").strip().lower()
        user = email_to_user.get(email)
        if not user:
            continue
        stats = user_stats[user.id]
        stats["contacts"] += 1
        stats["last_activity_at"] = _set_latest_activity(stats["last_activity_at"], contact.get("created_at"))

    return [
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": get_user_display_name(user),
            "phone_number": user.phone_number,
            "country": user.country,
            "device": user.device,
            "auth_type": user.auth_type,
            "email_verified": user.email_verified,
            "is_active": user.is_active,
            "suspended": user.suspended,
            "deleted": user.deleted,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
            **user_stats[user.id],
        }
        for user in sorted(
            users,
            key=lambda item: user_stats[item.id]["last_activity_at"] or item.date_joined,
            reverse=True,
        )
    ]


def build_admin_page_traffic_from_events(page_views):
    page_traffic_map = {}
    for event in page_views:
        entry = page_traffic_map.setdefault(
            event["page_path"],
            {
                "path": event["page_path"],
                "title": event["page_title"] or event["page_path"],
                "views": 0,
                "sessions": set(),
            },
        )
        entry["views"] += 1
        if event["session_key"]:
            entry["sessions"].add(event["session_key"])

    return sorted(
        [
            {
                "path": entry["path"],
                "title": entry["title"],
                "views": entry["views"],
                "unique_visitors": len(entry["sessions"]),
            }
            for entry in page_traffic_map.values()
        ],
        key=lambda item: (-item["views"], item["path"]),
    )


def build_admin_page_traffic_page(page=1, page_size=ADMIN_PAGE_TRAFFIC_PAGE_SIZE):
    now = timezone.now()
    window_days = max(ANALYTICS_TRAFFIC_WINDOW_DAYS, 1)
    window_start = now - timedelta(days=window_days)
    page_size = max(int(page_size or ADMIN_PAGE_TRAFFIC_PAGE_SIZE), 1)
    page_number = max(int(page or 1), 1)

    page_views = list(
        AnalyticsEvent.objects.filter(
            created_at__gte=window_start,
            event_type="page_view",
        )
        .exclude(page_path__isnull=True)
        .exclude(page_path="")
        .values("session_key", "page_path", "page_title")
    )
    all_rows = build_admin_page_traffic_from_events(page_views)
    total_items = len(all_rows)
    total_pages = max((total_items + page_size - 1) // page_size, 1)
    page_number = min(page_number, total_pages)
    start = (page_number - 1) * page_size
    end = start + page_size

    return {
        "window_days": window_days,
        "page": page_number,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "results": all_rows[start:end],
    }


def build_admin_analytics():
    now = timezone.now()
    window_days = max(ANALYTICS_TRAFFIC_WINDOW_DAYS, 1)
    window_start = now - timedelta(days=window_days)
    events = list(
        AnalyticsEvent.objects.filter(created_at__gte=window_start)
        .values(
            "session_key",
            "event_type",
            "page_path",
            "page_title",
            "product_id",
            "product_name",
            "quantity",
            "duration_seconds",
            "cart_item_count",
            "cart_total_quantity",
            "cart_total_value",
            "created_at",
        )
        .order_by("-created_at")
    )

    page_views = [event for event in events if event["event_type"] == "page_view" and event["page_path"]]
    giftcard_views = [event for event in events if event["event_type"] == "giftcard_view_duration"]
    add_to_cart_events = [event for event in events if event["event_type"] == "giftcard_add_to_cart"]
    buy_now_events = [event for event in events if event["event_type"] == "giftcard_buy_now"]

    traffic_by_day = {}
    for offset in range(window_days):
        day = (window_start + timedelta(days=offset)).date().isoformat()
        traffic_by_day[day] = 0
    for event in page_views:
        day = event["created_at"].date().isoformat()
        traffic_by_day[day] = traffic_by_day.get(day, 0) + 1

    page_traffic = build_admin_page_traffic_from_events(page_views)

    event_breakdown_map = defaultdict(int)
    for event in events:
        event_breakdown_map[event["event_type"]] += 1
    event_breakdown = [
        {"event_type": key, "count": value}
        for key, value in sorted(event_breakdown_map.items(), key=lambda item: (-item[1], item[0]))
    ]

    giftcard_map = {}
    for event in events:
        if not event["product_id"] and not event["product_name"]:
            continue

        product_key = str(event["product_id"] or event["product_name"])
        entry = giftcard_map.setdefault(
            product_key,
            {
                "product_id": event["product_id"] or "",
                "product_name": event["product_name"] or "Gift card",
                "views": 0,
                "total_view_seconds": 0,
                "add_to_cart": 0,
                "buy_now": 0,
                "cta_clicks": 0,
            },
        )
        if event["event_type"] == "giftcard_view_duration":
            entry["views"] += 1
            entry["total_view_seconds"] += int(event["duration_seconds"] or 0)
        elif event["event_type"] == "giftcard_add_to_cart":
            entry["add_to_cart"] += int(event["quantity"] or 1)
            entry["cta_clicks"] += 1
        elif event["event_type"] == "giftcard_buy_now":
            entry["buy_now"] += 1
            entry["cta_clicks"] += 1
        elif event["event_type"] == "giftcard_amount_selected":
            entry["cta_clicks"] += 1

    top_giftcards = sorted(
        [
            {
                **entry,
                "average_view_seconds": round(
                    entry["total_view_seconds"] / entry["views"],
                    1,
                )
                if entry["views"]
                else 0,
            }
            for entry in giftcard_map.values()
        ],
        key=lambda item: (
            -(item["views"] + item["add_to_cart"] + item["buy_now"]),
            -item["total_view_seconds"],
            item["product_name"],
        ),
    )

    abandoned_threshold = now - timedelta(minutes=max(ANALYTICS_ABANDONED_CART_MINUTES, 1))
    abandoned_items = (
        Cart.objects.select_related("user")
        .filter(updated_at__lt=abandoned_threshold)
        .order_by("-updated_at")
    )
    abandoned_by_user = {}
    for item in abandoned_items:
        if not item.user_id:
            continue

        entry = abandoned_by_user.setdefault(
            item.user_id,
            {
                "user_id": item.user_id,
                "email": item.user.email,
                "name": f"{item.user.first_name or ''} {item.user.last_name or ''}".strip() or "Unnamed user",
                "last_activity_at": item.updated_at,
                "item_count": 0,
                "total_quantity": 0,
                "total_value": Decimal("0.00"),
                "products": [],
            },
        )
        entry["item_count"] += 1
        entry["total_quantity"] += int(item.quantity or 0)
        entry["total_value"] += decimal_or_zero(item.AmountToPay) * Decimal(str(item.quantity or 0))
        if item.updated_at and item.updated_at > entry["last_activity_at"]:
            entry["last_activity_at"] = item.updated_at
        entry["products"].append(
            {
                "id": item.id,
                "product_id": item.productId,
                "product_name": item.productName,
                "quantity": item.quantity,
                "recipient_amount": str(item.recipientAmount),
                "recipient_currency": item.recipientCurrency,
                "amount_to_pay": str(item.AmountToPay),
                "currency_to_pay_in": item.currencyToPayIn,
                "updated_at": item.updated_at,
                "image": item.img,
            }
        )

    abandoned_carts = sorted(
        [
            {
                **entry,
                "total_value": str(entry["total_value"].quantize(Decimal("0.01"))),
            }
            for entry in abandoned_by_user.values()
        ],
        key=lambda item: item["last_activity_at"],
        reverse=True,
    )

    average_view_seconds = 0
    if giftcard_views:
        average_view_seconds = round(
            sum(int(event["duration_seconds"] or 0) for event in giftcard_views) / len(giftcard_views),
            1,
        )

    return {
        "window_days": window_days,
        "abandoned_after_minutes": ANALYTICS_ABANDONED_CART_MINUTES,
        "summary": {
            "page_views": len(page_views),
            "unique_visitors": len({event["session_key"] for event in page_views if event["session_key"]}),
            "giftcard_views": len(giftcard_views),
            "average_giftcard_view_seconds": average_view_seconds,
            "add_to_cart_actions": len(add_to_cart_events),
            "giftcards_added_to_cart": sum(int(event["quantity"] or 0) for event in add_to_cart_events),
            "buy_now_clicks": len(buy_now_events),
            "abandoned_registered_carts": len(abandoned_carts),
            "abandoned_cart_items": sum(item["item_count"] for item in abandoned_carts),
        },
        "traffic_series": [
            {"date": day, "views": views}
            for day, views in sorted(traffic_by_day.items(), key=lambda item: item[0])
        ],
        "page_traffic": page_traffic[:10],
        "event_breakdown": event_breakdown[:12],
        "top_giftcards": top_giftcards[:10],
        "abandoned_carts": abandoned_carts[:20],
    }


class AdminLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def _lockout_response(self, email, *, retry_after=None):
        seconds_remaining = retry_after or get_admin_lockout_seconds_remaining(email)
        return Response(
            {
                "error": f"Too many failed attempts. Try again in {seconds_remaining} seconds.",
                "retry_after": seconds_remaining,
                "locked": True,
            },
            status=status.HTTP_423_LOCKED,
        )

    def _invalid_attempt_response(self, email, message):
        failure_state = register_admin_failure(email)
        if failure_state["locked"]:
            return self._lockout_response(email, retry_after=failure_state["retry_after"])

        return Response(
            {
                "error": message,
                "attempts_remaining": failure_state["attempts_remaining"],
                "locked": False,
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    def _start_login(self, request, admin_email, admin_password):
        email = normalize_admin_identity(request.data.get("email"))
        password = request.data.get("password") or ""
        captcha_token = request.data.get("captcha_token")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not captcha_token:
            return Response(
                {"error": "Please complete the reCAPTCHA challenge."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            is_captcha_valid = verify_recaptcha_token(
                captcha_token,
                remote_ip=get_client_ip(request),
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.RequestException:
            return Response(
                {"error": "Unable to verify reCAPTCHA right now. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not is_captcha_valid:
            return Response(
                {"error": "Invalid reCAPTCHA challenge. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email != normalize_admin_identity(admin_email) or password != admin_password:
            return self._invalid_attempt_response(admin_email, "Invalid admin credentials.")

        verification_code = f"{secrets.randbelow(1_000_000):06d}"
        cache.set(
            get_admin_pending_code_cache_key(admin_email),
            {
                "digest": get_admin_code_digest(admin_email, verification_code),
                "issued_at": timezone.now().isoformat(),
            },
            timeout=ADMIN_LOGIN_CODE_TTL_SECONDS,
        )

        try:
            send_admin_verification_code(admin_email, verification_code)
        except Exception as exc:
            cache.delete(get_admin_pending_code_cache_key(admin_email))
            error_message = "Unable to send the verification code email. Please try again."
            if settings.DEBUG:
                error_message = f"{error_message} {exc}"
            return Response(
                {"error": error_message},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "step": "verify_code",
                "email": admin_email,
                "masked_email": mask_email_address(admin_email),
                "code_expires_in": ADMIN_LOGIN_CODE_TTL_SECONDS,
            },
            status=status.HTTP_200_OK,
        )

    def _verify_code(self, request, admin_email):
        code = str(request.data.get("code") or "").strip()
        if not code:
            return Response(
                {"error": "Verification code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pending_code = cache.get(get_admin_pending_code_cache_key(admin_email))
        if not pending_code:
            return Response(
                {"error": "Verification code expired. Start the login process again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if pending_code.get("digest") != get_admin_code_digest(admin_email, code):
            return self._invalid_attempt_response(admin_email, "Invalid verification code.")

        login_ip = get_client_ip(request)
        audit = AdminLoginAudit.objects.create(
            email=admin_email,
            ip_address=login_ip,
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:500],
        )
        login_at = audit.created_at or timezone.now()
        clear_admin_login_state(admin_email)
        return Response(
            {
                "token": make_admin_token(
                    admin_email,
                    login_ip=login_ip,
                    login_at=login_at,
                    audit_id=audit.id,
                ),
                "email": admin_email,
                "login_ip": login_ip,
                "login_at": login_at,
                "expires_in": ADMIN_TOKEN_MAX_AGE_SECONDS,
                "step": "completed",
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        try:
            admin_email, admin_password, _ = get_admin_credentials(require_secret=False)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        admin_email = normalize_admin_identity(admin_email)
        lockout_remaining = get_admin_lockout_seconds_remaining(admin_email)
        if lockout_remaining > 0:
            return self._lockout_response(admin_email, retry_after=lockout_remaining)

        step = str(request.data.get("step") or "credentials").strip().lower()
        if step == "verify_code":
            return self._verify_code(request, admin_email)

        return self._start_login(request, admin_email, admin_password)


class AdminConfigurationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def get(self, request):
        config = get_config()
        return Response(serialize_config(config), status=status.HTTP_200_OK)

    @require_admin
    def patch(self, request):
        config = get_config()
        allowed_fields = {
            "profit_percentage",
            "processing_fee",
            "giftcard_processing_fee",
            "order_mode",
        }

        for field in allowed_fields:
            if field in request.data:
                setattr(config, field, request.data[field])

        if config.order_mode not in {"auto", "manual"}:
            return Response({"error": "order_mode must be auto or manual"}, status=status.HTTP_400_BAD_REQUEST)

        config.save()
        return Response(serialize_config(config), status=status.HTTP_200_OK)


class AdminDashboardView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def get(self, request):
        admin_session = get_admin_from_request(request)
        payment_orders = PaymentOrder.objects.order_by("-created_at")[:50]
        topups = TopupTransaction.objects.order_by("-created_at")[:30]
        giftcards = GiftCardTransaction.objects.prefetch_related(
            "transactions_order_product",
            "transactions_details_completed",
        ).order_by("-created_at")[:30]
        contacts = Contact.objects.order_by("-created_at")[:100]
        analytics = build_admin_analytics()
        users = build_admin_users()
        latest_admin_login = AdminLoginAudit.objects.filter(email=admin_session.get("email") or "").order_by("-created_at").first()

        return Response(
            {
                "configuration": serialize_config(get_config()),
                "admin_session": {
                    "email": admin_session.get("email", ""),
                    "login_ip": admin_session.get("login_ip", ""),
                    "issued_at": admin_session.get("issued_at"),
                    "audit_id": admin_session.get("audit_id"),
                    "latest_login_at": latest_admin_login.created_at if latest_admin_login else None,
                    "latest_login_ip": latest_admin_login.ip_address if latest_admin_login else admin_session.get("login_ip", ""),
                },
                "stats": {
                    "payment_orders": PaymentOrder.objects.count(),
                    "pending_payment_orders": PaymentOrder.objects.filter(status=PaymentOrder.Status.PENDING).count(),
                    "paid_payment_orders": PaymentOrder.objects.filter(status=PaymentOrder.Status.PAID).count(),
                    "approved_payment_orders": PaymentOrder.objects.filter(admin_approved=True).count(),
                    "manual_queue": PaymentOrder.objects.filter(
                        status=PaymentOrder.Status.PAID,
                        admin_approved=False,
                    ).count(),
                    "topups": TopupTransaction.objects.count(),
                    "giftcards": GiftCardTransaction.objects.count(),
                    "users": Account.objects.count(),
                    "contacts": Contact.objects.count(),
                    "new_contacts": Contact.objects.filter(read_at__isnull=True).count(),
                    "page_views": analytics["summary"]["page_views"],
                    "unique_visitors": analytics["summary"]["unique_visitors"],
                    "abandoned_registered_carts": analytics["summary"]["abandoned_registered_carts"],
                },
                "payment_orders": [serialize_payment_order(order) for order in payment_orders],
                "topups": [serialize_topup(order) for order in topups],
                "giftcards": [serialize_giftcard(order) for order in giftcards],
                "contacts": [serialize_contact(contact) for contact in contacts],
                "users": users,
                "analytics": analytics,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def get(self, request, user_id):
        try:
            user = Account.objects.get(id=user_id)
        except Account.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(build_admin_user_detail(user), status=status.HTTP_200_OK)


class AdminPageTrafficView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def get(self, request):
        page = request.GET.get("page", "1")
        page_size = request.GET.get("page_size", str(ADMIN_PAGE_TRAFFIC_PAGE_SIZE))

        try:
            payload = build_admin_page_traffic_page(page=page, page_size=page_size)
        except (TypeError, ValueError):
            return Response({"error": "Invalid page or page_size value."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(payload, status=status.HTTP_200_OK)


class AdminCompletePaymentOrderView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def post(self, request, order_id):
        admin = get_admin_from_request(request)
        config = get_config()

        try:
            order = PaymentOrder.objects.get(public_id=order_id)
        except PaymentOrder.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if config.order_mode == "manual" and not order.admin_approved:
            return Response(
                {"error": "Approve this payment before releasing the product."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = complete_order(order, actor=admin.get("email", "admin"))
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"data": result, "order": serialize_payment_order(order)},
            status=status.HTTP_200_OK,
        )


class AdminDeletePaymentOrderView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def delete(self, request, order_id):
        try:
            order = PaymentOrder.objects.get(public_id=order_id)
        except PaymentOrder.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.fulfillment_status == PaymentOrder.FulfillmentStatus.COMPLETED:
            return Response(
                {"error": "Completed orders cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.delete()
        return Response({"data": {"status": "deleted"}}, status=status.HTTP_200_OK)


class AdminContactReadView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def post(self, request, contact_id):
        try:
            contact = Contact.objects.get(id=contact_id)
        except Contact.DoesNotExist:
            return Response({"error": "Contact message not found"}, status=status.HTTP_404_NOT_FOUND)

        if contact.read_at is None:
            contact.read_at = timezone.now()
            contact.save(update_fields=["read_at"])

        return Response({"contact": serialize_contact(contact)}, status=status.HTTP_200_OK)


class AdminContactReplyView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def post(self, request, contact_id):
        admin = get_admin_from_request(request)
        reply_message = str(request.data.get("reply_message") or "").strip()
        if not reply_message:
            return Response({"error": "Reply message is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            contact = Contact.objects.get(id=contact_id)
        except Contact.DoesNotExist:
            return Response({"error": "Contact message not found"}, status=status.HTTP_404_NOT_FOUND)

        message = EmailMultiAlternatives(
            subject="Reply from Digishelves support",
            body=reply_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[contact.email],
            reply_to=[get_admin_notification_email()],
        )

        try:
            message.send(fail_silently=False)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        contact.read_at = contact.read_at or timezone.now()
        contact.reply_message = reply_message
        contact.replied_at = timezone.now()
        contact.replied_by = admin.get("email", "")
        contact.save(update_fields=["read_at", "reply_message", "replied_at", "replied_by"])

        return Response({"contact": serialize_contact(contact)}, status=status.HTTP_200_OK)


class AdminApprovePaymentOrderView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def post(self, request, order_id):
        admin = get_admin_from_request(request)
        try:
            _, _, secret_code = get_admin_credentials()
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        submitted_secret = str(request.data.get("secret_code") or "").strip()
        if submitted_secret != secret_code:
            return Response({"error": "Invalid secret code"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = PaymentOrder.objects.get(public_id=order_id)
        except PaymentOrder.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status != PaymentOrder.Status.PAID:
            return Response({"error": "Payment is not confirmed yet."}, status=status.HTTP_400_BAD_REQUEST)

        order.admin_approved = True
        order.admin_approved_at = timezone.now()
        order.admin_approved_by = admin.get("email", "")
        order.save(update_fields=["admin_approved", "admin_approved_at", "admin_approved_by"])

        result = {"status": "approved"}
        if order.fulfillment_status != PaymentOrder.FulfillmentStatus.COMPLETED:
            try:
                result = complete_order(order, actor=admin.get("email", "admin"))
                order.refresh_from_db()
            except Exception as exc:
                return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"data": result, "order": serialize_payment_order(order)},
            status=status.HTTP_200_OK,
        )


def get_config():
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


def serialize_config(config):
    return {
        "profit_percentage": str(config.profit_percentage),
        "processing_fee": str(config.processing_fee),
        "giftcard_processing_fee": str(config.giftcard_processing_fee),
        "order_mode": config.order_mode,
    }


def serialize_blocked_url(entry):
    return {
        "id": entry.id,
        "url": entry.url,
        "reason": entry.reason,
        "is_active": entry.is_active,
        "created_at": entry.created_at,
        "updated_at": entry.updated_at,
    }


def _bust_sitemap_cache():
    cache.delete(f"seo_sitemap_giftcards:{SITEMAP_GIFTCARD_MAX_PAGES}")


class AdminBlockedUrlAdminListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def get(self, request):
        entries = BlockedUrl.objects.all()
        return Response([serialize_blocked_url(e) for e in entries], status=status.HTTP_200_OK)


class AdminBlockedUrlListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        # Public — used by server.js to enforce blocks. Returns only active URLs as plain strings.
        entries = BlockedUrl.objects.filter(is_active=True).values_list("url", flat=True)
        return Response(list(entries), status=status.HTTP_200_OK)

    @require_admin
    def post(self, request):
        url = str(request.data.get("url") or "").strip()
        reason = str(request.data.get("reason") or "").strip()
        if not url:
            return Response({"error": "url is required."}, status=status.HTTP_400_BAD_REQUEST)

        entry, created = BlockedUrl.objects.get_or_create(url=url, defaults={"reason": reason, "is_active": True})
        if not created:
            entry.reason = reason
            entry.is_active = True
            entry.save(update_fields=["reason", "is_active", "updated_at"])

        _bust_sitemap_cache()
        return Response(serialize_blocked_url(entry), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class AdminBlockedUrlDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @require_admin
    def patch(self, request, entry_id):
        try:
            entry = BlockedUrl.objects.get(id=entry_id)
        except BlockedUrl.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if "is_active" in request.data:
            entry.is_active = bool(request.data["is_active"])
        if "reason" in request.data:
            entry.reason = str(request.data["reason"] or "").strip()
        entry.save(update_fields=["is_active", "reason", "updated_at"])
        _bust_sitemap_cache()
        return Response(serialize_blocked_url(entry), status=status.HTTP_200_OK)

    @require_admin
    def delete(self, request, entry_id):
        try:
            entry = BlockedUrl.objects.get(id=entry_id)
        except BlockedUrl.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        entry.delete()
        _bust_sitemap_cache()
        return Response({"status": "deleted"}, status=status.HTTP_200_OK)
