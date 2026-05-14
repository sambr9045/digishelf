import secrets
import uuid

from django.db import models


def generate_payment_code():
    return secrets.token_hex(6).upper()


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"

    class Token(models.TextChoices):
        USDC = "USDC", "USDC"
        USDT = "USDT", "USDT"

    class FulfillmentType(models.TextChoices):
        NONE = "none", "None"
        TOPUP = "topup", "Top-up"
        GIFTCARD = "giftcard", "Gift card"

    class FulfillmentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    payment_code = models.CharField(max_length=12, unique=True, editable=False, blank=True)
    amount = models.DecimalField(max_digits=20, decimal_places=6)
    token_symbol = models.CharField(
        max_length=8,
        choices=Token.choices,
        default=Token.USDC,
        db_index=True,
    )
    token_contract_address = models.CharField(max_length=42, default="")
    wallet_address = models.CharField(max_length=42, unique=True, db_index=True)
    wallet_index = models.PositiveIntegerField(unique=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    paid_transaction_hash = models.CharField(
        max_length=66, unique=True, null=True, blank=True
    )
    paid_block_number = models.PositiveBigIntegerField(null=True, blank=True)
    fulfillment_type = models.CharField(
        max_length=20,
        choices=FulfillmentType.choices,
        default=FulfillmentType.NONE,
        db_index=True,
    )
    customer_email = models.EmailField(blank=True, default="", db_index=True)
    fulfillment_payload = models.JSONField(default=dict, blank=True)
    summary_snapshot = models.JSONField(default=dict, blank=True)
    fulfillment_status = models.CharField(
        max_length=20,
        choices=FulfillmentStatus.choices,
        default=FulfillmentStatus.PENDING,
        db_index=True,
    )
    fulfillment_error = models.TextField(blank=True, default="")
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    admin_approved = models.BooleanField(default=False, db_index=True)
    admin_approved_at = models.DateTimeField(null=True, blank=True)
    admin_approved_by = models.EmailField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.token_symbol} order {self.id} - {self.amount} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.payment_code:
            while True:
                candidate = generate_payment_code()
                if not self.__class__.objects.filter(payment_code=candidate).exists():
                    self.payment_code = candidate
                    break
        super().save(*args, **kwargs)


class WalletIndex(models.Model):
    next_index = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class ProcessedTransfer(models.Model):
    transaction_hash = models.CharField(max_length=66)
    log_index = models.PositiveIntegerField()
    token_symbol = models.CharField(max_length=8, default=Order.Token.USDC, db_index=True)
    token_contract_address = models.CharField(max_length=42, default="")
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="processed_transfers",
        null=True,
        blank=True,
    )
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42, db_index=True)
    amount = models.DecimalField(max_digits=20, decimal_places=6)
    block_number = models.PositiveBigIntegerField(db_index=True)
    confirmations = models.PositiveIntegerField(default=0)
    confirmed = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("transaction_hash", "log_index")
        ordering = ["-block_number", "-log_index"]


class ListenerCursor(models.Model):
    name = models.CharField(max_length=80, unique=True)
    last_scanned_block = models.PositiveBigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
