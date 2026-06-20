import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api_endpoint } from "../components/constant";
import GiftCardBanner from "../components/GiftCardBanner";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { GIFT_CARD_CATALOG_PATH } from "../config/giftCardProviderPolicy";
import { buildGiftCardUrl } from "../utils/slugify";
import {
  buildAbsoluteUrl,
  createBreadcrumbSchema,
  createWebPageSchema,
} from "../utils/seo";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Search() {
  const query = useQuery();
  const navigate = useNavigate();
  const searchName = query.get("name") || "";
  const searchCountry = query.get("country") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [giftCards, setGiftCards] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const HandelSeach = async (
    country,
    giftcardname,
    page,
    isPagination = false,
  ) => {
    if (!isPagination) {
      setIsLoading(true);
    }

    try {
      const response = await axios.get(`${api_endpoint}/api/giftcard-search/`, {
        params: {
          country: country,
          name: giftcardname,
          page: page,
        },
      });

      if (response.data) {
        const nextItems = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setGiftCards((prevGiftCards) =>
          page === 1 ? nextItems : [...prevGiftCards, ...nextItems],
        );
        setHasMore(nextItems.length > 0);
      }
    } catch (error) {
      console.log(error);
      if (page === 1) {
        setGiftCards([]);
      }
      setHasMore(false);
    } finally {
      setPaginationLoading(false);
      setIsLoading(false);
    }
  };

  const CallHandlSeach = async () => {
    await HandelSeach(searchCountry, searchName, page, page > 1);
  };

  useEffect(() => {
    setGiftCards([]);
    setHasMore(true);
    setPaginationLoading(false);
    setPage(1);
  }, [searchCountry, searchName]);

  useEffect(() => {
    if (page > 1) {
      setPaginationLoading(true);
    }

    CallHandlSeach();
  }, [page, searchCountry, searchName]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 4;

      if (!nearBottom || isLoading || paginationLoading || !hasMore) {
        return;
      }

      setPage((prevPage) => prevPage + 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, paginationLoading, hasMore]);
  const searchPath = `/giftcard/search?country=${encodeURIComponent(searchCountry)}&name=${encodeURIComponent(searchName)}`;
  const catalogUrl = buildAbsoluteUrl(GIFT_CARD_CATALOG_PATH);
  const schema = useMemo(() => {
    const items = giftCards.slice(0, 24).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: catalogUrl,
      name: item.productName,
    }));

    return [
      createWebPageSchema({
        title: "Gift Card Search Results",
        description: `Search results for ${searchName || "gift cards"}${searchCountry ? ` in ${searchCountry}` : ""} on Digishelves.`,
        path: searchPath,
        type: "SearchResultsPage",
      }),
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Gift Cards", path: GIFT_CARD_CATALOG_PATH },
        { name: "Search", path: searchPath },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Gift card search results",
        itemListElement: items,
      },
    ];
  }, [catalogUrl, giftCards, searchCountry, searchName, searchPath]);

  const handleProductSelect = (item) => {
    if (!item?.productId) {
      return;
    }

    const productUrl = buildGiftCardUrl(item, item.productName);
    navigate(productUrl);
  };

  return (
    <div>
      <Seo
        title={
          searchName ? `${searchName} Gift Card Search` : "Gift Card Search"
        }
        description={`Search results for ${searchName || "gift cards"}${searchCountry ? ` in ${searchCountry}` : ""} on Digishelves.`}
        keywords={[
          `${searchName || "gift card"} search`,
          searchCountry,
          "digital gift cards",
          "Digishelves",
        ].filter(Boolean)}
        path={searchPath}
        schema={schema}
      />
      <GiftCardBanner Search={HandelSeach} />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GiftCardContentDisplau
            GIFTCARD={giftCards}
            isLoading={paginationLoading ? false : isLoading}
            type={"search"}
            paginationLoading={paginationLoading}
            onProductSelect={handleProductSelect}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
