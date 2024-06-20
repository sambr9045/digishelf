import React from "react";
import axios from "axios";
import { api_endpoint } from "../constant";

export default function FilterTwo({ setIsLoading, setGiftCards }) {
  const HandelSeach = async (country, giftcardname) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${api_endpoint}/api/giftcard-search/`, {
        params: {
          country: country,
          giftcardname: giftcardname,
        },
      });
      if (response.data) {
        setGiftCards(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  return <div></div>;
}
