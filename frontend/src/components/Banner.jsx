import React, { useContext } from "react";
import Header from "./Header/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TopUpContext } from "./Context/TopUpContext";

import arrowright from "../assets/images/payment/arrow-right.png";
import "react-intl-tel-input/dist/main.css";
import StepOne from "../utils/topUp/StepOne";
import StepTwo from "../utils/topUp/StepTwo";
import StepThree from "../utils/topUp/StepThree";
import StepFour from "../utils/topUp/StepFour";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

export default function Banner() {
  const { steps } = useContext(TopUpContext);

  return (
    <>
      <section className="banner__section Home__banner_section gradient-div">
        <Header />
        <ToastContainer position="top-center" theme="colored" />

        <div className="container mt-5">
          <br />
          <br />

          <div
            className="fasilities__body wow fadeInUp justify-content-center mt-5"
            data-wow-duration="3s"
          >
            <div className="row g-4 justify-content-center pt-120">
              <div className="col-lg-7">
                <div className="home-page-details" style={{ zIndex: "1000" }}>
                  <span className="top-message">Airtime top-up</span>
                  <br /> <br />
                  <h1 className="fade-in-text-from-top">
                    Instant Airtime
                    <span className="text-with-circle">Top-ups</span> Anytime
                  </h1>
                  <br />
                  <div className="">
                    <ul className="fade-in-list ">
                      <li className="fade-in-item">
                        <img src={arrowright} alt="arrow-right" />
                        Instant top-up
                      </li>
                      <li className="fade-in-item">
                        <img src={arrowright} alt="arrow-right" />
                        Secure & safe
                      </li>
                      <li className="fade-in-item">
                        <img src={arrowright} alt="arrow-right" />
                        Crypto & Debit/Credit Card payment method
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xxl-5 col-xl-5 col-lg-4 col-md-5 col-sm-5">
                <div className="recharge__paymentbox ">
                  {steps === 1 && (
                    <>
                      <StepOne />
                    </>
                  )}

                  {steps === 2 && (
                    <>
                      <StepTwo />
                    </>
                  )}

                  {steps === 3 && (
                    <>
                      <StepThree />
                    </>
                  )}

                  {steps === 4 && (
                    <>
                      <StepFour />
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
