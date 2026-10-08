import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { productOffers, sellingPrice } from "../seo/product.js";

const product = { denominationType: "FIXED", fixedRecipientDenominations: [20, 30], seo_pricing: { recipient_rate: "1", fee_percentage: "5", valid_from: "2026-10-07T10:00:00+00:00" } };

test("offers advertise purchase totals including mandatory fees", () => {
  const offers = productOffers(product, "https://digishelves.com/gift-card/test/1", "https://digishelves.com");
  assert.equal(offers[0].price, "23.00");
  assert.equal(offers[1].price, "33.50");
  assert.equal(offers[0].priceCurrency, "USD");
  assert.equal(offers[0].validFrom, "2026-10-07T10:00:00+00:00");
  assert.equal(offers[0].shippingDetails.length, 2);
  assert.equal(offers[0].shippingDetails[0].shippingRate.value, 0);
  assert.equal(offers[0].shippingDetails[0].deliveryTime, undefined);
  assert.equal(offers[0].availability, undefined);
  assert.match(offers[0].hasMerchantReturnPolicy.merchantReturnLink, /terms-of-use#refunds$/);
  assert.equal(offers[0].hasMerchantReturnPolicy.merchantReturnDays, undefined);
});

test("unknown prices do not become guessed offers", () => {
  assert.equal(productOffers({ ...product, seo_pricing: undefined }, "/", "https://digishelves.com"), undefined);
  assert.equal(sellingPrice({ seo_pricing: { recipient_rate: "0", fee_percentage: "5" } }, 20), null);
});

test("range offers convert currency and reflect known unavailability", () => {
  const offers = productOffers({ ...product, denominationType: "RANGE", minRecipientDenomination: 10, maxRecipientDenomination: 100, status: "INACTIVE", seo_pricing: { recipient_rate: "2", fee_percentage: "5" } }, "/", "https://digishelves.com");
  assert.equal(offers.lowPrice, "7.25");
  assert.equal(offers.highPrice, "54.50");
  assert.equal(offers.availability, "https://schema.org/OutOfStock");
});

test("service worker never intercepts pages, API responses or verification files", () => {
  const handlers = {};
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    self: { location: { origin: "https://digishelves.com" }, addEventListener: (name, handler) => { handlers[name] = handler; } }, URL,
  });
  for (const pathname of ["/", "/checkout", "/gift-card/paystack/reference", "/api/payments/orders/", "/terms-of-use", "/.well-known/apple-developer-merchantid-domain-association"]) {
    handlers.fetch({ request: { method: "GET", url: `https://digishelves.com${pathname}`, mode: "navigate" }, respondWith: () => assert.fail(`Intercepted ${pathname}`) });
    handlers.fetch({ request: { method: "GET", url: `https://digishelves.com${pathname}`, mode: "cors" }, respondWith: () => assert.fail(`Intercepted ${pathname}`) });
  }
});
