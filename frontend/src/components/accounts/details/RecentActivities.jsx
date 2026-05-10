import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  CreditCard,
  Gift,
  History,
  KeyRound,
  Mail,
  PackageCheck,
  Phone,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SessionContext } from "../../sessionContext";
import { api_endpoint } from "../../constant";

function formatMoney(value, currency) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "N/A";
  }

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || ""}`.trim();
}

function RecentActivities() {
  const [recentActivities, setRecentActivities] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { session } = useContext(SessionContext);
  const token = session?.accessToken;

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(
          `${api_endpoint}/api/account/recent_activity/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setRecentActivities(response.data.data || []);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    fetchRecentActivities();
  }, [token]);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="rounded-[2rem] border border-[#eadfe7] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#551839]">
            Activity
          </span>
          <h2 className="mb-0 mt-3 text-3xl font-black tracking-[-0.05em] text-[#211722]">
            Recent activity
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf8f4] text-[#551839]">
          <History className="h-6 w-6" />
        </div>
      </div>

      {recentActivities.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[#eadfe7] bg-[#fbf8f4] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#10ac84] shadow-sm">
            <Send className="h-6 w-6" />
          </div>
          <h3 className="mb-0 mt-5 text-2xl font-black tracking-[-0.04em] text-[#211722]">
            Send your first top-up
          </h3>
          <p className="mb-0 mt-2 max-w-xl text-base leading-7 text-[#665b67]">
            Once you send your first top-up, your top-up history will appear
            here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#551839] px-6 text-sm font-black text-white shadow-lg shadow-[#551839]/15 transition hover:bg-[#44122d]"
          >
            Send now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((activity, index) => {
            const isAirtime = activity.activity_type === "topup" || Boolean(activity.operator);
            const isExpanded = expandedIndex === index;
            const giftProducts = activity.products || [];
            const giftCards = activity.cards || [];
            const giftProductLabel = giftProducts
              .map((item) => item.product_name)
              .filter(Boolean)
              .join(", ");
            const activityStatus = (activity.status || "").toLowerCase();

            return (
              <div
                key={`${activity.reference || activity.transaction_id}-${index}`}
                className="overflow-hidden rounded-[1.25rem] border border-[#eadfe7] bg-[#fbf8f4]"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#551839] shadow-sm">
                      {isAirtime ? (
                        <Phone className="h-5 w-5" />
                      ) : (
                        <Gift className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="mb-0 font-black text-[#211722]">
                        {isAirtime ? "Airtime top-up" : "Gift card"}
                      </p>
                      <p className="mb-0 truncate text-sm font-bold text-[#665b67]">
                        {activityStatus || "processing"} ·{" "}
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <p className="mb-0 hidden font-black text-[#211722] sm:block">
                      {isAirtime
                        ? `${activity.sender_currency} ${activity.total_paid}`
                        : formatMoney(activity.amount, "USD")}
                    </p>
                    <ChevronDown
                      className={`h-5 w-5 text-[#551839] transition ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#eadfe7] bg-white px-4 py-4 text-sm font-bold text-[#665b67]">
                    {isAirtime ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activity.reference && (
                          <p className="mb-0">
                            <span className="text-[#211722]">Reference:</span>{" "}
                            {activity.reference}
                          </p>
                        )}
                        {activity.payment_method && (
                          <p className="mb-0">
                            <span className="text-[#211722]">Payment:</span>{" "}
                            {activity.payment_method}
                          </p>
                        )}
                        {activity.phone_number && (
                          <p className="mb-0">
                            <span className="text-[#211722]">Phone:</span>{" "}
                            {activity.phone_number}
                          </p>
                        )}
                        {activity.operator && (
                          <p className="mb-0">
                            <span className="text-[#211722]">Operator:</span>{" "}
                            {activity.operator}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {activity.reference && (
                            <DetailBadge
                              icon={CreditCard}
                              label="Reference"
                              value={activity.reference}
                            />
                          )}
                          <DetailBadge
                            icon={Mail}
                            label="Delivery email"
                            value={activity.email || "N/A"}
                          />
                          <DetailBadge
                            icon={PackageCheck}
                            label="Card delivery"
                            value={`${activity.ready_cards || 0}/${activity.total_cards || 0} ready`}
                          />
                          <DetailBadge
                            icon={Gift}
                            label="Products"
                            value={giftProducts.length ? `${giftProducts.length} item${giftProducts.length > 1 ? "s" : ""}` : "N/A"}
                          />
                          <DetailBadge
                            icon={CreditCard}
                            label="Amount paid"
                            value={formatMoney(activity.amount, "USD")}
                          />
                        </div>

                        {giftProducts.length > 0 && (
                          <div className="rounded-[1rem] border border-[#eadfe7] bg-[#fbf8f4] p-4">
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                              Gift-card items
                            </p>
                            <div className="space-y-3">
                              {giftProducts.map((item, productIndex) => (
                                <div
                                  key={`${item.product_name}-${productIndex}`}
                                  className="flex flex-col gap-3 border-b border-[#eadfe7] pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <ProductImageThumb
                                      src={item.product_image}
                                      alt={item.product_name || "Gift card"}
                                    />
                                    <div>
                                      <p className="mb-0 font-black text-[#211722]">
                                        {item.product_name || "Gift card"}
                                      </p>
                                      <p className="mb-0 mt-1 text-sm font-bold text-[#665b67]">
                                        Qty {item.quantity} · Recipient gets{" "}
                                        {formatMoney(
                                          item.recipient_amount,
                                          item.recipient_currency,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="mb-0 text-sm font-black text-[#551839]">
                                    Paid{" "}
                                    {formatMoney(
                                      item.amount_to_pay,
                                      item.currency_to_pay_in,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {giftProductLabel && (
                              <p className="mb-0 mt-3 text-sm font-bold text-[#665b67]">
                                {giftProductLabel}
                              </p>
                            )}
                          </div>
                        )}

                        {giftCards.length > 0 && (
                          <div className="rounded-[1rem] border border-[#eadfe7] bg-[#fbf8f4] p-4">
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                              Card codes
                            </p>
                            <div className="space-y-3">
                              {giftCards.map((item, cardIndex) => (
                                <div
                                  key={`${item.product_name}-${item.card_number}-${cardIndex}`}
                                  className="rounded-[1rem] bg-white p-4"
                                >
                                  <div className="mb-3 flex items-center gap-3">
                                    <ProductImageThumb
                                      src={item.product_image}
                                      alt={item.product_name || "Gift card"}
                                    />
                                    <p className="mb-0 font-black text-[#211722]">
                                      {item.product_name || "Gift card"}
                                    </p>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <DetailBadge
                                      icon={CreditCard}
                                      label="Card number"
                                      value={item.card_number || "Not available"}
                                    />
                                    <DetailBadge
                                      icon={KeyRound}
                                      label="Pin code"
                                      value={item.pin_code || "Not available"}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DetailBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1rem] border border-[#eadfe7] bg-[#fbf8f4] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#551839]" />
        <p className="mb-0 text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8b97]">
          {label}
        </p>
      </div>
      <p className="mb-0 break-words text-sm font-black text-[#211722]">
        {value}
      </p>
    </div>
  );
}

function ProductImageThumb({ src, alt }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[#eadfe7] bg-white">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Gift className="h-5 w-5 text-[#551839]" />
      )}
    </div>
  );
}

export default RecentActivities;
