export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildGiftCardUrl = (item, fallbackType = "") => {
  const productId = item.productId;
  const productName = item.productName || fallbackType;
  const brandName = item.brand?.brandName || fallbackType || productName;
  const countryName =
    item.country?.isoName ||
    item.country?.name ||
    item.countryCode ||
    item.recipientCurrencyCode ||
    "global";

  if (!productId) {
    return `/gift-card/${slugify(productName)}`;
  }

  return `/gift-card/${slugify(brandName)}/${slugify(countryName)}/${slugify(
    productName,
  )}/${productId}`;
};
