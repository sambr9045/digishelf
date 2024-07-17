import React, { useContext, useState } from "react";
import bitcoin from "../../assets/images/payment/bitcoin.png";
import coins from "../../assets/images/payment/coins.png";
import ae from "../../assets/images/payment/ae.png";
import discover from "../../assets/images/payment/discover.png";
import mastercard from "../../assets/images/payment/mastercard.png";
import visa from "../../assets/images/payment/visa.png";
import { TopUpContext } from "../../components/Context/TopUpContext";
import ExchangeRateConverter from "../../components/ExchangeRateConverter";
import { nanoid } from "nanoid";
import { SessionContext } from "../../components/sessionContext";
import { PaystackConsumer, usePaystackPayment } from "react-paystack";
import { api_endpoint } from "../../components/constant";
import {
  TopUpAitimeFeeCalculatio,
  ConvertGHStoUSD,
} from "../../components/includes/Functions";
import axios from "axios";
import Loader from "../../components/includes/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function StepThree() {
  const {
    oparatorData,
    editNumber,
    setSteps,
    selectedOptinData,
    paymentMethodSelect,
    fx_rate,
    country,
    setPaymentMethodSelect,
    setPaystackConfig,
    EmailAddress,
    operatorCountryData,
    isLoading,
    setisLoading,
  } = useContext(TopUpContext);
  const { session } = useContext(SessionContext);
  const navigate = useNavigate();

  const AmountPaid =
    parseFloat(
      TopUpAitimeFeeCalculatio(selectedOptinData.amount, country.country)[0]
    ) + parseFloat(selectedOptinData.amount);

  // reference: "wSFvu5uXj1wY4i", trans: "3952288590", status: "success", message: "Approved", transaction: "3952288590", trxref: "wSFvu5uXj1wY4i", redirecturl: "?trxref=wSFvu5uXj1wY4i&reference=wSFvu5uXj1wY4i"

  const handlePaymentProcessing = async (data) => {
    const response = await processPayment(data);
    if (response.status === "SUCCESSFUL") {
      navigate(`/top-up/success/${response.customIdentifier}`);
    }
  };

  console.log("handle payment is called");

  const processPayment = async (data) => {
    try {
      const response = await axios.post(
        `${api_endpoint}/api/aitimetopup/`,
        data
      );

      if (response.data) {
        console.log(response.data.data);
        // redirect to success page
        setisLoading(false);

        return response.data.data;
      }
    } catch (error) {
      console.log(error);
      setisLoading(false);
      toast.error("Something went wrong please try again!! Or contact suppose");
    }
  };
  const handleSuccess = (reference) => {
    // Implementation for whatever you want to do with reference and after success call.
    // make backend call to buy airtime from reloady here
    // then update teh status of airtime
    // then redirect to the success page
    setisLoading(true);

    // resposne

    const data = {
      transaction: reference,
      receiverAmount: selectedOptinData.amount,
      receiverCurrency: selectedOptinData.currency,
      ProcessingFee: TopUpAitimeFeeCalculatio(
        selectedOptinData.amount,
        country.country
      )[0],
      amountPaid: AmountPaid,
      email: EmailAddress,
      userType: session && session.user !== null ? session.user : "guest",
      PaymentCurreuncy: country.country === "GH" ? "GHS" : "USD",
      PaymentMethod: paymentMethodSelect,
      ConvertedAmountToUsd:
        country.country == "GH"
          ? ConvertGHStoUSD(selectedOptinData.amount)
          : false,
      oparatorData: oparatorData,
      operatorCountryData: operatorCountryData,
      editNumber: editNumber,
      ghana_cedis_rate: localStorage.getItem("exchangeRate")
        ? JSON.parse(localStorage.getItem("exchangeRate")).GHS
        : null,
      country: country.country,
    };
    console.log(data);
    handlePaymentProcessing(data);
  };

  const handleClose = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log("closed");
    const data = {
      receiverAmount: selectedOptinData.amount,
      receiverCurrency: selectedOptinData.currency,
      ProcessingFee: TopUpAitimeFeeCalculatio(
        selectedOptinData.amount,
        country.country
      )[0],
      amountPaid: AmountPaid,
      email: EmailAddress,
      userType: session && session.user !== null ? session.user : "guest",
      PaymentCurreuncy: country.country === "GH" ? "GHS" : "USD",
      PaymentMethod: paymentMethodSelect,
      ConvertedAmountToUsd:
        country.country == "GH"
          ? ConvertGHStoUSD(selectedOptinData.amount)
          : false,
      oparatorData: oparatorData,
      operatorCountryData: operatorCountryData,
      editNumber: editNumber,
      ghana_cedis_rate: localStorage.getItem("exchangeRate")
        ? JSON.parse(localStorage.getItem("exchangeRate")).GHS
        : null,
    };
  };

  const config = {
    reference: nanoid(14),
    email: EmailAddress,
    amount: Math.round(parseFloat(AmountPaid).toFixed(2) * 100), //Amount is in USD
    currency: "GHS",
    publicKey: "pk_test_2d258100e34a102a5137cdb2fae8f2e878f45b2d",
  };
  const initializePayment = usePaystackPayment(config);

  const handlePaymentChange = (event) => {
    setPaymentMethodSelect(event.target.value);
  };

  const HandlePayment = async () => {
    initializePayment({
      onSuccess: handleSuccess,
      onClose: handleClose,
      config: config,
    });
  };

  return (
    <>
      {isLoading && (
        <>
          <Loader />
        </>
      )}
      <div className=" p-0">
        <div className="card border-0 p-0">
          <div className="row align-items-center">
            <div className="col-12 text-left mb-4">
              <h5 className="font-weight-bold">
                <span style={{ cursor: "pointer" }} onClick={() => setSteps(2)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H6M12 5l-7 7 7 7" />
                  </svg>
                </span>
                &nbsp;&nbsp; Your order
              </h5>
            </div>

            <div className="col-md-12 mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <p className="mb-1 font-weight-bold mr-2">{editNumber}</p>
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
                  <ExchangeRateConverter
                    receiverCurrencyCode={fx_rate.currencyCode}
                    senderCountry={country.country}
                    Amount={selectedOptinData.amount}
                    fx_rate={fx_rate.rate}
                  />
                </h4>
              </div>
              <hr />
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-1 text-muted">Top-up subtotal</p>
                      <b>
                        <p className="mb-1 ">
                          {selectedOptinData.amount}{" "}
                          {selectedOptinData.currency}
                        </p>
                      </b>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-1 text-muted">Top-up fee</p>
                      <p className="mb-1 ">
                        <b>
                          {
                            TopUpAitimeFeeCalculatio(
                              selectedOptinData.amount,
                              country.country
                            )[0]
                          }
                          &nbsp;
                          {
                            TopUpAitimeFeeCalculatio(
                              selectedOptinData.amount,
                              country.country
                            )[1]
                          }
                        </b>
                      </p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="mb-0 font-weight-bold text-muted">
                        Your Total
                      </p>
                      <p className="mb-0 font-weight-bold ">
                        <b>
                          {(
                            parseFloat(
                              TopUpAitimeFeeCalculatio(
                                selectedOptinData.amount,
                                country.country
                              )[0]
                            ) + parseFloat(selectedOptinData.amount)
                          ).toFixed(2)}
                          &nbsp;
                          {
                            TopUpAitimeFeeCalculatio(
                              selectedOptinData.amount,
                              country.country
                            )[1]
                          }
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-2 choose_payment mt-2">
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
                        checked={paymentMethodSelect === "cbc" ? true : false}
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
                        <img src={ae} alt="ae" className="ml-2 payment-icone" />
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
                          paymentMethodSelect === "crypto" ? true : false
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
            className="cmn__btn mb-2 mt-2 text-center"
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
  );
}
