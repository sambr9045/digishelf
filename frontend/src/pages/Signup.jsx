import React, { useState, useContext } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.svg";
import signup_success from "../assets/images/signup/signup_success.svg";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { SessionContext } from "../components/sessionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "../assets/css/custom.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [SignupError, setSignupError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accountCreated, setAccountCreated] = useState("");
  const [accountSuccess, setAccountSuccess] = useState(false);
  const { session, setSession } = useContext(SessionContext);
  const [googelAuthenticating, setGoogleAuthenticating] = useState(false);
  const navigate = useNavigate();

  const [FormData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [FormError, setFormError] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const Process = async (formData) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/email/signup/",
        formData
      );
      if (response.status === 201) {
        setShowForm(false);
        setFormError({});
        setAccountSuccess(true);
        setAccountCreated(
          "Account successfully created. Please check your inbox for an email and follow the instructions to complete the process."
        );
      }
      // Handle successful signup, e.g., redirect or show success message
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setSignupError(error.response.data.error);
      } else {
        setSignupError("An error occurred during signup.");
      }
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Clear the error when user types
    setFormError((prevFormError) => ({
      ...prevFormError,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!FormData.fullname) {
      errors.fullname = "Full Name is required";
    } else if (FormData.fullname.length <= 2) {
      errors.fullname = "Full Name is too short";
    }

    if (!FormData.email || !emailRegex.test(FormData.email)) {
      errors.email = "Invalid email address";
    }

    if (FormData.password.length < 8) {
      errors.password = "Password is too short";
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      Process(FormData);
      // Submit form logic here
    }
  };

  const clientId =
    "1014448615483-g62js5lep5uq3lulr4tnquqkc0bvv5ab.apps.googleusercontent.com";

  const handleSignUp = (data) => {
    const session = {
      user: data.user,
      accessToken: data.access,
      refreshToken: data.refresh,
    };

    setSession(session);
    localStorage.setItem("session", JSON.stringify(session));
    setGoogleAuthenticating(false);
    // redirect to home page
    navigate("/");

    // setShowForm(false);
    // setFormError({});
    // setAccountSuccess(true);
    // setAccountCreated(
    //   "Account successfully created. Please check your inbox for an email and follow the instructions to complete the process."
    // );
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      setSignupError(errorMessage);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  return (
    <div>
      <Header />
      <div>
        <section className="signup__section pb__60">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-5 col-lg-5">
                <div
                  className={
                    googelAuthenticating
                      ? "signup__boxes processing_google_authentication"
                      : "signup__boxes "
                  }
                >
                  {accountSuccess ? (
                    <>
                      <div className=" text-center justify-content-center">
                        <img
                          src={signup_success}
                          alt="sigup_comple"
                          width="100px"
                          className="mt-4 mb-5"
                        />

                        <h4 className="text-success basecolor_custom">
                          Account Created successfully !
                        </h4>
                        <p className="mt-4">{accountCreated}</p>

                        <div className="login">
                          <Link
                            to="/signin"
                            className="cmn__btn form-control mt-3 p-3"
                          >
                            Sign In
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>Let's Get Started!</h4>
                      <p className="head__pra fs-6">
                        Please sign up to Digishelf to recharge, pay bills, and
                        more.
                      </p>
                      {SignupError && (
                        <div
                          className="login-display-error alert alert-danger mt-4"
                          role="alert"
                        >
                          <p>{SignupError}</p>
                        </div>
                      )}

                      {accountCreated && (
                        <>
                          <div
                            className=" alert alert-success mt-4"
                            role="alert"
                          >
                            <p>{accountCreated}</p>
                          </div>
                        </>
                      )}
                      {!showForm && (
                        <div className="choose-login-method mb-5 mt-5">
                          <GoogleOAuthProvider clientId={clientId}>
                            <GoogleLoginButton
                              onLogin={handleSignUp}
                              onError={handleError}
                              label={"Sign Up with Google"}
                              url={
                                "http://127.0.0.1:8000/api/auth/google/signup/"
                              }
                            />
                          </GoogleOAuthProvider>
                          <button
                            className="btn btn-secondary-outline border form-control mt-2 pt-2 pb-2 signupLoginwithButton"
                            onClick={() => setShowForm(true)}
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
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span
                              className=""
                              style={{
                                color: "gray",
                              }}
                            >
                              Sign up with Email
                            </span>
                          </button>

                          <div className="text-center mt-5 text-muted">
                            Already have account?
                            <Link to="/signin" className="basecolor_custom">
                              &nbsp;Login
                            </Link>
                          </div>
                        </div>
                      )}
                      {showForm && (
                        <form
                          className="signup__form pt__40"
                          onSubmit={handleFormSubmit}
                        >
                          <div className="row g-3">
                            <div className="col-lg-12">
                              <div className="input__grp">
                                <label htmlFor="fullname">Full Name *</label>
                                {FormError.fullname && (
                                  <p className="text-danger form_error">
                                    {FormError.fullname}
                                  </p>
                                )}
                                <input
                                  type="text"
                                  id="fullname"
                                  name="fullname"
                                  placeholder="Full Name"
                                  value={FormData.fullname}
                                  onChange={handleInputChange}
                                  className="shadow-sm"
                                />
                              </div>
                            </div>
                            <div className="col-lg-12">
                              <div className="input__grp">
                                <label htmlFor="email">
                                  Enter Email Address *
                                </label>
                                {FormError.email && (
                                  <p className="text-danger form_error">
                                    {FormError.email}
                                  </p>
                                )}
                                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  placeholder="Your email ID here"
                                  value={FormData.email}
                                  onChange={handleInputChange}
                                  className="shadow-sm"
                                />
                              </div>
                            </div>
                            <div className="col-lg-12">
                              <div className="input__grp">
                                <label htmlFor="password">
                                  Enter Password *
                                </label>
                                {FormError.password && (
                                  <p className="text-danger form_error">
                                    {FormError.password}
                                  </p>
                                )}
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  placeholder="Enter your password"
                                  value={FormData.password}
                                  onChange={handleInputChange}
                                  className="shadow-sm"
                                />
                              </div>
                            </div>
                            <div className="col-lg-12">
                              <div className="input__grp">
                                <p className="tag__pra fs-6">
                                  By clicking submit, you agree to&nbsp;
                                  <a href="#" className="">
                                    Terms of Use
                                  </a>
                                  ,&nbsp;<a href="#0">Privacy Policy</a>,&nbsp;
                                  <a href="#0">E-sign</a> &nbsp;&&nbsp;
                                  <a href="#0">Communication Authorization</a>.
                                </p>
                              </div>
                            </div>
                            <div className="col-lg-12">
                              <div className="input__grp mt-2">
                                <button
                                  type="submit"
                                  className="cmn__btn form-control p-3"
                                >
                                  <span>Signup</span>
                                </button>
                              </div>

                              <div className="text-center mt-5 text-muted">
                                Already have account?
                                <Link to="/signin" className="basecolor_custom">
                                  &nbsp;Login
                                </Link>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="col-xl-5 col-lg-6">
                <div className="signup__thumb">
                  <img src={signup} alt="Signup" width="400px" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
