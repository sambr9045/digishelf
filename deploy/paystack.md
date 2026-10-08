Paystack gift card checkout

Set backend environment variables before deploying:

- `PAYSTACK_SECRET_KEY_GH`: Paystack secret key for an account that accepts GHS.
- `PAYSTACK_SECRET_KEY_NG`: Paystack secret key for an account that accepts NGN.
- `PAYSTACK_SECRET_KEY` is an optional shared fallback when the account supports the required currency.
- `FIA_CURRENCY_EXCHANGE_API_KEY`: server exchange-rate API key, also used by the existing currency endpoint.
- `PUBLIC_SITE_URL`: frontend origin, for example `https://digishelves.com`.

Enable card payments and Ghana mobile money in the appropriate Paystack dashboards. Configure each account's webhook URL as `https://<backend-host>/api/payments/paystack/webhook/`. No Paystack secret or public key is needed in the frontend.

Run `python manage.py migrate` and deploy both backend and frontend. The migration has been applied to the local workspace database.

Paystack checkout is available to all visitors regardless of IP or country. Payments use the Ghana merchant account in GHS, with card and mobile money offered inside Paystack. Use `PAYSTACK_SECRET_KEY_GH` or the shared `PAYSTACK_SECRET_KEY` for that account. IP-country detection is not used for Paystack options, quotes, or initialization. MoMo requires a supported Ghana mobile-money account; acceptance of international cards depends on your Paystack account configuration.

Checkout prices are calculated from Reloadly product data and server exchange rates; browser totals are not trusted. Payments are verified against the stored reference, amount, currency, and customer email. Signed webhooks support payments completed after the browser closes. Existing automatic/manual fulfillment settings apply.

Validation: `python manage.py test payments` and `npm --prefix frontend run build`. To test locally, mock `visitor_country` in tests; localhost requires the browser’s detected public IP hint. Complete a test-mode card payment and Ghana mobile money payment on a public staging deployment before switching to live keys.

Checkout rates use the free, keyless ExchangeRate-API open-access endpoint first. The keyed service is used only as a fallback if configured. Valid rates are cached for 24 hours. Product validation reuses the existing server-owned gift card catalog cache. Upstream Reloadly credentials must remain valid for uncached products and fulfillment.

Paystack quotes validate fresh Reloadly product data, use the fixed sender-price map or the FX endpoint for range values, and include sender fees before applying existing platform processing fees. Discounts are retained rather than assumed. Quotes are signed and valid for 10 minutes; initialization uses the saved quote and the order stores the provider cost snapshot. The conversion of a non-USD wallet cost into USD, and USD into GHS, uses the cached general rates. This pricing verification currently applies to Paystack checkout; crypto continues its existing calculation.
