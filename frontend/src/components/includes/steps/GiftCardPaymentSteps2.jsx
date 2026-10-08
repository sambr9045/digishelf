import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import validator from "validator";
import bitcoin from "../../../assets/images/payment/bitcoin.png";
import coins from "../../../assets/images/payment/coins.png";
import emptycart from "../../../assets/images/cart/cart.svg";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Loader2,
  Mail,
  PackageCheck,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { toast } from "react-toastify";
import { api_endpoint } from "../../constant";
import { nanoid } from "nanoid";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../sessionContext";
import { ProcessingFeeCalculation } from "../Functions";

// id
// productName
// productId
// quantity
// recipientAmount
// recipientCurrency
// AmountToPay
// currencyToPayIn
// img

export default function GiftCardPaymentSteps2({ onStepChange }) {
  const PAYMENT_CURRENCY = "USD";
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("crypto");
  const [paystackQuote, setPaystackQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLading, setIsLoading] = useState(false);
  const { cart, country, clearCart, session } = useContext(SessionContext);
  const [cartTotal, setCartTotal] = useState(0);
  const [steps, setSteps] = useState(1);
  const [processingFee, setProcessinFee] = useState(0);
  const navigate = useNavigate();
  const [reference] = useState(() => `DSG-${nanoid(14)}`);
  const currentUserId = session?.user?.id || null;
  const normalizedUserType = currentUserId ? "user" : "guest";
  const paystackOptions = {
    country: "GH",
    currency: "GHS",
    channels: ["card", "mobile_money"],
  };



  useEffect(() => {
    setPaystackQuote(null);
    setQuoteError("");
    if (paymentMethodSelect === "crypto") {
      setQuoteLoading(false);
      return;
    }
    const controller = new AbortController();
    setQuoteLoading(true);
    axios.post(`${api_endpoint}/api/payments/paystack/quote/`, {
      products: cart || [], channel: paymentMethodSelect,
      visitor_ip: localStorage.getItem("ip") || "",
    }, { signal: controller.signal })
      .then(({ data }) => setPaystackQuote(data))
      .catch((error) => {
        if (!controller.signal.aborted) setQuoteError(error?.response?.data?.error || "Could not load the Paystack total. Please select the payment method again.");
      })
      .finally(() => { if (!controller.signal.aborted) setQuoteLoading(false); });
    return () => controller.abort();
  }, [paymentMethodSelect, cart, quoteAttempt]);

  const createPaystackOrder = async () => {
    if (!paystackQuote || !paystackOptions.channels.length) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${api_endpoint}/api/payments/paystack/initialize/`, {
        email: userEmail, products: cartItems, channel: paymentMethodSelect,
        expected_amount: paystackQuote.amount, expected_currency: paystackQuote.currency,
        quote_token: paystackQuote.quote_token,
        visitor_ip: localStorage.getItem("ip") || "",
      }, session?.accessToken ? { headers: { Authorization: `Bearer ${session.accessToken}` } } : undefined);
      try {
        const { default: PaystackPop } = await import("@paystack/inline-js");
        if (!data.access_code) throw new Error("Popup access code unavailable");
        const popup = new PaystackPop();
        popup.resumeTransaction(data.access_code, {
          onSuccess: () => {
            // The status page verifies with the backend before confirming delivery.
            navigate(`/gift-card/paystack/${data.reference}`);
          },
          onCancel: () => {
            setIsLoading(false);
          },
          onError: () => {
            window.location.assign(data.authorization_url);
          },
        });
      } catch {
        window.location.assign(data.authorization_url);
      }
    } catch (error) {
      const message = error?.response?.data?.error || "Could not start Paystack payment. Please try again.";
      toast.error(message);
      if (message.toLowerCase().includes("quote")) {
        setPaystackQuote(null);
        setQuoteError(message);
      }
      setIsLoading(false);
    }
  };

  const buildCryptoFulfillmentPayload = () => ({
    transaction: {
      reference,
      products: cartItems,
      amount: cartTotal,
      country: country.country,
      email: userEmail,
      user: currentUserId,
      user_type: normalizedUserType,
      payment_method: "crypto",
    },
    payment_details: {
      message: "Awaiting ERC20 stablecoin payment",
      status: "pending",
      transaction: reference,
      trxref: reference,
    },
    user_device: {
      ip_address: localStorage.getItem("ip") || "",
    },
    payment_currency: PAYMENT_CURRENCY,
  });

  const createCryptoOrder = async () => {
    setIsLoading(true);

    try {
      const fulfillmentPayload = buildCryptoFulfillmentPayload();
      const response = await axios.post(
        `${api_endpoint}/api/payments/orders/`,
        {
          amount: cartTotal,
          token_symbol: "USDC",
          fulfillment_type: "giftcard",
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

      localStorage.setItem(
        `digishelf:topup-payment:${response.data.order_id}`,
        JSON.stringify({
          orderId: response.data.order_id,
          reference,
          fulfillmentPayload,
          createdAt: new Date().toISOString(),
        }),
      );

      navigate(`/gift-card/payment/${response.data.order_id}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not create crypto payment order. Check payment settings and try again.",
      );
      setIsLoading(false);
    }
  };

  const HandlePayment = async () => {
    if (userEmail === "") {
      toast.error("Please enter your email address.");
      return;
    }

    if (emailError) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (paymentMethodSelect === "") {
      toast.error("Please select payment method.");
      return;
    }

    if (paymentMethodSelect === "crypto") {
      await createCryptoOrder();
    } else {
      await createPaystackOrder();
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setUserEmail(value);
    if (!validator.isEmail(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePaymentChange = (event) => {
    setPaymentMethodSelect(event);
  };

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
      setEmailError("");
    }
  }, [session]);

  useEffect(() => {
    if (cart && cart.length > 0) {
      // const processing fee =
      const processing_fee = cart.reduce(
        (acc, item) =>
          acc +
          ProcessingFeeCalculation(
            item.AmountToPay,
            PAYMENT_CURRENCY,
            item.processing_fee,
          ) *
            item.quantity,
        0,
      );

      setProcessinFee(processing_fee);

      const total = cart.reduce(
        (acc, item) => acc + item.AmountToPay * item.quantity,
        0,
      );

      setCartTotal((total + processing_fee).toFixed(2));
    }
  }, [cart]);

  useEffect(() => {
    onStepChange?.(steps);
  }, [onStepChange, steps]);

  const formatMoney = (value, currency) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(value || 0));

  const cartItems = cart || [];
  const orderSubtotal = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.AmountToPay || 0) * Number(item.quantity || 1),
    0,
  );
  const payingWithPaystack = steps === 2 && paymentMethodSelect === "paystack";
  const summaryCurrency = payingWithPaystack ? "GHS" : PAYMENT_CURRENCY;
  const summaryTotal = payingWithPaystack ? paystackQuote?.amount : cartTotal;
  const summarySubtotal = payingWithPaystack ? paystackQuote?.subtotal : orderSubtotal;
  const summaryFees = payingWithPaystack ? paystackQuote?.fees : processingFee;
  const totalsLoading = payingWithPaystack && !paystackQuote && !quoteError;
  const amountSkeleton = (
    <span role="status" aria-label="Loading payment total" className="inline-block h-[1em] w-28 animate-pulse rounded-md bg-[#eadfe7] align-middle motion-reduce:animate-none" />
  );
  const summaryMoney = (value) => totalsLoading ? amountSkeleton : value == null ? "—" : formatMoney(value, summaryCurrency);
  const canContinueToPayment = cartItems.length > 0;
  const hasAccountEmail = Boolean(session?.user?.email);
  const getItemFee = (item) =>
    ProcessingFeeCalculation(
      item.AmountToPay,
      PAYMENT_CURRENCY,
      item.processing_fee,
    ) * item.quantity;

  return (
    <div className="checkout-flow">
      {cartItems.length > 0 ? (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6">
            <div className="overflow-hidden rounded-md border border-[#eadfe7] bg-white shadow-[0_22px_70px_rgba(33,23,34,0.08)]">
              <div className="border-b border-[#eadfe7] bg-[#211722] p-5 text-white sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                      {steps === 1 ? "Order review" : "Payment details"}
                    </p>
                    <h2 className="mb-0 text-xl font-black tracking-[-0.04em] !text-white sm:text-3xl">
                      {steps === 1
                        ? "Confirm your gift cards"
                        : "Complete your purchase"}
                    </h2>
                  </div>

                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black">
                    {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                {steps === 1 && (
                  <>
                    <div className="grid gap-4">
                      {cartItems.map((item) => {
                        const itemFee = getItemFee(item);
                        const image = Array.isArray(item.img)
                          ? item.img[0]
                          : item.img;

                        return (
                          <div
                            key={item.id || item.productId}
                            className="grid gap-4 rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-4 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center"
                          >
                            <div className="flex h-24 items-center justify-center overflow-hidden rounded-md bg-white sm:h-28">
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="h-9 w-9 text-[#551839]" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#a196a3]">
                                    Gift card
                                  </p>
                                  <h3 className="mb-0 text-lg font-black text-[#211722] sm:text-xl">
                                    {item.productName}
                                  </h3>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#551839]">
                                  Qty {item.quantity}
                                </span>
                              </div>

                              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div>
                                  <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-[#a196a3]">
                                    Receives
                                  </p>
                                  <p className="mb-0 font-black text-[#3d3440]">
                                    {formatMoney(
                                      item.recipientAmount,
                                      item.recipientCurrency,
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-[#a196a3]">
                                    Fee
                                  </p>
                                  <p className="mb-0 font-black text-[#3d3440]">
                                    {formatMoney(itemFee, PAYMENT_CURRENCY)}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-[#a196a3]">
                                    Price
                                  </p>
                                  <p className="mb-0 font-black text-[#3d3440]">
                                    {formatMoney(
                                      item.AmountToPay,
                                      PAYMENT_CURRENCY,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {steps === 2 && (
                  <div className="grid gap-6">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-white px-4 py-3 text-sm font-black text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839] sm:w-fit sm:justify-start sm:py-2"
                      onClick={() => setSteps(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to order
                    </button>

                    {hasAccountEmail ? (
                      <div className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-4">
                        <p className="mb-2 text-sm font-black text-[#211722]">
                          Delivery email
                        </p>
                        <div className="flex items-start gap-3 rounded-md bg-white px-4 py-4 sm:items-center">
                          <Mail className="h-5 w-5 shrink-0 text-[#551839]" />
                          <div>
                            <p className="mb-0 text-base font-black text-[#211722]">
                              {userEmail}
                            </p>
                            <p className="mb-0 mt-1 text-sm font-bold text-[#665b67]">
                              Using your signed-in account email for gift-card
                              delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-black text-[#211722]"
                        >
                          Delivery email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c7f8d]" />
                          <input
                            type="email"
                            className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] pl-12 pr-4 text-base font-bold text-[#211722] outline-none transition placeholder:text-[#9c919d] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                            id="email"
                            aria-describedby="emailHelp"
                            placeholder="name@example.com"
                            value={userEmail}
                            onChange={handleEmailChange}
                          />
                        </div>
                        {emailError && (
                          <div
                            id="emailHelp"
                            className="mt-2 text-sm font-bold text-red-600"
                          >
                            {emailError}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="mb-3 text-lg font-black text-[#211722]">
                        Payment method
                      </h3>
                      <div className="grid gap-3">
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between gap-4 rounded-md border p-4 text-left transition ${
                            paymentMethodSelect === "crypto"
                              ? "border-[#551839] bg-[#fff7fb] shadow-[0_14px_35px_rgba(85,24,57,0.08)]"
                              : "border-[#eadfe7] bg-[#fbf8f4] hover:border-[#551839]/30"
                          }`}
                          onClick={() => handlePaymentChange("crypto")}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#551839]">
                              <Wallet className="h-5 w-5" />
                            </span>
                            <span>
                              <span className="block font-black text-[#211722]">
                                Crypto
                              </span>
                              <span className="mt-1 flex items-center gap-2 text-sm font-bold text-[#665b67]">
                                <img
                                  src={bitcoin}
                                  alt=""
                                  className="h-4 w-auto"
                                />
                                <img
                                  src={coins}
                                  alt=""
                                  className="h-4 w-auto"
                                />
                                Pay using your crypto wallet
                              </span>
                            </span>
                          </span>
                          {paymentMethodSelect === "crypto" && (
                            <BadgeCheck className="h-5 w-5 shrink-0 text-[#10ac84]" />
                          )}
                        </button>
                        {paystackOptions.channels.length > 0 && (
                            <button
                              type="button"
                              aria-pressed={paymentMethodSelect === "paystack"}
                              onClick={() => handlePaymentChange("paystack")}
                              className={`flex w-full items-center justify-between gap-4 rounded-md border p-4 text-left transition ${paymentMethodSelect === "paystack" ? "border-[#551839] bg-[#fff7fb]" : "border-[#eadfe7] bg-[#fbf8f4] hover:border-[#551839]/30"}`}
                            >
                              <span className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#551839]"><CreditCard className="h-5 w-5" /></span>
                                <span>
                                  <span className="block font-black text-[#211722]">Visa / Mastercard</span>
                                  <span className="mt-1 block text-sm font-bold text-[#665b67]">Paystack</span>
                                </span>
                              </span>
                              {paymentMethodSelect === "paystack" && <BadgeCheck className="h-5 w-5 shrink-0 text-[#10ac84]" />}
                            </button>
                        )}
                      </div>
                      {paymentMethodSelect !== "crypto" && quoteError && (
                        <button type="button" onClick={() => setQuoteAttempt((value) => value + 1)} className="mt-3 text-sm font-bold text-[#551839] underline">
                          Try again
                        </button>
                      )}
                      {paymentMethodSelect !== "crypto" && (
                        <p role="status" className="mb-0 mt-3 text-sm font-bold text-[#665b67]">
                          {totalsLoading ? (
                            <span aria-label="Loading payment details" className="block space-y-2 animate-pulse motion-reduce:animate-none">
                              <span className="block h-3 w-3/4 rounded bg-[#eadfe7]" />
                              <span className="block h-3 w-1/2 rounded bg-[#eadfe7]" />
                            </span>
                          ) : quoteError || (paystackQuote ? "Pay securely with Paystack." : "")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-md border border-[#eadfe7] bg-white p-5 shadow-[0_22px_70px_rgba(33,23,34,0.08)] sm:p-6 lg:sticky lg:top-28">
              {steps === 2 ? (
                <div className="mb-6 overflow-hidden rounded-md border border-[#eadfe7]">
                  <div className="flex items-center gap-3 bg-[#211722] px-5 py-4 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                      <Receipt className="h-5 w-5 text-[#9ff1dd]" />
                    </span>
                    <div>
                      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#9ff1dd]">
                        Product summary
                      </p>
                      <h3 className="mb-0 text-lg font-black !text-white">
                        {cartItems.length} item{cartItems.length > 1 ? "s" : ""}{" "}
                        in this order
                      </h3>
                    </div>
                  </div>

                  <div className="divide-y divide-[#eadfe7] bg-white">
                    {cartItems.map((item) => (
                      <div
                        key={item.id || item.productId}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#eadfe7] bg-[#fbf8f4]">
                            {(Array.isArray(item.img) ? item.img[0] : item.img) ? (
                              <img src={Array.isArray(item.img) ? item.img[0] : item.img} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-[#551839]" />
                            )}
                          </div>
                          <div className="min-w-0">
                          <p className="mb-1 text-sm font-black text-[#211722]">
                            {item.productName}
                          </p>
                          <p className="mb-0 text-sm font-bold text-[#665b67]">
                            Qty {item.quantity} ·{" "}
                            {formatMoney(
                              item.recipientAmount,
                              item.recipientCurrency,
                            )}
                          </p>
                          </div>
                        </div>
                        {!payingWithPaystack && <div className="text-left sm:text-right">
                          <p className="mb-1 text-sm font-black text-[#211722]">
                            {formatMoney(
                              item.AmountToPay * item.quantity,
                              PAYMENT_CURRENCY,
                            )}
                          </p>
                          <p className="mb-0 text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
                            Fee{" "}
                            {formatMoney(getItemFee(item), PAYMENT_CURRENCY)}
                          </p>
                        </div>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839]">
                Order total
              </p>
              <div className="text-3xl font-black tracking-[-0.05em] text-[#211722] sm:text-4xl">
                {summaryMoney(summaryTotal)}
              </div>

              <div className="mt-6 grid gap-3 border-t border-[#eadfe7] pt-6">
                <div className="flex items-center justify-between gap-4 text-sm font-bold text-[#665b67]">
                  <span>Subtotal</span>
                  <span className="text-[#211722]">
                    {summaryMoney(summarySubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm font-bold text-[#665b67]">
                  <span>Processing fees</span>
                  <span className="text-[#211722]">
                    {summaryMoney(summaryFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-md bg-[#fbf8f4] p-4 text-base font-black text-[#211722]">
                  <span>Total due</span>
                  <span>{summaryMoney(summaryTotal)}</span>
                </div>
              </div>

              {payingWithPaystack && paystackQuote && (
                <p className="mb-0 mt-3 text-sm text-[#665b67]">Charged in Ghana cedis. Your bank may apply currency conversion fees.</p>
              )}


              <div className="mt-6">
                {steps === 1 ? (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#551839] px-6 py-4 text-base font-black text-white shadow-xl shadow-[#551839]/15 transition hover:bg-[#44122d] disabled:opacity-60"
                    disabled={!canContinueToPayment}
                    onClick={() => setSteps(2)}
                  >
                    Continue to payment
                    <PackageCheck className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#551839] px-6 py-4 text-base font-black text-white shadow-xl shadow-[#551839]/15 transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLading || (paymentMethodSelect !== "crypto" && (quoteLoading || !paystackQuote))}
                    onClick={HandlePayment}
                  >
                    {isLading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Preparing payment...
                      </>
                    ) : (
                      <>
                        {totalsLoading ? (
                          <span role="status" aria-label="Loading payment amount" className="h-5 w-32 animate-pulse rounded bg-white/25 motion-reduce:animate-none" />
                        ) : payingWithPaystack && !paystackQuote ? "Pay" : <>Pay {summaryMoney(summaryTotal)}</>}
                        <ShieldCheck className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-md bg-[#211722] p-5 text-white">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9ff1dd]" />
                  <div>
                    <h3 className="mb-1 text-base font-black !text-white">
                      Secure checkout
                    </h3>
                    <p className="mb-0 text-sm font-medium leading-6 text-white/70">
                      Your order details stay protected while we prepare the
                      gift-card delivery.
                    </p>
                  </div>
                </div>
              </div>
              {payingWithPaystack && paystackQuote && (
                <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="mt-4 block text-center text-[11px] text-[#665b67] underline">Currency rates by ExchangeRate-API</a>
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto max-w-xl rounded-md border border-[#eadfe7] bg-white p-6 text-center shadow-[0_22px_70px_rgba(33,23,34,0.08)] sm:p-8">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#fbf8f4]">
              <img src={emptycart} alt="empty cart" className="h-14 w-14" />
            </div>

            <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839]">
              Empty cart
            </p>
            <h2 className="mb-3 text-3xl font-black tracking-[-0.04em] text-[#211722]">
              Your cart is empty.
            </h2>
            <p className="mx-auto mb-7 max-w-sm text-base font-medium leading-7 text-[#665b67]">
              Choose a gift card first, then return here to complete checkout.
            </p>

            <div>
              <Link
                to="/gift-card"
                className="inline-flex items-center justify-center rounded-full bg-[#551839] px-6 py-3 text-sm font-black text-white shadow-xl shadow-[#551839]/15 transition hover:bg-[#44122d]"
              >
                Browse gift cards
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
