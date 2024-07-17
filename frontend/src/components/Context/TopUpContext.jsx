import React, { createContext, useState, useEffect, useContext } from "react";
import { SessionContext } from "../sessionContext";
import axios from "axios";
import { countries } from "../Countries";
import { get_country_by_api } from "../constant";
import { api_endpoint } from "../constant";

const TopUpContext = createContext();

const TopUpProvider = ({ children }) => {
  const [index, setIndex] = useState(0);
  const { country } = useContext(SessionContext);
  const [number, setNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [steps, setSteps] = useState(1);
  const [oparatorData, setOpararatorData] = useState([]);
  const [editNumber, setEditNumber] = useState();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("mostPopular");
  const [selectedOptinData, setSelectedOptionData] = useState("");
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("cdc");
  const [EmailAddress, setEmailAddress] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [paystackConfig, setPaystackConfig] = useState([]);
  const [operatoCountryData, setOperatorCountryData] = useState();
  const [suggestedAmountsMap, setSuggestedAmountsMap] = useState([]);
  const [fx_rate, setFx_rate] = useState();
  const [autoDetected, setAutoDetected] = useState(true);

  const [selectedValue, setSelectedValue] = useState({ country });

  // configuring object for paystack initialization

  const handleOptionClick = (option) => {
    setSelectedOption(option.name);
    setSelectedOptionData(option);
  };

  // const handleCustomAmountChange = (e) => {
  //   const value = e.target.value;
  //   if (value === "" || (Number(value) >= 1 && Number(value) <= 500)) {
  //     setCustomAmount(value);
  //   }
  // };

  const handleEnterCustomAmountClick = () => {
    setShowCustomInput(true);
  };

  const handleChange = (newValue) => {
    setSelectedValue(newValue);
  };
  const handlePaymentChange = (event) => {
    console.log(event.target.value);
    setPaymentMethodSelect(event.target.value);
  };
  const handleSubmitStepTwo = async (e) => {
    e.preventDefault();
    if (!validateEmail(EmailAddress) || EmailAddress === "") {
      setEmailError("Invalide email address");
    } else {
      setEmailError("");
      if (selectedOption === "mostPopular") {
        setSelectedOptionData({
          name: "mostPopular",
          amount: oparatorData.data.mostPopularAmount,
          currency: oparatorData.data.fx.currencyCode,
        });
      }

      setSteps(3);
    }
    // first validate email address
    // get amount selected
    // set steps
  };

  useEffect(() => {
    setPaymentMethodSelect("cbc");
  }, []);

  return (
    <TopUpContext.Provider
      value={{
        country,
        number,
        setNumber,
        phoneError,
        setPhoneError,
        steps,
        setSteps,
        oparatorData,
        setOpararatorData,
        editNumber,
        setEditNumber,
        showCustomInput,
        setShowCustomInput,
        customAmount,
        setCustomAmount,
        isLoading,
        setisLoading,
        selectedOptinData,
        setSelectedOption,
        paymentMethodSelect,
        setPaymentMethodSelect,
        EmailError,
        setEmailError,
        EmailAddress,
        setEmailAddress,
        paystackConfig,
        setPaystackConfig,
        operatoCountryData,
        setOperatorCountryData,
        suggestedAmountsMap,
        setSuggestedAmountsMap,
        selectedValue,
        setSelectedValue,
        fx_rate,
        setFx_rate,
        setSelectedOptionData,
        setAutoDetected,
        autoDetected,
      }}
    >
      {children}
    </TopUpContext.Provider>
  );
};

export { TopUpProvider, TopUpContext };
