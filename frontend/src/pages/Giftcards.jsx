import React, { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer/Footer";
import GiftCardBanner from "../components/GiftCardBanner";
import { api_endpoint } from "../components/constant";
import axios from "axios";
import Seo from "../components/Seo";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";
import { Gift, PanelLeft, X } from "lucide-react";
import { buildGiftCardUrl } from "../utils/slugify";
import {
  buildAbsoluteUrl,
  createBreadcrumbSchema,
  createWebPageSchema,
} from "../utils/seo";

import airbnb from "../assets/images/giftcards/airbnb.png";
import amazon from "../assets/images/giftcards/amazon.png";
import apple from "../assets/images/giftcards/apple.jpg";
import google from "../assets/images/giftcards/google.png";
import itunes from "../assets/images/giftcards/itunes.png";
import Netflix from "../assets/images/giftcards/Netflix.webp";
import playstation from "../assets/images/giftcards/playstation.png";
import spotify from "../assets/images/giftcards/spotify.png";
import steam from "../assets/images/giftcards/steam.png";
import uber from "../assets/images/giftcards/uber.png";
import xbox from "../assets/images/giftcards/xbox.jpg";

const GIFTCARD = [
  {
    productId: 1,
    productName: "Airbnb",
    img: airbnb,
  },
  {
    productId: 2,
    productName: "Amazon",
    img: amazon,
  },
  {
    productId: 3,
    productName: "Playstation",
    img: playstation,
  },
  {
    productId: 4,
    productName: "Apple",
    img: apple,
  },
  {
    productId: 5,
    productName: "Xbox",
    img: xbox,
  },
  {
    productId: 6,
    productName: "Itunes",
    img: itunes,
  },
  {
    productId: 7,
    productName: "Netflix",
    img: Netflix,
  },
  {
    productId: 8,
    productName: "Spotify",
    img: spotify,
  },
  {
    productId: 9,
    productName: "Steam",
    img: steam,
  },
  {
    productId: 10,
    productName: "Uber",
    img: uber,
  },
  {
    productId: 11,
    productName: "Google",
    img: google,
  },
];

export default function Giftcards() {
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeBrand, setActiveBrand] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // const HandelSeach = async (country, giftcardname) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get(`${api_endpoint}/api/giftcard-search/`, {
  //       params: {
  //         country: country,
  //         giftcardname: giftcardname,
  //       },
  //     });
  //     if (response.data) {
  //       setFilter(true);
  //       setGiftCards(response.data.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   setIsLoading(false);
  // };

  const getGistCard = async (pageNumber = 1, brandName = "") => {
    setIsLoading(true);

    try {
      const response = await axios.get(`${api_endpoint}/api/giftcards/`, {
        params: {
          page: pageNumber,
          size: 60,
          ...(brandName ? { type: brandName } : {}),
        },
      });

      if (response.data) {
        const payload = response.data.data || {};
        const cards = Array.isArray(payload.content) ? payload.content : [];
        setGiftCards(cards);
        setTotalPages(Number(payload.totalPages || 1));
        setTotalItems(Number(payload.totalElements || cards.length || 0));
      }
    } catch (error) {
      console.log(error);
      setGiftCards([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGiftCard = async (pageNumber = 1, brandName = activeBrand) => {
    await getGistCard(pageNumber, brandName);
  };

  useEffect(() => {
    handleGiftCard(page, activeBrand);
  }, [activeBrand, page]);

  useEffect(() => {
    if (!mobileFilterOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileFilterOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileFilterOpen]);

  const handleBrandSelect = (brandName) => {
    setActiveBrand((currentBrand) => {
      const nextBrand = currentBrand === brandName ? "" : brandName;
      return nextBrand;
    });
    setPage(1);
  };

  const displayCards = giftCards;
  const popularBrands = GIFTCARD.slice(0, 9);
  const closeMobilePopover = () => {
    setMobileFilterOpen(false);
  };
  const toggleMobilePopover = () => {
    setMobileFilterOpen((open) => !open);
  };
  const selectBrandAndClosePanel = (brandName) => {
    handleBrandSelect(brandName);
    closeMobilePopover();
  };
  const renderBrandSidebar = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#551839] text-white">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <p className="mb-0 text-xs font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            Most popular
          </p>
          <h3 className="mb-0 text-xl font-black tracking-[-0.03em] text-[#211722]">
            Gift card brands
          </h3>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => selectBrandAndClosePanel("")}
          className={`flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-3 text-left transition ${
            !activeBrand
              ? "border-[#551839] bg-[#551839] text-white shadow-lg shadow-[#551839]/15"
              : "border-[#eadfe7] bg-white text-[#211722] hover:border-[#551839]/25"
          }`}
        >
          <span>
            <span className="block text-sm font-black">All gift cards</span>
          </span>
          <span
            className={`text-xs font-black uppercase tracking-[0.18em] ${!activeBrand ? "text-white/75" : "text-[#9a8b97]"}`}
          >
            Live
          </span>
        </button>

        {popularBrands.map((item) => {
          const isActive = activeBrand === item.productName;

          return (
            <button
              key={item.productId}
              type="button"
              onClick={() => selectBrandAndClosePanel(item.productName)}
              className={`flex w-full items-center gap-3 rounded-[1.5rem] border px-4 py-3 text-left transition ${
                isActive
                  ? "border-[#551839] bg-white shadow-lg shadow-[#551839]/10"
                  : "border-[#eadfe7] bg-white hover:border-[#551839]/25 hover:shadow-sm"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#f0e7ee] bg-[#f7f1e8]">
                <img
                  src={item.img}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-[#211722]">
                  {item.productName}
                </span>
              </span>
              {isActive ? (
                <span className="rounded-full bg-[#f7f1e8] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#551839]">
                  Active
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
  const giftCardSchema = useMemo(() => {
    const schemaCards = giftCards.slice(0, 24);
    const items = schemaCards.map((item, index) => {
      const minValue = Number(item.minRecipientDenomination || 0);
      const maxValue = Number(item.maxRecipientDenomination || 0);
      const recipientCurrency = item.recipientCurrencyCode || "USD";
      const hasPriceRange = minValue > 0 || maxValue > 0;

      return {
        "@type": "ListItem",
        position: index + 1,
        url: buildAbsoluteUrl(
          buildGiftCardUrl(item, item.productName || "gift-card"),
        ),
        name: item.productName,
        ...(hasPriceRange
          ? {
              item: {
                "@type": "Product",
                name: item.productName,
                offers: {
                  "@type": "AggregateOffer",
                  lowPrice: minValue || maxValue,
                  highPrice: maxValue || minValue,
                  priceCurrency: recipientCurrency,
                  availability: "https://schema.org/InStock",
                },
              },
            }
          : {}),
      };
    });

    return [
      createWebPageSchema({
        title: "Buy Digital Gift Cards",
        description:
          "Browse digital gift cards by brand and country, compare values, and buy online through Digishelves.",
        path: "/gift-cards",
        type: "CollectionPage",
      }),
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Gift Cards", path: "/gift-cards" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Digishelves Gift Card Catalog",
        itemListElement: items,
      },
    ];
  }, [giftCards]);

  return (
    <div>
      <Seo
        title="Buy Digital Gift Cards"
        description="Browse digital gift cards by brand and country, compare values, and buy online through Digishelves."
        keywords={[
          "buy gift cards online",
          "digital gift cards",
          "gift card catalog",
          "Digishelves gift cards",
        ]}
        path="/gift-cards"
        schema={giftCardSchema}
      />
      <GiftCardBanner />

      {mobileFilterOpen ? (
        <div>
          <button
            type="button"
            aria-label="Close brand filter"
            className="fixed inset-0 z-[58] bg-[#211722]/25 backdrop-blur-[1px]"
            onClick={closeMobilePopover}
          />
          <div
            id="giftcard-brand-panel"
            className="fixed inset-x-4 top-[6.5rem] bottom-4 z-[59] overflow-y-auto rounded-[2rem] border border-[#efe7ed] bg-[#fbf8f4] p-5 shadow-[0_28px_90px_rgba(33,23,34,0.22)] lg:inset-x-auto lg:left-1/2 lg:top-32 lg:bottom-auto lg:max-h-[70vh] lg:w-full lg:max-w-xl lg:-translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-label="Browse brands"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-0 text-xs font-black uppercase tracking-[0.22em] text-[#9a8b97]">
                  Filter brands
                </p>
                <h3 className="mb-0 mt-2 text-3xl font-black tracking-[-0.04em] text-[#211722]">
                  Browse brands
                </h3>
              </div>
              <button
                type="button"
                onClick={closeMobilePopover}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadfe7] bg-white text-[#211722] transition hover:border-[#551839]/30 hover:text-[#551839]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderBrandSidebar()}
          </div>
        </div>
      ) : null}

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-[#f7f1e8] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839]">
                Popular brands
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#211722] sm:text-5xl">
                Browse cards people buy most.
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-[#665b67]">
                Pick a brand to see available gift card products and values.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleMobilePopover}
              className="rounded-3xl bg-[#211722] p-5 text-left text-white shadow-xl shadow-[#551839]/15 transition hover:bg-[#341c2d]"
              aria-expanded={mobileFilterOpen}
              aria-controls="giftcard-brand-panel"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10ac84] text-[#13251f]">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <p className="mb-0 text-2xl font-black">
                    {isLoading ? "..." : `${totalItems}+`}
                  </p>
                  <p className="mb-0 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                    Brand categories
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleMobilePopover}
                className="inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-white px-4 py-3 text-sm font-black text-[#211722] shadow-sm transition hover:border-[#551839]/30 hover:text-[#551839] lg:hidden"
                aria-expanded={mobileFilterOpen}
                aria-controls="giftcard-brand-panel"
              >
                <PanelLeft className="h-4 w-4" />
                Brand categories
              </button>
              <span className="rounded-full border border-[#eadfe7] bg-[#fbf8f4] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#551839]">
                {activeBrand ? `${activeBrand} collection` : "All gift cards"}
              </span>
              <span className="text-sm font-bold text-[#665b67]">
                {isLoading
                  ? "Loading catalog..."
                  : `${totalItems} products available`}
              </span>
              {activeBrand ? (
                <button
                  type="button"
                  onClick={() => handleBrandSelect("")}
                  className="rounded-full border border-[#eadfe7] bg-white px-4 py-2 text-sm font-black text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839]"
                >
                  Clear filter
                </button>
              ) : null}
            </div>

            <GiftCardContentDisplau
              GIFTCARD={displayCards}
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              type={activeBrand}
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
