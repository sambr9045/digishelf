from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0004_order_fulfillment_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="admin_approved",
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name="order",
            name="admin_approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="admin_approved_by",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
    ]
