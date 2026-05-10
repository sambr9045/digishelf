from django.contrib import admin

from .models import ListenerCursor, Order, ProcessedTransfer, WalletIndex


def get_order_customer_type(order):
    payload = order.fulfillment_payload or {}

    if order.fulfillment_type == Order.FulfillmentType.TOPUP:
        user_value = payload.get("userType")
        if isinstance(user_value, dict):
            return "Logged-in user"
        if isinstance(user_value, str):
            lowered = user_value.strip().lower()
            if lowered in {"guest", "email", "email_only", "email-only"}:
                return "Email only"
            if lowered:
                return "Logged-in user"
        return "Email only" if order.customer_email else "Unknown"

    if order.fulfillment_type == Order.FulfillmentType.GIFTCARD:
        transaction = payload.get("transaction") or {}
        if transaction.get("user"):
            return "Logged-in user"
        user_type = transaction.get("user_type")
        if isinstance(user_type, dict):
            return "Logged-in user"
        if isinstance(user_type, str):
            lowered = user_type.strip().lower()
            if lowered in {"guest", "email", "email_only", "email-only"}:
                return "Email only"
            if lowered:
                return "Logged-in user"
        return "Email only" if order.customer_email else "Unknown"

    return "Email only" if order.customer_email else "Unknown"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_email",
        "customer_type",
        "amount",
        "token_symbol",
        "wallet_address",
        "wallet_index",
        "status",
        "created_at",
        "paid_at",
    )
    search_fields = ("wallet_address", "paid_transaction_hash")
    list_filter = ("token_symbol", "status", "created_at", "paid_at")
    readonly_fields = (
        "token_contract_address",
        "wallet_address",
        "wallet_index",
        "paid_transaction_hash",
        "paid_block_number",
        "created_at",
        "paid_at",
    )

    @admin.display(description="Customer type")
    def customer_type(self, obj):
        return get_order_customer_type(obj)


@admin.register(WalletIndex)
class WalletIndexAdmin(admin.ModelAdmin):
    list_display = ("id", "next_index", "updated_at")


@admin.register(ProcessedTransfer)
class ProcessedTransferAdmin(admin.ModelAdmin):
    list_display = (
        "transaction_hash",
        "log_index",
        "token_symbol",
        "order",
        "amount",
        "confirmations",
        "confirmed",
        "block_number",
    )
    search_fields = ("transaction_hash", "to_address", "from_address")
    list_filter = ("token_symbol", "confirmed", "created_at")


@admin.register(ListenerCursor)
class ListenerCursorAdmin(admin.ModelAdmin):
    list_display = ("name", "last_scanned_block", "updated_at")
