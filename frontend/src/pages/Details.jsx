import { Navigate, useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import GiftCardProductDetail from "../components/giftcards/GiftCardProductDetail";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { buildAbsoluteUrl, createBreadcrumbSchema } from "../utils/seo";
import { GIFT_CARD_CATALOG_PATH } from "../config/giftCardProviderPolicy";

function titleizeSlug(value = "") {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProductImage(product) {
  if (!product?.logoUrls) return null;
  return Array.isArray(product.logoUrls) ? product.logoUrls[0] : product.logoUrls;
}

function buildProductSeoProps(product, pathname) {
  if (!product) return null;

  const productName = product.productName || "Gift Card";
  const brand = product.brand?.brandName || productName;
  const currency = product.recipientCurrencyCode || "USD";
  const min = Number(product.minRecipientDenomination || 0);
  const max = Number(product.maxRecipientDenomination || 0);
  const country = product.country?.name ? ` in ${product.country.name}` : "";
  const absoluteUrl = buildAbsoluteUrl(pathname);

  let priceText = "available values";
  let sharePrice = "";
  if (min > 0 && max > 0) { priceText = `${currency} ${min}–${max}`; sharePrice = String(min); }
  else if (max > 0) { priceText = `${currency} ${max}`; sharePrice = String(max); }
  else if (min > 0) { priceText = `${currency} ${min}`; sharePrice = String(min); }

  const title = `${brand} eGift Card | Digishelves`;
  const description = `Buy ${productName} gift card${country} on Digishelves. Price range: ${priceText}. Fast digital delivery and secure checkout.`;
  const image = getProductImage(product);

  const seller = {
    "@type": "Organization",
    name: "Digishelves",
    url: buildAbsoluteUrl("/"),
  };

  // One year from now as a reasonable priceValidUntil
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const fixedDenominations = product.fixedRecipientToSenderDenominationsMap
    ? Object.keys(product.fixedRecipientToSenderDenominationsMap)
    : [];

  const offers = fixedDenominations.length > 0
    ? fixedDenominations.map((amount) => ({
        "@type": "Offer",
        price: String(amount),
        priceCurrency: currency,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil,
        url: absoluteUrl,
        seller,
      }))
    : {
        "@type": "AggregateOffer",
        lowPrice: min || undefined,
        highPrice: max || undefined,
        offerCount: 1,
        priceCurrency: currency,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil,
        url: absoluteUrl,
        seller,
      };

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${productName} eGift Card`,
      image: image ? [image] : undefined,
      description,
      brand: { "@type": "Brand", name: brand },
      category: "Gift Cards",
      sku: String(product.productId),
      mpn: String(product.productId),
      offers,
    },
    createBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Gift Cards", path: GIFT_CARD_CATALOG_PATH },
      { name: productName, path: pathname },
    ]),
  ];

  return { title, description, image, schema, path: pathname, price: sharePrice, priceCurrency: currency };
}

export default function Details() {
  const { productSlug, productId } = useParams();
  const [product, setProduct] = useState(null);

  const handleProductLoaded = useCallback((loadedProduct) => {
    setProduct(loadedProduct);
  }, []);

  if (!productId) {
    return <Navigate to="/gift-card" replace />;
  }

  const pathname = `/gift-card/${productSlug}/${productId}`;
  const bannerType = titleizeSlug(productSlug);
  const seoProps = buildProductSeoProps(product, pathname);

  return (
    <div>
      {seoProps ? (
        <Seo
          title={seoProps.title}
          description={seoProps.description}
          image={seoProps.image}
          path={seoProps.path}
          type="product"
          robots="index,follow,max-image-preview:large"
          schema={seoProps.schema}
          price={seoProps.price}
          priceCurrency={seoProps.priceCurrency}
        />
      ) : (
        <Seo
          title={`${titleizeSlug(productSlug)} eGift Card | Digishelves`}
          description={`Buy ${titleizeSlug(productSlug)} gift card on Digishelves. Fast digital delivery and secure checkout.`}
          path={pathname}
          robots="index,follow,max-image-preview:large"
        />
      )}
      <GiftCardBanner type={bannerType} details={false} />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GiftCardProductDetail productId={productId} onProductLoaded={handleProductLoaded} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
