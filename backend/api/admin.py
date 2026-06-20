from django.contrib import admin

from . import models


@admin.register(models.Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "auth_type", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("auth_type", "is_active", "is_staff", "deleted", "suspended")


@admin.register(models.DigiShelfData)
class DigiShelfDataAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "profit_percentage",
        "processing_fee",
        "giftcard_processing_fee",
        "order_mode",
        "include_restricted_in_sitemap",
    )


@admin.register(models.UserDeviceGiftCardPayment)
class UserDeviceGiftCardPaymentAdmin(admin.ModelAdmin):
    list_display = ("GiftCardTransaction", "ip_address")
    search_fields = ("GiftCardTransaction__reference", "ip_address")


@admin.register(models.PaymentDetails)
class PaymentDetailsAdmin(admin.ModelAdmin):
    list_display = ("GiftCardTransaction", "status", "transaction", "trxref", "created_at")
    search_fields = ("GiftCardTransaction__reference", "transaction", "trxref")
    list_filter = ("status", "created_at")


@admin.register(models.GiftCardTransaction)
class GiftCardTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "email",
        "user_type",
        "user",
        "amount",
        "country",
        "payment_method",
        "created_at",
    )
    search_fields = ("reference", "email", "user__email")
    list_filter = ("user_type", "payment_method", "country", "created_at")


@admin.register(models.TransactionProduct)
class TransactionProductAdmin(admin.ModelAdmin):
    list_display = ("GiftCardTransaction", "product", "status", "amount", "currencyCode", "created_at")
    search_fields = ("GiftCardTransaction__reference", "product", "status")
    list_filter = ("status", "currencyCode", "created_at")


@admin.register(models.ErrorLog)
class ErrorLogAdmin(admin.ModelAdmin):
    list_display = ("reference", "email", "resolve", "created_at")
    search_fields = ("reference", "email")
    list_filter = ("resolve", "created_at")


@admin.register(models.Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "productName", "recipientAmount", "currencyToPayIn", "quantity", "created_at")
    search_fields = ("user__email", "productName")
    list_filter = ("currencyToPayIn", "created_at")


@admin.register(models.TopupTransaction)
class TopupTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "email",
        "user_type",
        "user",
        "operator",
        "phone_number",
        "total_paid",
        "sender_currency",
        "status",
        "created_at",
    )
    search_fields = ("reference", "email", "user__email", "phone_number")
    list_filter = ("user_type", "sender_currency", "status", "created_at")
