import { useEffect } from "react";

const DEFAULT_SITE_NAME = "Digishelves";
const DEFAULT_DESCRIPTION =
  "Digishelves helps customers buy airtime top-ups and digital gift cards through a cleaner, faster checkout flow.";
const DEFAULT_KEYWORDS = [
  "Digishelves",
  "airtime top-up",
  "gift cards",
  "digital gift cards",
  "crypto checkout",
  "mobile recharge",
];
const DEFAULT_GEO = {
  region: "GH-AA",
  placename: "Accra",
  position: "5.6037;-0.1870",
  icbm: "5.6037, -0.1870",
};

function getSiteOrigin() {
  const configuredOrigin = import.meta.env.VITE_SITE_URL || "https://digishelves.com";

  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return window.location.origin;
  }

  return configuredOrigin;
}

export function buildAbsoluteUrl(path = "/") {
  const origin = getSiteOrigin().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("data-digishelf-seo", "true");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("data-digishelf-seo", "true");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function resetManagedJsonLd() {
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-digishelf-seo="true"]')
    .forEach((node) => node.remove());
}

function renderJsonLd(schema) {
  if (!schema) {
    return;
  }

  const items = Array.isArray(schema) ? schema : [schema];
  items.filter(Boolean).forEach((item) => {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-digishelf-seo", "true");
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

function toKeywordString(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.filter(Boolean).join(", ");
  }

  return keywords || DEFAULT_KEYWORDS.join(", ");
}

export function createBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function createWebPageSchema({
  title,
  description,
  path,
  type = "WebPage",
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url: buildAbsoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: DEFAULT_SITE_NAME,
      url: buildAbsoluteUrl("/"),
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: DEFAULT_SITE_NAME,
    url: buildAbsoluteUrl("/"),
    email: "info@digishelves.com",
    sameAs: [
      "https://facebook.com",
      "https://linkedin.com",
      "https://x.com",
    ],
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: DEFAULT_SITE_NAME,
    url: buildAbsoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildAbsoluteUrl("/giftcard/search")}?name={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = "/",
  image = "/favicon.ico",
  type = "website",
  robots = "index,follow,max-image-preview:large",
  geo = DEFAULT_GEO,
  schema = [],
  price = "",
  priceCurrency = "",
}) {
  useEffect(() => {
    const fullTitle = title?.includes(DEFAULT_SITE_NAME)
      ? title
      : `${title} | ${DEFAULT_SITE_NAME}`;
    const url = buildAbsoluteUrl(path);
    const imageUrl = image.startsWith("http") ? image : buildAbsoluteUrl(image);
    const keywordString = toKeywordString(keywords);

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywordString });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: DEFAULT_SITE_NAME });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: fullTitle });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: fullTitle });
    upsertMeta('meta[name="geo.region"]', { name: "geo.region", content: geo.region });
    upsertMeta('meta[name="geo.placename"]', { name: "geo.placename", content: geo.placename });
    upsertMeta('meta[name="geo.position"]', { name: "geo.position", content: geo.position });
    upsertMeta('meta[name="ICBM"]', { name: "ICBM", content: geo.icbm });

    // Product price meta — used by Facebook/Open Graph product scrapers
    if (price) {
      upsertMeta('meta[property="product:price:amount"]', { property: "product:price:amount", content: String(price) });
      upsertMeta('meta[property="product:price:currency"]', { property: "product:price:currency", content: priceCurrency || "USD" });
    }

    upsertLink('link[rel="canonical"]', { rel: "canonical", href: url });
    upsertLink('link[rel="sitemap"]', { rel: "sitemap", type: "application/xml", href: buildAbsoluteUrl("/sitemap.xml") });

    resetManagedJsonLd();
    renderJsonLd(schema);
  }, [description, geo.icbm, geo.placename, geo.position, geo.region, image, keywords, path, price, priceCurrency, robots, schema, title, type]);
}
