import React from "react";
import Header from "../components/Header/Header";
import { Link } from "react-router-dom";
import bb1 from "../assets/images/banner/three/bb1.png";
import bb2 from "../assets/images/banner/three/bb2.png";
import bb3 from "../assets/images/banner/three/bb3.png";
import bb4 from "../assets/images/banner/three/bb4.png";
import booksolving from "../assets/images/banner/booksolving.png";
import qustion from "../assets/images/refer/qustion.png";
import qustionshape from "../assets/images/refer/qustion-shape.png";
import Footer from "../components/Footer/Footer";

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
                  <h2>We Provide Recharge, Bill Payment and Gift Card</h2>
                  <p>
                    Enjoy easy mobile recharge and bill payments, with the added
                    flexibility to pay securely using credit cards or
                    cryptocurrency.
                  </p>
                </div>
                <ul className="explore__list explore__list__about pb__40">
                  <li>
                    <span>
                      <img src={bb1} alt="bb1" />
                    </span>
                    <span>100% Secure</span>
                  </li>
                  <li>
                    <span>
                      <img src={bb2} alt="bb2" />
                    </span>
                    <span>Trust pay</span>
                  </li>
                  <li>
                    <span>
                      <img src={bb3} alt="bb3" />
                    </span>
                    <span>Refer & Earn</span>
                  </li>
                  <li>
                    <span>
                      <img src={bb4} alt="bb4" />
                    </span>
                    <span>24X7 Support</span>
                  </li>
                </ul>
                <a href="blog-details.html" className="cmn__btn">
                  <span>Explore deals</span>
                </a>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="booksolving__thumb">
                <img src={booksolving} alt="booksolving" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="question__section bgsection pt-120 pb-120">
        <div className="container">
          <div className="row flex-row-reverse  justify-content-between align-items-center">
            <div className="col-xl-6 col-lg-6">
              <div className="qustion__content relative">
                <div className="section__header pb__40 wow fadeInDown">
                  <h2>If you got questions we have answer</h2>
                  <p>
                    There are many variations of passages of Lorem Ipsum
                    available, but the have suffered alteration in some form, by
                    injected humour, or randomised words which don't look even
                    slightly believable. If you are going to use... have
                    suffered alteration in some form, by injected humour, or
                    randomised words which don't look even slightly believable.
                    If you are going to use...
                  </p>
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
                          What is e recharge?
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
                            Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. Lorem Ipsum has been the
                            industry's standard dummy text ever since the 1500s,
                            when
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
                          What is recharge credit?
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
                            Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. Lorem Ipsum has been the
                            industry's standard dummy text ever since the 1500s,
                            when
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
                          How reliable is recharge com?
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
                            Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. Lorem Ipsum has been the
                            industry's standard dummy text ever since the 1500s,
                            when
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
                <img src={qustion} alt="qustion" />
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
