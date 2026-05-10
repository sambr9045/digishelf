import React, { useContext } from "react";
import { Modal } from "react-bootstrap";
import { BadgeCheck, WalletCards, X } from "lucide-react";
import { TopUpContext } from "../../../components/Context/TopUpContext";

const MoreOptionModal = ({ show, setShow, operatorData }) => {
  const {
    suggestedAmountsMap,
    customAmount,
    fx_rate,
    setSelectedOptionData,
    setCustomAmount,
  } = useContext(TopUpContext);

  const handleClose = () => setShow(false);

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    const isValid = /^(\d+\.?\d{0,2}|\d*)$/.test(value);

    if (isValid || value === "") {
      setCustomAmount(value);
    }
  };

  const suggestedAmountValues = Object.keys(suggestedAmountsMap || {})
    .map((amount) => Number(amount))
    .filter((amount) => Number.isFinite(amount) && amount > 0);
  const explicitMinAmount = Number(
    operatorData?.minAmount ||
      operatorData?.localMinAmount ||
      operatorData?.minimumAmount ||
      0,
  );
  const explicitMaxAmount = Number(
    operatorData?.maxAmount ||
      operatorData?.localMaxAmount ||
      operatorData?.maximumAmount ||
      0,
  );
  const derivedMinAmount = suggestedAmountValues.length
    ? Math.min(...suggestedAmountValues)
    : Number(operatorData?.mostPopularAmount || 0);
  const derivedMaxAmount = suggestedAmountValues.length
    ? Math.max(...suggestedAmountValues)
    : Number(operatorData?.mostPopularAmount || 0);
  const minAmount = explicitMinAmount > 0 ? explicitMinAmount : derivedMinAmount;
  const maxAmount = explicitMaxAmount > 0 ? explicitMaxAmount : derivedMaxAmount;
  const hasKnownRange = minAmount > 0 && maxAmount > 0 && maxAmount >= minAmount;
  const payAmount = Number(customAmount || 0);
  const receiveAmount = payAmount * Number(fx_rate?.rate || 0);
  const receiveCurrency =
    operatorData?.destinationCurrencyCode || fx_rate?.currencyCode || "";
  const hasSuggestions = Object.keys(suggestedAmountsMap || {}).length > 0;
  const isAmountValid =
    customAmount !== "" &&
    payAmount > 0 &&
    (!hasKnownRange || (payAmount >= minAmount && payAmount <= maxAmount));

  const HandleConfirmClick = () => {
    if (!isAmountValid) {
      return;
    }

    setSelectedOptionData({
      name: "customAmount",
      amount: payAmount.toFixed(2),
      currency: "USD",
      payAmount: payAmount.toFixed(2),
      payCurrency: "USD",
      receiveAmount: receiveAmount.toFixed(2),
      receiveCurrency,
    });

    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="border-0 bg-transparent shadow-none"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[#fffaf5] shadow-[0_30px_90px_rgba(33,23,34,0.2)]">
        <div className="relative border-b border-[#eadfe7] bg-[radial-gradient(circle_at_top_left,_rgba(16,172,132,0.12),_transparent_36%),linear-gradient(180deg,_#fffdf9_0%,_#fff7f2_100%)] px-6 pb-5 pt-6">
          <div className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#551839]">
            {hasSuggestions ? "More options" : "Custom amount"}
          </div>
          <h2 className="mb-0 mt-4 pr-10 text-[2rem] font-black tracking-[-0.05em] text-[#211722]">
            Enter a custom top-up amount
          </h2>
          <p className="mb-0 mt-2 max-w-md text-sm font-bold leading-6 text-[#665b67]">
            Choose how much you want to pay in USD and we will preview exactly
            what the recipient gets.
          </p>

          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfe7] bg-white text-[#551839] transition hover:border-[#551839]/35 hover:bg-[#f7f1e8]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label
              htmlFor="customAmount"
              className="mb-2 block text-sm font-black text-[#332834]"
            >
              Amount to pay
            </label>
            <div className="relative">
              <WalletCards className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                id="customAmount"
                className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-white px-12 pr-20 text-lg font-black text-[#211722] outline-none transition placeholder:text-[#9a8b97] focus:border-[#551839] focus:ring-4 focus:ring-[#551839]/10"
                onChange={handleCustomAmountChange}
                value={customAmount}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#551839]">
                USD
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasKnownRange ? (
              <>
                <span className="inline-flex rounded-full border border-[#eadfe7] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#665b67]">
                  Min {minAmount.toFixed(2)} USD
                </span>
                <span className="inline-flex rounded-full border border-[#eadfe7] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#665b67]">
                  Max {maxAmount.toFixed(2)} USD
                </span>
              </>
            ) : (
              <span className="inline-flex rounded-full border border-[#eadfe7] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#665b67]">
                Enter any amount above 0 USD
              </span>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  Recipient gets
                </p>
                <p className="mb-0 text-3xl font-black tracking-[-0.05em] text-[#211722]">
                  {receiveAmount.toFixed(2)} {receiveCurrency}
                </p>
                <p className="mb-0 mt-2 text-sm font-bold text-[#665b67]">
                  Based on the current operator conversion rate.
                </p>
              </div>

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1e8] text-[#551839]">
                <BadgeCheck className="h-5 w-5" />
              </span>
            </div>
          </div>

          {!isAmountValid && customAmount !== "" && (
            <p className="mb-0 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {hasKnownRange
                ? `Enter an amount between ${minAmount.toFixed(2)} USD and ${maxAmount.toFixed(2)} USD.`
                : "Enter an amount greater than 0 USD."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#eadfe7] bg-white px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#eadfe7] bg-[#fbf8f4] px-6 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-white"
            onClick={handleClose}
          >
            Close
          </button>

          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#551839] px-6 text-sm font-black text-white transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={HandleConfirmClick}
            disabled={!isAmountValid}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MoreOptionModal;
