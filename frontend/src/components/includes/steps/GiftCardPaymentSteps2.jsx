import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import validator from "validator";
import visa from "../../../assets/images/payment/visa.png";
import mastercard from "../../../assets/images/payment/mastercard.png";
import bitcoin from "../../../assets/images/payment/bitcoin.png";
import coins from "../../../assets/images/payment/coins.png";
import ae from "../../../assets/images/payment/ae.png";
import discover from "../../../assets/images/payment/discover.png";
import emptycart from "../../../assets/images/cart/cart.svg";
import { Link } from "react-router-dom";

import { usePaystackPayment } from "react-paystack";
import { PaystackConsumer } from "react-paystack";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../Loader";
import { api_endpoint } from "../../constant";
import { nanoid } from "nanoid";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../sessionContext";

// id
// productName
// productId
// quantity
// recipientAmount
// recipientCurrency
// AmountToPay
// currencyToPayIn
// img

export default function GiftCardPaymentSteps2() {
  const [paymentMethodSelect, setPaymentMethodSelect] = useState("cdc");
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [reference, setReference] = useState("reference");
  const [isLading, setIsLoading] = useState(false);
  const { cart, country } = useContext(SessionContext);
  const [cartTotal, setCartTotal] = useState(0);
  const [CurrencyToPay, setCurrencyToPay] = useState("USD");
  const navigate = useNavigate();
  // const history = useHistory();

  let totalAmount = 0;
  // if (country === "GH") {
  //   totalAmount = parseFloat(amount);
  // } else {
  //   totalAmount = parseFloat(currencyInUsd);
  // }

  const HandleRelease = async (UserData) => {
    try {
      const response = await axios.post(
        `${api_endpoint}/api/process-payment/`,
        UserData
      );
      if (response.data) {
        setIsLoading(false);
        // redirect to completed paymenr
        return response.data;
      }
    } catch (error) {
      toast.info(
        "Your transaction has been submitted successfully. However, we are currently experiencing network issues. Please contact our support team for assistance."
      );
      setIsLoading(false);
    }
  };

  const handleCall = async (data) => {
    const result = await HandleRelease(data);
    console.log(result);
    const url = `/gift-card/payment-complete/${result.reference}`;
    navigate(url);
    // window.location.href = ;
  };
  const handleSuccess = (reference) => {
    setIsLoading(true);

    const data = {
      transaction: {
        reference: reference.reference,
        products: cart,
        amount: cartTotal,
        country: country.country,
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

    console.log(data);
    handleCall(data);
  };

  const handleClose = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log("closed");
  };

  const config = {
    reference: nanoid(10),
    email: userEmail,
    amount: Math.round(cartTotal * 100), // Amount in kobo
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
    } else if (paymentMethodSelect === "crypto") {
      console.log("crypto payment ");
    } else {
      toast.error("Please select payment method");
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

  useEffect(() => {
    if (country.country === "GH") {
      setCurrencyToPay("GHS");
    }
    if (cart && cart.length > 0) {
      const total = cart.reduce(
        (acc, item) => acc + item.AmountToPay * item.quantity,
        0
      );
      setCartTotal(total.toFixed(2));
    }
  }, [cart]);

  return (
    <div>
      <ToastContainer position="top-center" theme="colored" />
      {isLading && (
        <>
          <Loader />
        </>
      )}
      {cart && cart.length > 0 ? (
        <>
          <section className="flight__onewaysection pb__60">
            <div className="container gift-card-step-2 ">
              <div className="row justify-content-center">
                <div className="col-lg-6 shadow-lg p-0">
                  {/* Stage 1: Gift Card Details */}
                  <div className="card p-2 mb-3 border-0">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Product</h5>
                      {cart.map((item) => (
                        <>
                          <div
                            key={item.id}
                            className="d-flex justify-content-between mb-2"
                          >
                            <span className="fs-6">
                              {item.productName}&nbsp;
                              <b>
                                {item.recipientAmount}&nbsp;
                                {item.recipientCurrency}
                              </b>
                            </span>
                            <span className="fs-6">
                              {parseFloat(item.AmountToPay).toFixed(2)}&nbsp;
                              {item.currencyToPayIn}
                            </span>
                          </div>
                        </>
                      ))}
                      {/* <div className="d-flex justify-content-between  border p-2 mb-2">
                        <span>
                          PLayStation US&nbsp;
                          <b>10&nbsp;USD</b>
                        </span>
                        <span className="text-right">34 GHS</span>
                      </div>
                      <div className="d-flex justify-content-between  border p-2 mb-2">
                        <span>
                          {" "}
                          PLayStation US&nbsp;
                          <b>10&nbsp;USD</b>
                        </span>
                        <span>34 GHS</span>
                      </div> */}
                      {/* <div className="d-flex justify-content-between  border p-2 m-2"> */}
                      {/* {country === "GH" ? (
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
                        )} */}
                      {/* <span>Amount to Pay:</span>
                        <span>80 USD</span> */}
                      {/* </div> */}

                      <div className="d-flex justify-content-between ">
                        <span className="mt-4 fs-3">Total:</span>
                        <span className="mt-4 fs-3">
                          <b>
                            {cartTotal}&nbsp;{CurrencyToPay}
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <hr className="mt-3 mb-2 w-70" /> */}
                  {/* Stage 2: Email */}
                  <div className="card p-2 border-0">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Email address</h5>
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
                            <div
                              id="emailHelp"
                              className="form-text text-danger"
                            >
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
                      {country.country === "GH" && (
                        <div
                          className={`form-check border pt-3 pb-3 pl-5 mb-2 d-flex justify-content-between align-items-center ${
                            paymentMethodSelect === "cbc"
                              ? "selected shadow-sm"
                              : ""
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
                            <img
                              src={ae}
                              alt="ae"
                              className="ml-2 payment-icon"
                            />
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

                      {/* <button
                        className="form-control btn btn-secondary  mb-4 pt-3 pb-3"
                        style={{ border: "1px solid lightgray!important" }}
                        // onClick={GoBack}
                      >
                        Cancel
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="text-center mb-5 " style={{ marginTop: "20vh" }}>
            <img
              src={emptycart}
              alt="empty cart"
              style={{ width: "200px", height: "auto" }}
            />

            <p className="mt-4 mb-5">
              <b className="text-muted">Your cart is currently empty</b>
            </p>

            <div className="mt-4">
              <Link to="/gift-cards" className="cmn__btn">
                Keep Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
