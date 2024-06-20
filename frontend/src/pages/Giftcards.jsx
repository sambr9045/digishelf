import React, { useState, useEffect, useContext } from "react";
import Footer from "../components/Footer/Footer";
import GiftCardBanner from "../components/GiftCardBanner";
import { api_endpoint } from "../components/constant";
import axios from "axios";
import { SessionContext } from "../components/sessionContext";
import Filter from "../components/includes/Filter";
import GiftCardContentDisplau from "../components/includes/GiftCardContentDisplau";

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
  const { country } = useContext(SessionContext);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(false);

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

  const getGistCard = async () => {
    const response = await axios.get(`${api_endpoint}/api/giftcards/`);
    if (response.data) {
      setGiftCards(response.data.data.content);
      setIsLoading(false);
      if (response.data.data) {
        localStorage.setItem(
          "giftcards",
          JSON.stringify(response.data.data.content)
        );
      }
    }
  };

  const handleGiftCard = async () => {
    const giftcard = localStorage.getItem("giftcards");
    setIsLoading(false);
    if (giftcard && filter === false) {
      setGiftCards(JSON.parse(giftcard));
    } else {
      const result = await getGistCard();
    }

    console.log(giftCards);
  };

  useEffect(() => {
    handleGiftCard();
  }, []);

  return (
    <div>
      <GiftCardBanner />

      <section className="flight__onewaysection pb__60">
        <div className="container">
          <div className="cars__gridwrapper">
            <div className="row g-4 justify-content-center">
              <Filter country={country} />
              <GiftCardContentDisplau
                GIFTCARD={GIFTCARD}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
