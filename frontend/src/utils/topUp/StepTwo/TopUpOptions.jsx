// TopUpOptions.js
import React, { useState, useContext } from "react";
import ExchangeRateConverter from "../../../components/ExchangeRateConverter";
import MoreOptionModal from "./MoreOptionModal";
import { TopUpContext } from "../../../components/Context/TopUpContext";

const TopUpOptions = () => {
  const {
    oparatorData,
    selectedOption,
    handleOptionClick,
    country,
    suggestedAmountsMap,
    selectedOptinData,
    EmailAddress,
    setEmailAddress,
    EmailError,
    setSelectedOptionData,
  } = useContext(TopUpContext);
  const [show, setShow] = useState();
  const [customAmountTwo, setCustomAmountTwo] = useState();
  const [emailError, setEmailError] = useState("");

  const HandleSelectedClicke = () => {
    setSelectedOptionData({
      name: "customAmount",
      amount: customAmount,
      currency: country.country === "GH" ? "GHS" : "USD",
    });
  };

  const HandleCustomAmounTwo = (e) => {
    const value = e.target.value;
    // Only allow digits and optionally one dot
    const isValid = /^(\d+\.?\d{0,2}|\d*)$/.test(value);
    if (isValid || value === "") {
      setCustomAmountTwo(value);
    }
  };

  const HandleEmailChange = (e) => {
    const email = e.target.value;
    setEmailAddress(email);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail && email !== "") {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(""); // Clear error if valid or empty
    }
  };

  const handleOnFocusOut = () => {
    setSelectedOptionData({
      name: "customAmount",
      amount: customAmountTwo,
      currency: country.country === "GH" ? "GHS" : "USD",
    });
  };
  // setSelectedOptionData({
  //   name: "customAmount",
  //   amount: customAmount,
  //   currency: country.country === "GH" ? "GHS" : "USD",
  // });
  return (
    <>
      <div className="top-up-options">
        {/* Mapping over options can be done here */}

        {selectedOptinData !== "" ? (
          <>
            <div className={`top-up-option selected`}>
              <p className="amount ">
                <span className="" onClick={() => setSelectedOptionData("")}>
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
                &nbsp;&nbsp;&nbsp;
                <ExchangeRateConverter
                  receiverCurrencyCode={
                    oparatorData.data.destinationCurrencyCode
                  }
                  senderCountry={country.country}
                  Amount={selectedOptinData.amount}
                  fx_rate={oparatorData.data.fx.rate}
                />
              </p>
              <button className="buy-button">
                Pay&nbsp;{selectedOptinData.amount}&nbsp;
                {oparatorData.data.senderCurrencyCode}
              </button>
            </div>
          </>
        ) : (
          <>
            {oparatorData.data.mostPopularAmount === null ? (
              <>
                <div className="mt-2">
                  <div className="form-group">
                    <input
                      type="text"
                      name="custom-amount-two"
                      className={`form-control pt-3 pb-3  ${
                        EmailError ? "FormError" : ""
                      }`}
                      id="custom-amount-two"
                      placeholder={`Enter Amount ${oparatorData.data.fx.currencyCode}`}
                      onChange={HandleCustomAmounTwo}
                      onBlur={handleOnFocusOut}
                      value={customAmountTwo}
                    />
                    <span
                      style={{
                        position: "absolute",
                        fontWeight: "bold",
                        color: "#555",
                        right: 0,
                        marginRight: "120px",
                        marginTop: "-65px",
                      }}
                    >
                      {oparatorData.data.fx.currencyCode}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`top-up-option ${
                    selectedOption === "mostPopular" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setSelectedOptionData({
                      name: "mostPopular",
                      amount: oparatorData.data.mostPopularAmount,
                      currency: oparatorData.data.fx.currencyCode,
                    })
                  }
                >
                  <p className="amount basecolor_custom">
                    <ExchangeRateConverter
                      receiverCurrencyCode={
                        oparatorData.data.destinationCurrencyCode
                      }
                      senderCountry={country.country}
                      Amount={oparatorData.data.mostPopularAmount}
                      fx_rate={oparatorData.data.fx.rate}
                    />
                  </p>

                  {country.country === "GH" &&
                  oparatorData.data.country.isoName === "GH" ? (
                    ""
                  ) : (
                    <>
                      <button className="buy-button">
                        Buy &nbsp; {oparatorData.data.mostPopularAmount} &nbsp;
                        {oparatorData.data.senderCurrencyCode}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Additional options can be similarly defined */}
            {Object.keys(suggestedAmountsMap).length > 0
              ? Object.entries(suggestedAmountsMap)
                  .slice(0, 2)
                  .map(([key, item]) => (
                    <div key={item.key}>
                      {/* Mapping over options can be done here */}
                      <div
                        className={`top-up-option `}
                        onClick={() =>
                          setSelectedOptionData({
                            name: "mostPopular",
                            amount: key,
                            currency: oparatorData.data.fx.currencyCode,
                          })
                        }
                      >
                        <p className="amount ">
                          <ExchangeRateConverter
                            receiverCurrencyCode={
                              oparatorData.data.destinationCurrencyCode
                            }
                            senderCountry={country.country}
                            Amount={key}
                            fx_rate={oparatorData.data.fx.rate}
                          />
                        </p>
                        <button className="buy-button">
                          Buy &nbsp;{key}&nbsp;
                          {oparatorData.data.senderCurrencyCode}
                        </button>
                      </div>
                    </div>
                  ))
              : null}
          </>
        )}

        {selectedOptinData === "" &&
          oparatorData.data.mostPopularAmount !== null && (
            <>
              <div className="mt-0 mb-1 text-left">
                <span
                  className="text fz-12 fw-600 basecolor_custom more-option"
                  onClick={() => setShow(true)}
                >
                  More options
                </span>
                <MoreOptionModal show={show} setShow={setShow} />
              </div>
            </>
          )}

        <div className="mt-2">
          <div className="form-group">
            <h2 htmlFor="email" className="text-muted pb-2">
              <b>
                2. Enter your email <span className="text-danger">*</span>
              </b>
            </h2>
            <input
              type="email"
              name="email"
              className={`form-control pt-3 pb-3  ${
                EmailError ? "FormError" : ""
              }`}
              id="email"
              placeholder="Enter email address"
              onChange={HandleEmailChange}
              value={EmailAddress}
            />
          </div>
        </div>
      </div>
      {/* More option pop modal */}
    </>
  );
};

export default TopUpOptions;
