import axios from "axios";
import { api_endpoint } from "../constant";

const HandelSeach = async (setIsLoading, setGiftCards) => {
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

export default HandelSeach;
