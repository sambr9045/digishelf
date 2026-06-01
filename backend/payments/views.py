import os
import uuid
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.cache import cache
from django.core import signing
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, WalletIndex
from .tokens import get_payment_token, normalize_token_symbol
from .wallet import generate_address, validate_payment_environment
from .fulfillment import (
    attach_customer_email,
    build_order_summary,
    complete_order,
    extract_customer_email,
    get_platform_config,
    summarize_fulfillment_payload,
)
from .listener import StablecoinTransferListener
from .notifications import send_admin_new_order_notification

COMPLETION_TOKEN_SALT = "payments.completion"
COMPLETION_TOKEN_MAX_AGE_SECONDS = int(
    os.getenv("PAYMENT_COMPLETION_TOKEN_MAX_AGE_SECONDS", str(30 * 24 * 60 * 60))
)


def parse_usdc_amount(value):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("amount must be a decimal value with up to 6 decimals")

    if amount <= 0:
        raise ValueError("amount must be greater than zero")

    if amount.as_tuple().exponent < -6:
        raise ValueError("amount must not have more than 6 decimal places")

    return amount.quantize(Decimal("0.000001"))


def get_order_by_identifier(identifier):
    order = Order.objects.filter(payment_code__iexact=identifier).first()
    if order:
        return order

    try:
        public_id = uuid.UUID(str(identifier))
    except (TypeError, ValueError, AttributeError) as exc:
        raise Order.DoesNotExist() from exc

    return Order.objects.get(public_id=public_id)


def serialize_payment_activity(order):
    transfers = list(order.processed_transfers.order_by("-block_number", "-log_index"))
    total_received = sum((transfer.amount for transfer in transfers), Decimal("0"))
    confirmed_received = sum(
        (transfer.amount for transfer in transfers if transfer.confirmed),
        Decimal("0"),
    )
    required_confirmations = 3
    latest_transfer = transfers[0] if transfers else None
    highest_confirmations = max((transfer.confirmations for transfer in transfers), default=0)

    if not transfers:
        amount_match_status = "none"
    elif total_received == order.amount:
        amount_match_status = "exact"
    elif total_received < order.amount:
        amount_match_status = "under"
    else:
        amount_match_status = "over"

    remaining_amount = max(order.amount - confirmed_received, Decimal("0"))

    return {
        "payment_received": bool(transfers),
        "required_confirmations": required_confirmations,
        "current_confirmations": latest_transfer.confirmations if latest_transfer else 0,
        "highest_confirmations": highest_confirmations,
        "received_amount": str(total_received),
        "confirmed_received_amount": str(confirmed_received),
        "remaining_amount": str(remaining_amount),
        "exact_amount_received": amount_match_status == "exact",
        "amount_match_status": amount_match_status,
        "latest_transaction_hash": latest_transfer.transaction_hash if latest_transfer else "",
    }


def make_completion_token(order):
    return signing.dumps(
        {
            "order_id": str(order.public_id),
            "fulfillment_type": order.fulfillment_type,
        },
        salt=COMPLETION_TOKEN_SALT,
    )


def get_order_from_completion_token(token):
    data = signing.loads(
        token,
        salt=COMPLETION_TOKEN_SALT,
        max_age=COMPLETION_TOKEN_MAX_AGE_SECONDS,
    )
    return Order.objects.get(public_id=data["order_id"])


def serialize_completion_payload(order):
    from api import models as api_models
    from api import serializers as api_serializers

    if order.fulfillment_status != Order.FulfillmentStatus.COMPLETED:
        raise ValueError("Order fulfillment is not complete yet.")

    summary = build_order_summary(order)
    reference = summary.get("reference")
    if not reference:
        raise ValueError("Order completion reference is missing.")

    base_payload = {
        "order_id": order.payment_code,
        "public_id": str(order.public_id),
        "fulfillment_type": order.fulfillment_type,
        "reference": reference,
        "completion_token": make_completion_token(order),
    }

    if order.fulfillment_type == Order.FulfillmentType.GIFTCARD:
        transaction = api_models.GiftCardTransaction.objects.filter(reference=reference).first()
        if not transaction:
            raise ValueError("Gift card transaction not found.")

        transaction_products = api_models.TransactionProduct.objects.filter(
            GiftCardTransaction=transaction
        )
        return {
            **base_payload,
            "data": {
                "product_data": api_serializers.GiftCardTransactionSerializer(transaction).data,
                "transactionData": api_serializers.TransactionProductSerializer(
                    transaction_products,
                    many=True,
                ).data,
            },
        }

    if order.fulfillment_type == Order.FulfillmentType.TOPUP:
        topup = api_models.TopupTransaction.objects.filter(reference=reference).first()
        if not topup:
            raise ValueError("Top-up transaction not found.")

        return {
            **base_payload,
            "data": api_serializers.AirtimTopUpSerializer(topup).data,
        }

    raise ValueError("Unsupported fulfillment type.")


class CreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            validate_payment_environment()
            amount = parse_usdc_amount(request.data.get("amount"))
            token_symbol = normalize_token_symbol(request.data.get("token_symbol"))
            payment_token = get_payment_token(token_symbol)
            fulfillment_type = request.data.get("fulfillment_type") or Order.FulfillmentType.NONE
            fulfillment_payload = request.data.get("fulfillment_payload") or {}
            if fulfillment_type not in Order.FulfillmentType.values:
                raise ValueError("Invalid fulfillment_type")
            if fulfillment_payload and not isinstance(fulfillment_payload, dict):
                raise ValueError("fulfillment_payload must be an object")
            authenticated_email = (
                request.user.email.strip()
                if getattr(request.user, "is_authenticated", False) and getattr(request.user, "email", "")
                else ""
            )
            customer_email = extract_customer_email(fulfillment_type, fulfillment_payload)
            if not customer_email and authenticated_email:
                fulfillment_payload = attach_customer_email(
                    fulfillment_type,
                    fulfillment_payload,
                    authenticated_email,
                )
            customer_email = extract_customer_email(fulfillment_type, fulfillment_payload)
            if fulfillment_type in {Order.FulfillmentType.TOPUP, Order.FulfillmentType.GIFTCARD} and not customer_email:
                raise ValueError("Customer email is required for this order")
            summary_snapshot = summarize_fulfillment_payload(
                fulfillment_type,
                fulfillment_payload,
                amount=amount,
                token_symbol=payment_token.symbol,
            )
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            wallet_index_state, _ = WalletIndex.objects.select_for_update().get_or_create(
                pk=1,
                defaults={"next_index": 0},
            )

            # Keep pointer in sync with existing rows (covers restored DBs or manual edits).
            max_used_index = Order.objects.order_by("-wallet_index").values_list("wallet_index", flat=True).first()
            if max_used_index is not None and wallet_index_state.next_index <= max_used_index:
                wallet_index_state.next_index = max_used_index + 1

            order = None
            for _ in range(8):
                wallet_index = wallet_index_state.next_index
                wallet = generate_address(wallet_index)
                try:
                    order = Order.objects.create(
                        amount=amount,
                        token_symbol=payment_token.symbol,
                        token_contract_address=payment_token.contract_address,
                        wallet_address=wallet["address"],
                        wallet_index=wallet_index,
                        fulfillment_type=fulfillment_type,
                        customer_email=customer_email,
                        fulfillment_payload=fulfillment_payload,
                        summary_snapshot=summary_snapshot,
                    )
                except IntegrityError:
                    # Advance and retry if this index/address already exists.
                    wallet_index_state.next_index = wallet_index + 1
                    continue

                wallet_index_state.next_index = wallet_index + 1
                wallet_index_state.save(update_fields=["next_index", "updated_at"])
                break

            if order is None:
                raise ValueError("Unable to allocate a unique wallet address for order")

        send_admin_new_order_notification(order, summary_snapshot)

        return Response(
            {
                "order_id": order.payment_code,
                "public_id": str(order.public_id),
                "wallet_address": order.wallet_address,
                "amount": str(order.amount),
                "token_symbol": order.token_symbol,
                "network": "Ethereum ERC20",
                "fulfillment_status": order.fulfillment_status,
                "order_summary": build_order_summary(order),
                "completion_token": (
                    make_completion_token(order)
                    if order.fulfillment_status == Order.FulfillmentStatus.COMPLETED
                    else ""
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class OrderStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_id):
        try:
            order = get_order_by_identifier(order_id)
        except (Order.DoesNotExist, Exception):
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == Order.Status.PENDING:
            throttle_key = f"payments:order-status-sync:{order.pk}"
            should_sync = cache.get(throttle_key) is None
            if should_sync:
                cache.set(throttle_key, True, timeout=12)
                try:
                    listener = StablecoinTransferListener()
                    listener.scan_order(order)
                    order.refresh_from_db()
                except Exception:
                    order.refresh_from_db()

        if (
            order.status == Order.Status.PAID
            and order.fulfillment_status == Order.FulfillmentStatus.PENDING
            and get_platform_config().order_mode == "auto"
        ):
            try:
                complete_order(order, actor="status-check")
                order.refresh_from_db()
            except Exception:
                order.refresh_from_db()

        return Response(
            {
                "order_id": order.payment_code,
                "public_id": str(order.public_id),
                "amount": str(order.amount),
                "token_symbol": order.token_symbol,
                "network": "Ethereum ERC20",
                "wallet_address": order.wallet_address,
                "status": order.status,
                "fulfillment_type": order.fulfillment_type,
                "fulfillment_status": order.fulfillment_status,
                "fulfillment_error": order.fulfillment_error,
                "order_mode": get_platform_config().order_mode,
                "order_summary": build_order_summary(order),
                "created_at": order.created_at,
                "paid_at": order.paid_at,
                "payment_activity": serialize_payment_activity(order),
                "completion_token": (
                    make_completion_token(order)
                    if order.fulfillment_status == Order.FulfillmentStatus.COMPLETED
                    else ""
                ),
            }
        )


class FulfillOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_id):
        config = get_platform_config()
        if config.order_mode != "auto":
            return Response(
                {"error": "This store is in manual order mode."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            order = get_order_by_identifier(order_id)
            result = complete_order(order, actor="auto")
            order.refresh_from_db()
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        response_payload = {"data": result}
        if order.fulfillment_status == Order.FulfillmentStatus.COMPLETED:
            response_payload["data"]["completion_token"] = make_completion_token(order)

        return Response(response_payload, status=status.HTTP_200_OK)


class CompletionOrderView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            order = get_order_from_completion_token(token)
            payload = serialize_completion_payload(order)
        except (signing.BadSignature, signing.SignatureExpired, Order.DoesNotExist, ValueError):
            return Response(
                {"error": "Completed order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(payload, status=status.HTTP_200_OK)
