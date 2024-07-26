import React from "react";
import logo from "../../assets/images/logo.png";
import logo4 from "../../assets/images/NLogo/logo4.png";

import twitter from "../../assets/images/svg/twitter.png";
import facebook from "../../assets/images/svg/facebook.png";
import ball from "../../assets/images/svg/ball.svg";
import linkedin from "../../assets/images/svg/linkedin.svg";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <>
      <footer className="footer__section bgsection pt-120">
        <div className="container">
          <div className="footer__wrapper">
            <div className="footer__top pb-120">
              <div className="row gy-5 gx-5">
                <div
                  className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6 wow fadeInUp"
                  data-wow-duration="1s"
                >
                  <div className="footer__widget">
                    <div className="widget__head mb__20">
                      <a href="index.html" className="footer__logo">
                        <img
                          src={logo4}
                          alt="logo"
                          style={{ width: "200px", height: "auto" }}
                        />
                      </a>
                    </div>
                    <p className="pratext mb__20 fz-18">
                      Empowering Connectivity, Gifting Convenience, Settling
                      Bills with Ease
                    </p>
                    <ul className="social d-flex gap-3">
                      <li>
                        <a href="javascript:void(0)" className="social__icon">
                          <img src={facebook} alt="svg" />
                        </a>
                      </li>
                      <li>
                        <a href="javascript:void(0)" className="social__icon">
                          <img src={linkedin} alt="svg" />
                        </a>
                      </li>
                      <li>
                        <a href="javascript:void(0)" className="social__icon">
                          <img src={twitter} alt="svg" />
                        </a>
                      </li>
                      {/* <li>
                        <a href="javascript:void(0)" className="social__icon">
                          <img src={ball} alt="svg" />
                        </a>
                      </li> */}
                    </ul>
                  </div>
                </div>
                <div
                  className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6 wow fadeInUp"
                  data-wow-duration="1.5s"
                >
                  <div className="footer__widget">
                    <div className="widget__head mb__20">
                      <h4 className="fz-24 pratext">Quick Links</h4>
                    </div>
                    <div className="widget__link">
                      <Link to="/" className="link fz-18 pratext">
                        Top-Up
                      </Link>
                      <Link to="/about" className="link fz-18 pratext">
                        About
                      </Link>

                      {/* <a href="index.html" className="link fz-18 pratext">
                        Bill Payment
                      </a> */}

                      <Link to="/gift-cards" className="link fz-18 pratext">
                        Gift cards
                      </Link>
                      <Link to="/contact" className="link fz-18 pratext">
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6 wow fadeInUp"
                  data-wow-duration="1.7s"
                >
                  <div className="footer__widget">
                    <div className="widget__head mb__20">
                      <h4 className="fz-24 pratext">Address</h4>
                    </div>
                    <div className="widget__link">
                      <a
                        href="javascript:void(0)"
                        className="link fz-18 pratext"
                      >
                        <span className="d-block">(480) 555-0103</span>
                        <span>(406) 555-0120</span>
                      </a>
                      <a
                        href="javascript:void(0)"
                        className="link fz-18 pratext"
                      >
                        <span className="d-block">support@digishelf.com</span>
                        <span>info@digishelf.com</span>
                      </a>
                      <a
                        href="javascript:void(0)"
                        className="link fz-18 pratext"
                      >
                        285 Great North Road, Grey Lynn, Auckland 1021
                      </a>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6 wow fadeInUp"
                  data-wow-duration="1.9s"
                >
                  <div className="footer__widget">
                    <div className="widget__head mb__20">
                      <h4 className="fz-24 pratext">Newsletter</h4>
                    </div>
                    <div className="widget__link">
                      <p className="fz-18 pratext mb__30">
                        Subscribe our newsletter to get our latest update & news
                      </p>
                      <form
                        action="javacript:void(0)"
                        className="d-flex justify-content-between"
                      >
                        <input type="email" placeholder="Your mail address" />
                        <button type="submit" className="cmn__btn">
                          <span>
                            <i className="material-symbols-outlined">
                              rocket_launch
                            </i>
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer__bottom d-flex">
              <p className="fz-18 pratext">
                Copyright &copy;2024
                <a href="/" className="base">
                  &nbsp;Digishelf.
                </a>
                All Rights Reserved
              </p>
              <ul className="footer__bottom__link">
                <li>
                  <a href="help-support.html">Support</a>
                </li>
                <li>
                  <a href="help-support.html">Terms of Use</a>
                </li>
                <li>
                  <a href="help.html">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
