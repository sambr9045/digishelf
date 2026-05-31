import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { countries } from "./Countries";
import { get_country_by_api } from "./constant";
import { api_endpoint } from "./constant";
import { json } from "react-router-dom";
import Loader from "./includes/Loader";
import { toast } from "react-toastify";
import {
  buildCartAnalyticsSnapshot,
  trackAnalyticsEvent,
} from "../utils/analytics";
const SessionContext = createContext();
import countryToCurrency from "country-to-currency";

const SESSION_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
  const [country, setCountry] = useState({
    country: null,
    country_code: null,
  });
  const [exchangeRate, setExchangeRate] = useState();
  const [percentage, setPercentage] = useState();
  const [cart, setCart] = useState([]);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [pc, setPc] = useState();
  const [gpc, setGpc] = useState();
  const [yps, setYps] = useState();
  const [mainCurrency, setMainCurrency] = useState("USD");
  // Get cart from database
  const FetchDataBaseCart = async (session) => {
    const response = await axios.get(`${api_endpoint}/api/cart/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    if (response.data) {
      setCart(response.data);
    }
  };

  // Get cart from local storage
  const FetchLocalStorageCart = async () => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    setCart(cart ? cart : []);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      const localSession = JSON.parse(savedSession);
      setSession(localSession);
      FetchDataBaseCart(localSession);
    } else {
      // const savedCart = localStorage.getItem("cart");
      // setCart(savedCart ? JSON.parse(savedCart) : []);
      FetchLocalStorageCart();
    }
  }, []);

  useEffect(() => {
    if (session.user && cartUpdated) {
      FetchDataBaseCart(session);
      setCartUpdated(false); // Reset the flag after updating
    } else if (session.user === null && cartUpdated) {
      FetchLocalStorageCart();
      setCartUpdated(false); // Reset the flag after updating
    }
  }, [cartUpdated, session]);

  const getNextId = (cart) => {
    return cart.length > 0 ? Math.max(cart.map((item) => item.id)) + 1 : 1;
  };

  const trackCartEvent = (eventType, item, itemsSnapshot) => {
    if (!item?.productId && !item?.productName) {
      return;
    }

    trackAnalyticsEvent(
      {
        event_type: eventType,
        product_id: String(item.productId || ""),
        product_name: item.productName || "Gift card",
        quantity: Number(item.quantity || 0),
        ...buildCartAnalyticsSnapshot(itemsSnapshot),
        metadata: {
          recipient_amount: item.recipientAmount || "",
          recipient_currency: item.recipientCurrency || "",
          amount_to_pay: item.AmountToPay || "",
          currency_to_pay_in: item.currencyToPayIn || "",
        },
      },
      { token: session?.accessToken || null },
    );
  };

  const addToCart = async (item) => {
    if (session.user) {
      const loading = toast.loading("Adding to cart");

      try {
        // make api request to the backend
        const response = await axios.post(`${api_endpoint}/api/cart/`, item, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (response.data) {
          const trackedCart = [...(Array.isArray(cart) ? cart : []), item];
          toast.update(loading, {
            render: "Item added to card successfully",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          trackCartEvent("giftcard_add_to_cart", item, trackedCart);
          setCartUpdated(true);
        }
      } catch (error) {
        toast.update(loading, {
          render: "Item already exist !",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } else {
      setCart((prevCart) => {
        if (!Array.isArray(prevCart)) {
          return prevCart;
        }
        const existingItem = prevCart.find(
          (cartItem) =>
            cartItem.productId === item.productId &&
            cartItem.AmountToPay === item.AmountToPay,
        );

        if (item.recipientAmount === 0 || item.recipientAmount === "") {
          toast.error("Invalide Amount !!!");
          return;
        }

        if (existingItem) {
          toast.error("Item already in cart!!");
          return prevCart;
        }

        const newItem = {
          ...item,
          id: getNextId(prevCart),
        };

        const updatedCart = [...prevCart, newItem];
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Item added to cart successfully !");
        trackCartEvent("giftcard_add_to_cart", newItem, updatedCart);
        return updatedCart;
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (session && session.user) {
      const removedItem = cart.find((item) => item.id === itemId);
      const updatedCart = cart.filter((item) => item.id !== itemId);
      const response = await axios.delete(`${api_endpoint}/api/cart/`, {
        params: { id: itemId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (response.data) {
        if (removedItem) {
          trackCartEvent("cart_item_removed", removedItem, updatedCart);
        }
        setCartUpdated(true);
      }
    } else {
      setCart((prevCart) => {
        const removedItem = prevCart.find((item) => item.id === itemId);
        const updatedCart = prevCart.filter((item) => item.id !== itemId);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        if (removedItem) {
          trackCartEvent("cart_item_removed", removedItem, updatedCart);
        }
        return updatedCart;
      });
    }
  };
  const updateCartItem = async (itemId, quantity) => {
    if (session && session.accessToken) {
      const updatedCart = cart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: quantity,
            }
          : item,
      );
      const updatedItem = updatedCart.find((item) => item.id === itemId);
      const response = await axios.put(
        `${api_endpoint}/api/cart/`,
        { quantity: quantity },
        {
          params: { id: itemId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (response.data) {
        if (updatedItem) {
          trackCartEvent("cart_quantity_updated", updatedItem, updatedCart);
        }
        setCartUpdated(true);
      }
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: quantity,
              }
            : item,
        );
        console.log(cart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        const updatedItem = updatedCart.find((item) => item.id === itemId);
        if (updatedItem) {
          trackCartEvent("cart_quantity_updated", updatedItem, updatedCart);
        }
        return updatedCart;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // call and sace exchange rate
  const getExchangeRate = async () => {
    try {
      const exchangeRate = JSON.parse(localStorage.getItem("exchangeRate"));
      const percentage = localStorage.getItem("percentage");
      const pc = localStorage.getItem("pc");
      const gpc = localStorage.getItem("gpc");

      if (gpc) {
        setGpc(gpc);
      }
      if (pc) {
        setPc(pc);
      }
      if (percentage) {
        setPercentage(exchangeRate);
      }
      if (exchangeRate) {
        setExchangeRate(exchangeRate);
      } else {
        const response = await axios.get(`${api_endpoint}/api/exchange-rate/`);
        if (response.data) {
          setPercentage(response.data.percentage);
          setPc(response.data.processing);
          setGpc(response.data.giftcard_processing_fee);
          localStorage.setItem("percentage", response.data.percentage);
          localStorage.setItem("pc", response.data.processing);
          localStorage.setItem("gpc", response.data.giftcard_processing_fee);
          const currency = JSON.parse(
            response.data.data.join(""),
          ).conversion_rates;

          setExchangeRate(JSON.stringify(currency));
          localStorage.setItem("exchangeRate", JSON.stringify(currency));
        }
      }
    } catch (error) {
      console.error("Failed to load exchange rate:", error);
    }
  };

  // get country alpha2code by ipaddress
  const getCountryAlpha2Code = async () => {
    try {
      const response = await axios.get(get_country_by_api);
      if (response.data) {
        const detectedCountry =
          response.data.country_code || response.data.country || "US";
        const detectedCallingCode =
          response.data.country_calling_code?.replace(/\+/g, "") || "1";

        localStorage.setItem("ip", response.data.ip);

        setCountry({
          country: detectedCountry.toUpperCase(),
          country_code: detectedCallingCode,
        });

        setMainCurrency("USD");
      }
    } catch (error) {
      console.error("Failed to detect visitor country:", error);
      setCountry({
        country: "US",
        country_code: "1",
      });
      setMainCurrency("USD");
    }
  };

  const handleCountry = async () => {
    await getCountryAlpha2Code();
  };

  // Set up an interval to refresh the access token
  useEffect(() => {
    if (!exchangeRate) {
      getExchangeRate();
    }
    if (country.country === null) {
      handleCountry();
    }
    if (session.accessToken) {
      const interval = setInterval(() => {
        refreshAccessToken();
      }, SESSION_REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [session.accessToken, country]);

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("/api/auth/refresh/", {
        refresh: session.refreshToken,
      });
      const newAccessToken = response.data.access;
      const updatedSession = {
        ...session,
        accessToken: newAccessToken,
      };
      setSession(updatedSession);
      localStorage.setItem("session", JSON.stringify(updatedSession));
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const newSession = {
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };
      setSession(newSession);
      localStorage.setItem("session", JSON.stringify(newSession));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("session");
    setSession({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    setCartUpdated(true);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        login,
        logout,
        country,
        percentage,
        pc,
        exchangeRate,
        addToCart,
        removeFromCart,
        updateCartItem,
        mainCurrency,
        clearCart,
        cart,
        setCartUpdated,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionProvider };
