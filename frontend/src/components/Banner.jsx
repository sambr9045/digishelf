import React, { useState, useEffect, useContext, useRef } from "react";
import Header from "./Header/Header";
import rechargeoffer from "../assets/images/banner/rechargeoffer.jpg";
import { SessionContext } from "./sessionContext";
import { api_endpoint } from "./constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Carousel from "react-bootstrap/Carousel";
import axios from "axios";
import ExchangeRateConverter from "./ExchangeRateConverter";
import visa from "../assets/images/payment/visa.png";
import mastercard from "../assets/images/payment/mastercard.png";
import bitcoin from "../assets/images/payment/bitcoin.png";
import coins from "../assets/images/payment/coins.png";
import ae from "../assets/images/payment/ae.png";
import discover from "../assets/images/payment/discover.png";
import confirm from "../assets/images/payment/confirm.svg";
import { usePaystackPayment } from "react-paystack";
import { configPaystack, exchangeRateConverter } from "./includes/Functions";
import { PaystackConsumer } from "react-paystack";

// import VirtualizedSelect from "react-virtualized-select";

// import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

const config = {
  reference: new Date().getTime().toString(),
  email: "user@example.com",
  amount: 20000, //Amount is in USD
  publicKey: "pk_test_2d258100e34a102a5137cdb2fae8f2e878f45b2d",
};

// you can call this function anything
const handleSuccess = (reference) => {
  // Implementation for whatever you want to do with reference and after success call.
  console.log(reference);
};

// you can call this function anything
const handleClose = () => {
  // implementation for  whatever you want to do when the Paystack dialog closed.
  console.log("closed");
};

export default function Banner() {
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
  const [selectedOptinData, setSelectedOptionData] = useState([]);
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("cdc");
  const [EmailAddress, setEmailAddress] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [paystackConfig, setPaystackConfig] = useState([]);

  const amount_2 = 27;
  const amount_3 = 54;

  const [selectedValue, setSelectedValue] = useState({ country }); // Track selected value
  // const country_image = ;

  const config = {
    reference: new Date().getTime().toString(),
    email: "shamsubr@gmail.com",
    amount: 20000, //Amount is in USD
    currency: "GHS",
    publicKey: "pk_test_2d258100e34a102a5137cdb2fae8f2e878f45b2d",
  };
  const initializePayment = usePaystackPayment(config);

  // handle payment

  // const componentProps = {
  //   ...config,
  //   text: "Paystack Button Implementation",
  //   onSuccess: (reference) => handleSuccess(reference),
  //   onClose: handleClose,
  // };

  const HandlePayment = async () => {
    const amount_in_usd = exchangeRateConverter(
      selectedOptinData.currency,
      selectedOptinData.amount
    );

    const config = {
      reference: new Date().getTime().toString(),
      email: "shamsubr@gmail.com",
      amount: 20000, //Amount is in GHS
      currency: "GHS",
      publicKey: "pk_test_2d258100e34a102a5137cdb2fae8f2e878f45b2d",
    };

    setPaystackConfig(config);
    initializePayment(handleSuccess, handleClose);
    // const amount_in_usd = exchangeRateConverter(
    //   selectedOptinData.currency,
    //   selectedOptinData.amount
    // );

    // const config = configPaystack(
    //   EmailAddress,
    //   amount_in_usd,
    //   "pk_test_2d258100e34a102a5137cdb2fae8f2e878f45b2d"
    // );

    // console.log(config);
    //   const componentProps = {
    //     ...config,
    //     text: 'Paystack Button Implementation',
    //     onSuccess: (reference) => handleSuccess(reference),
    //     onClose: handleClose
    // };
    // setPaystackConfig(config);

    // const initializePayment = usePaystackPayment(config);

    // const data = {
    //   number: editNumber,
    //   email: EmailAddress,
    //   option_data: selectedOptinData,
    //   payment_method: paymentMethodSelect,
    //   country: country,
    //   provider: oparatorData.data.name,
    // };
    // const response = await axios.post(`${api_endpoint}/api/makepayment/`, data);
    // if (response.data) {
    //   console.log(response.data);
    // }
    //  make request to backend with data
    // backend make request to paystack
  };

  // validate email ;
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailAddress = (e) => {
    const email = e.target.value;
    setEmailAddress(email.trim());
    setEmailError("");
  };

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option.name);
    setSelectedOptionData(option);
  };

  const HandleEditbutton = async () => {
    setSteps(1);
    setShowCustomInput(false);
  };
  const getOparator = async (number) => {
    setisLoading(true);
    if (number === "") {
      setPhoneError("Please enter a valid number");
      setisLoading(false);
      toast.error("Please enter a valid number");
    } else {
      let edit_number = 0;
      if (number.startsWith("0")) {
        edit_number = number.substring(1);
      } else {
        edit_number = number;
      }
      const phone_ = `+${country.country_code}${edit_number}`;
      setEditNumber(phone_);
      const data = { phone: phone_, country: country.country };
      try {
        const response = await axios.post(
          `${api_endpoint}/api/getoparator/`,
          data
        );
        if (response.data) {
          setOpararatorData(response.data);
          console.log(response.data);
          setSteps(2);
          setisLoading(false);
        }
      } catch (error) {
        console.log(error);
        setisLoading(false);
        toast.error(error.message);
      }
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 1 && Number(value) <= 500)) {
      setCustomAmount(value);
    }
  };

  const handleEnterCustomAmountClick = () => {
    setShowCustomInput(true);
  };

  const handleNumber = (e) => {
    const inputValue = e.target.value.trim();
    if (isNaN(inputValue)) {
      setPhoneError("Invalid phone number");
    } else {
      setNumber(inputValue);
      setPhoneError(""); // Clear any previous error message
    }
  };

  const HandleSteps2 = async (e) => {
    e.preventDefault();
    const result = await getOparator(number);
    console.log(result);
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
    <>
      <section className="banner__section Home__banner_section">
        <Header />
        <ToastContainer position="bottom-center" theme="colored" />
        {/* {paystackConfig && (
          <>
            <PaystackHookExample config={paystackConfig} />
          </>
        )} */}

        <div className="container">
          <div
            className="fasilities__body wow fadeInUp justify-content-center"
            data-wow-duration="3s"
          >
            <div className="row g-4 justify-content-center pt-120">
              <div className="col-lg-7">
                <div className="home-page-details" style={{ zIndex: "1000" }}>
                  <span className="top-message">Airtime top-up</span>
                  <br /> <br />
                  <h1 className="">
                    Instant Airtime <span>top-Ups</span> Anytime
                  </h1>
                  <br />
                  <div className="">
                    <ul className="">
                      <li>Instant top-up</li>
                      <li>Secure & safe</li>
                      <li>Crypto & Debit/Credit Card</li>
                    </ul>
                  </div>
                  {/* <div>
                    butoo
                  </div> */}
                </div>
              </div>
              <div className="col-xxl-5 col-xl-5 col-lg-5 col-md-5">
                <div className="recharge__paymentbox">
                  {steps === 1 && (
                    <>
                      <div className="mobile__recharge text-center">
                        <h5 className="mb-5 mt-5">Ready to send top-up ?</h5>

                        <form
                          action="javascript:void(0)"
                          className="pb__40 mt-10 "
                          style={{ justifyContent: "center" }}
                        >
                          <div className="row g-4">
                            <div className="col-lg-4">
                              {country.country !== null && (
                                <>
                                  <div className="image-display">
                                    {country && (
                                      <>
                                        <img
                                          src={`https://flagsapi.com/${country.country.toUpperCase()}/flat/64.png`}
                                        />
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                              <select name="niceselect" className="wide">
                                <option value="1" selected>
                                  {country.country}&nbsp;+{country.country_code}
                                </option>
                                <option value="2">1st Operator</option>
                                <option value="3">2nd Operator</option>
                                <option value="4">3rd Operator</option>
                              </select>
                            </div>
                            <div className="col-lg-8 text-center">
                              <input
                                type="text"
                                placeholder="8888888888"
                                value={number}
                                onChange={handleNumber}
                                className="custom-input"
                              />
                            </div>
                            {phoneError && (
                              <>
                                <span className="text-center mt-2 mb-2 text-danger">
                                  {phoneError}
                                </span>
                              </>
                            )}

                            {/*   <div className="col-lg-6">
                          <select name="niceselect">
                            <option value="1">Select offers</option>
                            <option value="2">1st Offers</option>
                            <option value="3">2nd Offers</option>
                            <option value="4">3rd Offers</option>
                          </select>
                        </div>
                        <div className="col-lg-6">
                          <input type="number" placeholder="Enter Amount" />
                        </div> */}
                          </div>
                        </form>
                        <a
                          href="#"
                          className="cmn__btn mb-5"
                          onClick={HandleSteps2}
                          style={{
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {!isLoading && (
                            <>
                              <span>Continue recharge</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="19"
                                height="19"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                              </svg>
                            </>
                          )}

                          {isLoading && (
                            <>
                              <span>Processing...</span>
                            </>
                          )}
                        </a>
                      </div>
                    </>
                  )}

                  {steps === 2 && (
                    <>
                      <div className="mobile__recharge text-left">
                        <h5 className="mb-4 mt-2">You’re sending top-up to</h5>
                        <div className="mt-4">
                          <div className="top-up-container">
                            <div className="header mb-5 mt-2">
                              {showCustomInput && (
                                <>
                                  <span
                                    className=""
                                    style={{
                                      paddingRight: "20px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setShowCustomInput(false);
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="29"
                                      height="29"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M19 12H6M12 5l-7 7 7 7" />
                                    </svg>
                                  </span>
                                </>
                              )}
                              <img
                                src={`https://flagsapi.com/${country.country.toUpperCase()}/flat/64.png`}
                                alt="Country Flag"
                                className="flag"
                              />
                              <span className="phone-number">{editNumber}</span>
                              <img
                                src={oparatorData.data.logoUrls[2]}
                                alt={oparatorData.data.name}
                                className="operator-logo"
                              />
                              <button
                                className="edit-button"
                                onClick={HandleEditbutton}
                              >
                                ✎
                              </button>
                            </div>
                            {!showCustomInput && (
                              <>
                                <h6 className="mb-5">
                                  <b>1.</b> Let’s select a top-up
                                </h6>
                                <div className="top-up-options">
                                  <div
                                    className={`top-up-option ${
                                      selectedOption === "mostPopular"
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleOptionClick({
                                        name: "mostPopular",
                                        amount:
                                          oparatorData.data.mostPopularAmount,
                                        currency:
                                          oparatorData.data.fx.currencyCode,
                                      })
                                    }
                                  >
                                    <p className="label">Most people buy 🔥</p>
                                    <br />
                                    <span className="amount">
                                      {oparatorData.data.mostPopularAmount} GHS
                                    </span>
                                    <button className="buy-button">
                                      Buy{" "}
                                      <ExchangeRateConverter
                                        currency={
                                          oparatorData.data.fx.currencyCode
                                        }
                                        amount={
                                          oparatorData.data.mostPopularAmount
                                        }
                                      />{" "}
                                      USD
                                    </button>
                                  </div>
                                  <div
                                    className={`top-up-option ${
                                      selectedOption === "second"
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleOptionClick({
                                        name: "second",
                                        amount: 27,
                                        currency:
                                          oparatorData.data.fx.currencyCode,
                                      })
                                    }
                                  >
                                    <span className="amount ">27 GHS</span>
                                    <button className="buy-button">
                                      <ExchangeRateConverter
                                        currency={
                                          oparatorData.data.fx.currencyCode
                                        }
                                        amount={amount_2}
                                      />
                                      &nbsp; USD
                                    </button>
                                  </div>
                                  <div
                                    className={`top-up-option ${
                                      selectedOption === "third"
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleOptionClick({
                                        name: "third",
                                        amount: 54,
                                        currency:
                                          oparatorData.data.fx.currencyCode,
                                      })
                                    }
                                  >
                                    <span className="amount">54 GHS</span>
                                    <button className="buy-button">
                                      <ExchangeRateConverter
                                        currency={
                                          oparatorData.data.fx.currencyCode
                                        }
                                        amount={amount_3}
                                      />
                                      &nbsp; USD
                                    </button>
                                  </div>
                                </div>

                                <div className="recharge__numberbtn mb-5">
                                  <a
                                    href="javascript:void(0)"
                                    className="addanother"
                                    onClick={handleEnterCustomAmountClick}
                                  >
                                    <span className="plus">
                                      <i className="material-symbols-outlined">
                                        add
                                      </i>
                                    </span>
                                    <span className="text fz-18 fw-600">
                                      Enter custom amount
                                    </span>
                                  </a>
                                </div>
                              </>
                            )}

                            {showCustomInput && (
                              <div className="custom-amount-input-container">
                                <input
                                  type="number"
                                  value={customAmount}
                                  onChange={handleCustomAmountChange}
                                  placeholder="Enter amount (1-500 GHS)"
                                  className="custom-input form-control mb-4"
                                />
                              </div>
                            )}

                            <div className="mb-5 mt-5 mb-4">
                              <h6>
                                <b>2.</b> Enter Email address
                                <div className="mt-2">
                                  <input
                                    type="email"
                                    value={EmailAddress}
                                    onChange={handleEmailAddress}
                                    placeholder="Enter email address"
                                    className="custom-input form-control mt-3 mb-2"
                                  />
                                </div>
                                {EmailError && (
                                  <>
                                    <p className="text-danger">{EmailError}</p>
                                  </>
                                )}
                              </h6>
                            </div>

                            {/* <div className="mb-5 choose_payment mt-5">
                              <div className="card border-0">
                                <div className="card-header border-0 p-0">
                                  <h6>
                                    <b>3.</b> Select a payment method
                                  </h6>
                                </div>
                                <div className="card-body p-0 mt-4">
                                  <div className="form-check border pt-3 pb-3 pl-3 mb-2">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="flexRadioDefault"
                                      id="flexRadioDefault1"
                                      checked={paymentMethodSelect === "cbc"}
                                      onChange={handlePaymentChange}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexRadioDefault1"
                                    >
                                      Debit/Credit cards &nbsp;
                                      <img
                                        src={visa}
                                        alt="vida"
                                        className="ml-2 payment-icone"
                                      />
                                      &nbsp;
                                      <img
                                        src={mastercard}
                                        alt="mastercard"
                                        className="ml-2 payment-icone"
                                      />
                                      &nbsp;
                                      <img
                                        src={discover}
                                        alt="discover"
                                        className="ml-2 payment-icone"
                                      />
                                      &nbsp;
                                      <img
                                        src={ae}
                                        alt="ae"
                                        className="ml-2 payment-icone"
                                      />
                                    </label>
                                  </div>
                                  <div className="form-check border pt-3 pb-3 pl-3 mb-2">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="flexRadioDefault"
                                      id="flexRadioDefault2"
                                      checked={paymentMethodSelect === "crypto"}
                                      onChange={handlePaymentChange}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexRadioDefault2"
                                    >
                                      Crypto Currency &nbsp;
                                      <img
                                        src={bitcoin}
                                        alt="bitcoin"
                                        className="ml-2 payment-icone"
                                      />
                                      <img
                                        src={coins}
                                        alt="ethereum"
                                        className="ml-2 payment-icone"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div> */}

                            <a
                              href="#"
                              className="cmn__btn mb-5"
                              onClick={handleSubmitStepTwo}
                            >
                              <span>Continue recharge</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="19"
                                height="19"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {steps === 3 && (
                    <>
                      <div className="container">
                        <div className="card p-4 border-0 ">
                          <div className="row align-items-center">
                            <div className="col-12 text-left mb-4">
                              <h5 className="font-weight-bold">Your order</h5>
                            </div>

                            <div className="col-md-12 mb-3 mb-md-0">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <p className="mb-1 font-weight-bold mr-2">
                                    {editNumber}
                                  </p>
                                </div>

                                <div className="d-flex align-items-center">
                                  <img
                                    src={oparatorData.data.logoUrls[2]}
                                    alt="Vodafone"
                                    style={{
                                      width: "20px",
                                      marginRight: "10px",
                                    }}
                                  />

                                  <span
                                    onClick={() => {
                                      setSteps(1);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="21"
                                      height="21"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                                    </svg>
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-muted mb-1">Receives</p>
                                <h4 className="font-weight-bold text__base">
                                  {selectedOptinData.amount}{" "}
                                  {selectedOptinData.currency}
                                </h4>
                              </div>
                              <hr />
                              <div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <p className="mb-0 font-weight-bold text-muted">
                                        Your Total
                                      </p>
                                      <p className="mb-0 font-weight-bold text__base">
                                        <ExchangeRateConverter
                                          currency={selectedOptinData.currency}
                                          amount={selectedOptinData.amount}
                                        />
                                        &nbsp;USD
                                      </p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <p className="mb-1 text-muted">
                                        Top-up subtotal
                                      </p>
                                      <p className="mb-1 text__base">
                                        <ExchangeRateConverter
                                          currency={selectedOptinData.currency}
                                          amount={selectedOptinData.amount}
                                        />
                                        &nbsp;USD
                                      </p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <p className="mb-1 text-muted">
                                        Top-up fee
                                      </p>
                                      <p className="mb-1 text__base">
                                        1.44 USD
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-5 choose_payment mt-5">
                                <div className="card border-0">
                                  <div className="card-header border-0 p-0">
                                    <h6>Choose Payment</h6>
                                  </div>
                                  <div className="card-body p-0 mt-4">
                                    <div className="form-check border pt-3 pb-3 pl-3 mb-2">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="flexRadioDefault"
                                        id="flexRadioDefault1"
                                        value="cbc"
                                        checked={
                                          paymentMethodSelect === "cbc" && (
                                            <>"true"</>
                                          )
                                        }
                                        onChange={handlePaymentChange}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor="flexRadioDefault1"
                                      >
                                        Debit/Credit cards &nbsp;
                                        <img
                                          src={visa}
                                          alt="vida"
                                          className="ml-2 payment-icone"
                                        />
                                        &nbsp;
                                        <img
                                          src={mastercard}
                                          alt="mastercard"
                                          className="ml-2 payment-icone"
                                        />
                                        &nbsp;
                                        <img
                                          src={discover}
                                          alt="discover"
                                          className="ml-2 payment-icone"
                                        />
                                        &nbsp;
                                        <img
                                          src={ae}
                                          alt="ae"
                                          className="ml-2 payment-icone"
                                        />
                                      </label>
                                    </div>

                                    <div className="form-check border pt-3 pb-3 pl-3 mb-2">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        value="crypto"
                                        name="flexRadioDefault"
                                        id="flexRadioDefault2"
                                        checked={
                                          paymentMethodSelect === "crypto" && (
                                            <>"true"</>
                                          )
                                        }
                                        onChange={handlePaymentChange}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor="flexRadioDefault2"
                                      >
                                        Crypto Currency &nbsp;
                                        <img
                                          src={bitcoin}
                                          alt="bitcoin"
                                          className="ml-2 payment-icone"
                                        />
                                        <img
                                          src={coins}
                                          alt="ethereum"
                                          className="ml-2 payment-icone"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <a
                            href="#"
                            className="cmn__btn mb-5 mt-4 text-center"
                            onClick={HandlePayment}
                          >
                            {paymentMethodSelect === "cbc" && (
                              <>
                                <span>Pay with Debit/Credit cards</span>
                              </>
                            )}

                            {paymentMethodSelect === "crypto" && (
                              <>
                                <span>Pay with Crypto</span>
                              </>
                            )}

                            {!paymentMethodSelect && (
                              <>
                                <span>Continue to payment</span>
                              </>
                            )}

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="19"
                              height="19"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                  {steps === 4 && (
                    <>
                      <div className="container">
                        <div className="card p-4 border-0 ">
                          <div className="row align-items-center">
                            <div className="col-12 text-left mb-4">
                              <h5 className="font-weight-bold">Your order</h5>
                            </div>

                            <div className="col-md-12 mb-3 mb-md-0">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <p className="mb-1 font-weight-bold mr-2">
                                    +233500872933
                                  </p>
                                </div>

                                <div className="d-flex align-items-center">
                                  <img
                                    src={oparatorData.data.logoUrls[2]}
                                    alt="Vodafone"
                                    style={{
                                      width: "20px",
                                      marginRight: "10px",
                                    }}
                                  />

                                  <span
                                    onClick={() => {
                                      setSteps(1);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="21"
                                      height="21"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                                    </svg>
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-muted mb-1">Receives</p>
                                <h4 className="font-weight-bold text__base">
                                  83.46 GHS
                                </h4>
                              </div>
                              <hr />
                              <div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <p className="mb-0 font-weight-bold text-muted">
                                        Your Total
                                      </p>
                                      <p className="mb-0 font-weight-bold text__base">
                                        8.93 USD
                                      </p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <p className="mb-1 text-muted">
                                        Top-up subtotal
                                      </p>
                                      <p className="mb-1 text__base">
                                        7.49 USD
                                      </p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <p className="mb-1 text-muted">
                                        Top-up fee
                                      </p>
                                      <p className="mb-1 text__base">
                                        1.44 USD
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <a
                            href="#"
                            className="cmn__btn mb-5 mt-4 text-center"
                            onClick={() => {
                              setSteps(4);
                            }}
                          >
                            <span>Continue to payment</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="19"
                              height="19"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
