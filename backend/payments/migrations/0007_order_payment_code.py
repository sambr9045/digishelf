import secrets

from django.db import migrations, models


def make_code():
    return secrets.token_hex(6).upper()


def backfill_payment_codes(apps, schema_editor):
    Order = apps.get_model("payments", "Order")
    used_codes = set(
        Order.objects.exclude(payment_code__isnull=True)
        .exclude(payment_code="")
        .values_list("payment_code", flat=True)
    )

    for order in Order.objects.filter(models.Q(payment_code__isnull=True) | models.Q(payment_code="")).iterator():
        code = make_code()
        while code in used_codes:
            code = make_code()
        order.payment_code = code
        order.save(update_fields=["payment_code"])
        used_codes.add(code)


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0006_order_customer_email_summary_snapshot"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="payment_code",
            field=models.CharField(blank=True, editable=False, max_length=12),
        ),
        migrations.RunPython(backfill_payment_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="order",
            name="payment_code",
            field=models.CharField(blank=True, editable=False, max_length=12, unique=True),
        ),
    ]
