import os


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


DEBUG_MODE = env_bool("DEBUG", default=False)

RELOADLY_TOPUPS_SANDBOX_URL = os.getenv(
    "RELOADLY_TOPUPS_SANDBOX_URL",
    "https://topups-sandbox.reloadly.com",
).rstrip("/")
RELOADLY_TOPUPS_PRODUCTION_URL = os.getenv(
    "RELOADLY_TOPUPS_PRODUCTION_URL",
    "https://topups.reloadly.com",
).rstrip("/")
RELOADLY_GIFTCARDS_SANDBOX_URL = os.getenv(
    "RELOADLY_GIFTCARDS_SANDBOX_URL",
    "https://giftcards-sandbox.reloadly.com",
).rstrip("/")
RELOADLY_GIFTCARDS_PRODUCTION_URL = os.getenv(
    "RELOADLY_GIFTCARDS_PRODUCTION_URL",
    "https://giftcards.reloadly.com",
).rstrip("/")

topups_base_url = (
    RELOADLY_TOPUPS_SANDBOX_URL
    if DEBUG_MODE
    else RELOADLY_TOPUPS_PRODUCTION_URL
)
giftcards_base_url = (
    RELOADLY_GIFTCARDS_SANDBOX_URL
    if DEBUG_MODE
    else RELOADLY_GIFTCARDS_PRODUCTION_URL
)

topups_audience = topups_base_url
giftcards_audience = giftcards_base_url
token_url = os.getenv("RELOADLY_TOKEN_URL", "https://auth.reloadly.com/oauth/token")

oparator_url = (
    f"{topups_base_url}/operators?includeBundles=true&includeData=true"
    "&suggestedAmountsMap=trueD&size=10&page=1&includeCombo=false"
    "&comboOnly=false&bundlesOnly=false&dataOnly=false&pinOnly=false"
)


def get_operators_by_country(country):
    return (
        f"{topups_base_url}/operators/countries/{country}"
        "?suggestedAmountsMap=true&suggestedAmounts=true&"
    )


def phone_lookup(phone, country):
    return (
        f"{topups_base_url}/operators/mnp-lookup/phone/{phone}/countries/"
        "?suggestedAmountsMap=true&suggestedAmounts=true"
    )


balance_url = f"{topups_base_url}/accounts/balance"
airtime_top_up = f"{topups_base_url}/topups"
gift_card_order = f"{giftcards_base_url}/orders"
gift_card = (
    f"{giftcards_base_url}/products?size=&page=&productName=playstation"
    "&countryCode=&includeRange=true&includeFixed=true&sorted=true"
)
url = (
    f"{giftcards_base_url}/products?size=&page=&productName=&countryCode="
    "&includeRange=true&includeFixed=true"
)


def gift_card_product_id(productId):
    return f"{giftcards_base_url}/products/{productId}"


def get_giftcard_url(productName, countryCode=""):
    return (
        f"{giftcards_base_url}/products?size=&page=&productName={productName}"
        f"&countryCode={countryCode}&includeRange=true&includeFixed=true&sorted=false"
    )


def auto_detect_oparator(phone, country_code):
    return (
        f"{topups_base_url}/operators/auto-detect/phone/{phone}/countries/{country_code}"
        "?suggestedAmountsMap=true&includeBundles=false&includeData=false&includeCombo=true"
    )


def get_exchange_fiat_url(api_key):
    return f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"


def get_giftcard_redeem_code(transactionId):
    return f"{giftcards_base_url}/orders/transactions/{transactionId}/cards"


def get_giftcard_url_two(productName, countryCode, page, size=24):
    return (
        f"{giftcards_base_url}/products?size={size}&page={page}"
        f"&productName={productName}&countryCode={countryCode}"
        "&includeRange=true&includeFixed=true&sorted=false"
    )
