from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0003_add_public_id_to_order"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="fulfillment_type",
            field=models.CharField(
                choices=[
                    ("none", "None"),
                    ("topup", "Top-up"),
                    ("giftcard", "Gift card"),
                ],
                db_index=True,
                default="none",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="fulfillment_payload",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="order",
            name="fulfillment_status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("processing", "Processing"),
                    ("completed", "Completed"),
                    ("failed", "Failed"),
                ],
                db_index=True,
                default="pending",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="fulfillment_error",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="order",
            name="fulfilled_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
