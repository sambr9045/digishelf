import requests
from django.core.cache import cache

class Reloady:
    TOKEN_EXPIRATION = 24 * 60 * 60  # 24 hours in seconds

    def __init__(self, public_key, secret_key, token_url):
        self.public_key = public_key
        self.secret_key = secret_key
        self.token_url = token_url

    def fetch_token(self, audience):
        payload = {
            "client_id": self.public_key,
            "client_secret": self.secret_key,
            "grant_type": "client_credentials",
            "audience": audience
        }

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        response = requests.post(self.token_url, json=payload, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        access_token = response_data.get('access_token')
        print(access_token)
        return access_token

    def get_token(self, audience):
        token_cache_key = f"{audience}_access_token"
        token = cache.get(token_cache_key)
        if not token:
            token = self.fetch_token(audience)
            cache.set(token_cache_key, token, timeout=self.TOKEN_EXPIRATION)
            
        return token

    def make_api_request(self, api_endpoint, accept_header, audience, method='GET', data=None):
        token = self.get_token(audience)

        headers = {
            "Accept": accept_header,
            'Authorization': f'Bearer {token}'
        }

        if method == 'GET':
            response = requests.get(api_endpoint, headers=headers)
        elif method == 'POST':
            response = requests.post(api_endpoint, headers=headers, json=data)
        response.raise_for_status()
        return response.json()

    def airtime_top_up(self, data):
        api_endpoint = 'https://www.sample.com/api/airtime-topup'
        audience = "https://topups-sandbox.reloadly.com"  # Replace with the appropriate audience for airtime top-up
        accept_header = "application/com.reloadly.topups-v1+json"
        return self.make_api_request(api_endpoint, accept_header, audience, method='POST', data=data)

    def get_operators(self):
        api_endpoint = 'https://www.sample.com/api/getoperators'
        audience = "https://operators-sandbox.reloadly.com"  # Replace with the appropriate audience for get operators
        accept_header = "application/com.reloadly.operators-v1+json"
        return self.make_api_request(api_endpoint, accept_header, audience)

    def bundle_top_up(self, data):
        api_endpoint = 'https://www.sample.com/api/bundletopup'
        audience = "https://bundles-sandbox.reloadly.com"  # Replace with the appropriate audience for bundle top-up
        accept_header = "application/com.reloadly.bundles-v1+json"
        return self.make_api_request(api_endpoint, accept_header, audience, method='POST', data=data)

    def gift_cards(self, data):
        api_endpoint = 'https://www.sample.com/api/giftcards'
        audience = "https://giftcards-sandbox.reloadly.com"  # Replace with the appropriate audience for gift cards
        accept_header = "application/com.reloadly.giftcards-v1+json"
        return self.make_api_request(api_endpoint, accept_header, audience, method='POST', data=data)

    def bill_payment(self, data):
        api_endpoint = 'https://www.sample.com/api/billpayment'
        audience = "https://billpayment-sandbox.reloadly.com"  # Replace with the appropriate audience for bill payment
        accept_header = "application/com.reloadly.billpayment-v1+json"
        return self.make_api_request(api_endpoint, accept_header, audience, method='POST', data=data)
