import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.png";

export default function Signin() {
  return (
    <div>
      <Header />
      <section className="signup__section ">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-6 col-lg-6">
              <div className="signup__boxes">
                <h4>Sign in to Digishelf</h4>
                <p className="head__pra mb__30">
                  Sign in to your account and make recharges. payments and Bill
                  payment faster
                </p>
                <form action="#0" className="signup__form">
                  <div className="row g-4">
                    <div className="col-lg-12">
                      <div className="input__grp">
                        <label htmlFor="email">Enter Your Email ID</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="Your email ID here"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input__grp">
                        <label htmlFor="pass">Enter Your Password</label>
                        <input
                          type="text"
                          id="pass"
                          placeholder="Your Password"
                        />
                      </div>
                    </div>
                    <a href="javascript:void(0)" className="forgot">
                      Forgot Password?
                    </a>
                    <div className="col-lg-12">
                      <div className="input__grp">
                        <button type="submit" className="cmn__btn">
                          <span>Sign In</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-xl-5 col-lg-6">
              <div className="signup__thumb">
                <img src={signup} alt="img" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
