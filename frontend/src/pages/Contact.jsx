import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Link } from "react-router-dom";
import map from "../assets/images/signup/map.png";
import email from "../assets/images/signup/email.png";
import phone from "../assets/images/signup/phone.png";
import contact from "../assets/images/refer/contact.svg";
import contact2 from "../assets/images/refer/contact2.svg";
import axios from "axios";
import { api_endpoint } from "../components/constant";
import ReCAPTCHA from "react-google-recaptcha";
import Loader from "../components/includes/Loader";
import { toast } from "react-toastify";
export default function Contact() {
  const [capTchaToken, setCapTchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setsuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevState) => ({
      ...prevState,
      [name]: "",
    }));
  };

  const sitekey = "6LfHphYqAAAAANnmoQKL9PLw5nLOuejl4sbifpj_";
  const onChange = async (value) => {
    setCapTchaToken(value);
    setCaptchaError(""); // Clear CAPTCHA error when new token is set
  };

  const validate = () => {
    const errors = {};
    if (!formState.name) {
      errors.name = "Name is required";
    }
    if (!formState.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = "Email is invalid";
    }
    if (!formState.message) {
      errors.message = "Message is required";
    }
    return errors;
  };

  const submitData = async (data) => {
    try {
      const response = await axios.post(`${api_endpoint}/api/contact/`, data);
      if (response.data) {
        setsuccess(
          "Thank you for reaching out , Our team will get back to you as soon as possible"
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error!! Something went wrong please try again later.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else if (capTchaToken === "") {
      setCaptchaError("Invalid CAPTCHA !!!");
    } else {
      // Form is valid, proceed with form submission (e.g., send data to server)
      const data = { formData: formState, token: capTchaToken };
      const response = await submitData(data);
      console.log("Form submitted successfully", formState);
      // Clear the form and errors
      setFormState({ name: "", email: "", message: "" });
      setErrors({});
      setCaptchaError(""); // Clear CAPTCHA error
    }

    setIsLoading(false);
  };

  return (
    <div>
      <Header />

      {isLoading && (
        <>
          <Loader />
        </>
      )}
      <section className="breadcumnd__banner">
        <div className="container">
          <div className="breadcumnd__wrapper">
            <h2 className="bread__title">Contact Us</h2>
            <ul className="breadcumnd__link">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li>
              <li>
                <a href="javascript:void(0)">Pages</a>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="contact__section pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center wow fadeInDown">
            <div className="col-lg-6">
              <div className="section__header section__center pb__60">
                <h2>Get in touch with us.</h2>
                <p>
                  Fill up the form and our team will get back to you within 24
                  hours
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-6">
              <div className="mt-0 mb-5">
                <img
                  src={contact2}
                  alt="contact us"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="signup__boxes">
                <form action="#0" className="signup__form pt__40">
                  <div className="row g-4 justify-content-center">
                    {success && (
                      <>
                        <div
                          className="alert alert-success"
                          style={{ width: "100%" }}
                        >
                          {success}
                        </div>
                      </>
                    )}
                    <div className="col-lg-6">
                      <div className="input__grp">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formState.name}
                          placeholder="What's your name?"
                          onChange={handleChange}
                        />
                        {errors.name && (
                          <span style={{ color: "red" }}>{errors.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input__grp">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formState.email}
                          placeholder="What's your email?"
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <span style={{ color: "red" }}>{errors.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input__grp">
                        <label htmlFor="comment">Message</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          id="comment"
                          name="message"
                          value={formState.message}
                          placeholder="Your message..."
                          onChange={handleChange}
                        ></textarea>
                        {errors.message && (
                          <span style={{ color: "red" }}>{errors.message}</span>
                        )}
                      </div>
                    </div>
                    <ReCAPTCHA sitekey={sitekey} onChange={onChange} />,
                    {captchaError && (
                      <span style={{ color: "red" }}>{captchaError}</span>
                    )}
                    <div className="col-lg-12">
                      <div className="input__grp mt-2 text-center">
                        <button
                          type="submit"
                          className="cmn__btn form-control pt-3 pb-3"
                          onClick={handleSubmit}
                        >
                          <span>Send Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact__need pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center wow fadeInDown">
            <div className="col-lg-6">
              <div className="section__header section__center pb__60">
                <h2>Need More Help?</h2>
                <p>
                  Queries, complaints and feedback. We will be happy to serve
                  you
                </p>
              </div>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="contact__need__item">
                <div className="icon d-flex align-items-center justify-content-center">
                  <img src={phone} alt="phone" />
                </div>
                <h5>Call Now</h5>
                <a href="javascript:void(0)">
                  <span className="fz-18 mb-1 fw-400 lato dtext d-block">
                    (907) 555-0101
                  </span>
                  <span className="fz-18 fw-400 lato dtext d-block">
                    (252) 555-0126
                  </span>
                </a>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="contact__need__item">
                <div className="icon d-flex align-items-center justify-content-center">
                  <img src={email} alt="email" />
                </div>
                <h5>Email Address</h5>
                <a href="javascript:void(0)">
                  <span className="fz-18 mb-1 fw-400 lato dtext d-block">
                    support@digishelft.co
                  </span>
                  <span className="fz-18 fw-400 lato dtext d-block">
                    info@digishelft.co
                  </span>
                </a>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="contact__need__item">
                <div className="icon d-flex align-items-center justify-content-center">
                  <img src={map} alt="map" />
                </div>
                <h5>Location</h5>
                <a href="javascript:void(0)">
                  <span className="fz-18 mb-1 fw-400 lato dtext d-block">
                    Royal Ln. Mesa, New Jersey 45463
                  </span>
                  <span className="fz-18 fw-400 lato dtext d-block">
                    Thornridge Cir. Shiloh, Hawaii 81063
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
