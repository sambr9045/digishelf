import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";
import axios from "axios";
import { api_endpoint } from "../components/constant";
import { buildGiftCardUrl, slugify } from "../utils/slugify";
import {
  buildAbsoluteUrl,
  createBreadcrumbSchema,
  createWebPageSchema,
} from "../utils/seo";

const CATEGORY_GIFT_CARD_CACHE_KEY = "giftcardsByCategory";

export default function GiftcardType() {
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const type = useParams();

  const getStoredGiftCards = () => {
    try {
      const storedGiftCards = JSON.parse(
        localStorage.getItem(CATEGORY_GIFT_CARD_CACHE_KEY) || "{}"
      );

      return Array.isArray(storedGiftCards) ? {} : storedGiftCards;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const getGiftCardData = async () => {
    const response = await axios.get(`${api_endpoint}/api/giftcards/`, {
      params: {
        type: type.type,
      },
    });

    return response.data?.data?.content || [];
  };

  const handleGiftCardData = async () => {
    setIsLoading(true);

    try {
      const storedGiftCards = getStoredGiftCards();
      const cachedCards = storedGiftCards[type.type];

      if (Array.isArray(cachedCards) && cachedCards.length > 0) {
        setGiftCards(cachedCards);
        return;
      }

      const fetchedGiftCards = await getGiftCardData();
      setGiftCards(fetchedGiftCards);

      localStorage.setItem(
        CATEGORY_GIFT_CARD_CACHE_KEY,
        JSON.stringify({
          ...storedGiftCards,
          [type.type]: fetchedGiftCards,
        })
      );
    } catch (error) {
      console.log(error);
      setGiftCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGiftCardData();
  }, [type.type]);

  const pagePath = `/gift-card/${slugify(type.type || "")}`;
  const schema = useMemo(() => {
    const items = giftCards.slice(0, 24).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildAbsoluteUrl(buildGiftCardUrl(item, type.type)),
      name: item.productName,
    }));

    return [
      createWebPageSchema({
        title: `${type.type} Gift Cards`,
        description: `Browse ${type.type} gift card products and values on Digishelves.`,
        path: pagePath,
        type: "CollectionPage",
      }),
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Gift Cards", path: "/gift-cards" },
        { name: type.type || "Category", path: pagePath },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${type.type} gift card products`,
        itemListElement: items,
      },
    ];
  }, [giftCards, pagePath, type.type]);

  return (
    <>
      <Seo
        title={`${type.type} Gift Cards`}
        description={`Browse ${type.type} gift card products and values on Digishelves.`}
        keywords={[
          `${type.type} gift cards`,
          `buy ${type.type} gift cards`,
          "digital gift cards",
          "Digishelves",
        ]}
        path={pagePath}
        schema={schema}
      />
      <GiftCardBanner type={type.type} />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GiftCardContentDisplau
            GIFTCARD={giftCards}
            isLoading={isLoading}
            type={type.type}
          />
        </div>
      </section>
      <Footer />
    </>
  );
}
