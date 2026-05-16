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
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const price = escapeHtml(meta.price);
  const priceCurrency = escapeHtml(meta.priceCurrency);

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  out = replaceTag(
    out,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name=\"description\" content=\"${description}\" />`,
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${BACKEND_ORIGIN}/api/giftcards/?productId=${productId}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload?.data || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

app.use(express.static(DIST_DIR, { index: false, maxAge: "1d" }));

app.get("*", async (req, res) => {
  const indexHtml = await readIndexHtml();
  const productId = extractProductId(req.path);

  if (!productId) {
    res.status(200).type("html").send(indexHtml);
    return;
  }

  const product = await fetchGiftCard(productId);
  if (!product) {
    res.status(200).type("html").send(indexHtml);
    return;
  }

  const meta = buildProductMeta(product, req.path);
  const html = injectMetaTags(indexHtml, meta);
  res.status(200).type("html").send(html);
});

app.listen(PORT, () => {
  console.log(`digishelf-frontend listening on ${PORT}`);
});
