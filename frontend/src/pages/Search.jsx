import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { api_endpoint } from "../components/constant";
import GiftCardBanner from "../components/GiftCardBanner";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";
import Footer from "../components/Footer/Footer";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Search() {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(true);
  const [giftCards, setGiftCards] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const HandelSeach = async (
    country,
    giftcardname,
    page,
    paginationLoading = false
  ) => {
    if (paginationLoading === false) {
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
        setGiftCards((prevGiftCards) => [
          ...prevGiftCards,
          ...response.data.data,
        ]);
        setPaginationLoading(false);
        if (response.data.data.length === 0) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const CallHandlSeach = async () => {
    await HandelSeach(query.get("country"), query.get("name"), page);
  };

  useEffect(() => {
    CallHandlSeach();
  }, [page]);

  useEffect(() => {
    console.log(page);
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isLoading ||
        !hasMore
      ) {
        return;
      }
      setPaginationLoading(true);
      setPage((prevPage) => prevPage + 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);

  return (
    <div>
      <GiftCardBanner Search={HandelSeach} />

      <section className="flight__onewaysection pb__60">
        <div className="container">
          <div className="cars__gridwrapper">
            <div className="row g-4 justify-content-center pb__60">
              <GiftCardContentDisplau
                GIFTCARD={giftCards}
                isLoading={paginationLoading ? false : isLoading}
                type={"search"}
                paginationLoading={paginationLoading}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
