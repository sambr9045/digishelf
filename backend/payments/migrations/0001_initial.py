from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=6, max_digits=20)),
                ("wallet_address", models.CharField(db_index=True, max_length=42, unique=True)),
                ("wallet_index", models.PositiveIntegerField(unique=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("paid", "Paid")], db_index=True, default="pending", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
                ("paid_transaction_hash", models.CharField(blank=True, max_length=66, null=True, unique=True)),
                ("paid_block_number", models.PositiveBigIntegerField(blank=True, null=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ListenerCursor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=80, unique=True)),
                ("last_scanned_block", models.PositiveBigIntegerField(default=0)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="WalletIndex",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("next_index", models.PositiveIntegerField(default=0)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="ProcessedTransfer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("transaction_hash", models.CharField(max_length=66)),
                ("log_index", models.PositiveIntegerField()),
                ("from_address", models.CharField(max_length=42)),
                ("to_address", models.CharField(db_index=True, max_length=42)),
                ("amount", models.DecimalField(decimal_places=6, max_digits=20)),
                ("block_number", models.PositiveBigIntegerField(db_index=True)),
                ("confirmations", models.PositiveIntegerField(default=0)),
                ("confirmed", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("order", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="processed_transfers", to="payments.order")),
            ],
            options={
                "ordering": ["-block_number", "-log_index"],
                "unique_together": {("transaction_hash", "log_index")},
            },
        ),
    ]
