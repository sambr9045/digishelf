import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { api_endpoint } from "../constant";
import { SessionContext } from "../sessionContext";
import { giftcardDetailsCalculation } from "../includes/Functions";
import { sendAnalyticsEvents, trackAnalyticsEvent } from "../../utils/analytics";

const TRADEMARK_NOTICE =
  "All trademarks, service marks, and brand names are the property of their respective owners. Digishelves is an independent authorized reseller and is not the issuer of any gift card. Digishelves is not affiliated with, endorsed by, or sponsored by any brand listed on this website. Brand names and logos are used solely to identify products available through licensed third-party distribution partners. Use of each gift card is also subject to the issuer's terms and redemption policies.";

function getLogoUrl(product) {
  if (!product?.logoUrls) {
    return "";
  }

  return Array.isArray(product.logoUrls)
    ? product.logoUrls[0]
    : product.logoUrls;
}

function buildInstructionBlocks(text) {
  if (!text) {
    return [];
  }

  const normalized = text
    .replace(/\s*•\s*/g, "\n• ")
    .replace(/\s+(\d+\.)\s+/g, "\n$1 ")
    .replace(
      /\.\s+(?=(Important Information:|Scam Warning:|Restrictions:|Terms and Support:|How to Redeem|Where You Can Use))/g,
      ".\n",
    )
    .replace(/\s{2,}/g, " ")
    .trim();

  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];

  lines.forEach((line) => {
    if (/^•\s+/.test(line)) {
      const value = line.replace(/^•\s+/, "");
      const previous = blocks[blocks.length - 1];
      if (previous?.type === "bullet-list") {
        previous.items.push(value);
      } else {
        blocks.push({ type: "bullet-list", items: [value] });
      }
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      const value = line.replace(/^\d+\.\s+/, "");
      const previous = blocks[blocks.length - 1];
      if (previous?.type === "ordered-list") {
        previous.items.push(value);
      } else {
        blocks.push({ type: "ordered-list", items: [value] });
      }
      return;
    }

    blocks.push({ type: "paragraph", content: line });
  });

  return blocks;
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="aspect-[4/3] animate-pulse rounded-[2rem] bg-[#f4eee8]" />
      <div className="space-y-5">
        <div className="h-14 w-3/4 animate-pulse rounded-full bg-[#eadfe7]" />
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-[#eadfe7]" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-2xl bg-[#f4eee8]"
            />
          ))}
        </div>
        <div className="h-14 w-56 animate-pulse rounded-full bg-[#eadfe7]" />
      </div>
    </div>
  );
}

function InstructionBlock({ block }) {
  if (block.type === "bullet-list") {
    return (
      <ul className="mb-0 space-y-2 pl-5 marker:text-[#551839]">
        {block.items.map((item, index) => (
          <li key={index} className="text-base leading-7 text-[#665b67]">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol className="mb-0 space-y-2 pl-5 marker:font-black marker:text-[#551839]">
        {block.items.map((item, index) => (
          <li key={index} className="text-base leading-7 text-[#665b67]">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p className="mb-0 text-base leading-7 text-[#665b67]">{block.content}</p>
  );
}

function TrademarkSubtext() {
  return (
    <p className="mb-0 mt-6 border-t border-[#eadfe7] pt-5 text-sm leading-6 text-[#9a8b97]">
      <span className="font-black text-[#665b67]">Trademark notice:</span>{" "}
      {TRADEMARK_NOTICE}
    </p>
  );
}

export default function GiftCardProductDetail({ productId, onClose }) {
  const [productIdData, setProductIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedValue, setSelectedValue] = useState(0);
  const [customAmountError, setCustomAmountError] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customAmountValue, setCustomAmountValue] = useState(0);
  const { country, addToCart, mainCurrency, session } =
    useContext(SessionContext);
  const navigate = useNavigate();
  const viewStartRef = useRef(0);

  const denominationMap =
    productIdData?.fixedRecipientToSenderDenominationsMap || null;
  const denominationOptions = useMemo(
    () => (denominationMap ? Object.keys(denominationMap) : []),
    [denominationMap],
  );

  const logoUrl = getLogoUrl(productIdData);
  const selectedRecipientAmount = selectedKey || customAmount;
  const selectedLocalAmount = selectedValue || customAmountValue;
  const canContinue =
    Boolean(productIdData) &&
    Boolean(selectedRecipientAmount) &&
    !customAmountError &&
    parseFloat(selectedRecipientAmount) > 0;

  const conciseInstructionBlocks = useMemo(
    () => buildInstructionBlocks(productIdData?.redeemInstruction?.concise),
    [productIdData?.redeemInstruction?.concise],
  );

  const verboseInstructionBlocks = useMemo(
    () => buildInstructionBlocks(productIdData?.redeemInstruction?.verbose),
    [productIdData?.redeemInstruction?.verbose],
  );

  const hasRedeemInstructions =
    conciseInstructionBlocks.length > 0 || verboseInstructionBlocks.length > 0;

  useEffect(() => {
    if (!productId) {
      return;
    }

    const getProductById = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${api_endpoint}/api/giftcards/`, {
          params: {
            productId,
          },
        });

        setProductIdData(response.data?.data || null);
      } catch (error) {
        console.log(error);
        toast.error("Unable to load this gift card. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    getProductById();
  }, [productId]);

  useEffect(() => {
    if (!productIdData || !denominationOptions.length) {
      return;
    }

    const firstAmount = denominationOptions[0];
    setSelectedKey(firstAmount);
    setSelectedValue(
      giftcardDetailsCalculation(
        firstAmount,
        mainCurrency,
        productIdData.recipientCurrencyCode,
      ),
    );
  }, [denominationOptions, mainCurrency, productIdData]);

  useEffect(() => {
    if (!productIdData) {
      return;
    }

    const startedAt = Date.now();
    viewStartRef.current = startedAt;

    return () => {
      const durationSeconds = Math.max(
        Math.round((Date.now() - startedAt) / 1000),
        1,
      );
      sendAnalyticsEvents(
        [
          {
            event_type: "giftcard_view_duration",
            product_id: String(productIdData.productId || ""),
            product_name: productIdData.productName || "Gift card",
            duration_seconds: durationSeconds,
            metadata: {
              recipient_currency: productIdData.recipientCurrencyCode || "",
              country: productIdData.country?.name || "",
            },
          },
        ],
        {
          token: session?.accessToken || null,
          keepalive: true,
        },
      );
    };
  }, [productIdData, session?.accessToken]);

  const handleSelect = (amount) => {
    setCustomAmount("");
    setCustomAmountError("");
    setSelectedKey(amount);
    setSelectedValue(
      giftcardDetailsCalculation(
        amount,
        mainCurrency,
        productIdData.recipientCurrencyCode,
      ),
    );
    trackAnalyticsEvent(
      {
        event_type: "giftcard_amount_selected",
        product_id: String(productIdData.productId || ""),
        product_name: productIdData.productName || "Gift card",
        metadata: {
          selected_amount: amount,
          recipient_currency: productIdData.recipientCurrencyCode || "",
        },
      },
      { token: session?.accessToken || null },
    );
  };

  const handleCustomAmount = (event) => {
    const amount = event.target.value;
    const min = parseFloat(productIdData.minRecipientDenomination);
    const max = parseFloat(productIdData.maxRecipientDenomination);
    const numericAmount = parseFloat(amount);

    setSelectedKey(null);
    setSelectedValue(0);
    setCustomAmount(amount);

    if (!amount || Number.isNaN(numericAmount)) {
      setCustomAmountError("Please enter a valid amount.");
      setCustomAmountValue(0);
      return;
    }

    if (numericAmount > max || numericAmount < min) {
      setCustomAmountError(`The amount must be between ${min} and ${max}.`);
      setCustomAmountValue(0);
      return;
    }

    setCustomAmountError("");
    setCustomAmountValue(
      giftcardDetailsCalculation(
        numericAmount,
        mainCurrency,
        productIdData.recipientCurrencyCode,
      ),
    );
  };

  const buildCartItem = () => ({
    id: productIdData.productId,
    productName: productIdData.productName,
    productId: productIdData.productId,
    quantity: 1,
    recipientAmount: selectedRecipientAmount,
    recipientCurrency: productIdData.recipientCurrencyCode,
    AmountToPay: selectedLocalAmount,
    currencyToPayIn: mainCurrency,
    img: productIdData.logoUrls,
    processing_fee: country.country === "GH" ? productIdData.senderFee : 2,
  });

  const validateSelection = () => {
    if (!canContinue) {
      toast.error("Please select or enter a valid amount.");
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) {
      return;
    }

    addToCart(buildCartItem());
  };

  const handleBuyNow = () => {
    if (!validateSelection()) {
      return;
    }

    trackAnalyticsEvent(
      {
        event_type: "giftcard_buy_now",
        product_id: String(productIdData.productId || ""),
        product_name: productIdData.productName || "Gift card",
        quantity: 1,
        metadata: {
          selected_amount: selectedRecipientAmount,
          recipient_currency: productIdData.recipientCurrencyCode || "",
          amount_to_pay: selectedLocalAmount,
          currency_to_pay_in: mainCurrency,
        },
      },
      { token: session?.accessToken || null },
    );
    addToCart(buildCartItem());
    navigate("/checkout");
  };

  return (
    <div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-white px-5 py-3 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-[#fbf8f4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to gift cards
        </button>
      ) : null}

      {isLoading ? (
        <DetailsSkeleton />
      ) : productIdData ? (
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-[#eadfe7] bg-[#fbf8f4] shadow-sm">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${productIdData.productName} gift card`}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            )}
          </div>

          <div>
            <span className="inline-flex rounded-full bg-[#f7f1e8] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#551839]">
              Digital gift card
            </span>
            <h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.055em] text-[#211722] sm:text-6xl">
              {productIdData.productName} eGift Card
            </h1>
            <p className="mb-0 mt-4 max-w-2xl text-lg leading-8 text-[#665b67]">
              Choose a value, add it to your cart, or continue directly to
              checkout with secure Digishelves payment.
            </p>

            <div className="mt-8">
              {denominationOptions.length > 0 ? (
                <>
                  <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#9a8b97]">
                    Choose amount
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {denominationOptions.map((amount) => {
                      const isSelected = selectedKey === amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleSelect(amount)}
                          className={`rounded-[1.25rem] border p-4 text-left transition ${
                            isSelected
                              ? "border-[#551839] bg-[#551839] text-white shadow-lg shadow-[#551839]/15"
                              : "border-[#eadfe7] bg-[#fbf8f4] text-[#211722] hover:border-[#551839]/30 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`text-2xl font-black tracking-[-0.04em] ${
                              isSelected ? "text-white" : "text-[#211722]"
                            }`}
                          >
                            {amount}
                          </span>
                          <span className="ml-2 text-sm font-black opacity-70">
                            {productIdData.recipientCurrencyCode}
                          </span>
                          <p
                            className={`mb-0 mt-2 text-sm font-bold ${
                              isSelected ? "text-white/70" : "text-[#665b67]"
                            }`}
                          >
                            {giftcardDetailsCalculation(
                              amount,
                              mainCurrency,
                              productIdData.recipientCurrencyCode,
                            )}{" "}
                            {mainCurrency}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div>
                  <label
                    htmlFor="gift-card-amount"
                    className="mb-3 block text-sm font-black uppercase tracking-[0.16em] text-[#9a8b97]"
                  >
                    Enter amount
                  </label>
                  <div className="flex max-w-md overflow-hidden rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] focus-within:border-[#551839] focus-within:ring-4 focus-within:ring-[#551839]/10">
                    <span className="flex items-center border-r border-[#eadfe7] px-4 text-sm font-black text-[#551839]">
                      {productIdData.recipientCurrencyCode}
                    </span>
                    <input
                      id="gift-card-amount"
                      type="number"
                      className="h-14 w-full bg-transparent px-4 text-lg font-black text-[#211722] outline-none"
                      value={customAmount}
                      placeholder={`Min ${productIdData.minRecipientDenomination} - Max ${productIdData.maxRecipientDenomination}`}
                      onChange={handleCustomAmount}
                    />
                  </div>
                  {customAmountError && (
                    <p className="mb-0 mt-2 text-sm font-bold text-red-600">
                      {customAmountError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-[#eadfe7] bg-[#fbf8f4] p-5">
              <p className="mb-1 text-sm font-black uppercase tracking-[0.16em] text-[#9a8b97]">
                You pay
              </p>
              <p className="mb-0 text-3xl font-black tracking-[-0.05em] text-[#211722]">
                {parseFloat(selectedLocalAmount || 0).toFixed(2)} {mainCurrency}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-white px-7 text-base font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-[#fbf8f4]"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#551839] px-7 text-base font-black text-white shadow-lg shadow-[#551839]/15 transition hover:bg-[#44122d]"
              >
                Continue to payment
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {hasRedeemInstructions ? (
            <div className="border-t border-[#eadfe7] pt-8 lg:col-span-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#10ac84]" />
                <h2 className="mb-0 text-2xl font-black tracking-[-0.04em] text-[#211722]">
                  Redeem instructions
                </h2>
              </div>
              <div className="mt-4 max-w-4xl">
                {conciseInstructionBlocks.length > 0 && (
                  <div className="space-y-4">
                    {conciseInstructionBlocks.map((block, index) => (
                      <InstructionBlock
                        key={`concise-${index}`}
                        block={block}
                      />
                    ))}
                  </div>
                )}

                {verboseInstructionBlocks.length > 0 && (
                  <div className="space-y-4 border-t border-[#eadfe7] pt-5">
                    {verboseInstructionBlocks.map((block, index) => (
                      <InstructionBlock
                        key={`verbose-${index}`}
                        block={block}
                      />
                    ))}
                  </div>
                )}

                <TrademarkSubtext />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2">
              <TrademarkSubtext />
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-base font-bold text-[#665b67]">
          This gift card could not be loaded. Please choose another card from
          the catalog.
        </p>
      )}
    </div>
  );
}
