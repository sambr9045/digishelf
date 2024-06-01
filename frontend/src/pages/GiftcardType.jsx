import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Filter from "../components/includes/Filter";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";
import { SessionContext } from "../components/sessionContext";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";
import axios from "axios";
import { api_endpoint } from "../components/constant";
export default function GiftcardType() {
  const [giftCards, setGiftCards] = useState([]);
  const { country } = useContext(SessionContext);
  const [isLoading, setIsLoading] = useState(true);

  const type = useParams();
  // creat funtion to featch by type
  const getGiftCardData = async () => {
    try {
      const response = await axios.get(`${api_endpoint}/api/giftcards/`, {
        params: {
          type: type.type,
        },
      });
      if (response.data) {
        console.log(response.data.data);
        setIsLoading(false);
        setGiftCards(response.data.data.content);
        return response.data.data.content;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGiftCardData = async () => {
    const GiftCardData = localStorage.getItem("giftcards");
    console.log(JSON.parse(GiftCardData)[type.type]);
    if (GiftCardData && JSON.parse(GiftCardData)[type.type]) {
      setGiftCards(JSON.parse(GiftCardData)[type.type]);
      setIsLoading(false);
    } else {
      const GiftCardData = await getGiftCardData();
      setGiftCards(GiftCardData);
      let existingObject = localStorage.getItem("giftcards");
      existingObject = existingObject ? JSON.parse(existingObject) : {};
      existingObject[type.type] = GiftCardData;
      const updatedObjectStr = JSON.stringify(existingObject);
      localStorage.setItem("giftcards", updatedObjectStr);
    }
  };

  useEffect(() => {
    handleGiftCardData();
  }, []);

  return (
    <>
      <GiftCardBanner type={type.type} />

      <section className="flight__onewaysection pb__60">
        <div className="container">
          <div className="cars__gridwrapper">
            <div className="row g-4 justify-content-center">
              <Filter country={country} />
              <GiftCardContentDisplau
                GIFTCARD={giftCards}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
