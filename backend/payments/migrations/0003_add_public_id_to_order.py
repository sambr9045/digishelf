import uuid
from django.db import migrations, models


def populate_public_id(apps, schema_editor):
    Order = apps.get_model("payments", "Order")
    for order in Order.objects.filter(public_id__isnull=True):
        order.public_id = uuid.uuid4()
        order.save(update_fields=["public_id"])


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_add_payment_token_support'),
    ]

    operations = [
        # Step 1: add as nullable so existing rows don't conflict
        migrations.AddField(
            model_name='order',
            name='public_id',
            field=models.UUIDField(db_index=True, null=True, blank=True, editable=False),
        ),
        # Step 2: populate unique UUIDs for all existing rows
        migrations.RunPython(populate_public_id, migrations.RunPython.noop),
        # Step 3: apply unique constraint and remove nullable
        migrations.AlterField(
            model_name='order',
            name='public_id',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
