import { GIFT_CARD_CATALOG_PATH } from "../config/giftCardProviderPolicy";

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildGiftCardUrl = (item, fallbackType = "") => {
  const productId = item?.productId;
  const productSlug = slugify(item?.productName || fallbackType || "");

  if (productId) {
    if (!productSlug) {
      return `${GIFT_CARD_CATALOG_PATH}?productId=${productId}`;
    }

    return `${GIFT_CARD_CATALOG_PATH}/${productSlug}/${productId}`;
  }

  const brandName =
    item?.brand?.brandName || fallbackType || item?.productName || "";
  if (brandName) {
    return `${GIFT_CARD_CATALOG_PATH}?brand=${encodeURIComponent(brandName)}`;
  }

  return GIFT_CARD_CATALOG_PATH;
};
