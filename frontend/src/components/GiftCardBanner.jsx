import React, { useState } from "react";
import Header from "./Header/Header";
import { Link } from "react-router-dom";
import { countries } from "./Countries";
export default function GiftCardBanner({ Search, type = "", details = false }) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [giftcardname, setGiftcardname] = useState("");

  const handleNameChange = (e) => {
    setGiftcardname(e.target.value);
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const HandleSeachClik = async () => {
    Search(selectedCountry, giftcardname);
  };

  return (
    <>
      <Header />
      <section className="breadcumnd__banner">
        <div className="container">
          {!details && (
            <>
              <div className="breadcumnd__wrapper">
                <h2 className="bread__title">
                  {type !== "" ? <>{type}</> : <>Gift Cards</>}
                </h2>
                <ul className="breadcumnd__link">
                  <li>
                    <Link to="/home">Home</Link>
                  </li>
                  <li>
                    <i className="material-symbols-outlined">chevron_right</i>
                  </li>

                  {type !== "" ? (
                    <>
                      <li>
                        <Link to={`/gift-cards/`}>Gift Cards</Link>
                      </li>
                      <li>
                        <i className="material-symbols-outlined">
                          chevron_right
                        </i>
                      </li>
                      <li>
                        <a href="javascript:void(0)">{type}</a>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <a href="javascript:void(0)">Gift Cards</a>
                      </li>
                    </>
                  )}

                  {}
                </ul>
              </div>
            </>
          )}
        </div>

        {!details && (
          <>
            <div className="flight__roundtrip pt-80">
              <div className="container">
                <div className="booking__landing__wrap1">
                  <div className="booking__landing__body">
                    <div className="dating__body">
                      <div className="dating__body__box  mb__30">
                        <div className="dating__item dating__hidden">
                          <div className="input-group">
                            <select
                              className="form-control pt-3 pb-3"
                              value={selectedCountry}
                              onChange={handleCountryChange}
                              style={{ outline: "none" }}
                            >
                              <option value="" disabled>
                                Select a country
                              </option>
                              {countries.map((country) => (
                                <option
                                  key={country.code}
                                  value={country.alpha2Code}
                                >
                                  {country.name}
                                </option>
                              ))}
                            </select>
                            <span className="input-group-addon">
                              <i className="glyphicon glyphicon-calendar"></i>
                            </span>
                          </div>
                        </div>
                        <div className="dating__item dating__hidden">
                          <input
                            type="text"
                            placeholder="Gift Card Name"
                            onChange={handleNameChange}
                          />
                          <span className="calendaricon">
                            <i className="material-symbols-outlined">redeem</i>
                          </span>
                        </div>

                        <div className="dating__item">
                          <button
                            type="submit"
                            className="cmn__btn"
                            onClick={HandleSeachClik}
                          >
                            <span>Search Gift Cards</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* <div className="boock__check mt__30">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="bcheckbok"
                      />
                      <label className="form-check-label" htmlFor="bcheckbok">
                        Driver aged 25 - 70
                      </label>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
