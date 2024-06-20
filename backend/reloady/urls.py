oparator_url = "https://topups-sandbox.reloadly.com/operators?includeBundles=true&includeData=true&suggestedAmountsMap=%7Bvalue%7D&size=10&page=2&includeCombo=%7Bvalue%7D&comboOnly=%7Bvalue%7D&bundlesOnly=%7Bvalue%7D&dataOnly=%7Bvalue%7D&pinOnly=%7Bvalue%7D"


# production
# gift_card = "https://giftcards.reloadly.com/countries"

gift_card_order = "https://giftcards-sandbox.reloadly.com/orders"

def gift_card_product_id(productId):
    return f"https://giftcards-sandbox.reloadly.com/products/{productId}" 
# sandbpx
gift_card = "https://giftcards-sandbox.reloadly.com/products?size=&page=&productName=playstation&countryCode=&includeRange=true&includeFixed=true&sorted=true"

token_url = "https://auth.reloadly.com/oauth/token"

def get_giftcard_url(productName, countryCode=""):
    return f"https://giftcards-sandbox.reloadly.com/products?size=30&page=2&productName={productName}&countryCode={countryCode}&includeRange=true&includeFixed=true&sorted=false"

def auto_detect_oparator(phone, country_code):
    return f"https://topups-sandbox.reloadly.com/operators/auto-detect/phone/{phone}/countries/{country_code}?suggestedAmountsMap=true"

def get_exchange_fiat_url(api_key):
    return f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"


url = "https://giftcards-sandbox.reloadly.com/products?size=&page=&productName=&countryCode=&includeRange=true&includeFixed=true"


def get_giftcard_redeem_code(transactionId):
    return f"https://giftcards-sandbox.reloadly.com/orders/transactions/{transactionId}/cards"

def get_giftcard_url_two(productName, countryCode="", page=""):
    return f"https://giftcards-sandbox.reloadly.com/products?size=5&page={page}&productName={productName}&countryCode={countryCode}&includeRange=true&includeFixed=true&sorted=false"