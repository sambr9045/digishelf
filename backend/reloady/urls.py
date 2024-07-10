oparator_url = "https://topups-sandbox.reloadly.com/operators?includeBundles=true&includeData=true&suggestedAmountsMap=trueD&size=10&page=1&includeCombo=false&comboOnly=false&bundlesOnly=false&dataOnly=false&pinOnly=false"


def phone_lookup(phone, country):
    return f"https://topups-sandbox.reloadly.com/operators/mnp-lookup/phone/{phone}/countries/?suggestedAmountsMap=true&suggestedAmounts=true"

balance_url = "https://topups-sandbox.reloadly.com/accounts/balance"
# production
# gift_card = "https://giftcards.reloadly.com/countries"

airtime_top_up = "https://topups-sandbox.reloadly.com/topups"

gift_card_order = "https://giftcards-sandbox.reloadly.com/orders"

def gift_card_product_id(productId):
    return f"https://giftcards-sandbox.reloadly.com/products/{productId}" 
# sandbpx
gift_card = "https://giftcards-sandbox.reloadly.com/products?size=&page=&productName=playstation&countryCode=&includeRange=true&includeFixed=true&sorted=true"

token_url = "https://auth.reloadly.com/oauth/token"

def get_giftcard_url(productName, countryCode=""):
    return f"https://giftcards-sandbox.reloadly.com/products?size=&page=&productName={productName}&countryCode={countryCode}&includeRange=true&includeFixed=true&sorted=false"

def auto_detect_oparator(phone, country_code):
    return f"https://topups-sandbox.reloadly.com/operators/auto-detect/phone/{phone}/countries/{country_code}?suggestedAmountsMap=true&includeBundles=false&includeData=false&includeCombo=true"

def get_exchange_fiat_url(api_key):
    return f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"


url = "https://giftcards-sandbox.reloadly.com/products?size=&page=&productName=&countryCode=&includeRange=true&includeFixed=true"


def get_giftcard_redeem_code(transactionId):
    return f"https://giftcards-sandbox.reloadly.com/orders/transactions/{transactionId}/cards"

def get_giftcard_url_two(productName, countryCode, page):
    return f"https://giftcards-sandbox.reloadly.com/products?size=24&page={page}&productName={productName}&countryCode={countryCode}&includeRange=true&includeFixed=true&sorted=false"