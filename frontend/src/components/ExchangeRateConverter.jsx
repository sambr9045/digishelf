import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "./sessionContext";
const ExchangeRateConverter = ({
  receiverCurrencyCode,
  senderCountry,
  Amount,
  fx_rate,
}) => {
  const percentage = localStorage.getItem("percentage");
  const amountToPayInSenderCurrency = fx_rate * Amount;

  console.log(receiverCurrencyCode, senderCountry, Amount, fx_rate);

  if (senderCountry === "GH") {
    if (receiverCurrencyCode === "GHS") {
      // pass
      return [amountToPayInSenderCurrency.toFixed(2), " GHS"];
    } else {
      return [
        amountToPayInSenderCurrency.toFixed(2),
        ` ${receiverCurrencyCode}`,
      ];
    }
  } else {
    return amountToPayInSenderCurrency;
  }

  // const exchangeRate = JSON.parse(localStorage.getItem("exchangeRate"));
  //   const exchangeRate = fx_rate * amount;
  //   console.log(exchangeRate, "next exchange");

  //   const country_currency_rate = exchangeRate[currency];
  //   console.log(country_currency_rate, "this is the current rate");
  //   const sellAmountInLocalCurrency =
  //     parseFloat(amount) * (parseFloat(percentage) / 100);
  //   const sell_amoun_with_percentage = sellAmountInLocalCurrency + amount;
  //   const sellAmountUsd = sell_amoun_with_percentage / country_currency_rate;
  //   console.log(
  //     exchangeRate[currency],
  //     sellAmountUsd,
  //     country_currency_rate,
  //     percentage,
  //     sellAmountInLocalCurrency,
  //     amount
  //   );

  //   return exchangeRate.toFixed(2);
};

export default ExchangeRateConverter;

// Example usage
// <ExchangeRateConverter country="GHS" amount={500} />
