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
                  Sign in to your account and make recharges, and Bill payment
                  faster
                </p>

                <div className="choose-login-method mb-5 mt-5">
                  <button className="btn btn-danger form-control mt-2 pt-2 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="24"
                      height="24"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      ></path>
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      ></path>
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                    </svg>
                    &nbsp;Login with Google
                  </button>
                  <button className="btn btn-primary form-control mt-2 pt-2 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    &nbsp;Login with Facebook
                  </button>
                  <button
                    className="btn btn-secondary-outline border form-control mt-2 pt-2 pb-2"
                    style={{ backgroundColor: "none!important;" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    &nbsp;Login with Email
                  </button>
                </div>
                {/* <form action="#0" className="signup__form">
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
                </form> */}
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
