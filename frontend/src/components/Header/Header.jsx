import React from "react";
import logo from "../../assets/images/logo.png";

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
                <a href="signin.html" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </a>
                <a href="signup.html" className="cmn__btn">
                  <span>Signup</span>
                </a>
              </div>
              <div className="header-bar d-lg-none">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <ul className="main-menu">
              <li className="grid__style">
                <a href="javascript:void(0)" className="d-flex">
                  <span>Home</span>
                </a>
              </li>
              <li className="grid__style">
                <a href="javascript:void(0)" className="d-flex">
                  <span>Top-up</span>
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" className="d-flex">
                  <span>Gift cards</span>
                </a>
              </li>
              <li className="grid__style">
                <a href="javascript:void(0)" className="d-flex">
                  <span>Pay bills</span>
                  <span className="icons">
                    {/* <i className="material-symbols-outlined">expand_more</i> */}
                  </span>
                </a>
              </li>
              <li className="grid__style">
                <a href="javascript:void(0)" className="d-flex">
                  <span>About us </span>
                  <span className="icons">
                    {/* <i className="material-symbols-outlined">expand_more</i> */}
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" className="d-flex">
                  <span>Faq</span>
                </a>
              </li>
              <li className="sigup__grp d-lg-none d-flex align-items-center">
                <a href="signin.html" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </a>
                <a href="signup.html" className="cmn__btn">
                  <span>Signup</span>
                </a>
              </li>
            </ul>
            <div className="sigin__grp d-flex align-items-center">
              <a href="signin.html" className="cmn__btn outline__btn">
                <span>Signin</span>
              </a>
              <a href="signup.html" className="cmn__btn">
                <span>Signup</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
