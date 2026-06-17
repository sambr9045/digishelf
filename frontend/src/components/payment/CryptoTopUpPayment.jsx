import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Loader2,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Timer,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Seo from "../Seo";
import { api_endpoint } from "../constant";
import { createWebPageSchema } from "../../utils/seo";

const PAYMENT_TIMEOUT_SECONDS = 15 * 60;
const POLL_INTERVAL_MS = 4000;
const CRYPTO_PAYMENT_STORAGE_PREFIX = "digishelf:topup-payment:";

function getSecondsLeft(createdAt) {
  if (!createdAt) {
    return PAYMENT_TIMEOUT_SECONDS;
  }

  const elapsed = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000,
  );
  return Math.max(PAYMENT_TIMEOUT_SECONDS - elapsed, 0);
}

function formatTokenAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "0.00";
  }

  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function getPaymentStatusText(
  order,
  activity,
  isFulfillingOrder,
  remainingAmountLabel = "",
) {
  if (!order) {
    return "Loading payment";
  }

  const isGiftCardOrder = order.fulfillment_type === "giftcard";

  if (order.fulfillment_status === "completed") {
    return isGiftCardOrder ? "Gift card order completed" : "Top-up completed";
  }

  if (order.fulfillment_status === "failed") {
    return "Payment confirmed, fulfillment failed";
  }

  if (order.status === "paid") {
    if (order.order_mode === "manual") {
      return "Payment confirmed, order processing";
    }

    if (order.fulfillment_status === "processing" || isFulfillingOrder) {
      return isGiftCardOrder
        ? "Payment confirmed, preparing your gift card"
        : "Payment confirmed, completing top-up";
    }

    return "Payment confirmed";
  }

  if (activity?.payment_received) {
    if (activity.amount_match_status === "under") {
      return remainingAmountLabel
        ? `Partial payment received, ${remainingAmountLabel} remaining`
        : "Payment received, amount is below the required total";
    }

    if (activity.amount_match_status === "over") {
      return "Payment received, amount is above the required total";
    }

    return "Payment received, waiting for confirmations";
  }

  return "Awaiting payment";
}

export default function CryptoTopUpPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isFulfillingOrder, setIsFulfillingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const fulfillmentStarted = useRef(false);

  const storageKey = `${CRYPTO_PAYMENT_STORAGE_PREFIX}${orderId}`;

  const getPendingPayment = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }, [storageKey]);

  const navigateToCompletion = useCallback(
    (nextOrder, completionToken) => {
      if (!completionToken) {
        return;
      }

      localStorage.removeItem(storageKey);

      if (nextOrder.fulfillment_type === "giftcard") {
        navigate(`/gift-card/payment-complete/${completionToken}`);
        return;
      }

      navigate(`/top-up/success/${completionToken}`);
    },
    [navigate, storageKey],
  );

  const completeOrder = useCallback(
    async (paidOrder) => {
      if (fulfillmentStarted.current) {
        return;
      }

      if (paidOrder.order_mode === "manual") {
        return;
      }

      fulfillmentStarted.current = true;
      setIsFulfillingOrder(true);

      try {
        const response = await axios.post(
          `${api_endpoint}/api/payments/orders/${paidOrder.order_id}/fulfill/`,
        );
        const completionToken =
          response.data?.data?.completion_token || paidOrder.completion_token;

        if (response.data?.data?.status === "completed") {
          navigateToCompletion(paidOrder, completionToken);
        } else if (response.data?.data?.status === "already_completed") {
          navigateToCompletion(paidOrder, completionToken);
        } else {
          setPaymentError(
            paidOrder.fulfillment_type === "giftcard"
              ? "Payment confirmed, but gift-card processing is still running. Please check again shortly."
              : "Payment confirmed, but top-up fulfillment is still processing. Please check again shortly.",
          );
        }
      } catch (error) {
        setPaymentError(
          paidOrder.fulfillment_type === "giftcard"
            ? "Payment confirmed, but gift-card fulfillment failed. Contact support with this payment ID."
            : "Payment confirmed, but top-up fulfillment failed. Contact support with this payment ID.",
        );
      } finally {
        setIsFulfillingOrder(false);
      }
    },
    [navigateToCompletion],
  );

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }
      setPaymentError("");

      try {
        const response = await axios.get(
          `${api_endpoint}/api/payments/orders/${orderId}/`,
        );
        const nextOrder = response.data;
        setOrder(nextOrder);
        setSecondsLeft(getSecondsLeft(nextOrder.created_at));

        const qrDataUrl = await QRCode.toDataURL(nextOrder.wallet_address, {
          margin: 1,
          width: 320,
          color: {
            dark: "#211722",
            light: "#ffffff",
          },
        });
        setQrCode(qrDataUrl);

        if (
          nextOrder.status === "paid" &&
          nextOrder.order_mode === "auto" &&
          nextOrder.fulfillment_status === "pending"
        ) {
          await completeOrder(nextOrder);
        }
      } catch (error) {
        setPaymentError(
          error?.response?.data?.error || "Could not load this payment.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [completeOrder, orderId],
  );

  const checkPaymentStatus = useCallback(async () => {
    setIsCheckingPayment(true);
    await loadOrder({ silent: true });
    setIsCheckingPayment(false);
  }, [loadOrder]);

  const copyAddress = async () => {
    if (!order?.wallet_address) {
      return;
    }

    await navigator.clipboard.writeText(order.wallet_address);
    toast.success("Wallet address copied.");
  };

  const copyExpectedAmount = async () => {
    if (!order?.amount) {
      return;
    }

    await navigator.clipboard.writeText(String(order.amount));
    toast.success("Expected amount copied.");
  };

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const stored = getPendingPayment();
    if (stored) {
      setPendingPayment(stored);
    }
  }, [getPendingPayment]);

  useEffect(() => {
    if (
      order?.fulfillment_status === "completed" &&
      order?.completion_token
    ) {
      navigateToCompletion(order, order.completion_token);
    }
  }, [navigateToCompletion, order]);

  useEffect(() => {
    if (
      !order ||
      order.fulfillment_status === "completed" ||
      secondsLeft <= 0
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [order, secondsLeft]);

  useEffect(() => {
    const hasReceivedPayment = Boolean(
      order?.payment_activity?.payment_received,
    );
    const shouldPollForUpdates =
      Boolean(order) &&
      order?.fulfillment_status !== "completed" &&
      order?.fulfillment_status !== "failed" &&
      !(!hasReceivedPayment && secondsLeft <= 0 && order?.status !== "paid");

    if (!shouldPollForUpdates) {
      return undefined;
    }

    const poller = window.setInterval(checkPaymentStatus, POLL_INTERVAL_MS);
    return () => window.clearInterval(poller);
  }, [checkPaymentStatus, order, secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const paymentActivity = order?.payment_activity;
  const requiredConfirmations = paymentActivity?.required_confirmations || 3;
  const currentConfirmations =
    paymentActivity?.current_confirmations ||
    paymentActivity?.highest_confirmations ||
    0;
  const hasReceivedPayment = Boolean(paymentActivity?.payment_received);
  const isPaid = order?.status === "paid";
  const isUnderpaid = paymentActivity?.amount_match_status === "under";
  const isOverpaid = paymentActivity?.amount_match_status === "over";
  const isGiftCardOrder =
    order?.fulfillment_type === "giftcard" ||
    pendingPayment?.fulfillmentPayload?.transaction?.products?.length > 0;
  const expectedAmountValue = Number(order?.amount ?? 0);
  const receivedAmountValue = Number(paymentActivity?.received_amount ?? 0);
  const remainingDueValue = Math.max(
    expectedAmountValue - receivedAmountValue,
    0,
  );
  const expectedAmount = order
    ? `${formatTokenAmount(order.amount)} ${order.token_symbol}`
    : "";
  const receivedAmount = order
    ? `${formatTokenAmount(paymentActivity?.received_amount)} ${order.token_symbol}`
    : "";
  const remainingDueAmount = order
    ? `${formatTokenAmount(remainingDueValue)} ${order.token_symbol}`
    : "";
  const confirmedReceivedAmount = order
    ? `${formatTokenAmount(paymentActivity?.confirmed_received_amount)} ${order.token_symbol}`
    : "";
  const confirmationValue = `${currentConfirmations}/${requiredConfirmations}`;
  const statusText = getPaymentStatusText(
    order,
    paymentActivity,
    isFulfillingOrder,
    remainingDueAmount,
  );
  const amountMatchLabel =
    paymentActivity?.amount_match_status === "exact"
      ? "Exact amount received"
      : isUnderpaid
        ? `${remainingDueAmount} remaining`
        : isOverpaid
          ? "Amount received is above total due"
          : "Waiting for payment";
  const helperContent = !order ? (
    ""
  ) : !hasReceivedPayment ? (
    `Send exactly ${expectedAmount} on ${order.network} to this address.`
  ) : isPaid ? (
    order.order_mode === "manual" ? (
      "Payment is confirmed on-chain. Your order is now processing."
    ) : order.fulfillment_status === "processing" || isFulfillingOrder ? (
      isGiftCardOrder ? (
        "Payment is confirmed on-chain. Digishelves is now preparing your gift card automatically."
      ) : (
        "Payment is confirmed on-chain. Digishelves is now sending the airtime automatically."
      )
    ) : isGiftCardOrder ? (
      "Payment is confirmed on-chain. Your gift card order will complete automatically as soon as processing finishes."
    ) : (
      "Payment is confirmed on-chain. The top-up will complete automatically as soon as processing finishes."
    )
  ) : isUnderpaid ? (
    <>
      Received {receivedAmount}.{" "}
      <strong>{remainingDueAmount} still remains.</strong> Complete the
      remaining payment to continue this{" "}
      {isGiftCardOrder ? "gift-card order" : "top-up"}, or{" "}
      <Link
        to="/contact"
        className="font-black text-[#8a4b08] underline underline-offset-4 transition hover:text-[#6d3905]"
      >
        contact support
      </Link>{" "}
      to cancel the order and request a refund.
    </>
  ) : (
    `Received ${receivedAmount}. Current confirmations: ${confirmationValue}. The ${
      isGiftCardOrder ? "gift-card order" : "top-up"
    } starts once the confirmed amount reaches the total due and confirmations reach ${requiredConfirmations}.`
  );

  return (
    <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
      <Seo
        title={isGiftCardOrder ? "Gift Card Payment" : "Top-up Payment"}
        description="Complete and monitor your Digishelves crypto payment."
        path={
          isGiftCardOrder
            ? `/gift-card/payment/${orderId}`
            : `/top-up/payment/${orderId}`
        }
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: isGiftCardOrder
            ? "Digishelves Gift Card Payment"
            : "Digishelves Top-up Payment",
          description: "Complete and monitor your Digishelves crypto payment.",
          path: isGiftCardOrder
            ? `/gift-card/payment/${orderId}`
            : `/top-up/payment/${orderId}`,
        })}
      />
      <Header />

      <main className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
        <div className="absolute left-[-10rem] top-12 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to={isGiftCardOrder ? "/gift-card" : "/top-up/checkout"}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-white px-4 py-2 text-sm font-black text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839]"
          >
            <ArrowLeft className="h-4 w-4" />
            {isGiftCardOrder ? "Back to gift cards" : "Back to top-up"}
          </Link>

          {/* Order Summary */}
          {(pendingPayment?.fulfillmentPayload || order?.order_summary) && (
            <OrderSummary
              payload={pendingPayment?.fulfillmentPayload}
              summary={order?.order_summary}
              orderId={orderId}
            />
          )}

          <section className="mt-6 md:overflow-hidden md:rounded md:border md:border-[#eadfe7] md:bg-white md:shadow-[0_30px_90px_rgba(33,23,34,0.14)]">
            <div className="bg-[#211722] p-6 text-white sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <CryptoTokenIcon token={order?.token_symbol || "USDC"} />
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                      {isGiftCardOrder ? "Gift card payment" : "Crypto payment"}
                    </p>
                    <h1 className="mb-0 max-w-2xl text-3xl font-black tracking-[-0.05em] !text-white sm:text-5xl">
                      {order
                        ? `Send exactly ${expectedAmount}`
                        : "Loading payment"}
                    </h1>
                  </div>
                </div>

                {order &&
                  order.fulfillment_status !== "completed" &&
                  !isPaid && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                      <Timer className="h-4 w-4 text-[#9ff1dd]" />
                      {minutes}:{seconds}
                    </div>
                  )}
              </div>
            </div>

            {isLoading ? (
              <PaymentSkeleton />
            ) : !order ? (
              <div className="p-5 sm:p-7">
                <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm font-bold leading-6 text-red-700">
                  {paymentError || "Payment not found."}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
                  <div className="flex aspect-square items-center justify-center rounded bg-white p-4">
                    {qrCode ? (
                      <img
                        src={qrCode}
                        alt={`${order.token_symbol} payment QR code`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin text-[#551839]" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#9a8b97]">
                          Wallet address
                        </p>
                        <p className="mb-0 break-all font-mono text-sm font-black leading-6 text-[#211722]">
                          {order.wallet_address}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#551839] transition hover:bg-[#f7f1e8] sm:w-auto"
                        onClick={copyAddress}
                      >
                        <Copy className="h-4 w-4" />
                        Copy address
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard label="Network" value={order.network} />
                    <SummaryCard label="Asset" value={order.token_symbol} />
                    <SummaryCard
                      label="Expected amount"
                      value={expectedAmount}
                      action={
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#551839] transition hover:bg-[#f7f1e8]"
                          onClick={copyExpectedAmount}
                          aria-label="Copy expected amount"
                          title="Copy expected amount"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      }
                    />
                    <SummaryCard
                      label="Received amount"
                      value={receivedAmount}
                      helper={
                        hasReceivedPayment
                          ? isUnderpaid
                            ? `Confirmed: ${confirmedReceivedAmount} | Remaining: ${remainingDueAmount}`
                            : `Confirmed: ${confirmedReceivedAmount}`
                          : "No payment detected yet"
                      }
                    />
                    <SummaryCard
                      label="Confirmations"
                      value={confirmationValue}
                      helper={`Required: ${requiredConfirmations}`}
                      tone={
                        hasReceivedPayment &&
                        currentConfirmations >= requiredConfirmations
                          ? "success"
                          : "default"
                      }
                    />
                    <SummaryCard
                      label="Amount check"
                      value={amountMatchLabel}
                      helper={
                        isUnderpaid
                          ? "Complete the remaining amount or contact support to cancel and request a refund."
                          : ""
                      }
                      tone={
                        isUnderpaid
                          ? "warning"
                          : paymentActivity?.amount_match_status === "exact"
                            ? "success"
                            : "default"
                      }
                    />
                    <SummaryCard
                      label="Status"
                      value={statusText}
                      helper={
                        paymentActivity?.latest_transaction_hash
                          ? `${paymentActivity.latest_transaction_hash.slice(0, 10)}...`
                          : ""
                      }
                      tone={
                        isUnderpaid
                          ? "warning"
                          : isPaid || order.fulfillment_status === "completed"
                            ? "success"
                            : "default"
                      }
                    />
                  </div>

                  <div
                    className={`rounded p-5 ${
                      isUnderpaid
                        ? "border border-[#f0c48a] bg-[#fff4e5] text-[#8a4b08]"
                        : "bg-[#211722] text-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <ShieldCheck
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          isUnderpaid ? "text-[#d97706]" : "text-[#9ff1dd]"
                        }`}
                      />
                      <p
                        className={`mb-0 text-sm font-bold leading-6 ${
                          isUnderpaid ? "text-[#8a4b08]" : "!text-white/75"
                        }`}
                      >
                        {helperContent}
                      </p>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                      {paymentError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrderSummary({ payload, summary, orderId }) {
  const fp = payload || {};
  const isGiftCardOrder =
    summary?.type === "giftcard" || Array.isArray(fp?.transaction?.products);
  const operator = fp?.oparatorData;
  const phone = fp?.editNumber || summary?.recipient;
  const operatorName = operator?.name || summary?.operator;
  const operatorLogo = operator?.logoUrls?.[0] || summary?.operator_logo;
  const receiveAmount =
    fp?.receiverAmount || fp?.receiveAmount || summary?.receiver_amount;
  const receiveCurrency = fp?.receiverCurrency || summary?.receiver_currency;
  const amountPaid =
    fp?.amountPaid || summary?.total_paid || fp?.transaction?.amount;
  const processingFee = fp?.ProcessingFee || summary?.processing_fee;
  const paymentCurrency =
    fp?.PaymentCurreuncy ||
    fp?.payment_currency ||
    summary?.payment_currency ||
    "USD";
  const deliveryEmail =
    fp?.email || fp?.transaction?.email || summary?.email || "";
  const giftCardProducts = fp?.transaction?.products || summary?.products || [];

  return (
    <section className="mt-6 md:overflow-hidden md:rounded md:border md:border-[#eadfe7] md:bg-white md:shadow-[0_30px_90px_rgba(33,23,34,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#eadfe7] px-6 py-5 sm:px-8">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#f7f1e8]">
          <Receipt className="h-4 w-4 text-[#551839]" />
        </span>
        <h2 className="text-base font-black tracking-[-0.03em] text-[#211722]">
          Order summary
        </h2>
        <span className="ml-auto rounded-full bg-[#f7f1e8] px-3 py-1 font-mono text-[0.65rem] font-black uppercase tracking-wider text-[#9a8b97]">
          #
          {typeof orderId === "string"
            ? orderId.replace(/-/g, "").slice(0, 12).toUpperCase()
            : orderId}
        </span>
      </div>

      {isGiftCardOrder ? (
        <div className="grid gap-4 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {deliveryEmail && (
              <div className="flex items-start gap-3 rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white">
                  <Mail className="h-4 w-4 text-[#551839]" />
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                    Delivery email
                  </p>
                  <p className="break-all text-sm font-black text-[#211722]">
                    {deliveryEmail}
                  </p>
                </div>
              </div>
            )}

            {amountPaid && (
              <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
                <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  Total charged
                </p>
                <p className="text-xl font-black tracking-[-0.04em] text-[#211722]">
                  {Number(amountPaid).toFixed(2)}{" "}
                  <span className="text-base">{paymentCurrency}</span>
                </p>
                {processingFee && Number(processingFee) > 0 && (
                  <p className="mt-1 text-xs font-bold text-[#9a8b97]">
                    Includes {Number(processingFee).toFixed(2)}{" "}
                    {paymentCurrency} processing fee
                  </p>
                )}
              </div>
            )}
          </div>

          {giftCardProducts.length > 0 && (
            <div className="overflow-hidden rounded border border-[#eadfe7]">
              <div className="border-b border-[#eadfe7] bg-[#211722] px-5 py-4 text-white">
                <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#9ff1dd]">
                  Product summary
                </p>
                <h3 className="mb-0 text-lg font-black !text-white">
                  {giftCardProducts.length} item
                  {giftCardProducts.length > 1 ? "s" : ""} in this order
                </h3>
              </div>

              <div className="divide-y divide-[#eadfe7] bg-white">
                {giftCardProducts.map((item, index) => (
                  <div
                    key={`${item.product_id || item.productId || item.product_name || item.productName}-${index}`}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#f7f1e8]">
                        <ShoppingBag className="h-4 w-4 text-[#551839]" />
                      </span>
                      <div className="min-w-0">
                        <p className="mb-1 text-sm font-black text-[#211722]">
                          {item.productName || item.product_name}
                        </p>
                        <p className="mb-0 text-sm font-bold text-[#665b67]">
                          Qty {item.quantity || 1}
                          {item.recipientAmount || item.recipient_amount ? (
                            <>
                              {" "}
                              · {item.recipientAmount ||
                                item.recipient_amount}{" "}
                              {item.recipientCurrency ||
                                item.recipient_currency}
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          {phone && (
            <div className="flex items-start gap-3 rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white">
                <Phone className="h-4 w-4 text-[#551839]" />
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  Phone number
                </p>
                <p className="font-mono text-sm font-black text-[#211722]">
                  {phone}
                </p>
              </div>
            </div>
          )}

          {operatorName && (
            <div className="flex items-start gap-3 rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                {operatorLogo ? (
                  <img
                    src={operatorLogo}
                    alt={operatorName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Zap className="h-4 w-4 text-[#551839]" />
                )}
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  Operator
                </p>
                <p className="text-sm font-black text-[#211722]">
                  {operatorName}
                </p>
              </div>
            </div>
          )}

          {receiveAmount && receiveCurrency && (
            <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                Recipient gets
              </p>
              <p className="text-xl font-black tracking-[-0.04em] text-[#211722]">
                {Number(receiveAmount).toFixed(2)}{" "}
                <span className="text-base">{receiveCurrency}</span>
              </p>
            </div>
          )}

          {amountPaid && (
            <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-4">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                Total charged
              </p>
              <p className="text-xl font-black tracking-[-0.04em] text-[#211722]">
                {Number(amountPaid).toFixed(2)}{" "}
                <span className="text-base">{paymentCurrency}</span>
              </p>
              {processingFee && Number(processingFee) > 0 && (
                <p className="mt-1 text-xs font-bold text-[#9a8b97]">
                  Includes {Number(processingFee).toFixed(2)} {paymentCurrency}{" "}
                  processing fee
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PaymentSkeleton() {
  return (
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="aspect-square animate-pulse rounded-md bg-[#efe7ed]" />
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-md bg-[#efe7ed]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded bg-[#efe7ed]" />
          <div className="h-24 animate-pulse rounded bg-[#efe7ed]" />
          <div className="h-24 animate-pulse rounded bg-[#efe7ed]" />
          <div className="h-24 animate-pulse rounded bg-[#efe7ed]" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper = "",
  action = null,
  tone = "default",
}) {
  const isSuccess = tone === "success";
  const isWarning = tone === "warning";

  return (
    <div
      className={`rounded border p-4 ${
        isSuccess
          ? "border-[#551839]/25 bg-[#551839] text-white"
          : isWarning
            ? "border-[#f0c48a] bg-[#fff4e5] text-[#8a4b08]"
            : "border-[#eadfe7] bg-[#fbf8f4] text-[#211722]"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p
          className={`mb-0 text-xs font-black uppercase tracking-[0.18em] ${
            isSuccess
              ? "text-white/55"
              : isWarning
                ? "text-[#b56a19]"
                : "text-[#9a8b97]"
          }`}
        >
          {label}
        </p>
        {action}
      </div>
      <p className="mb-0 text-xl font-black tracking-[-0.035em]">{value}</p>
      {helper && (
        <p
          className={`mb-0 mt-2 text-xs font-bold ${
            isSuccess
              ? "text-white/70"
              : isWarning
                ? "text-[#a25b10]"
                : "text-[#9a8b97]"
          }`}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function CryptoTokenIcon({ token }) {
  if (token === "USDT") {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#26a17b] shadow-sm">
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="h-8 w-8"
          fill="none"
        >
          <path
            fill="#fff"
            d="M35.8 12H12.2v5.7h8.9v3.5c-7.2.3-12.6 1.7-12.6 3.4s5.4 3.1 12.6 3.4v8h5.8v-8c7.2-.3 12.6-1.7 12.6-3.4s-5.4-3.1-12.6-3.4v-3.5h8.9V12Zm-11.8 14.2c-7.7 0-13.9-1.1-13.9-2.4 0-1.1 4.7-2.1 11-2.3v4.1c.9.1 1.9.1 2.9.1s2 0 2.9-.1v-4.1c6.3.2 11 1.2 11 2.3 0 1.3-6.2 2.4-13.9 2.4Z"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2775ca] shadow-sm">
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="h-8 w-8"
        fill="none"
      >
        <path
          fill="#fff"
          d="M24 42C14.1 42 6 33.9 6 24S14.1 6 24 6s18 8.1 18 18-8.1 18-18 18Zm0-3.2c8.2 0 14.8-6.6 14.8-14.8S32.2 9.2 24 9.2 9.2 15.8 9.2 24 15.8 38.8 24 38.8Z"
        />
        <path
          fill="#fff"
          d="M22.4 34.4v-3c-3.1-.4-5.5-1.8-7.1-4.1l3.1-2.1c1.3 1.8 3.1 2.7 5.6 2.7 2.3 0 3.7-.8 3.7-2.2 0-1.2-.9-1.8-4.3-2.3-4.7-.7-7.1-2.5-7.1-5.8 0-3 2.4-5.2 6.1-5.7V9.6h3.1v2.5c2.5.4 4.4 1.5 5.8 3.4l-3 2.1c-1-1.4-2.4-2.1-4.5-2.1-2.2 0-3.4.8-3.4 2 0 1.1.9 1.7 4.2 2.2 4.8.7 7.2 2.5 7.2 5.9 0 3.2-2.5 5.4-6.3 5.9v2.9h-3.1Z"
        />
      </svg>
    </span>
  );
}
