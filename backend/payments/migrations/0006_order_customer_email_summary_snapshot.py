from django.db import migrations, models


def build_summary(order):
    payload = order.fulfillment_payload or {}

    if order.fulfillment_type == "topup":
        operator = payload.get("oparatorData", {}).get("data", {})
        return {
            "type": "topup",
            "reference": payload.get("transaction", {}).get("reference"),
            "recipient": payload.get("editNumber"),
            "operator": operator.get("name"),
            "operator_logo": (operator.get("logoUrls") or [None])[0],
            "receiver_amount": payload.get("receiverAmount"),
            "receiver_currency": payload.get("receiverCurrency"),
            "processing_fee": payload.get("ProcessingFee"),
            "total_paid": payload.get("amountPaid"),
            "payment_currency": payload.get("PaymentCurreuncy") or "USD",
            "email": payload.get("email"),
            "country": payload.get("country"),
        }

    if order.fulfillment_type == "giftcard":
        transaction = payload.get("transaction", {})
        products = transaction.get("products") or []
        return {
            "type": "giftcard",
            "reference": transaction.get("reference"),
            "email": transaction.get("email"),
            "country": transaction.get("country"),
            "total_paid": str(order.amount),
            "payment_currency": payload.get("payment_currency") or order.token_symbol or "USD",
            "product_count": len(products),
            "products": [
                {
                    "product_name": item.get("productName"),
                    "product_id": item.get("productId"),
                    "quantity": item.get("quantity"),
                    "recipient_amount": item.get("recipientAmount"),
                    "recipient_currency": item.get("recipientCurrency"),
                }
                for item in products
            ],
        }

    return {"type": order.fulfillment_type or "none"}


def backfill_customer_summary(apps, schema_editor):
    Order = apps.get_model("payments", "Order")
    for order in Order.objects.all().iterator():
        summary = build_summary(order)
        email = (summary.get("email") or "").strip()
        update_fields = []

        if not order.summary_snapshot:
            order.summary_snapshot = summary
            update_fields.append("summary_snapshot")

        if email and not order.customer_email:
            order.customer_email = email
            update_fields.append("customer_email")

        if update_fields:
            order.save(update_fields=update_fields)


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0005_order_admin_approval_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="customer_email",
            field=models.EmailField(blank=True, db_index=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="order",
            name="summary_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.RunPython(backfill_customer_summary, migrations.RunPython.noop),
    ]
