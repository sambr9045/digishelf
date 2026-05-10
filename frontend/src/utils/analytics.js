import { api_endpoint } from "../components/constant";

const ANALYTICS_SESSION_STORAGE_KEY = "digishelf_analytics_session_key";

function createAnalyticsSessionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnalyticsSessionKey() {
  if (typeof window === "undefined") {
    return createAnalyticsSessionKey();
  }

  const saved = window.localStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);
  if (saved) {
    return saved;
  }

  const nextValue = createAnalyticsSessionKey();
  window.localStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, nextValue);
  return nextValue;
}

export function shouldTrackPath(pathname = "") {
  if (typeof window !== "undefined" && window.location.hostname.startsWith("admin.")) {
    return false;
  }

  return !pathname.startsWith("/admin");
}

export function buildCartAnalyticsSnapshot(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const cartItemCount = safeItems.length;
  const cartTotalQuantity = safeItems.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0,
  );
  const cartTotalValue = safeItems.reduce(
    (total, item) => total + Number(item?.AmountToPay || 0) * Number(item?.quantity || 0),
    0,
  );

  return {
    cart_item_count: cartItemCount,
    cart_total_quantity: cartTotalQuantity,
    cart_total_value: cartTotalValue.toFixed(2),
  };
}

export async function sendAnalyticsEvents(events, { token = null, keepalive = false } = {}) {
  if (!Array.isArray(events) || !events.length) {
    return;
  }

  const payload = events.map((event) => ({
    session_key: event.session_key || getAnalyticsSessionKey(),
    event_type: event.event_type,
    page_path: event.page_path || window.location.pathname,
    page_title: event.page_title || document.title || "",
    product_id: event.product_id || "",
    product_name: event.product_name || "",
    quantity: event.quantity || 0,
    duration_seconds: event.duration_seconds || 0,
    cart_item_count: event.cart_item_count || 0,
    cart_total_quantity: event.cart_total_quantity || 0,
    cart_total_value: event.cart_total_value || "0.00",
    metadata: event.metadata || {},
  }));

  try {
    await fetch(`${api_endpoint}/api/analytics/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: payload }),
      keepalive,
    });
  } catch {
    return;
  }
}

export function trackAnalyticsEvent(event, options) {
  return sendAnalyticsEvents([event], options);
}
