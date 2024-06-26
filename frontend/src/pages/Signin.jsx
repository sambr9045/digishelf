import React, { useState, useContext } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.png";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionContext } from "../components/sessionContext";
import { ToastContainer, toast } from "react-toastify";
import "../assets/css/custom.css";
import { Link, useNavigate } from "react-router-dom";
export default function Signin() {
  const [LoginError, setLoginError] = useState("");
  const clienId =
    "1014448615483-g62js5lep5uq3lulr4tnquqkc0bvv5ab.apps.googleusercontent.com";
  const navigate = useNavigate();
  const { session, setSession } = useContext(SessionContext);

  const handleLogin = (data) => {
    const loading = toast.loading("Please wait processing");
    const session = {
      user: data.user,
      accessToken: data.access,
      refreshToken: data.refresh,
    };

    setSession(session);
    localStorage.setItem("session", JSON.stringify(session));
    // redirect to home page

    toast.update(loading, {
      render: "Successfully logged in!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
    });

    navigate("/");
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      // Display error toast for invalid username
      setLoginError(errorMessage);
      localStorage.removeItem("session");
    }
  };

  return (
    <div>
      <Header />
      <section className="signup__section ">
        <div className="container">
          <div className="row align-items-center justify-content-center mt__60 mb__60">
            <div className="col-xl-5 col-lg-5 col-md-6 mb__60">
              <div className="signup__boxes ">
                <h4 className="mt__30 ">
                  <b>Sign in</b>
                </h4>
                <p className="head__pra mb__30 text-muted">
                  Sign in to your account and make recharges, buy Gift cards,
                  and Bill payment
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
                      className="pt-3 pb-3 p-5"
                    />
                  </GoogleOAuthProvider>

                  <button
                    className="btn btn-secondary-outline border form-control mt-2 mb__30 shadow-md justify-content-center d-flex loginWith"
                    style={{
                      backgroundColor: "none!important;",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
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
                      className=""
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-muted">Login with Email</span>
                  </button>
                </div>

                {/* <div className="text-center mt-3">
                  <small className="text-muted">or</small>
                </div> */}

                <div className="text-center mt-3 text-muted">
                  Don't have an account?
                  <Link to="/signup" className="basecolor_custom">
                    &nbsp;Register
                  </Link>
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
            {/* <div className="col-xl-5 col-lg-6">
              <div className="signup__thumb">
                <img src={signup} alt="img" />
              </div>
            </div> */}
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
}
