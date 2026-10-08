from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("payments", "0008_order_wallet_address_not_unique")]
    operations = [
        migrations.AddField(model_name="order", name="payment_provider", field=models.CharField(max_length=20, default="crypto", db_index=True)),
        migrations.AddField(model_name="order", name="provider_reference", field=models.CharField(max_length=100, unique=True, null=True, blank=True)),
        migrations.AddField(model_name="order", name="payment_currency", field=models.CharField(max_length=3, default="USD")),
        migrations.AddField(model_name="order", name="payment_amount_minor", field=models.PositiveBigIntegerField(null=True, blank=True)),
    ]
