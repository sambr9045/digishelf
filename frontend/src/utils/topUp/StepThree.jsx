import React, { useContext, useState } from "react";
import axios from "axios";
import { ArrowLeft, Copy, Loader2, Wallet } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { TopUpContext } from "../../components/Context/TopUpContext";
import { SessionContext } from "../../components/sessionContext";
import { api_endpoint } from "../../components/constant";
import { TopUpAitimeFeeCalculatio } from "../../components/includes/Functions";
import Loader from "../../components/includes/Loader";

const TOPUP_PAYMENT_STORAGE_PREFIX = "digishelf:topup-payment:";

const TOKENS = [
  {
    symbol: "USDC",
    label: "USD Coin",
    iconClass: "bg-[#2775ca]",
  },
  {
    symbol: "USDT",
    label: "Tether USD",
    iconClass: "bg-[#26a17b]",
  },
];

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

export default function StepThree() {
  const {
    oparatorData,
    editNumber,
    setSteps,
    selectedOptinData,
    fx_rate,
    country,
    EmailAddress,
    operatorCountryData,
    isLoading,
  } = useContext(TopUpContext);
  const { session } = useContext(SessionContext);
  const navigate = useNavigate();

  const [paymentError, setPaymentError] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [reference] = useState(() => nanoid(14));
  const customerEmail = (EmailAddress || session?.user?.email || "").trim();

  const payAmount = parseFloat(
    selectedOptinData.payAmount || selectedOptinData.amount || 0,
  );
  const receiveAmount = parseFloat(
    selectedOptinData.receiveAmount ||
      (payAmount * parseFloat(fx_rate?.rate || 0)).toFixed(2),
  );
  const receiveCurrency =
    selectedOptinData.receiveCurrency || fx_rate?.currencyCode;
  const paymentCurrency = selectedOptinData.payCurrency || "USD";
  const processingFee = parseFloat(
    TopUpAitimeFeeCalculatio(payAmount, country.country)[0],
  );
  const amountPaid = processingFee + payAmount;
  const paymentAmount = amountPaid.toFixed(6);
  const tokenAmountLabel = `${formatTokenAmount(paymentAmount)} ${selectedToken}`;

  const buildFulfillmentPayload = (order) => ({
    transaction: {
      reference,
      payment_order_id: order.order_id,
    },
    paymentOrderId: order.order_id,
    receiverAmount: receiveAmount.toFixed(2),
    receiverCurrency: receiveCurrency,
    ProcessingFee: processingFee.toFixed(2),
    amountPaid: amountPaid.toFixed(2),
    email: customerEmail,
    userType: session && session.user !== null ? session.user : "guest",
    PaymentCurreuncy: paymentCurrency,
    PaymentMethod: "crypto",
    ConvertedAmountToUsd: false,
    oparatorData,
    operatorCountryData,
    editNumber,
    ghana_cedis_rate: localStorage.getItem("exchangeRate")
      ? JSON.parse(localStorage.getItem("exchangeRate")).GHS
      : null,
    country: country.country,
  });

  const savePendingPayment = (order) => {
    localStorage.setItem(
      `${TOPUP_PAYMENT_STORAGE_PREFIX}${order.order_id}`,
      JSON.stringify({
        orderId: order.order_id,
        reference,
        fulfillmentPayload: buildFulfillmentPayload(order),
        createdAt: new Date().toISOString(),
      }),
    );
  };

  const createCryptoOrder = async () => {
    setPaymentError("");
    if (!customerEmail) {
      const message =
        "Customer email is required before creating a crypto payment order.";
      setPaymentError(message);
      toast.error(message);
      return;
    }
    setIsCreatingOrder(true);

    try {
      const fulfillmentPayload = buildFulfillmentPayload({ order_id: null });
      const response = await axios.post(
        `${api_endpoint}/api/payments/orders/`,
        {
          amount: paymentAmount,
          token_symbol: selectedToken,
          fulfillment_type: "topup",
          fulfillment_payload: fulfillmentPayload,
        },
        session?.accessToken
          ? {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          : undefined,
      );

      const order = response.data;
      savePendingPayment(order);
      navigate(`/top-up/payment/${order.order_id}`);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Could not create crypto payment order. Check backend payment configuration.";
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const copyPaymentAmount = async () => {
    try {
      await navigator.clipboard.writeText(paymentAmount);
      toast.success("Payment amount copied.");
    } catch (error) {
      toast.error("Could not copy payment amount.");
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      <div className="space-y-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-white px-4 py-2 text-sm font-black text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839]"
          onClick={() => setSteps(2)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to amount
        </button>

        <div className="md:overflow-hidden md:rounded md:border md:border-[#eadfe7] md:bg-white md:shadow-[0_22px_70px_rgba(33,23,34,0.08)]">
          <div className="grid gap-5 p-0 md:p-5 lg:p-6">
            <div className="flex items-center gap-3 rounded bg-[#211722] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10ac84]">
                <Wallet className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                  Crypto payment
                </p>
                <p className="mb-0 text-sm font-bold text-white/70">
                  Pay with Ethereum ERC20 stablecoins.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:items-start">
              <div className="self-start rounded border border-[#eadfe7] bg-[#fbf8f4] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eadfe7] pb-5">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#9a8b97]">
                      Payment summary
                    </p>
                    <p className="mb-0 text-sm font-bold text-[#665b67]">
                      Review the recipient and amount before continuing.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#551839] shadow-sm">
                    ERC20
                  </span>
                </div>

                <div className="mt-5 grid gap-4">
                  <div className="border-b border-[#eadfe7] pb-4 sm:rounded sm:border sm:bg-white sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                          Recipient number
                        </p>
                        <p className="mb-1 text-xl font-black tracking-[-0.03em] text-[#211722]">
                          {editNumber}
                        </p>
                        <p className="mb-0 text-sm font-bold text-[#665b67]">
                          {oparatorData?.data?.name || "Mobile network"}
                        </p>
                      </div>
                      {oparatorData?.data?.logoUrls?.[2] && (
                        <img
                          src={oparatorData.data.logoUrls[2]}
                          alt={oparatorData?.data?.name}
                          className="h-10 w-auto object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="sm:rounded sm:border sm:border-[#eadfe7] sm:bg-white sm:p-4">
                    <SummaryRow
                      label="Recipient receives"
                      value={`${receiveAmount.toFixed(2)} ${receiveCurrency}`}
                    />
                    <SummaryRow
                      label="You pay"
                      value={`${payAmount.toFixed(2)} ${paymentCurrency}`}
                    />
                    <SummaryRow
                      label="Top-up fee"
                      value={`${processingFee.toFixed(2)} ${paymentCurrency}`}
                      withBorder={false}
                    />

                    <div className="mt-4 rounded bg-[#551839] px-4 py-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                            Total due
                          </p>
                          <p className="mb-0 text-3xl font-black tracking-[-0.05em] text-white">
                            {tokenAmountLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                          onClick={copyPaymentAmount}
                          aria-label="Copy payment amount"
                          title="Copy amount"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="mb-0 text-sm font-bold text-white/70">
                          on Ethereum ERC20
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#eadfe7] bg-[#fbf8f4] p-5 sm:p-6">
                <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#9a8b97]">
                  Payment token
                </p>
                <p className="mb-4 text-sm font-bold text-[#665b67]">
                  Choose the stablecoin you want to send.
                </p>

                <div className="grid gap-3">
                  {TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      type="button"
                      className={`rounded border p-4 text-left transition ${
                        selectedToken === token.symbol
                          ? "border-[#551839] bg-[#fff7fb] shadow-[0_14px_35px_rgba(85,24,57,0.08)]"
                          : "border-[#eadfe7] bg-white hover:border-[#551839]/30"
                      }`}
                      onClick={() => setSelectedToken(token.symbol)}
                    >
                      <span className="flex items-center gap-3">
                        <CoinIcon token={token} />
                        <span className="min-w-0">
                          <span className="block text-lg font-black text-[#211722]">
                            {token.symbol}
                          </span>
                          <span className="mt-1 block text-sm font-bold text-[#665b67]">
                            {token.label}
                          </span>
                          <span className="mt-1 block text-xs font-black uppercase tracking-[0.16em] text-[#9a8b97]">
                            Ethereum ERC20
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#551839] px-6 text-base font-black text-white shadow-lg shadow-[#551839]/15 transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={createCryptoOrder}
                  disabled={isCreatingOrder}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating payment page
                    </>
                  ) : (
                    <>
                      Continue to {selectedToken} payment
                      <Wallet className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {paymentError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                {paymentError}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryRow({ label, value, withBorder = true }) {
  return (
    <div
      className={`flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        withBorder ? "border-b border-[#efe7ed]" : ""
      }`}
    >
      <p className="mb-0 text-sm font-bold text-[#665b67]">{label}</p>
      <p className="mb-0 text-left text-lg font-black tracking-[-0.03em] text-[#211722] sm:text-right">
        {value}
      </p>
    </div>
  );
}

function CoinIcon({ token }) {
  if (token.symbol === "USDT") {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#26a17b] shadow-sm">
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="h-7 w-7"
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2775ca] shadow-sm">
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="h-7 w-7"
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
