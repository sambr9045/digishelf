import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  KeyRound,
  Mail,
  Receipt,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Loader from "../includes/Loader";
import Seo from "../Seo";
import { api_endpoint } from "../constant";
import { createWebPageSchema } from "../../utils/seo";

function formatDate(datetimeString) {
  if (!datetimeString) {
    return "N/A";
  }

  const date = new Date(datetimeString);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "N/A";
  }

  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white">
          <Icon className="h-5 w-5 text-[#551839]" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            {label}
          </p>
          <p className="mb-0 break-words text-lg font-black text-[#211722]">
            {value || "N/A"}
          </p>
          {helper ? (
            <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
              {helper}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function PaymentSuccess() {
  const { reference: completionToken } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [fetchError, setFetchError] = useState("");

  const fetchOrderData = async () => {
    setIsLoading(true);
    setFetchError("");

    try {
      const response = await axios.get(
        `${api_endpoint}/api/payments/completion/${completionToken}/`,
      );
      setOrderData(response.data?.data || null);
    } catch (error) {
      setOrderData(null);
      setFetchError(
        error?.response?.data?.error || "Could not load this gift-card order.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyReference = async () => {
    const nextReference = orderData?.product_data?.reference || "";
    if (!nextReference) {
      return;
    }

    await navigator.clipboard.writeText(nextReference);
    toast.success("Transaction ID copied.");
  };

  useEffect(() => {
    fetchOrderData();
  }, [completionToken]);

  const productData = orderData?.product_data || {};
  const transactions = orderData?.transactionData || [];

  const redeemEntries = useMemo(
    () =>
      transactions.flatMap((item) => {
        const product = parseJson(item.product, {});
        const redeemData = parseJson(item.redeem_data, []);

        if (!Array.isArray(redeemData) || redeemData.length === 0) {
          return [
            {
              id: `pending-${item.id}`,
              productName: product.productName || "Gift card",
              unitPrice: product.unitPrice,
              currencyCode: product.currencyCode || item.currencyCode || "",
              cardNumber: "",
              pinCode: "",
              pending: true,
            },
          ];
        }

        return redeemData.map((redeem, index) => ({
          id: `${item.id}-${index}`,
          productName: product.productName || "Gift card",
          unitPrice: product.unitPrice,
          currencyCode: product.currencyCode || item.currencyCode || "",
          cardNumber: redeem.cardNumber || "",
          pinCode: redeem.pinCode || "",
          pending: false,
        }));
      }),
    [transactions],
  );

  const hasReadyCards = redeemEntries.some((item) => !item.pending);
  const isProcessingCards = !fetchError && transactions.length === 0;
  const statusLabel = hasReadyCards ? "Completed" : "Processing";
  const eyebrowLabel = hasReadyCards
    ? "Gift cards completed"
    : "Gift cards processing";
  const title = hasReadyCards
    ? "Gift cards are ready"
    : "Your order is being processed";
  const subtitle = hasReadyCards
    ? "Your payment was confirmed and your gift-card details are now available below."
    : "Your payment was confirmed. We are still processing the gift cards and will show the card details here once they are ready.";

  return (
    <>
      <Seo
        title="Gift Card Order Complete"
        description="View your Digishelves gift card order status and redeemed card details."
        path={`/gift-card/payment-complete/${completionToken}`}
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Gift Card Order Complete",
          description:
            "View your Digishelves gift card order status and redeemed card details.",
          path: `/gift-card/payment-complete/${completionToken}`,
        })}
      />
      <Header />
      {isLoading ? <Loader /> : null}

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(85,24,57,0.08),_transparent_34%),linear-gradient(180deg,#fbf8f4_0%,#fffdfb_100%)] pt-28">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-md border border-[#eadfe7] bg-white shadow-[0_28px_90px_rgba(33,23,34,0.12)]">
              <div className="bg-[#211722] px-6 py-8 text-white sm:px-8 sm:py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                      {eyebrowLabel}
                    </p>
                    <h1 className="mb-0 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                      {title}
                    </h1>
                    <p className="mt-3 mb-0 max-w-2xl text-sm font-bold leading-6 text-white/72 sm:text-base">
                      {subtitle}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 self-start rounded-full bg-white/10 px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff8ef]">
                      <CheckCircle2 className="h-5 w-5 text-[#067a5f]" />
                    </span>
                    <div>
                      <p className="mb-0 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Status
                      </p>
                      <p className="mb-0 text-sm font-black text-white">
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_340px]">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                      icon={Receipt}
                      label="Transaction ID"
                      value={productData.reference || completionToken}
                      helper="Keep this for support and order tracking."
                    />
                    <SummaryCard
                      icon={CalendarDays}
                      label="Completed on"
                      value={formatDate(productData.created_at)}
                    />
                    <SummaryCard
                      icon={Mail}
                      label="Delivery email"
                      value={productData.email}
                    />
                    <SummaryCard
                      icon={ShoppingBag}
                      label="Amount paid"
                      value={formatAmount(productData.amount)}
                      helper={
                        productData.country
                          ? `Country: ${productData.country}`
                          : ""
                      }
                    />
                  </div>

                  <section className="overflow-hidden rounded-md border border-[#eadfe7] bg-white">
                    <div className="flex items-center gap-3 border-b border-[#eadfe7] bg-[#fbf8f4] px-5 py-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                        <CreditCard className="h-5 w-5 text-[#551839]" />
                      </span>
                      <div>
                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#9a8b97]">
                          Card delivery
                        </p>
                        <h2 className="mb-0 text-lg font-black text-[#211722]">
                          {hasReadyCards
                            ? "Gift-card details"
                            : "Waiting for card details"}
                        </h2>
                      </div>
                    </div>

                    {fetchError ? (
                      <div className="p-5">
                        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                          {fetchError}
                        </div>
                      </div>
                    ) : isProcessingCards ? (
                      <div className="p-5">
                        <div className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-6 text-center">
                          <p className="mb-0 text-lg font-black text-[#211722]">
                            Processing gift cards...
                          </p>
                          <p className="mt-2 mb-0 text-sm font-bold leading-6 text-[#665b67]">
                            Please wait while we complete your transaction.
                            Refresh this page shortly to check for the card
                            details.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 p-5">
                        {redeemEntries.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                                  Product
                                </p>
                                <p className="mb-0 text-lg font-black text-[#211722]">
                                  {item.productName}
                                </p>
                                {item.unitPrice ? (
                                  <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
                                    {item.unitPrice} {item.currencyCode}
                                  </p>
                                ) : null}
                              </div>

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                                  item.pending
                                    ? "bg-[#fff4e5] text-[#b56a19]"
                                    : "bg-[#e8fbf4] text-[#067a5f]"
                                }`}
                              >
                                {item.pending ? "Processing" : "Ready"}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-md bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-[#551839]" />
                                  <p className="mb-0 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                                    Card number
                                  </p>
                                </div>
                                <p className="mb-0 break-all font-mono text-sm font-black text-[#211722]">
                                  {item.pending
                                    ? "Will appear once processing completes"
                                    : item.cardNumber}
                                </p>
                              </div>

                              <div className="rounded-md bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                  <KeyRound className="h-4 w-4 text-[#551839]" />
                                  <p className="mb-0 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                                    Pin code
                                  </p>
                                </div>
                                <p className="mb-0 break-all font-mono text-sm font-black text-[#211722]">
                                  {item.pending
                                    ? "Will appear once processing completes"
                                    : item.pinCode}
                                </p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-5">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#9a8b97]">
                    Completion summary
                  </p>
                  <h2 className="mb-0 text-2xl font-black tracking-[-0.04em] text-[#211722]">
                    {hasReadyCards
                      ? "Gift-card order completed"
                      : "Gift-card order in progress"}
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#665b67]">
                    {hasReadyCards
                      ? "Your order has been processed successfully. You can copy the transaction ID, review the card details, or start another gift-card purchase."
                      : "Your payment has been received. Refresh the order status shortly to load the gift-card details as soon as processing finishes."}
                  </p>

                  <div className="mt-6 rounded-md bg-white p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                      Reference
                    </p>
                    <p className="mb-0 break-all text-base font-black text-[#211722]">
                      {productData.reference || completionToken}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <button
                      type="button"
                      onClick={copyReference}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#551839] px-5 text-sm font-black text-white disabled:opacity-60"
                    >
                      <Copy className="h-4 w-4" />
                      Copy transaction ID
                    </button>

                    <button
                      type="button"
                      onClick={fetchOrderData}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-white px-5 text-sm font-black text-[#551839]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh status
                    </button>

                    <Link
                      to="/gift-card"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#eadfe7] bg-transparent px-5 text-sm font-black text-[#665b67]"
                    >
                      Start another gift-card order
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
