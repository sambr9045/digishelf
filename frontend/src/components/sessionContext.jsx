import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { countries } from "./Countries";
import { get_country_by_api } from "./constant";
import { api_endpoint } from "./constant";
import { json } from "react-router-dom";
import Loader from "./includes/Loader";
import { ToastContainer, toast } from "react-toastify";

const SessionContext = createContext();

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
  const [mainCurrency, setMainCurrency] = useState("");

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
      console.log("save sessiong is runing");
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
          toast.update(loading, {
            render: "Item added to card successfully",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
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
            cartItem.AmountToPay === item.AmountToPay
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
        return updatedCart;
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (session && session.user) {
      const response = await axios.delete(`${api_endpoint}/api/cart/`, {
        params: { id: itemId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (response.data) {
        setCartUpdated(true);
      }
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== itemId);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };
  const updateCartItem = async (itemId, quantity) => {
    if (session && session.accessToken) {
      const response = await axios.put(
        `${api_endpoint}/api/cart/`,
        { quantity: quantity },
        {
          params: { id: itemId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.data) {
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
            : item
        );
        console.log(cart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
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
    console.log("calling this");
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
            response.data.data.join("")
          ).conversion_rates;

          setExchangeRate(JSON.stringify(currency));
          localStorage.setItem("exchangeRate", JSON.stringify(currency));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get country alpha2code by ipaddress
  const getCountryAlpha2Code = async () => {
    try {
      const response = await axios.get(get_country_by_api);
      if (response.data) {
        localStorage.setItem("ip", response.data.ip);
        const result = countries.filter((country) =>
          country.alpha2Code
            .toLowerCase()
            .includes(response.data.country.toLowerCase())
        );

        setCountry({
          country: response.data.country,
          country_code: result[0].callingCode,
        });

        console.log(response.data.country);

        if (response.data.country === "GH") {
          setMainCurrency("GHS");
        } else {
          setMainCurrency("USD");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCountry = async () => {
    const result = await getCountryAlpha2Code();
    console.log(result);
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
      }, 15 * 60 * 1000); // Refresh access token every 15 minutes
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
      {" "}
      {children}{" "}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionProvider };
