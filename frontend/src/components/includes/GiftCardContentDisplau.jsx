import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import empty_search from "../../assets/images/empty_search.svg";
import { buildGiftCardUrl } from "../../utils/slugify";

const skeletonCards = Array.from({ length: 12 });

function GiftCardSkeletonGrid({ compact = false }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Loading gift cards"
      aria-live="polite"
    >
      {skeletonCards.slice(0, compact ? 4 : 12).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-md border border-[#efe7ed] bg-white shadow-sm"
        >
          <div className="relative h-36 animate-pulse bg-[#f4eee8]">
            <div className="absolute right-0 top-0 h-11 w-14 rounded-bl-md bg-[#ede6ef]" />
          </div>
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="w-full">
              <div className="h-3 w-24 animate-pulse rounded-full bg-[#eadfe7]" />
              <div className="mt-3 h-5 w-3/5 animate-pulse rounded-full bg-[#eadfe7]" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-[#eadfe7]" />
            </div>
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-[#f0e7df]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GiftCardContentDisplau({
  GIFTCARD,
  isLoading,
  type = "",
  pageSize = 0,
  currentPage,
  totalPages: totalPagesProp,
  onPageChange,
}) {
  const [page, setPage] = useState(1);
  const cards = Array.isArray(GIFTCARD) ? GIFTCARD : [];
  const isRemotePagination =
    typeof onPageChange === "function" && Number(totalPagesProp || 0) > 1;
  const activePage = isRemotePagination ? Number(currentPage || 1) : page;
  const totalPages = isRemotePagination
    ? Number(totalPagesProp || 1)
    : pageSize > 0
      ? Math.ceil(cards.length / pageSize)
      : 1;
  const displayedCards =
    isRemotePagination || pageSize <= 0
      ? cards
      : cards.slice((activePage - 1) * pageSize, activePage * pageSize);

  const goToPage = (p) => {
    if (isRemotePagination) {
      onPageChange(p);
    } else {
      setPage(p);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items = [1];
    const start = Math.max(activePage - 1, 2);
    const end = Math.min(activePage + 1, totalPages - 1);

    if (start > 2) {
      items.push("left-ellipsis");
    }

    for (let value = start; value <= end; value += 1) {
      items.push(value);
    }

    if (end < totalPages - 1) {
      items.push("right-ellipsis");
    }

    items.push(totalPages);
    return items;
  };

  const getProductLink = (item) => {
    if (item?.productId) {
      return buildGiftCardUrl(item, type || item.productName);
    }

    if (!type) {
      return `/gift-card/${encodeURIComponent(item.productName)}`;
    }

    return buildGiftCardUrl(item, type);
  };

  const getPriceLabel = (item) => {
    const minValue = Number(item?.minRecipientDenomination || 0);
    const maxValue = Number(item?.maxRecipientDenomination || 0);
    const currency = item?.recipientCurrencyCode || "";

    if (minValue > 0 && maxValue > 0 && minValue !== maxValue) {
      return `${minValue} - ${maxValue} ${currency}`.trim();
    }

    if (minValue > 0 || maxValue > 0) {
      return `${minValue || maxValue} ${currency}`.trim();
    }

    const fixedMap = item?.fixedRecipientToSenderDenominationsMap;
    if (fixedMap && typeof fixedMap === "object") {
      const keys = Object.keys(fixedMap)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
      if (keys.length > 0) {
        const lowest = Math.min(...keys);
        const highest = Math.max(...keys);

        if (lowest !== highest) {
          return `${lowest} - ${highest} ${currency}`.trim();
        }

        return `${lowest} ${currency}`.trim();
      }
    }

    return "";
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <GiftCardSkeletonGrid />
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {displayedCards.map((item) => {
                  const image = item.logoUrls?.[0] || item.img;

                  return (
                    <Link
                      key={`${item.productId}-${item.productName}`}
                      to={getProductLink(item)}
                      className="group overflow-hidden rounded-md border border-[#efe7ed] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#551839]/10"
                    >
                      <div className="relative h-36 overflow-hidden bg-[#fbf8f4]">
                        {image && (
                          <img
                            src={image}
                            alt={item.productName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        )}
                        {item.country?.flagUrl && (
                          <span className="absolute right-0 top-0 flex h-11 w-14 items-center justify-center overflow-hidden rounded-bl-md border-l border-b border-black/5 bg-white shadow-sm">
                            <img
                              src={item.country.flagUrl}
                              alt={`${item.country.name || "country"} flag`}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5">
                        <div>
                          <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-[#9a8b97]">
                            Gift card
                          </p>
                          <h3 className="mb-0 text-lg font-black tracking-[-0.03em] text-[#211722]">
                            {item.productName}
                          </h3>
                          {getPriceLabel(item) ? (
                            <p className="mb-0 mt-2 text-sm font-bold text-[#665b67]">
                              From {getPriceLabel(item)}
                            </p>
                          ) : null}
                        </div>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#f7f1e8] text-[#551839] transition group-hover:bg-[#551839] group-hover:text-white">
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(Math.max(activePage - 1, 1))}
                    disabled={activePage === 1}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfe7] bg-white text-[#551839] shadow-sm transition hover:border-[#551839]/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getPaginationItems().map((p) =>
                    typeof p === "number" ? (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition ${
                          p === activePage
                            ? "bg-[#551839] text-white shadow-lg shadow-[#551839]/20"
                            : "border border-[#eadfe7] bg-white text-[#665b67] hover:border-[#551839]/30 hover:text-[#551839]"
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span
                        key={p}
                        className="flex h-11 w-8 items-center justify-center text-sm font-black text-[#9a8b97]"
                      >
                        ...
                      </span>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(Math.min(activePage + 1, totalPages))
                    }
                    disabled={activePage === totalPages}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfe7] bg-white text-[#551839] shadow-sm transition hover:border-[#551839]/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto my-12 max-w-md rounded-md border border-[#efe7ed] bg-[#fbf8f4] p-8 text-center">
              <img
                src={empty_search}
                alt="empty search"
                className="mx-auto w-56"
              />
              <h5 className="mt-6 text-xl font-black text-[#211722]">
                No results found
              </h5>
              <p className="mb-0 mt-2 text-[#665b67]">
                Try another country or gift card brand.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
