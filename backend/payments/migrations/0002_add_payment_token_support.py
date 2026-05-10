from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="token_symbol",
            field=models.CharField(
                choices=[("USDC", "USDC"), ("USDT", "USDT")],
                db_index=True,
                default="USDC",
                max_length=8,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="token_contract_address",
            field=models.CharField(default="", max_length=42),
        ),
        migrations.AddField(
            model_name="processedtransfer",
            name="token_symbol",
            field=models.CharField(db_index=True, default="USDC", max_length=8),
        ),
        migrations.AddField(
            model_name="processedtransfer",
            name="token_contract_address",
            field=models.CharField(default="", max_length=42),
        ),
    ]
