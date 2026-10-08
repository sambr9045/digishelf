from unittest.mock import Mock, patch
import requests
from django.test import SimpleTestCase, override_settings
from django.core.cache import cache
from .reloady import Reloady


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
class TokenTests(SimpleTestCase):
    def setUp(self):
        cache.clear()
        self.client = Reloady("client", "secret", "https://auth.example/token")
        self.audience = "https://giftcards.example"

    @patch("reloady.reloady.cache.set")
    @patch("reloady.reloady.requests.post")
    def test_provider_expiry_controls_cache(self, post, put):
        post.return_value.json.return_value = {"access_token": "token", "expires_in": 300}
        self.assertEqual(self.client.fetch_token(self.audience), "token")
        self.assertEqual(put.call_args.kwargs["timeout"], 270)

    @patch("reloady.reloady.requests.post")
    def test_cached_token_avoids_repeated_auth_requests(self, post):
        post.return_value.json.return_value = {"access_token": "token", "expires_in": 300}
        self.assertEqual(self.client.get_token(self.audience), "token")
        self.assertEqual(self.client.get_token(self.audience), "token")
        post.assert_called_once()

    @patch("reloady.reloady.cache.set")
    @patch("reloady.reloady.requests.post")
    def test_missing_lifetime_is_not_cached(self, post, put):
        post.return_value.json.return_value = {"access_token": "token"}
        self.client.fetch_token(self.audience)
        put.assert_not_called()

    def test_tokens_isolated_by_account_and_audience(self):
        self.assertNotEqual(self.client.token_cache_key(self.audience), self.client.token_cache_key("other"))
        self.assertNotEqual(self.client.token_cache_key(self.audience), Reloady("client", "new-secret", self.client.token_url).token_cache_key(self.audience))

    @patch("reloady.reloady.requests.get")
    @patch.object(Reloady, "fetch_token", return_value="fresh")
    def test_401_refreshes_once(self, refresh, get):
        cache.set(self.client.token_cache_key(self.audience), "expired")
        rejected = Mock(status_code=401)
        success = Mock(status_code=200)
        success.json.return_value = {"productId": 1}
        get.side_effect = [rejected, success]
        self.assertEqual(self.client.make_api_request("https://api.example/product", "application/json", self.audience), {"productId": 1})
        refresh.assert_called_once()
        self.assertEqual(get.call_count, 2)

    @patch("reloady.reloady.requests.get")
    @patch.object(Reloady, "fetch_token", return_value="fresh")
    def test_second_401_stops(self, refresh, get):
        cache.set(self.client.token_cache_key(self.audience), "expired")
        response = Mock(status_code=401)
        response.raise_for_status.side_effect = requests.HTTPError()
        get.return_value = response
        with self.assertRaises(requests.HTTPError):
            self.client.make_api_request("https://api.example/product", "application/json", self.audience)
        self.assertEqual(get.call_count, 2)
        refresh.assert_called_once()

    @patch("reloady.reloady.requests.post")
    def test_purchase_rate_limit_is_never_retried(self, post):
        cache.set(self.client.token_cache_key(self.audience), "valid")
        post.return_value.status_code = 429
        post.return_value.raise_for_status.side_effect = requests.HTTPError()
        with self.assertRaises(requests.HTTPError):
            self.client.make_api_request("https://api.example/order", "application/json", self.audience, method="POST", data={})
        post.assert_called_once()
