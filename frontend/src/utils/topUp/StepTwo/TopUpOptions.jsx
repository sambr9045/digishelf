import React, { useContext, useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Mail,
  WalletCards,
} from "lucide-react";
import visa from "../../../assets/images/payment/visa.png";
import mastercard from "../../../assets/images/payment/mastercard.png";
import discover from "../../../assets/images/payment/discover.png";
import ae from "../../../assets/images/payment/ae.png";
import bitcoin from "../../../assets/images/payment/bitcoin.png";
import coins from "../../../assets/images/payment/coins.png";

import MoreOptionModal from "./MoreOptionModal";
import { TopUpContext } from "../../../components/Context/TopUpContext";
import { SessionContext } from "../../../components/sessionContext";

const TopUpOptions = () => {
  const { session } = useContext(SessionContext);
  const {
    oparatorData,
    suggestedAmountsMap,
    selectedOptinData,
    EmailAddress,
    setEmailAddress,
    EmailError,
    paymentMethodSelect,
    setPaymentMethodSelect,
    setSelectedOptionData,
  } = useContext(TopUpContext);
  const [show, setShow] = useState(false);
  const [customAmountTwo, setCustomAmountTwo] = useState("");

  const operator = oparatorData?.data;
  const hasSelectedAmount =
    selectedOptinData !== "" && selectedOptinData !== undefined;

  useEffect(() => {
    if (session?.user?.email) {
      setEmailAddress(session.user.email);
    }
  }, [session, setEmailAddress]);

  useEffect(() => {
    setPaymentMethodSelect("crypto");
  }, [setPaymentMethodSelect]);

  if (!operator) {
    return null;
  }

  const handleCustomAmountChange = (event) => {
    const value = event.target.value;
    const isValid = /^(\d+\.?\d{0,2}|\d*)$/.test(value);

    if (isValid || value === "") {
      setCustomAmountTwo(value);
    }
  };

  const handleCustomAmountBlur = () => {
    if (!customAmountTwo) {
      return;
    }

    const payAmount = Number(customAmountTwo);
    const receiveAmount = payAmount * Number(operator.fx.rate || 0);

    setSelectedOptionData({
      name: "customAmount",
      amount: payAmount.toFixed(2),
      currency: "USD",
      payAmount: payAmount.toFixed(2),
      payCurrency: "USD",
      receiveAmount: receiveAmount.toFixed(2),
      receiveCurrency: operator.destinationCurrencyCode,
    });
  };

  const handleEmailChange = (event) => {
    setEmailAddress(event.target.value);
  };

  const selectAmount = (amount, name = "suggestedAmount") => {
    const payAmount = Number(amount);
    const receiveAmount = payAmount * Number(operator.fx.rate || 0);

    setSelectedOptionData({
      name,
      amount: payAmount.toFixed(2),
      currency: "USD",
      payAmount: payAmount.toFixed(2),
      payCurrency: "USD",
      receiveAmount: receiveAmount.toFixed(2),
      receiveCurrency: operator.destinationCurrencyCode,
    });
  };

  const amountOptions = [];

  if (operator.mostPopularAmount !== null) {
    amountOptions.push({
      key: "popular",
      label: "Popular",
      amount: operator.mostPopularAmount,
    });
  }

  Object.entries(suggestedAmountsMap || {})
    .slice(0, 2)
    .forEach(([amount], index) => {
      amountOptions.push({
        key: `suggested-${amount}`,
        label: index === 0 ? "Suggested" : "Value",
        amount,
      });
    });

  const AmountCard = ({ item }) => {
    const payAmount = Number(item.amount || 0);
    const receiveAmount = payAmount * Number(operator.fx.rate || 0);

    return (
      <button
        type="button"
        onClick={() => selectAmount(item.amount, item.key)}
        className="group rounded-md border border-[#eadfe7] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#551839]/35 hover:shadow-xl hover:shadow-[#551839]/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#551839]">
              {item.label}
            </span>
            <p className="mb-0 mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
              Recipient gets
            </p>
            <p className="mb-0 mt-1 text-2xl font-black tracking-[-0.04em] text-[#211722]">
              {receiveAmount.toFixed(2)} {operator.destinationCurrencyCode}
            </p>
            <p className="mb-0 mt-1 text-sm font-bold text-[#665b67]">
              You pay {payAmount.toFixed(2)} USD
            </p>
          </div>

          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fbf8f4] text-[#551839] transition group-hover:bg-[#551839] group-hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="topup-amount-step space-y-5">
      {hasSelectedAmount ? (
        <div className="rounded-md border border-[#551839]/25 bg-[#551839] p-5 text-white shadow-xl shadow-[#551839]/15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-white/55">
                Selected amount
              </p>
              <p className="mb-0 text-3xl font-black tracking-[-0.05em]">
                {selectedOptinData.receiveAmount}{" "}
                {selectedOptinData.receiveCurrency}
              </p>
              <p className="mb-0 mt-1 text-sm font-bold text-white/65">
                You pay {selectedOptinData.payAmount}{" "}
                {selectedOptinData.payCurrency}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOptionData("")}
              className="rounded-md bg-white px-5 py-3 text-sm font-black text-[#551839] transition hover:bg-[#f7f1e8]"
            >
              Change amount
            </button>
          </div>
        </div>
      ) : operator.mostPopularAmount === null ? (
        <div className="rounded-md border border-[#eadfe7] bg-white p-4 shadow-sm">
          <label
            htmlFor="custom-amount-two"
            className="mb-2 block text-sm font-black text-[#332834]"
          >
            Enter amount
          </label>
          <div className="relative">
            <WalletCards className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
            <input
              type="text"
              inputMode="decimal"
              id="custom-amount-two"
              name="custom-amount-two"
              className="h-14 w-full rounded-md border border-[#eadfe7] bg-[#fbf8f4] px-12 pr-20 text-lg font-black text-[#211722] outline-none transition placeholder:text-[#9a8b97] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
              placeholder="0.00"
              onChange={handleCustomAmountChange}
              onBlur={handleCustomAmountBlur}
              value={customAmountTwo}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#665b67]">
              USD
            </span>
          </div>
          <p className="mb-0 mt-3 text-sm font-bold text-[#665b67]">
            Enter the USD amount to pay. Recipient receives{" "}
            {Number(customAmountTwo || 0) > 0
              ? (
                  Number(customAmountTwo) * Number(operator.fx.rate || 0)
                ).toFixed(2)
              : "0.00"}{" "}
            {operator.destinationCurrencyCode}.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {amountOptions.map((item) => (
            <AmountCard key={item.key} item={item} />
          ))}
        </div>
      )}

      {!hasSelectedAmount && operator.mostPopularAmount !== null && (
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-[#fbf8f4] px-4 py-2 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-white"
            onClick={() => setShow(true)}
          >
            More options
            <ChevronRight className="h-4 w-4" />
          </button>
          <MoreOptionModal
            show={show}
            setShow={setShow}
            operatorData={operator}
          />
        </div>
      )}

      {(!session || !session.user || !session.user.email) && (
        <div className="rounded-md border border-[#eadfe7] bg-white p-4 shadow-sm">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-black text-[#332834]"
          >
            Receipt email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
            <input
              type="email"
              name="email"
              className={`h-14 w-full rounded-2xl border bg-[#fbf8f4] px-12 text-base font-bold text-[#211722] outline-none transition placeholder:text-[#9a8b97] focus:bg-white focus:ring-4 ${
                EmailError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-[#eadfe7] focus:border-[#551839] focus:ring-[#551839]/10"
              }`}
              id="email"
              placeholder="name@example.com"
              onChange={handleEmailChange}
              value={EmailAddress}
            />
          </div>
          {EmailError && (
            <p className="mb-0 mt-2 text-sm font-bold text-red-600">
              {EmailError}
            </p>
          )}
        </div>
      )}

      <div className="rounded-md border border-[#eadfe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="mb-1 text-sm font-black uppercase tracking-[0.16em] text-[#211722]">
              Payment method
            </h3>
            <p className="mb-0 text-sm font-medium text-[#665b67]">
              Continue with crypto. Card payments are currently unavailable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            disabled
            className="flex min-h-[112px] w-full cursor-not-allowed items-center justify-between gap-4 rounded-md border border-[#eadfe7] bg-[#f5f1f4] p-4 text-left opacity-70"
            aria-disabled="true"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8c7f8d]">
                <CreditCard className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-black text-[#433847]">
                  Debit or credit card
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  {[visa, mastercard, discover, ae].map((icon, index) => (
                    <img
                      key={index}
                      src={icon}
                      alt=""
                      className="h-4 w-auto opacity-80"
                    />
                  ))}
                </span>
              </span>
            </span>
            <span className="rounded-full border border-[#ddd2da] bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#8c7f8d]">
              Disabled
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethodSelect("crypto")}
            className={`flex min-h-[112px] w-full items-center justify-between gap-4 rounded-md border p-4 text-left transition ${
              paymentMethodSelect === "crypto"
                ? "border-[#551839] bg-[#fff7fb] shadow-[0_14px_35px_rgba(85,24,57,0.08)]"
                : "border-[#eadfe7] bg-[#fbf8f4] hover:border-[#551839]/30"
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#551839]">
                <img src={bitcoin} alt="Bitcoin" className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-black text-[#211722]">
                  Crypto currency
                </span>
                <span className="mt-1 flex items-center gap-2 text-sm font-bold text-[#665b67]">
                  <img src={bitcoin} alt="" className="h-4 w-auto" />
                  <img src={coins} alt="" className="h-4 w-auto" />
                  Auto-selected. Choose the coin on the next step.
                </span>
              </span>
            </span>
            {paymentMethodSelect === "crypto" && (
              <BadgeCheck className="h-5 w-5 shrink-0 text-[#10ac84]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpOptions;
