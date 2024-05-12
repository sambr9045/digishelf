import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.png";

export default function Signup() {
  return (
    <div>
      <Header />
      <div>
        <section className="signup__section ">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-6 col-lg-6">
                <div className="signup__boxes">
                  <h4>Let's Get Started!</h4>
                  <p className="head__pra">
                    Please Enter your Email Addredd to Start your Online
                    Application
                  </p>
                  <form action="#0" className="signup__form pt__40">
                    <div className="row g-4">
                      <div className="col-lg-6">
                        <div className="input__grp">
                          <label htmlFor="fname">First Name</label>
                          <input type="text" id="fname" placeholder="Jone" />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input__grp">
                          <label htmlFor="lname">Last Name</label>
                          <input type="text" id="lname" placeholder="Fisher" />
                        </div>
                      </div>
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
                          <label htmlFor="code">Enter Your Email ID</label>
                          <input
                            type="text"
                            id="code"
                            placeholder="Enter the referral code"
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input__grp">
                          <p className="tag__pra">
                            By clicking submit, you agree to{" "}
                            <a href="#">Terms of Use</a>,{" "}
                            <a href="#0">Privacy Policy</a>,{" "}
                            <a href="#0">E-sign</a> &{" "}
                            <a href="#0">communication Authorization</a>.
                          </p>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input__grp mt-2">
                          <button type="submit" className="cmn__btn">
                            <span>Signup</span>
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
      </div>
      <Footer />
    </div>
  );
}
