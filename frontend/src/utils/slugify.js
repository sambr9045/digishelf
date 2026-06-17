import {
  GIFT_CARD_CATALOG_PATH,
  brandAllowsDeepLinkForItem,
  buildLegacyDeepLinkPath,
} from "../config/giftCardProviderPolicy";

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildGiftCardUrl = (item, fallbackType = "") => {
  if (brandAllowsDeepLinkForItem(item, fallbackType)) {
    return buildLegacyDeepLinkPath(item, fallbackType);
  }

  const productId = item?.productId;
  if (productId) {
    return `${GIFT_CARD_CATALOG_PATH}?productId=${productId}`;
  }

  const brandName =
    item?.brand?.brandName || fallbackType || item?.productName || "";
  if (brandName) {
    return `${GIFT_CARD_CATALOG_PATH}?brand=${encodeURIComponent(brandName)}`;
  }

  return GIFT_CARD_CATALOG_PATH;
};
