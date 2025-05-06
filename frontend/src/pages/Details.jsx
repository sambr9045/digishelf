import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header/Header";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { api_endpoint } from "../components/constant";
import Loader from "../components/includes/Loader";
import { ToastContainer, toast } from "react-toastify";
import GiftCardPaymentSteps2 from "../components/includes/steps/GiftCardPaymentSteps2";
import { SessionContext } from "../components/sessionContext";
import { useNavigate } from "react-router-dom";
import { giftcardDetailsCalculation } from "../components/includes/Functions";
// id
// productName
// productId
// quantity
// recipientAmount
// recipientCurrency
// AmountToPay
// currencyToPayIn
// img

export default function Details() {
  const { name, productId } = useParams();
  const [productIdData, setProductIdData] = useState();
  const [isloading, setIsloading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedValue, setSelectedValue] = useState(0);
  const [customAmountError, setCustomAmountError] = useState("");
  const [customAmount, setCustomAmount] = useState(0);
  const [customAmountValue, setCustomAmountValue] = useState(parseFloat(0));
  const [steps, setSteps] = useState(1);
  const [stepTwoError, setStepTwoError] = useState();
  const {
    country,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItem,
    mainCurrency,
    setMainCurrency,
  } = useContext(SessionContext);
  const [details_status, setDetails_status] = useState(false);
  const navigate = useNavigate();

  //

  const HandleBuyNow = async (e) => {
    e.preventDefault();
    const amountToAdd = selectedKey ? selectedKey : customAmount;

    // Check if the amount exceeds the maximum allowed value
    if (
      parseFloat(amountToAdd) >
      parseFloat(productIdData.maxRecipientDenomination)
    ) {
      toast.error(
        `The amount exceeds the maximum allowed value of ${productIdData.maxRecipientDenomination}.`
      );
      return; // Prevent adding to cart
    }
    addToCart({
      id: productIdData.productId,
      productName: productIdData.productName,
      productId: productIdData.productId,
      quantity: 1,
      recipientAmount: selectedKey ? selectedKey : customAmount,
      recipientCurrency: productIdData.recipientCurrencyCode,
      AmountToPay: selectedValue ? selectedValue : customAmountValue,
      currencyToPayIn: mainCurrency,
      img: productIdData.logoUrls,
      processing_fee: country.country === "GH" ? productIdData.senderFee : 2,
    });

    navigate("/checkout");
  };

  const handleGoBack = async (e) => {
    setSteps(1);
    setDetails_status(false);
  };

  const handleSelect = (key, value) => {
    setSelectedKey(key);
    setSelectedValue(
      giftcardDetailsCalculation(
        key,
        mainCurrency,
        productIdData.recipientCurrencyCode
      )
    );
    // add or remove sender fees here
  };

  const HandleCustomAmount = (e, min, max) => {
    const amount = e.target.value;
    setCustomAmount(amount);
    // Check if the amount is not a number or is empty
    // Convert amount to a number for range checking
    const numericAmount = parseFloat(amount);

    // Check if the amount is outside the allowed range
    if (numericAmount > parseFloat(max) || numericAmount < parseFloat(min)) {
      setCustomAmountError(`The amount must be between ${min} and ${max}.`);
    } else if (isNaN(amount) || amount === "") {
      setCustomAmountError("Please enter a valid amount");
    } else {
      setCustomAmountError("");
    }

    if (numericAmount <= parseFloat(max) && numericAmount >= parseFloat(min)) {
      setCustomAmountValue(
        giftcardDetailsCalculation(
          numericAmount,
          mainCurrency,
          productIdData.recipientCurrencyCode
        )
      );
    }
  };

  // get fetch product by from reloady api
  const getProductById = async () => {
    try {
      const response = await axios.get(`${api_endpoint}/api/giftcards/`, {
        params: {
          productId: productId,
        },
      });
      if (response.data) {
        setProductIdData(response.data.data);
        setIsloading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleAddtoCard = async () => {};

  const Handledata = async () => {
    const data = await getProductById();
    console.log(data);
    if (data) {
      setProductIdData(data);
    }
  };
  useEffect(() => {
    Handledata();
    console.log(productIdData);
    if (productIdData && productIdData.fixedRecipientToSenderDenominationsMap) {
      const denomMap = productIdData.fixedRecipientToSenderDenominationsMap;
      const firstKey = Object.keys(denomMap)[0]; // "29.99"

      if (firstKey) {
        setSelectedKey(firstKey); // string: "29.99"
        setSelectedValue(
          giftcardDetailsCalculation(
            firstKey, // amount is in recipient currency
            mainCurrency,
            productIdData.recipientCurrencyCode
          )
        );
      }
    }
  }, []);
  return (
    <div>
      <GiftCardBanner type={name} details={details_status} />

      <section className="flight__onewaysection pb__60">
        <div className="container">
          <div className="cars__gridwrapper">
            <div className="row g-4 justify-content-center">
              <div className="row">
                {/* <div className="col-lg-6">Back</div>
                <div className="col-lg-6 ">Flag</div> */}
              </div>

              {isloading ? (
                <>
                  <Loader beforeLoaderContent={true} />
                </>
              ) : (
                <>
                  {steps === 1 && (
                    <>
                      <section className="step1">
                        <div className="row">
                          <div className="col-md-4 mt-5 mb-5">
                            <div className="giftcard_detail">
                              <img
                                src={productIdData.logoUrls}
                                alt="alt"
                                className="img-fluid rounded"
                              />
                            </div>
                          </div>
                          <div className="col-md-8 ">
                            <div className="card border-0">
                              <div className="card-body">
                                <h1 className="card-title display-4">
                                  {productIdData.productName} eGift Card
                                </h1>
                                <div className="row mt-4 mb-4 ">
                                  {productIdData.fixedRecipientToSenderDenominationsMap ? (
                                    <>
                                      <p className="mt-2 mb-4 text-muted">
                                        {" "}
                                        Choose Amount :
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="mt-2 mb-4 text-muted">
                                        {" "}
                                        Enter Amount:
                                      </p>
                                    </>
                                  )}
                                  <div className="div-flex-con">
                                    {productIdData.fixedRecipientToSenderDenominationsMap ? (
                                      Object.entries(
                                        productIdData.fixedRecipientToSenderDenominationsMap
                                      ).map(([key, value], index) => (
                                        <div
                                          key={index}
                                          className={`item ${
                                            selectedKey === key
                                              ? "giftcard_details_selected"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleSelect(
                                              key,
                                              giftcardDetailsCalculation(
                                                key,
                                                mainCurrency,
                                                productIdData.recipientCurrencyCode
                                              )
                                            )
                                          }
                                        >
                                          {/* Render your item properties here */}

                                          <div
                                            className="card d-block list-card-price shadow-sm"
                                            data-value={giftcardDetailsCalculation(
                                              key,
                                              mainCurrency,
                                              productIdData.recipientCurrencyCode
                                            )}
                                          >
                                            {key}&nbsp;
                                            {
                                              productIdData.recipientCurrencyCode
                                            }
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <>
                                        <div className="col-lg-4 col-md-4 col-sm-6">
                                          <div className="input-group ">
                                            <div className="input-group-prepend">
                                              <span className="input-group-text pt-3 pb-3">
                                                {
                                                  productIdData.recipientCurrencyCode
                                                }
                                              </span>
                                            </div>
                                            <input
                                              type="text"
                                              className="form-control"
                                              aria-label="Amount (to the nearest dollar)"
                                              onChange={(e) =>
                                                HandleCustomAmount(
                                                  e,
                                                  productIdData.minRecipientDenomination,
                                                  productIdData.maxRecipientDenomination
                                                )
                                              }
                                              value={customAmount}
                                              placeholder={`Min:${productIdData.minRecipientDenomination} - Max: ${productIdData.maxRecipientDenomination}`}
                                              min={
                                                productIdData.minRecipientDenomination
                                              }
                                              max={
                                                productIdData.maxRecipientDenomination
                                              }
                                            />
                                            {/* <div className="input-group-append">
                                      <span className="input-group-text">
                                        .00
                                      </span>
                                    </div> */}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {customAmountError && (
                                  <>
                                    <p className="text-danger mt-0 mb-4">
                                      {customAmountError}
                                    </p>
                                  </>
                                )}
                                {/* <p className="card-text lead">crazy world</p> */}
                                <h3 className="mt-2 mb-2">
                                  {productIdData.fixedRecipientToSenderDenominationsMap ? (
                                    <>
                                      {selectedValue}&nbsp;
                                      {mainCurrency}
                                    </>
                                  ) : (
                                    <>
                                      {giftcardDetailsCalculation(
                                        customAmount,
                                        mainCurrency,
                                        productIdData.recipientCurrencyCode
                                      )}
                                      &nbsp;
                                      {mainCurrency}
                                    </>
                                  )}
                                </h3>
                                <a
                                  href="#"
                                  className="cmn__btn mb-5 mt-5 outline__btn "
                                  style={{
                                    opacity: isloading ? 0.5 : 1,
                                    cursor: isloading
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                  onClick={() => {
                                    const amountToAdd = selectedKey
                                      ? selectedKey
                                      : customAmount;

                                    // Check if the amount exceeds the maximum allowed value
                                    if (
                                      parseFloat(amountToAdd) >
                                      parseFloat(
                                        productIdData.maxRecipientDenomination
                                      )
                                    ) {
                                      toast.error(
                                        `The amount exceeds the maximum allowed value of ${productIdData.maxRecipientDenomination}.`
                                      );
                                      return; // Prevent adding to cart
                                    }

                                    // Proceed to add to cart if the amount is valid
                                    addToCart({
                                      id: productIdData.productId,
                                      productName: productIdData.productName,
                                      productId: productIdData.productId,
                                      quantity: 1,
                                      recipientAmount: amountToAdd,
                                      recipientCurrency:
                                        productIdData.recipientCurrencyCode,
                                      AmountToPay: selectedValue
                                        ? selectedValue
                                        : customAmountValue,
                                      currencyToPayIn: mainCurrency,
                                      img: productIdData.logoUrls,
                                      processing_fee:
                                        country.country === "GH"
                                          ? productIdData.senderFee
                                          : 2,
                                    });
                                  }}
                                >
                                  {!isloading && (
                                    <>
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
                                        <circle cx="10" cy="20.5" r="1" />
                                        <circle cx="18" cy="20.5" r="1" />
                                        <path d="M2.5 2.5h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.6-8.4H7.1" />
                                      </svg>
                                      &nbsp;
                                      <span>Add to cart</span>
                                    </>
                                  )}

                                  {isloading && (
                                    <>
                                      <span>Processing...</span>
                                    </>
                                  )}
                                </a>
                                &nbsp; &nbsp; &nbsp; &nbsp;
                                <a
                                  href="#"
                                  className="cmn__btn mb-5 mt-5 "
                                  onClick={HandleBuyNow}
                                  style={{
                                    marginLeft: "10px!important",
                                    opacity: isloading ? 0.5 : 1,
                                    cursor: isloading
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                >
                                  {!isloading && (
                                    <>
                                      <span>Continue to Payment</span>
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

                                  {isloading && (
                                    <>
                                      <span>Processing...</span>
                                    </>
                                  )}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <hr className="mt-5 mb-5" />
                        <h5>Redeem Instractions</h5>
                        <ul>
                          <li className="text-muted mb-2">
                            {productIdData.redeemInstruction.concise}
                          </li>
                          <li className="text-muted">
                            {productIdData.redeemInstruction.verbose}
                          </li>
                        </ul>
                      </section>
                    </>
                  )}

                  {steps === 2 && (
                    <>
                      {country && country.country === "GH" ? (
                        <>
                          {/* <GiftCardPaymentSteps2
                            productName={productIdData.productName}
                            amountToreceive={
                              selectedKey ? selectedKey : customAmount
                            }
                            amount={
                              selectedValue ? selectedValue : customAmountValue
                            }
                            currencyInUsd={selectedKey}
                            LocalCurrency={productIdData.senderCurrencyCode}
                            receiverCurrencyCode={
                              productIdData.recipientCurrencyCode
                            }
                            country={country.country}
                            fees={productIdData.senderFee}
                            productId={productIdData.productId}
                            GoBack={handleGoBack}
                          /> */}
                        </>
                      ) : (
                        <>
                          {/* <GiftCardPaymentSteps2
                            productName={productIdData.productName}
                            amountToreceive={
                              selectedKey ? selectedKey : customAmount
                            }
                            amount={
                              selectedKey ? selectedKey : customAmountValue
                            }
                            currencyInUsd={selectedKey}
                            LocalCurrency={productIdData.senderCurrencyCode}
                            receiverCurrencyCode={
                              productIdData.recipientCurrencyCode
                            }
                            country={country.country}
                            fees={productIdData.senderFee}
                            productId={productIdData.productId}
                            GoBack={handleGoBack}
                          /> */}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
