from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0007_order_payment_code"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="wallet_address",
            field=models.CharField(db_index=True, max_length=42),
        ),
    ]
