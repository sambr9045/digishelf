import React from "react";
import Header from "./Header/Header";
export default function Banner() {
  return (
    <>
      <section className="banner__section">
        <Header />

        <div className="container">
          <div
            className="fasilities__wrapper pb__40 wow fadeInUp"
            data-wow-duration="2s"
          >
            <div className="fasilities__inner d-flex align-items-center">
              <a
                href="page1"
                className="fasilities__item active align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/phone.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Mobile</span>
              </a>
              <a
                href="card.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/card.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Card</span>
              </a>
              <a
                href="broadband.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/broadband.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Broadband</span>
              </a>
              <a
                href="landline.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/landphone.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Landline</span>
              </a>
              <a
                href="cabletv.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/tv.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">CableTv</span>
              </a>
              <a
                href="electricity.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/eletricity.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Electricity</span>
              </a>
              <a
                href="gas.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/gas.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Gas</span>
              </a>
              <a
                href="water.html"
                className="fasilities__item align-items-center d-flex"
              >
                <span className="icon">
                  <img src="assets/img/svg/water.svg" alt="icon" />
                </span>
                <span className="fz-18 pratext d-block">Water</span>
              </a>
            </div>
          </div>

          <div className="fasilities__body wow fadeInUp" data-wow-duration="3s">
            <div className="row g-4 justify-content-center">
              <div className="col-xxl-8 col-xl-8 col-lg-8 col-md-6">
                <div className="recharge__paymentbox">
                  <div className="mobile__recharge text-center">
                    <h5>Mobile Recharge or Bill Payment</h5>
                    <div className="prepaid__option">
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
                    </div>
                    <form action="javascript:void(0)" className="pb__40">
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <input
                            type="text"
                            placeholder="Enter Mobile Number"
                          />
                        </div>
                        <div className="col-lg-6">
                          <select name="niceselect">
                            <option value="1">Select Your Operator</option>
                            <option value="2">1st Operator</option>
                            <option value="3">2nd Operator</option>
                            <option value="4">3rd Operator</option>
                          </select>
                        </div>
                        <div className="col-lg-6">
                          <select name="niceselect">
                            <option value="1">Select offers</option>
                            <option value="2">1st Offers</option>
                            <option value="3">2nd Offers</option>
                            <option value="4">3rd Offers</option>
                          </select>
                        </div>
                        <div className="col-lg-6">
                          <input type="number" placeholder="Enter Amount" />
                        </div>
                      </div>
                    </form>
                    <a href="order.html" className="cmn__btn">
                      <span>Continue recharge</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                <div className="payment__sponsor owl-theme owl-carousel">
                  <div className="pay__sponsor__item">
                    <img src="assets/img/banner/recharge-offer.jpg" alt="img" />
                  </div>
                  <div className="pay__sponsor__item">
                    <img src="assets/img/banner/recharge-offer.jpg" alt="img" />
                  </div>
                  <div className="pay__sponsor__item">
                    <img src="assets/img/banner/recharge-offer.jpg" alt="img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
