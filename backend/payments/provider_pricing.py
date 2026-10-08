"""Authoritative gift-card cost in the Reloadly wallet currency."""
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from urllib.parse import urlencode
from reloady import urls


def positive_money(value):
    amount = Decimal(str(value))
    if not amount.is_finite() or amount <= 0:
        raise ValueError("Invalid provider price.")
    return amount


def provider_cost(client, product, value, rates):
    value = positive_money(value)
    currency = product.get("senderCurrencyCode")
    if not currency:
        raise ValueError("Gift card pricing is missing its wallet currency.")
    if product.get("denominationType") == "FIXED":
        mapping = product.get("fixedRecipientToSenderDenominationsMap") or {}
        matches = [amount for denomination, amount in mapping.items() if Decimal(str(denomination)) == value]
        if not matches:
            raise ValueError("This gift card has no verified price for the selected value.")
        base = positive_money(matches[0])
    else:
        params = urlencode({"currencyCode": product["recipientCurrencyCode"], "amount": str(value)})
        fx = client.make_api_request(f"{urls.giftcards_base_url}/fx-rate?{params}", "application/com.reloadly.giftcards-v1+json", urls.giftcards_audience)
        if (fx.get("senderCurrency") != currency or fx.get("recipientCurrency") != product["recipientCurrencyCode"]
                or Decimal(str(fx.get("recipientAmount"))) != value):
            raise ValueError("Gift card exchange quote does not match the requested value.")
        base = positive_money(fx.get("senderAmount"))
    flat_fee = Decimal(str(product.get("senderFee") or 0))
    fee_percentage = Decimal(str(product.get("senderFeePercentage") or 0))
    if any(not v.is_finite() or v < 0 for v in (flat_fee, fee_percentage)):
        raise ValueError("Invalid provider fee.")
    # Do not subtract discounts: retaining them avoids assuming a discount applies.
    cost = base + flat_fee + base * fee_percentage / 100
    wallet_rate = Decimal("1") if currency == "USD" else positive_money(rates[currency])
    usd_cost = (cost / wallet_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return usd_cost, {"sender_currency": currency, "sender_amount": str(base), "sender_fee": str(flat_fee),
        "sender_fee_percentage": str(fee_percentage), "cost_usd": str(usd_cost)}
