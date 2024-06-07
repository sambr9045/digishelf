import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { countries } from "./Countries";
import { get_country_by_api } from "./constant";
import { api_endpoint } from "./constant";
import { json } from "react-router-dom";
import Loader from "./includes/Loader";

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
  const [pc, setPc] = useState();
  const [gpc, setGpc] = useState();
  const [yps, setYps] = useState();

  // Load session from localStorage when the app starts
  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
  }, []);

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
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        login,
        logout,
        country,
        percentage,
        pc,
        exchangeRate,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionProvider };
