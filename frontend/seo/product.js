export function sellingPrice(product, value) {
  const pricing = product?.seo_pricing;
  if (!pricing) return null;
  const rate = Number(pricing.recipient_rate);
  const percentage = Number(pricing.fee_percentage);
  const amount = Number(value);
  if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(percentage) || !Number.isFinite(amount) || amount <= 0) return null;
  const base = Math.round((amount / rate + Number.EPSILON) * 100) / 100;
  const fee = Math.round((base * percentage / 100 + (base < 500 ? 2 : -2) + Number.EPSILON) * 100) / 100;
  return (base + fee).toFixed(2);
}

export function returnPolicy(origin) {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: ["GH", "NG"],
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: `${origin}/terms-of-use#refunds`,
    description: "Delivered digital products cannot be returned. If payment is complete but the purchased value has not been received, eligible refund requests are processed within 24–78 hours of receipt. Statutory rights are unaffected.",
  };
}

export function productOffers(product, url, origin) {
  if (!product?.seo_pricing) return undefined;
  const common = {
    priceCurrency: "USD", url,
    ...(product.seo_pricing.valid_from ? { validFrom: product.seo_pricing.valid_from } : {}),
    shippingDetails: ["GH", "NG"].map((country) => ({
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: country },
      shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
      shippingSettingsLink: `${origin}/terms-of-use#delivery`,
      description: "Digital delivery by email. No physical shipping or shipping charge. Fulfillment follows payment verification and depends on provider availability.",
    })),
    seller: { "@type": "Organization", name: "Digishelves", url: origin },
    hasMerchantReturnPolicy: returnPolicy(origin),
    ...(product.status === "ACTIVE" ? { availability: "https://schema.org/InStock" } :
      product.status === "INACTIVE" ? { availability: "https://schema.org/OutOfStock" } : {}),
  };
  const values = product.fixedRecipientDenominations?.length
    ? product.fixedRecipientDenominations : Object.keys(product.fixedRecipientToSenderDenominationsMap || {});
  if (product.denominationType === "FIXED" && values.length) {
    return values.map((value) => ({ "@type": "Offer", ...common, price: sellingPrice(product, value) })).filter((offer) => offer.price !== null);
  }
  const lowPrice = sellingPrice(product, product.minRecipientDenomination);
  const highPrice = sellingPrice(product, product.maxRecipientDenomination);
  if (!lowPrice || !highPrice) return undefined;
  return { "@type": "AggregateOffer", ...common, lowPrice, highPrice };
}
