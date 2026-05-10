import React, { createContext, useState, useEffect, useContext } from "react";
import { SessionContext } from "../sessionContext";
import axios from "axios";
import { countries } from "../Countries";
import { get_country_by_api } from "../constant";
import { api_endpoint } from "../constant";

const TopUpContext = createContext();

const TopUpProvider = ({ children, initialData = {} }) => {
  const [index, setIndex] = useState(0);
  const { country } = useContext(SessionContext);
  const [number, setNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [steps, setSteps] = useState(initialData.steps ?? 1);
  const [oparatorData, setOpararatorData] = useState(
    initialData.oparatorData ?? [],
  );
  const [editNumber, setEditNumber] = useState(initialData.editNumber);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("mostPopular");
  const [selectedOptinData, setSelectedOptionData] = useState("");
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("crypto");
  const [EmailAddress, setEmailAddress] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [operatoCountryData, setOperatorCountryData] = useState(
    initialData.operatorCountryData,
  );
  const [suggestedAmountsMap, setSuggestedAmountsMap] = useState(
    initialData.suggestedAmountsMap ?? [],
  );
  const [fx_rate, setFx_rate] = useState(initialData.fx_rate);
  const [autoDetected, setAutoDetected] = useState(
    initialData.autoDetected ?? true,
  );

  const [selectedValue, setSelectedValue] = useState({ country });

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
    setPaymentMethodSelect("crypto");
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
