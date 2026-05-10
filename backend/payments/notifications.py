import os

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def get_admin_notification_email():
    return (
        os.getenv("ADMIN_NOTIFICTION_EMAIL")
        or os.getenv("ADMIN_NOTIFICATION_EMAIL")
        or ""
    ).strip()


def send_admin_new_order_notification(order, summary):
    admin_email = get_admin_notification_email()
    if not admin_email:
        return False

    fulfillment_type = (order.fulfillment_type or "order").replace("_", " ").title()
    subject = f"New {fulfillment_type} crypto order received"
    heading = f"New {fulfillment_type.lower()} order created"
    preheader = "A new crypto payment order is waiting in the admin dashboard."
    rows = [
        {"label": "Order ID", "value": str(order.public_id)},
        {"label": "Type", "value": fulfillment_type},
        {"label": "Customer email", "value": order.customer_email or "Not provided"},
        {"label": "Amount", "value": f"{order.amount} {order.token_symbol}"},
        {"label": "Recipient / Country", "value": summary.get("recipient") or summary.get("country") or "N/A"},
        {"label": "Reference", "value": summary.get("reference") or "N/A"},
    ]

    context = {
        "subject": subject,
        "heading": heading,
        "preheader": preheader,
        "rows": rows,
        "status_label": "New order",
        "site_name": "Digishelves",
        "support_email": getattr(settings, "DEFAULT_FROM_ADDRESS", settings.DEFAULT_FROM_EMAIL),
    }

    html_content = render_to_string("emails/order_update.html", context)
    text_lines = [heading, preheader, ""]
    for row in rows:
        text_lines.append(f"{row['label']}: {row['value']}")
    text_lines.append("")
    text_lines.append("Open the admin dashboard to review this order.")

    message = EmailMultiAlternatives(
        subject=subject,
        body="\n".join(text_lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[admin_email],
    )
    message.attach_alternative(html_content, "text/html")
    message.send(fail_silently=True)
    return True
