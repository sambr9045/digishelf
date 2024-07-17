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

  const HandleSelectedClicke = () => {
    setSelectedOptionData({
      name: "customAmount",
      amount: customAmount,
      currency: country.country === "GH" ? "GHS" : "USD",
    });
  };

  const HandleEmailChange = (e) => {
    const email = e.target.value;
    if (email.trim() !== "") {
      setEmailAddress(email);
    }
  };
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

        {selectedOptinData === "" && (
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
            <label htmlFor="email" className="fs-5 pb-2">
              Enter your email*
            </label>
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
