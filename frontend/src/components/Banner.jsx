import React, { useState, useEffect, useContext } from "react";
import Header from "./Header/Header";
import rechargeoffer from "../assets/images/banner/rechargeoffer.jpg";
import { SessionContext } from "./sessionContext";

import Carousel from "react-bootstrap/Carousel";

export default function Banner() {
  const [index, setIndex] = useState(0);
  const { country } = useContext(SessionContext);
  const [number, setNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  // const country_image = ;

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
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

  console.log(country.country);

  return (
    <>
      <section className="banner__section">
        <Header />

        <div className="container">
          <div className="fasilities__body wow fadeInUp" data-wow-duration="3s">
            <div className="row g-4 justify-content-center">
              <div className="col-xxl-8 col-xl-8 col-lg-8 col-md-6">
                <div className="recharge__paymentbox">
                  <div className="mobile__recharge text-center">
                    <h5 className="mb-5 mt-5">Ready to send top-up ?</h5>
                    {/* <div className="prepaid__option">
                      <div className="prepaid__check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="pyradio2"
                          checked
                        />
                        <label className="form-check-label" htmlFor="pyradio2">
                          Prepaid
                        </label>
                      </div>
                      <div className="prepaid__check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="pyradio1"
                        />
                        <label className="form-check-label" htmlFor="pyradio1">
                          Postpaid
                        </label>
                      </div>
                    </div> */}
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
                                <img
                                  src={`https://flagsapi.com/${country.country.toUpperCase()}/flat/64.png`}
                                />
                              </div>
                            </>
                          )}
                          <select name="niceselect">
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
                          {phoneError && (
                            <>
                              <span>{phoneError}</span>
                            </>
                          )}
                        </div>

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
                    <a href="order.html" className="cmn__btn mb-5">
                      <span>Continue recharge</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                <div
                  className="payment__sponsor owl-theme owl-carousel"
                  style={{ display: "block" }}
                >
                  <>
                    <Carousel activeIndex={index} onSelect={handleSelect}>
                      <Carousel.Item>
                        <img src={rechargeoffer} alt="rechargeoffer" />
                        <Carousel.Caption>
                          <h3 className="text-white">Credit Crad Payment</h3>
                          <p>
                            Nulla vitae elit libero, a pharetra augue mollis
                            interdum.
                          </p>
                        </Carousel.Caption>
                      </Carousel.Item>
                      <Carousel.Item>
                        <img src={rechargeoffer} alt="rechargeoffer" />
                        <Carousel.Caption>
                          <h3>Second slide label</h3>
                          <p>Paypal Payment</p>
                        </Carousel.Caption>
                      </Carousel.Item>
                      <Carousel.Item>
                        <img src={rechargeoffer} alt="rechargeoffer" />
                        <Carousel.Caption>
                          <h3>Third slide label</h3>
                          <p>CryptoCurrency</p>
                        </Carousel.Caption>
                      </Carousel.Item>
                    </Carousel>
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
