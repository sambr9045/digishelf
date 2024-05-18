import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.png";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "../assets/css/custom.css";

export default function Signin() {
  const [LoginError, setLoginError] = useState("");
  const clienId =
    "1014448615483-g62js5lep5uq3lulr4tnquqkc0bvv5ab.apps.googleusercontent.com";
  const handleLogin = (data) => {
    console.log(data);
    // setUser(data.user);
    // localStorage.setItem("access_token", data.access);
    // localStorage.setItem("refresh_token", data.refresh);
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      // Display error toast for invalid username
      setLoginError(errorMessage);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  return (
    <div>
      <Header />
      <section className="signup__section ">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-4 col-lg-4 col-md-6">
              <div className="signup__boxes">
                <h4>Sign in to Digishelf</h4>
                <p className="head__pra mb__30">
                  Sign in to your account and make recharges, and Bill payment
                  faster
                </p>

                {LoginError && (
                  <>
                    <div
                      className="login-display-error alert alert-danger"
                      role="alert"
                    >
                      <p className="">{LoginError}</p>
                    </div>
                  </>
                )}
                <div className="choose-login-method mb-5 mt-5">
                  <GoogleOAuthProvider clientId={clienId}>
                    <GoogleLoginButton
                      onLogin={handleLogin}
                      onError={handleError}
                      label={"Sign in with Google"}
                      url={"http://127.0.0.1:8000/api/auth/google/"}
                    />
                  </GoogleOAuthProvider>
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
