import logging
from decimal import Decimal
from django.core.cache import cache
from django.utils import timezone
from .paystack import exchange_rates
from .fulfillment import get_platform_config

logger = logging.getLogger(__name__)


def attach_product_pricing(product):
    if not isinstance(product, dict) or not product.get("productId"):
        return product
    result = dict(product)
    # Never publish a guessed price if authoritative pricing is unavailable.
    result.pop("seo_pricing", None)
    try:
        rates = exchange_rates()
        rate = Decimal(str(rates[product["recipientCurrencyCode"]]))
        if not rate.is_finite() or rate <= 0:
            return result
        timestamp_key = "seo:pricing-valid-from"
        valid_from = cache.get(timestamp_key)
        if not valid_from:
            valid_from = timezone.now().isoformat()
            cache.set(timestamp_key, valid_from, 24 * 60 * 60)
        result["seo_pricing"] = {
            "valid_from": valid_from,
            "recipient_rate": str(rate),
            "fee_percentage": str(get_platform_config().giftcard_processing_fee),
            "currency": "USD",
        }
    except Exception:
        logger.warning("Product SEO pricing unavailable for product %s", product.get("productId"))
    return result
