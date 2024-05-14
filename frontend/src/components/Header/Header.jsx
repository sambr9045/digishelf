import React from "react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <header className="header-section">
        <div className="container">
          <div className="header-wrapper">
            <div className="logo-menu">
              <a href="index.html" className="logo">
                <img src={logo} alt="logo" />
              </a>
              <a href="index.html" className="small__logo d-xl-none">
                <img src="assets/img/logo/favicon.png" alt="logo" />
              </a>
            </div>
            <div className="menu__right__components d-flex align-items-center">
              <div className="sigup__grp d-lg-none">
                <Link to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </Link>

                <Link to="/signup" className="cmn__btn">
                  Signup
                </Link>
              </div>
              <div className="header-bar d-lg-none">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <ul className="main-menu">
              <li className="grid__style">
                <Link to="/" className="d-flex">
                  Home{" "}
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/top-up" className="d-flex">
                  Top-up{" "}
                </Link>
              </li>
              <li>
                <Link to="/gift-cards" className="d-flex">
                  Gift cards{" "}
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/pay-bills" className="d-flex">
                  Pay Bills{" "}
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/about" className="d-flex">
                  About{" "}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="d-flex">
                  Contact{" "}
                </Link>
              </li>
              <li className="sigup__grp d-lg-none d-flex align-items-center">
                <Link to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </Link>

                <Link to="/signup" className="cmn__btn">
                  Signup
                </Link>
              </li>
            </ul>
            <div className="sigin__grp d-flex align-items-center">
              <Link to="/signin" className="cmn__btn outline__btn">
                <span>Signin</span>
              </Link>

              <Link to="/signup" className="cmn__btn">
                Signup
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
