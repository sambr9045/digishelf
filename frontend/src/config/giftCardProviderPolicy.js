import { slugify } from "../utils/slugify";

/**
 * Provider URL policy audit (June 2025).
 *
 * Most gift card issuers prohibit unauthorized resellers from publishing
 * individual product listing pages that use their trademarks. Digishelves
 * consolidates all non-exempt cards on /gift-card to stay compliant.
 *
 * Brands may be added to DEEP_LINK_ALLOWED_BRANDS only after written
 * confirmation that individual deep-linked pages are permitted.
 */
export const GIFT_CARD_CATALOG_PATH = "/gift-card";

export const PROVIDER_URL_AUDIT = [
  {
    brand: "Visa",
    allowsDeepLink: false,
    reason:
      "Visa prepaid program rules restrict unauthorized resale and individual product listings.",
  },
  {
    brand: "Mastercard",
    allowsDeepLink: false,
    reason:
      "Mastercard prepaid program rules restrict unauthorized resale and individual product listings.",
  },
  {
    brand: "Amazon",
    allowsDeepLink: false,
    reason:
      "Amazon trademark and gift card terms prohibit unauthorized reseller product pages.",
  },
  {
    brand: "Apple",
    allowsDeepLink: false,
    reason:
      "Apple Media Services terms restrict third-party individual gift card listings.",
  },
  {
    brand: "iTunes",
    allowsDeepLink: false,
    reason:
      "Apple Media Services terms restrict third-party individual gift card listings.",
  },
  {
    brand: "Google",
    allowsDeepLink: false,
    reason:
      "Google Play brand guidelines prohibit unauthorized individual product pages.",
  },
  {
    brand: "Netflix",
    allowsDeepLink: false,
    reason:
      "Netflix brand guidelines prohibit unauthorized reseller product listings.",
  },
  {
    brand: "Spotify",
    allowsDeepLink: false,
    reason:
      "Spotify brand guidelines prohibit unauthorized reseller product listings.",
  },
  {
    brand: "Steam",
    allowsDeepLink: false,
    reason:
      "Valve/Steam trademark policy prohibits unauthorized individual product pages.",
  },
  {
    brand: "Uber",
    allowsDeepLink: false,
    reason:
      "Uber brand guidelines prohibit unauthorized reseller product listings.",
  },
  {
    brand: "Xbox",
    allowsDeepLink: false,
    reason:
      "Microsoft/Xbox trademark policy prohibits unauthorized individual product pages.",
  },
  {
    brand: "PlayStation",
    allowsDeepLink: false,
    reason:
      "Sony/PlayStation trademark policy prohibits unauthorized individual product pages.",
  },
  {
    brand: "Airbnb",
    allowsDeepLink: false,
    reason:
      "Airbnb brand guidelines prohibit unauthorized reseller product listings.",
  },
];

/** Brand slugs explicitly approved for individual deep-linked URLs. */
export const DEEP_LINK_ALLOWED_BRAND_SLUGS = new Set(
  PROVIDER_URL_AUDIT.filter((entry) => entry.allowsDeepLink).map((entry) =>
    slugify(entry.brand),
  ),
);

export function getBrandNameFromItem(item, fallbackType = "") {
  return (
    item?.brand?.brandName || fallbackType || item?.productName || ""
  ).trim();
}

export function brandAllowsDeepLink(brandName = "") {
  return DEEP_LINK_ALLOWED_BRAND_SLUGS.has(slugify(brandName));
}

export function brandAllowsDeepLinkForItem(item, fallbackType = "") {
  return brandAllowsDeepLink(getBrandNameFromItem(item, fallbackType));
}

export function buildLegacyDeepLinkPath(item, fallbackType = "") {
  const productId = item?.productId;
  const productName = item?.productName || fallbackType;
  const brandName = getBrandNameFromItem(item, fallbackType) || productName;
  const countryName =
    item?.country?.isoName ||
    item?.country?.name ||
    item?.countryCode ||
    item?.recipientCurrencyCode ||
    "global";

  if (!productId) {
    return `${GIFT_CARD_CATALOG_PATH}?brand=${encodeURIComponent(brandName)}`;
  }

  return `/gift-card/${slugify(brandName)}/${slugify(countryName)}/${slugify(
    productName,
  )}/${productId}`;
}
