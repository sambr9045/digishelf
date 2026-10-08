import hashlib
import hmac
import json
import os
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory

from .models import Order
from .paystack import (
    PaystackInitializeView, PaystackWebhookView, payment_options, price_cart, settle, visitor_country, exchange_rates,
)


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
class PaystackTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.keys = patch.dict(os.environ, {"PAYSTACK_SECRET_KEY": "test-secret", "PAYSTACK_SECRET_KEY_GH": "", "PAYSTACK_SECRET_KEY_NG": ""})
        self.keys.start()
        self.addCleanup(self.keys.stop)

    def order(self):
        return Order.objects.create(amount="12.50", wallet_address="", wallet_index=0,
            payment_provider="paystack", provider_reference="DSP-test", payment_currency="GHS",
            payment_amount_minor=15000, customer_email="buyer@example.com", fulfillment_type="giftcard",
            fulfillment_payload={"transaction": {"country": "GH"}, "payment_details": {}})

    def verified(self, **changes):
        return {"status": "success", "reference": "DSP-test", "amount": 15000,
            "currency": "GHS", "customer": {"email": "buyer@example.com"}, **changes}

    def test_channels_follow_country(self):
        self.assertEqual(payment_options("GH")["channels"], ["card", "mobile_money"])
        self.assertEqual(payment_options("NG")["channels"], ["card"])
        self.assertEqual(payment_options("US")["channels"], [])

    @patch("payments.paystack.requests.get")
    def test_private_ip_does_not_guess_eligible_country(self, get):
        request = self.factory.get("/", REMOTE_ADDR="127.0.0.1")
        from rest_framework.request import Request
        request = Request(request)
        self.assertEqual(visitor_country(request), "")
        get.assert_not_called()

    @patch("payments.paystack.visitor_country", return_value="US")
    @patch("payments.paystack.paystack_request")
    def test_ineligible_initialization_rejected(self, provider, country):
        request = self.factory.post("/", {"channel": "card", "country": "GH"}, format="json")
        self.assertEqual(PaystackInitializeView.as_view()(request).status_code, 400)
        country.assert_not_called()
        provider.assert_not_called()
        self.assertEqual(Order.objects.count(), 0)

    @patch("payments.paystack.get_platform_config", return_value=SimpleNamespace(order_mode="manual"))
    @patch("payments.paystack.paystack_request")
    def test_amount_currency_reference_and_email_must_match(self, provider, config):
        order = self.order()
        for changes in ({"amount": 1}, {"currency": "NGN"}, {"reference": "other"}, {"customer": {"email": "other@example.com"}}):
            provider.return_value = self.verified(**changes)
            with self.assertRaises(ValueError):
                settle("DSP-test")
            order.refresh_from_db()
            self.assertEqual(order.status, "pending")

    @patch("payments.paystack.get_platform_config", return_value=SimpleNamespace(order_mode="auto"))
    @patch("payments.paystack.complete_order")
    @patch("payments.paystack.paystack_request")
    def test_duplicate_verification_fulfills_once(self, provider, complete, config):
        self.order()
        provider.return_value = self.verified()
        def finish(order, **kwargs):
            order.fulfillment_status = "completed"
            order.save(update_fields=["fulfillment_status"])
        complete.side_effect = finish
        self.assertEqual(settle("DSP-test").status, "paid")
        self.assertEqual(settle("DSP-test").status, "paid")
        complete.assert_called_once()

    @patch("payments.paystack.paystack_request")
    def test_pending_payment_is_not_paid(self, provider):
        self.order()
        provider.return_value = self.verified(status="pending")
        self.assertEqual(settle("DSP-test").status, "pending")

    @patch("payments.paystack.settle")
    def test_webhook_requires_signature(self, verify):
        body = json.dumps({"event": "charge.success", "data": {"reference": "DSP-test"}})
        request = self.factory.post("/", body, content_type="application/json")
        self.assertEqual(PaystackWebhookView.as_view()(request).status_code, 401)
        verify.assert_not_called()
        signature = hmac.new(b"test-secret", body.encode(), hashlib.sha512).hexdigest()
        request = self.factory.post("/", body, content_type="application/json", HTTP_X_PAYSTACK_SIGNATURE=signature)
        self.assertEqual(PaystackWebhookView.as_view()(request).status_code, 200)
        verify.assert_called_once_with("DSP-test")

    @patch("payments.paystack.get_platform_config", return_value=SimpleNamespace(giftcard_processing_fee=5))
    @patch("payments.paystack.reloady.Reloady")
    def test_prices_and_product_details_come_from_server(self, client, config):
        client.return_value.make_api_request.return_value = {
            "productName": "Real card", "denominationType": "FIXED", "fixedRecipientDenominations": [10],
            "recipientCurrencyCode": "USD", "logoUrls": [], "senderCurrencyCode": "USD", "fixedRecipientToSenderDenominationsMap": {"10": 10},
        }
        products, total = price_cart([{"productId": 1, "recipientAmount": 10, "quantity": 2, "AmountToPay": "0.01", "productName": "Fake"}], {"USD": 1})
        self.assertEqual(total, Decimal("25.00"))
        self.assertEqual(products[0]["productName"], "Real card")
        self.assertEqual(products[0]["AmountToPay"], "10.00")
        with self.assertRaises(ValueError):
            price_cart([{"productId": 1, "recipientAmount": 1}], {"USD": 1})

    @patch("payments.paystack.send_admin_new_order_notification")
    @patch("payments.paystack.paystack_request")
    @patch("payments.paystack.quote")
    @patch("payments.paystack.visitor_country", return_value="GH")
    def test_initialize_uses_server_total_and_requested_channel(self, country, quote, provider, notify):
        quote.return_value = ({"currency": "GHS"}, "mobile_money", [], Decimal("12.50"), Decimal("150.00"))
        provider.return_value = {"authorization_url": "https://checkout.paystack.com/test"}
        request = self.factory.post("/", {"email": "buyer@example.com", "channel": "mobile_money",
            "expected_amount": "150.00", "expected_currency": "GHS", "amount": "1"}, format="json")
        response = PaystackInitializeView.as_view()(request)
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get()
        self.assertEqual(order.payment_amount_minor, 15000)
        self.assertEqual(order.wallet_address, "")
        self.assertEqual(provider.call_args.args[2]["channels"], ["mobile_money"])
        self.assertEqual(provider.call_args.args[2]["amount"], 15000)

    @patch("payments.paystack.get_platform_config", return_value=SimpleNamespace(order_mode="auto"))
    @patch("payments.paystack.complete_order", side_effect=ValueError("provider down"))
    @patch("payments.paystack.paystack_request")
    def test_fulfillment_failure_preserves_confirmed_payment(self, provider, complete, config):
        order = self.order()
        provider.return_value = self.verified()
        with self.assertRaises(ValueError):
            settle("DSP-test")
        order.refresh_from_db()
        self.assertEqual(order.status, "paid")

    def test_missing_keys_do_not_hide_eligible_channels(self):
        with patch.dict(os.environ, {"PAYSTACK_SECRET_KEY": "", "PAYSTACK_SECRET_KEY_GH": "", "PAYSTACK_SECRET_KEY_NG": ""}):
            self.assertEqual(payment_options("GH")["channels"], ["card", "mobile_money"])
            self.assertEqual(payment_options("NG")["channels"], ["card"])
            self.assertFalse(payment_options("GH")["configured"])

    @patch("payments.paystack.cache")
    @patch("payments.paystack.requests.get")
    def test_private_proxy_resolves_public_browser_ip_hint(self, get, cache):
        from rest_framework.request import Request
        cache.get.return_value = None
        get.return_value.json.return_value = {"country_code": "GH"}
        request = Request(self.factory.get("/?visitor_ip=8.8.8.8", REMOTE_ADDR="127.0.0.1"))
        self.assertEqual(visitor_country(request), "GH")
        get.assert_called_once_with("https://ipapi.co/8.8.8.8/json/", timeout=5)

    @patch("payments.paystack.cache")
    @patch("payments.paystack.requests.get")
    def test_public_proxy_ip_takes_priority_over_browser_hint(self, get, cache):
        from rest_framework.request import Request
        cache.get.return_value = None
        get.return_value.json.return_value = {"country_code": "NG"}
        request = Request(self.factory.get("/?visitor_ip=8.8.8.8", HTTP_X_REAL_IP="1.1.1.1"))
        self.assertEqual(visitor_country(request), "NG")
        get.assert_called_once_with("https://ipapi.co/1.1.1.1/json/", timeout=5)

    @patch("payments.paystack.requests.get")
    def test_public_rate_failure_uses_keyed_fallback_and_cache(self, get):
        from unittest.mock import Mock
        import requests
        from django.core.cache import cache
        cache.clear()
        primary = Mock()
        primary.raise_for_status.side_effect = requests.HTTPError("quota-reached")
        fallback = Mock()
        rates = {"USD": 1, "EUR": 0.9, "GHS": 12, "NGN": 1500}
        fallback.json.return_value = {"result": "success", "rates": rates}
        get.side_effect = [primary, fallback]
        with patch.dict(os.environ, {"FIA_CURRENCY_EXCHANGE_API_KEY": "test-key"}):
            self.assertEqual(exchange_rates(), rates)
            self.assertEqual(exchange_rates(), rates)
        self.assertEqual(get.call_count, 2)
        self.assertEqual(get.call_args_list[0].args[0], "https://open.er-api.com/v6/latest/USD")
        self.assertIn("test-key", get.call_args.args[0])

    @patch("payments.paystack.requests.get")
    def test_invalid_rates_are_not_used_for_payment(self, get):
        from django.core.cache import cache
        cache.clear()
        get.return_value.json.return_value = {"result": "success", "rates": {"USD": 1, "EUR": 0.9, "GHS": -1, "NGN": 1500}}
        with self.assertRaisesRegex(ValueError, "temporarily unavailable"):
            exchange_rates()

    @patch("payments.paystack.get_platform_config", return_value=SimpleNamespace(giftcard_processing_fee=5))
    @patch("payments.paystack.reloady.Reloady")
    def test_checkout_reuses_server_catalog_cache(self, client, config):
        from django.core.cache import cache
        cache.clear()
        params = {"type": None, "productId": "123", "page": "1", "size": "60"}
        key = "giftcards:" + hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()
        cache.set(key, {"productId": 123, "productName": "Cached card", "denominationType": "RANGE",
            "minRecipientDenomination": 1, "maxRecipientDenomination": 50, "recipientCurrencyCode": "EUR", "senderCurrencyCode": "USD"})
        client.return_value.make_api_request.return_value = {"senderCurrency": "USD", "recipientCurrency": "EUR", "recipientAmount": 10, "senderAmount": 10}
        products, total = price_cart([{"productId": 123, "recipientAmount": "10", "quantity": 1}], {"EUR": 1})
        self.assertEqual(total, Decimal("12.50"))
        self.assertIn("/fx-rate?", client.return_value.make_api_request.call_args.args[0])
        cache.clear()

    @patch("payments.product_seo.get_platform_config", return_value=SimpleNamespace(giftcard_processing_fee=5))
    @patch("payments.product_seo.exchange_rates", return_value={"EUR": "0.90"})
    def test_product_seo_pricing_uses_server_rates_without_mutating_catalog(self, rates, config):
        from .product_seo import attach_product_pricing
        product = {"productId": 1, "recipientCurrencyCode": "EUR"}
        result = attach_product_pricing(product)
        self.assertEqual(result["seo_pricing"]["recipient_rate"], "0.90")
        self.assertEqual(result["seo_pricing"]["fee_percentage"], "5")
        self.assertNotIn("seo_pricing", product)

    @patch("payments.product_seo.exchange_rates", side_effect=ValueError("unavailable"))
    def test_product_seo_omits_stale_prices_when_rates_fail(self, rates):
        from .product_seo import attach_product_pricing
        result = attach_product_pricing({"productId": 1, "seo_pricing": {"recipient_rate": "old"}})
        self.assertNotIn("seo_pricing", result)

    @patch("payments.paystack.exchange_rates", return_value={"USD": 1, "GHS": 12})
    @patch("payments.paystack.price_cart", return_value=([], Decimal("23.00")))
    def test_combined_paystack_method_allows_hosted_channel_choice(self, price, rates):
        from rest_framework.request import Request
        from .paystack import quote
        from rest_framework.parsers import JSONParser
        request = Request(self.factory.post("/", {"channel": "paystack", "products": []}, format="json"), parsers=[JSONParser()])
        options, channel, _, _, total = quote(request, "GH")
        self.assertEqual(channel, "paystack")
        self.assertEqual(options["channels"], ["card", "mobile_money"])
        self.assertEqual(total, Decimal("276.00"))

    @patch("payments.paystack.requests.get")
    def test_public_rates_are_primary_even_with_key_configured(self, get):
        from django.core.cache import cache
        cache.clear()
        rates = {"USD": 1, "EUR": 0.9, "GHS": 12, "NGN": 1500}
        get.return_value.json.return_value = {"result": "success", "rates": rates}
        with patch.dict(os.environ, {"FIA_CURRENCY_EXCHANGE_API_KEY": "test-key"}):
            self.assertEqual(exchange_rates(), rates)
            self.assertEqual(exchange_rates(), rates)
        get.assert_called_once_with("https://open.er-api.com/v6/latest/USD", timeout=10)

    @patch("payments.paystack.cache")
    @patch("payments.paystack.requests.get")
    def test_country_failure_has_specific_customer_message(self, get, cache):
        import requests
        from rest_framework.request import Request
        cache.get.return_value = None
        get.side_effect = requests.Timeout()
        request = Request(self.factory.get("/", REMOTE_ADDR="8.8.8.8"))
        with self.assertRaisesRegex(ValueError, "confirm your payment country"):
            visitor_country(request)

    @patch("payments.paystack.cache")
    def test_product_auth_failure_does_not_expose_provider_details(self, cache):
        import requests
        from unittest.mock import Mock
        from .paystack import catalog_product
        cache.get.return_value = None
        client = Mock()
        response = Mock(status_code=401)
        client.make_api_request.side_effect = requests.HTTPError("private provider URL", response=response)
        with self.assertRaisesRegex(ValueError, "product verification failed"):
            catalog_product(client, 18681)

    @patch("payments.paystack.visitor_country", side_effect=AssertionError("IP lookup must not run"))
    def test_paystack_options_available_without_ip_lookup(self, lookup):
        from .paystack import PaystackOptionsView
        response = PaystackOptionsView.as_view()(self.factory.get("/", REMOTE_ADDR="127.0.0.1"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["currency"], "GHS")
        self.assertEqual(response.data["channels"], ["card", "mobile_money"])
        lookup.assert_not_called()

    @patch("payments.paystack.visitor_country", side_effect=AssertionError("IP lookup must not run"))
    @patch("payments.paystack.quote")
    def test_quote_uses_merchant_currency_without_ip_lookup(self, quote_mock, lookup):
        from .paystack import PaystackQuoteView
        quote_mock.return_value = ({"currency": "GHS"}, "paystack", [], Decimal("23"), Decimal("276"))
        response = PaystackQuoteView.as_view()(self.factory.post("/", {"channel": "paystack"}, format="json"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(quote_mock.call_args.args[1], "GH")
        lookup.assert_not_called()

    def test_fixed_provider_cost_includes_wallet_fees(self):
        from .provider_pricing import provider_cost
        from unittest.mock import Mock
        cost, snapshot = provider_cost(Mock(), {"denominationType": "FIXED", "senderCurrencyCode": "USD",
            "fixedRecipientToSenderDenominationsMap": {"20.0": 20}, "senderFee": 1, "senderFeePercentage": 8}, Decimal("20"), {})
        self.assertEqual(cost, Decimal("22.60"))
        self.assertEqual(snapshot["sender_fee_percentage"], "8")

    def test_range_uses_provider_fx_and_converts_wallet_currency(self):
        from .provider_pricing import provider_cost
        from unittest.mock import Mock
        client = Mock()
        client.make_api_request.return_value = {"senderCurrency": "EUR", "recipientCurrency": "GBP", "recipientAmount": 25, "senderAmount": 30}
        cost, _ = provider_cost(client, {"denominationType": "RANGE", "senderCurrencyCode": "EUR", "recipientCurrencyCode": "GBP"}, 25, {"EUR": 2})
        self.assertEqual(cost, Decimal("15.00"))
        self.assertIn("currencyCode=GBP", client.make_api_request.call_args.args[0])

    def test_invalid_provider_fx_is_rejected(self):
        from .provider_pricing import provider_cost
        from unittest.mock import Mock
        client = Mock()
        client.make_api_request.return_value = {"senderCurrency": "USD", "recipientCurrency": "EUR", "recipientAmount": 1, "senderAmount": 10}
        with self.assertRaisesRegex(ValueError, "does not match"):
            provider_cost(client, {"denominationType": "RANGE", "senderCurrencyCode": "USD", "recipientCurrencyCode": "EUR"}, 25, {})

    @patch("payments.paystack.send_admin_new_order_notification")
    @patch("payments.paystack.paystack_request")
    @patch("payments.paystack.quote")
    def test_initialize_preserves_signed_quote_without_repricing(self, quote_mock, provider, notify):
        from django.core import signing
        token = signing.dumps({"products": [], "usd_total": "23.00", "amount": "276.00", "currency": "GHS", "channel": "paystack"}, salt="paystack.price-quote", compress=True)
        provider.return_value = {"authorization_url": "https://checkout.paystack.com/test"}
        request = self.factory.post("/", {"email": "buyer@example.com", "channel": "paystack", "quote_token": token,
            "expected_amount": "276.00", "expected_currency": "GHS"}, format="json")
        response = PaystackInitializeView.as_view()(request)
        self.assertEqual(response.status_code, 201)
        quote_mock.assert_not_called()
        self.assertEqual(provider.call_args.args[2]["amount"], 27600)
        self.assertEqual(provider.call_args.args[2]["channels"], ["card", "mobile_money"])

    @patch("payments.paystack.paystack_request")
    def test_tampered_quote_cannot_create_payment(self, provider):
        request = self.factory.post("/", {"quote_token": "tampered"}, format="json")
        response = PaystackInitializeView.as_view()(request)
        self.assertEqual(response.status_code, 400)
        provider.assert_not_called()

    def test_paid_order_exposes_processing_success_without_creating_delivery(self):
        from .views import serialize_completion_payload
        order = self.order()
        order.status = "paid"
        order.fulfillment_payload["transaction"].update(reference="DSP-test", amount="150.00", products=[{
            "productName": "Netflix US", "recipientAmount": "20", "recipientCurrency": "USD", "quantity": 2}])
        order.save()
        payload = serialize_completion_payload(order)
        self.assertEqual(payload["data"]["fulfillment_status"], "pending")
        self.assertEqual(len(payload["data"]["transactionData"]), 2)
        self.assertEqual(payload["data"]["transactionData"][0]["redeem_data"], [])

    def test_unpaid_order_cannot_access_success_data(self):
        from .views import serialize_completion_payload
        with self.assertRaisesRegex(ValueError, "not confirmed"):
            serialize_completion_payload(self.order())
