import React from "react";
import Header from "../components/Header/Header";
import { Link } from "react-router-dom";
import payment2 from "../assets/images/refer/payment2.png";
import payicon from "../assets/images/refer/payicon.png";
import redericon from "../assets/images/refer/redericon.png";
import suppoticon from "../assets/images/refer/suppoticon.png";
import about_team_work from "../assets/images/svg/about_team_work.svg";
import about_faq from "../assets/images/svg/about_faq.svg";
import qustionshape from "../assets/images/refer/qustion-shape.png";
import Footer from "../components/Footer/Footer";
import about_us_top_up from "../assets/images/svg/about_us_top_up.svg";
import about_gift_card from "../assets/images/svg/about_gift_card.svg";

export default function About() {
  return (
    <div>
      <Header />
      <section className="breadcumnd__banner">
        <div className="container">
          <div className="breadcumnd__wrapper">
            <h2 className="bread__title">About us</h2>
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
              <li>About us</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="booksolving__section pt-120 pb-120">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-xl-6 col-lg-6 col-md-7">
              <div className="booksolving__content custome__about1">
                <div className="section__header mb__30 wow fadeInDown">
                  <h2>
                    We Provide Instant Recharge, Bill Payment and Gift Card
                  </h2>
                  <p>
                    Enjoy easy mobile recharge and bill payments, with the added
                    flexibility to pay securely using credit cards or
                    cryptocurrency.
                  </p>
                </div>
                <ul className="explore__list explore__list__about pb__40">
                  <li className="p-3">
                    <span>
                      <img src={payment2} alt="bb1" />
                    </span>
                    <span>100% Secure</span>
                  </li>
                  <li className="p-3">
                    <span>
                      <img src={payicon} alt="bb2" />
                    </span>
                    <span>Trust pay</span>
                  </li>
                  <li className="p-3">
                    <span>
                      <img
                        src={redericon}
                        alt="bb3"
                        className="about_us_icon"
                      />
                    </span>
                    <span>Refer & Earn</span>
                  </li>
                  <li className="p-3">
                    <span>
                      <img src={suppoticon} alt="bb4" />
                    </span>
                    <span>24X7 Support</span>
                  </li>
                </ul>
                <a href="/" className="cmn__btn">
                  <span>Top-Up</span>
                </a>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="booksolving__thumb">
                <img src={about_team_work} alt="booksolving" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 
      <section className="question__section pt-120 pb-120">
        <div className="text-center">
          <h1 className="basecolor_custom fs-1 mb-5">Our services</h1>

          <div className="row mt-5 justify-content-center">
            <div className="col-lg-10 d-flex">
              <div className="col-lg-4 m-3">
                <div className="card text-center shadow-sm">
                  <img
                    className="card-img-top text-center"
                    src={about_us_top_up}
                    alt="Card image cap"
                    style={{ width: "" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">Airtime top-up</h5>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the card's content.
                    </p>
                    <a href="#" className="btn btn-primary">
                      Go somewhere
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 m-3">
                <div className="card text-center shadow-sm">
                  <img
                    className="card-img-top text-center"
                    src={about_gift_card}
                    alt="Card image cap"
                    style={{ width: "" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">Gift Card</h5>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the card's content.
                    </p>
                    <a href="#" className="btn btn-primary">
                      Go somewhere
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-4"></div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="question__section bgsection pt-120 pb-120">
        <div className="container">
          <div className="row flex-row-reverse  justify-content-between align-items-center">
            <div className="col-xl-6 col-lg-6">
              <div className="qustion__content relative">
                <div className="section__header pb__40 wow fadeInDown">
                  <h2>DIGISHELF instant airtime top-up and gift card sales</h2>
                  {/* <p>
                    DigitShelf is an innovative online platform dedicated to
                    providing instant airtime top-ups and digital gift cards to
                    users worldwide.
                    <br />
                    Our platform leverages cutting-edge technology and
                    user-centric design to deliver seamless and secure
                    transactions.
                    <br />
                    We aim to serve a growing community of users by offering
                    24/7 online Live Support and a variety of local and global
                    payment methods.
                    <br />
                  </p> */}
                </div>
                <div className="accordion__wrap">
                  <div className="accordion" id="accordionExample">
                    <div
                      className="accordion-item wow fadeInUp"
                      data-wow-duration="0.9s"
                    >
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                        >
                          What is e Digishelf?
                        </button>
                      </h2>
                      <div
                        id="collapseOne"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingOne"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <p>
                            {" "}
                            DigitShelf is an innovative online platform
                            dedicated to providing instant airtime top-ups and
                            digital gift cards to users worldwide.
                          </p>

                          <p>
                            We aim to serve a growing community of users by
                            offering 24/7 online Live Support and a variety of
                            local and global payment methods. Our commitment to
                            trustworthy service and exceptional user experience
                            sets us apart as a reliable digital hub.
                          </p>

                          <p>
                            As DigitShelf launches, we are excited to grow by
                            continuously expanding our range of services and
                            partnering with leading brands to offer the best
                            digital solutions to our customers.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="accordion-item wow fadeInUp"
                      data-wow-duration="1.2s"
                    >
                      <h2 className="accordion-header" id="headingTwo">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseTwo"
                          aria-expanded="false"
                          aria-controls="collapseTwo"
                        >
                          What payment methods does DigiShelf accept?
                        </button>
                      </h2>
                      <div
                        id="collapseTwo"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingTwo"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <p>
                            DigitShelf is pleased to offer a variety of secure
                            payment methods to accommodate our diverse customer
                            base. We currently accept Visa credit cards and
                            various forms of cryptocurrency, ensuring a
                            convenient and flexible payment experience for all
                            our users.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="accordion-item wow fadeInUp"
                      data-wow-duration="1.4s"
                    >
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseThree"
                          aria-expanded="false"
                          aria-controls="collapseThree"
                        >
                          How reliable is Digishelf?
                        </button>
                      </h2>
                      <div
                        id="collapseThree"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <p>
                            At DigitShelf, reliability is our top priority. We
                            employ state-of-the-art technology and stringent
                            security measures to ensure that our platform is
                            always available and transactions are processed
                            smoothly. Our dedicated team of professionals works
                            tirelessly to maintain high standards of service and
                            support, ensuring that you can trust DigitShelf for
                            all your digital needs. With round-the-clock
                            monitoring and robust infrastructure, we guarantee a
                            dependable and seamless user experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-5 col-lg-5 wow fadeInDown"
              data-wow-duration="0.9"
            >
              <div className="qustion__thumb">
                <img src={about_faq} alt="qustion" />
              </div>
            </div>
          </div>
        </div>
        <div className="qustion__shape">
          <img src={qustionshape} alt="qustionshape" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
