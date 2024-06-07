import React, { useState } from "react";
import axios from "axios";
import validator from "validator";
import visa from "../../../assets/images/payment/visa.png";
import mastercard from "../../../assets/images/payment/mastercard.png";
import bitcoin from "../../../assets/images/payment/bitcoin.png";
import coins from "../../../assets/images/payment/coins.png";
import ae from "../../../assets/images/payment/ae.png";
import discover from "../../../assets/images/payment/discover.png";
import { usePaystackPayment } from "react-paystack";
import { PaystackConsumer } from "react-paystack";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../Loader";
import { api_endpoint } from "../../constant";
import { nanoid } from "nanoid";
// import { useHistory } from "react-router-dom";

export default function GiftCardPaymentSteps2({
  productName,
  amountToreceive,
  amount,
  currencyInUsd,
  LocalCurrency,
  receiverCurrencyCode,
  country,
  fees,
  productId,
  GoBack,
}) {
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("cdc");
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [reference, setReference] = useState("reference");
  const [isLading, setIsLoading] = useState(false);
  // const history = useHistory();

  let totalAmount = 0;
  if (country === "GH") {
    totalAmount = parseFloat(amount);
  } else {
    totalAmount = parseFloat(currencyInUsd);
  }

  const HandleRelease = async (UserData) => {
    const response = await axios.post(
      `${api_endpoint}/api/process-payment/`,
      UserData
    );
    if (response.data) {
      setIsLoading(false);
      // redirect to completed paymenr
      return response.data;
    }
  };

  const handleCall = async (data) => {
    const result = await HandleRelease(data);
    console.log(result);
    window.location.href = `/gift-card/payment-complete/${result.reference}`;
  };
  const handleSuccess = (reference) => {
    setIsLoading(true);
    const data = {
      transaction: {
        reference: reference.reference,
        product_name: productName,
        product_id: productId,
        receiver_currency_code: receiverCurrencyCode,
        recipient_amount: amountToreceive,
        amount: totalAmount,
        country: country,
        email: userEmail,
        user_type: "guest",
        payment_method: paymentMethodSelect,
      },
      payment_details: {
        message: reference.message,
        status: reference.status,
        transaction: reference.transaction,
        trxref: reference.trxref,
      },
      user_device: {
        ip_address: localStorage.getItem("ip"),
      },
    };

    handleCall(data);
  };

  const handleClose = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log("closed");
  };

  const config = {
    reference: nanoid(10),
    email: userEmail,
    amount: Math.round(totalAmount * 100), // Amount in kobo
    currency: "GHS",
    publicKey: import.meta.env.VITE_APP_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const HandlePayment = async (e) => {
    if (userEmail === "") {
      toast.error("Please enter your email address.");
      return;
    }

    if (paymentMethodSelect === "") {
      toast.error("Please select payment method.");
      return;
    }

    if (paymentMethodSelect === "cbc") {
      // handleCall(testing_data);
      setReference(nanoid(10));
      const reference = nanoid(10);
      setReference(reference);

      initializePayment({
        onSuccess: handleSuccess,
        onClose: handleClose,
        config: config,
      });
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setUserEmail(value);
    if (!validator.isEmail(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePaymentChange = (event) => {
    setPaymentMethodSelect(event);
  };

  return (
    <div>
      {isLading && (
        <>
          <Loader />
        </>
      )}
      <div className="container gift-card-step-2 ">
        <div className="row justify-content-center">
          <div className="col-lg-6 shadow-lg">
            {/* Stage 1: Gift Card Details */}
            <div className="card p-2 mb-3 border-0">
              <div className="card-body">
                <h5 className="card-title mb-4">{productName}</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>You receive:</span>
                  <span>
                    {productName}{" "}
                    <b>
                      {amountToreceive}&nbsp;{receiverCurrencyCode}
                    </b>
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  {country === "GH" ? (
                    <>
                      <span>Amount to Pay:</span>
                      <span>
                        {amount}&nbsp;{LocalCurrency}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Amount to Pay:</span>
                      <span>80 USD</span>
                    </>
                  )}
                </div>

                <div className="d-flex justify-content-between ">
                  {country === "GH" && (
                    <>
                      <span className="mt-4 fs-3">Total:</span>
                      <span className="mt-4 fs-3">
                        <b>
                          {totalAmount}&nbsp;{LocalCurrency}
                        </b>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* <hr className="mt-3 mb-2 w-70" /> */}
            {/* Stage 2: Email */}
            <div className="card p-2 border-0">
              <div className="card-body">
                <h5 className="card-title mb-4">Email</h5>
                <form>
                  <div className="mb-3 col-lg-12 col-md-12 col-sm-12">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      aria-describedby="emailHelp"
                      placeholder="Enter email address"
                      style={{ width: "100%!important" }}
                      value={userEmail}
                      onChange={handleEmailChange}
                    />
                    {emailError && (
                      <div id="emailHelp" className="form-text text-danger">
                        {emailError}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Stage 3: Payment */}
            <div className="card border-0 p-4">
              <div className="card-body p-0 mt-0">
                <h5 className="card-title mb-4">Choose Payment</h5>
                {country === "GH" && (
                  <div
                    className={`form-check border pt-3 pb-3 pl-5 mb-2 d-flex justify-content-between align-items-center ${
                      paymentMethodSelect === "cbc" ? "selected shadow-sm" : ""
                    }`}
                    onClick={() => handlePaymentChange("cbc")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <label
                        className="form-check-label"
                        htmlFor="flexRadioDefault1"
                      >
                        Debit/Credit cards
                      </label>
                      <img
                        src={visa}
                        alt="visa"
                        className="ml-2 payment-icon"
                      />
                      <img
                        src={mastercard}
                        alt="mastercard"
                        className="ml-2 payment-icon"
                      />
                      <img
                        src={discover}
                        alt="discover"
                        className="ml-2 payment-icon"
                      />
                      <img src={ae} alt="ae" className="ml-2 payment-icon" />
                    </div>
                    {paymentMethodSelect === "cbc" && (
                      <span className="pr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="21"
                          height="21"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`form-check border pt-3 pb-3 pl-3 mb-2 d-flex justify-content-between align-items-center ${
                    paymentMethodSelect === "crypto" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentChange("crypto")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center">
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault2"
                    >
                      Crypto Currency
                    </label>
                    <img
                      src={bitcoin}
                      alt="bitcoin"
                      className="ml-2 payment-icon"
                    />
                    <img
                      src={coins}
                      alt="ethereum"
                      className="ml-2 payment-icon"
                    />
                  </div>
                  {paymentMethodSelect === "crypto" && (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <a
                  href="#"
                  className="cmn__btn mb-2 mt-5 form-control"
                  onClick={HandlePayment}
                >
                  <span>Pay</span>
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

                <button
                  className="form-control btn btn-secondary  mb-4 pt-3 pb-3"
                  style={{ border: "1px solid lightgray!important" }}
                  onClick={GoBack}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
