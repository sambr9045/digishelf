import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const PORT = Number(process.env.PORT || 5179);
const SITE_ORIGIN = (process.env.PUBLIC_SITE_ORIGIN || "https://digishelves.com").replace(/\/$/, "");
const BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN || process.env.VITE_DEV_BACKEND_ORIGIN || "http://backend:8000"
).replace(/\/$/, "");
const SITE_HOSTNAME = new URL(SITE_ORIGIN).hostname;
const DEFAULT_IMAGE = toAbsoluteUrl("/favicon.ico");

const app = express();
let cachedIndexHtml = "";


function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(urlPath = "/") {
  if (!urlPath) {
    return SITE_ORIGIN;
  }

  if (/^https?:\/\//i.test(urlPath)) {
    return urlPath;
  }

  return `${SITE_ORIGIN}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
}

function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

function titleizeSlug(value = "") {
  return decodeURIComponent(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildPageMeta(requestPath = "/") {
  const pathname = normalizePathname(requestPath);
  const staticPages = {
    "/": {
      title: "Airtime Top-ups and Gift Cards | Digishelves",
      description:
        "Buy airtime top-ups and digital gift cards with a streamlined checkout flow on Digishelves.",
      canonicalPath: "/",
    },
    "/about": {
      title: "About Digishelves",
      description:
        "Learn how Digishelves combines airtime top-ups and digital gift cards into one focused digital checkout experience.",
      canonicalPath: "/about",
    },
    "/contact": {
      title: "Contact Digishelves Support",
      description:
        "Contact Digishelves support for help with top-ups, gift cards, checkout issues, and order questions.",
      canonicalPath: "/contact",
    },
    "/terms-of-use": {
      title: "Terms of Use | Digishelves",
      description:
        "Read Digishelves terms governing gift card and airtime top-up services, payment rules, and platform usage.",
      canonicalPath: "/terms-of-use",
    },
    "/privacy-policy": {
      title: "Privacy Policy | Digishelves",
      description:
        "Read how Digishelves collects and uses personal data, including account, order, analytics, and security information.",
      canonicalPath: "/privacy-policy",
    },
    "/gift-card": {
      title: "Buy Digital Gift Cards | Digishelves",
      description:
        "Browse digital gift cards by brand and country, compare values, and buy online through Digishelves.",
      canonicalPath: "/gift-card",
    },
    "/top-up": {
      title: "Airtime Top-ups and Gift Cards | Digishelves",
      description:
        "Buy airtime top-ups and digital gift cards with a streamlined checkout flow on Digishelves.",
      canonicalPath: "/",
    },
  };

  if (staticPages[pathname]) {
    return staticPages[pathname];
  }

  const giftCardTypeMatch = pathname.match(/^\/gift-card\/([^/]+)$/);
  if (giftCardTypeMatch) {
    const segment = giftCardTypeMatch[1];
    if (!["payment", "payment-complete"].includes(segment)) {
      return {
        title: "Buy Digital Gift Cards | Digishelves",
        description:
          "Browse digital gift cards by brand and country, compare values, and buy online through Digishelves.",
        canonicalPath: "/gift-card",
        robots: "noindex,follow",
      };
    }
  }

  const legacyProductId = extractProductId(pathname);
  if (legacyProductId) {
    return {
      title: "Buy Digital Gift Cards | Digishelves",
      description:
        "Browse digital gift cards by brand and country, compare values, and buy online through Digishelves.",
      canonicalPath: "/gift-card",
      robots: "noindex,follow",
    };
  }

  return {
    title: "Digishelves",
    description:
      "Digishelves is a digital commerce platform for buying airtime top-ups and gift cards with cryptocurrency",
    canonicalPath: pathname,
  };
}

function buildRobotsValue(pathname = "/") {
  const noindexExactPaths = new Set([
    "/404",
    "/account",
    "/admin",
    "/admin-login",
    "/checkout",
    "/profile-settings",
    "/signin",
    "/signup",
    "/top-up/checkout",
  ]);
  const noindexPrefixes = [
    "/gift-card/payment/",
    "/gift-card/payment-complete/",
    "/top-up/payment/",
    "/top-up/success/",
  ];

  if (
    noindexExactPaths.has(pathname) ||
    noindexPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    extractProductId(pathname)
  ) {
    return "noindex,nofollow";
  }

  return "index,follow,max-image-preview:large";
}

function extractProductId(pathname) {
  if (!pathname.startsWith("/gift-card/")) {
    return null;
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 3 || parts[0] !== "gift-card") {
    return null;
  }

  if (["payment", "payment-complete"].includes(parts[1])) {
    return null;
  }

  const last = parts[parts.length - 1];
  if (!/^\d+$/.test(last)) {
    return null;
  }

  return last;
}

function replaceTag(html, matcher, replacement) {
  if (matcher.test(html)) {
    return html.replace(matcher, replacement);
  }

  return html.replace("</head>", `${replacement}\n</head>`);
}

function injectMetaTags(html, meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image || DEFAULT_IMAGE);
  const url = escapeHtml(meta.url);
  const robots = escapeHtml(meta.robots || "index,follow,max-image-preview:large");
  const price = escapeHtml(meta.price || "");
  const priceCurrency = escapeHtml(meta.priceCurrency || "");

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  out = replaceTag(
    out,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name=\"description\" content=\"${description}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name=\"robots\" content=\"${robots}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property=\"og:title\" content=\"${title}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property=\"og:description\" content=\"${description}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property=\"og:url\" content=\"${url}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property=\"og:image\" content=\"${image}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name=\"twitter:title\" content=\"${title}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name=\"twitter:description\" content=\"${description}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name=\"twitter:image\" content=\"${image}\" />`,
  );
  out = replaceTag(
    out,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel=\"canonical\" href=\"${url}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']product:price:amount["'][^>]*>/i,
    `<meta property=\"product:price:amount\" content=\"${price}\" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']product:price:currency["'][^>]*>/i,
    `<meta property=\"product:price:currency\" content=\"${priceCurrency}\" />`,
  );

  return out;
}

function buildProductMeta(product, requestPath) {
  const productName = product?.productName || "Gift Card";
  const currency = product?.recipientCurrencyCode || "USD";
  const min = Number(product?.minRecipientDenomination || 0);
  const max = Number(product?.maxRecipientDenomination || 0);

  let priceText = "available values";
  let sharePrice = "0";
  if (min > 0 && max > 0) {
    priceText = `${currency} ${min} - ${max}`;
    sharePrice = String(min);
  } else if (max > 0) {
    priceText = `${currency} ${max}`;
    sharePrice = String(max);
  } else if (min > 0) {
    priceText = `${currency} ${min}`;
    sharePrice = String(min);
  }

  const brand = product?.brand?.brandName || productName;
  const country = product?.country?.name ? ` in ${product.country.name}` : "";
  const description = `Buy ${productName} gift card${country} on Digishelves. Price range: ${priceText}. Fast digital delivery and secure checkout.`;
  const title = `${brand} eGift Card | Digishelves`;
  const logo = Array.isArray(product?.logoUrls)
    ? product.logoUrls[0]
    : product?.logoUrls || "/BingSiteAuth.xml";

  return {
    title,
    description,
    image: toAbsoluteUrl(logo),
    url: toAbsoluteUrl(requestPath),
    robots: "index,follow,max-image-preview:large",
    price: sharePrice,
    priceCurrency: currency,
  };
}

async function readIndexHtml() {
  if (!cachedIndexHtml) {
    cachedIndexHtml = await fs.readFile(INDEX_PATH, "utf-8");
  }

  return cachedIndexHtml;
}

async function fetchGiftCard(productId) {
  const origins = [...new Set([BACKEND_ORIGIN, SITE_ORIGIN])];

  for (const origin of origins) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${origin}/api/giftcards/?productId=${productId}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      if (payload?.data) {
        return payload.data;
      }
    } catch {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

app.use((req, res, next) => {
  if (req.hostname === `www.${SITE_HOSTNAME}`) {
    res.redirect(301, `${SITE_ORIGIN}${req.originalUrl}`);
    return;
  }

  next();
});

app.use((req, res, next) => {
  const pathname = normalizePathname(req.path);

  if (pathname === "/gift-cards") {
    res.redirect(301, toAbsoluteUrl("/gift-card"));
    return;
  }

  const productId = extractProductId(pathname);
  if (productId) {
    res.redirect(301, toAbsoluteUrl(`/gift-card?productId=${productId}`));
    return;
  }

  const giftCardTypeMatch = pathname.match(/^\/gift-card\/([^/]+)$/);
  if (
    giftCardTypeMatch &&
    !["payment", "payment-complete"].includes(giftCardTypeMatch[1])
  ) {
    const brand = encodeURIComponent(giftCardTypeMatch[1]);
    res.redirect(301, toAbsoluteUrl(`/gift-card?brand=${brand}`));
    return;
  }

  next();
});

app.use(express.static(DIST_DIR, { index: false, maxAge: "1d" }));

async function proxyBackendSeoPath(req, res, backendPath) {
  const origins = [...new Set([BACKEND_ORIGIN, SITE_ORIGIN])];

  for (const origin of origins) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${origin}${backendPath}`, {
        headers: {
          Accept: req.headers.accept || "*/*",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const body = await response.text();
      const contentType =
        response.headers.get("content-type") ||
        (backendPath.endsWith(".xml") ? "application/xml" : "text/plain; charset=utf-8");
      res.status(200).type(contentType).send(body);
      return;
    } catch {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  res.status(502).type("text/plain").send("SEO route unavailable");
}

app.get("/sitemap.xml", (req, res) => proxyBackendSeoPath(req, res, "/sitemap.xml"));
app.get("/robots.txt", (req, res) => proxyBackendSeoPath(req, res, "/robots.txt"));

app.get("*", async (req, res) => {
  const indexHtml = await readIndexHtml();
  const pathname = normalizePathname(req.path);
  const pageMeta = buildPageMeta(pathname);
  const html = injectMetaTags(indexHtml, {
    ...pageMeta,
    image: DEFAULT_IMAGE,
    url: toAbsoluteUrl(pageMeta.canonicalPath),
    robots: pageMeta.robots || buildRobotsValue(pathname),
  });
  res.status(200).type("html").send(html);
});

app.listen(PORT, () => {
  console.log(`digishelf-frontend listening on ${PORT}`);
});
