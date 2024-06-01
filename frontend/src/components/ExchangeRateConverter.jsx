import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "./sessionContext";
const ExchangeRateConverter = ({ currency, amount }) => {
  const percentage = localStorage.getItem("percentage");

  const exchangeRate = JSON.parse(localStorage.getItem("exchangeRate"));

  const country_currency_rate = exchangeRate[currency];
  const sellAmountInLocalCurrency =
    parseFloat(amount) * (parseFloat(percentage) / 100);
  const sell_amoun_with_percentage = sellAmountInLocalCurrency + amount;
  const sellAmountUsd = sell_amoun_with_percentage / country_currency_rate;
  console.log(
    exchangeRate[currency],
    sellAmountUsd,
    country_currency_rate,
    percentage,
    sellAmountInLocalCurrency,
    amount
  );

  return sellAmountUsd.toFixed(2);
};

export default ExchangeRateConverter;

// Example usage
// <ExchangeRateConverter country="GHS" amount={500} />
