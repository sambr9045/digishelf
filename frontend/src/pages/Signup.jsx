import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import signup from "../assets/images/signup/signup.png";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "../assets/css/custom.css";
import axios from "axios";

export default function Signup() {
  const [SignupError, setSignupError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accountCreated, setAccountCreated] = useState("");
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
    console.log(data);
    // setUser(data.user);
    // localStorage.setItem("access_token", data.access);
    // localStorage.setItem("refresh_token", data.refresh);
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
        <section className="signup__section ">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-xl-5 col-lg-5">
                <div className="signup__boxes">
                  <h4>Let's Get Started!</h4>
                  <p className="head__pra">
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
                      <div className=" alert alert-success mt-4" role="alert">
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
                          url={"http://127.0.0.1:8000/api/auth/google/signup/"}
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
                        &nbsp;Sign up with Email
                      </button>
                    </div>
                  )}
                  {showForm && (
                    <form
                      className="signup__form pt__40"
                      onSubmit={handleFormSubmit}
                    >
                      <div className="row g-4">
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
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="input__grp">
                            <label htmlFor="email">Enter Email Address *</label>
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
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="input__grp">
                            <label htmlFor="password">Enter Password *</label>
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
                              <a href="#0">Communication Authorization</a>.
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
                  )}
                </div>
              </div>
              <div className="col-xl-5 col-lg-6">
                <div className="signup__thumb">
                  <img src={signup} alt="Signup" />
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
