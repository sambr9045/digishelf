import React from "react";
import Footer from "../components/Footer/Footer";
import Banner from "../components/Banner";

import support from "../assets/images/refer/support.png";
import redericon from "../assets/images/refer/redericon.png";
import payicon from "../assets/images/refer/payicon.png";
import payment from "../assets/images/refer/payment.png";
import suppoticon from "../assets/images/refer/suppoticon.png";
import flowerrefer from "../assets/images/refer/flowerrefer.png";

import boxspeaker from "../assets/images/refer/boxspeaker.png";
import boxregister from "../assets/images/refer/boxregister.png";
import boxamount from "../assets/images/refer/boxamount.png";
import boxwithdrow from "../assets/images/refer/boxwithdrow.png";
import redercards from "../assets/images/refer/redercards.png";
import referman from "../assets/images/refer/referman.png";

import walletpro from "../assets/images/working/walletpro.png";
import find from "../assets/images/working/find.png";
import mobilepro from "../assets/images/working/mobilepro.png";
import working3shape from "../assets/images/working/working3shape.png";
import { TopUpProvider } from "../components/Context/TopUpContext";

export default function Home() {
  return (
    <>
      <TopUpProvider>
        <Banner />
      </TopUpProvider>

      <section className="working__section__three bgsection pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center ">
            <div className="col-lg-6">
              <div className="section__header section__center pb__40">
                <h2>How It’s Work</h2>
                <p>
                  Discover the simple steps involved in using our service with
                  our easy-to-follow guide.
                </p>
              </div>
            </div>
          </div>
          <div className="row g-4 justify-content-center align-items-center">
            <div className="col-lg-5 col-md-5">
              <div className="working__wrapitems__three">
                <div className="row justify-content-between">
                  <div className="col-xl-12 working__space">
                    <div className="working__itemstwo affter__one">
                      <span className="list">01</span>
                      <div className="icon">
                        <img src={find} alt="find" />
                      </div>
                      <div className="content">
                        <h5>Choose Network Provider </h5>
                        <p>
                          Select from a list of available network providers to
                          ensure compatibility with your mobile service
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-12">
                    <div className="working__itemstwo affter__three">
                      <span className="list">03</span>
                      <div className="icon">
                        <img src={mobilepro} alt="mobielpro" />
                      </div>
                      <div className="content">
                        <h5>Choose payment method </h5>
                        <p>
                          Complete your transaction securely using
                          cryptocurrency or a credit card for instant airtime
                          credit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-2">
              <div className="borders"></div>
            </div>
            <div className="col-xl-5 col-md-5">
              <div className="working__itemstwo affter__two">
                <span className="list">02</span>
                <div className="icon">
                  <img src={walletpro} alt=" walletpro" />
                </div>
                <div className="content">
                  <h5>Enter your number and amount </h5>
                  <p>
                    Input your mobile number and specify the amount of airtime
                    you wish to purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="working__3shape">
          <img src={working3shape} alt="working3shape" />
        </div>
      </section>

      {/* support system */}

      <section className="support__section pt-120 pb-120">
        <div className="container">
          <div className="row flex-row-reverse justify-content-between align-items-center">
            <div className="col-xl-6 col-lg-6">
              <div className="support__content">
                <div className="section__header pb__40 wow fadeInDown">
                  <h2>Enjoy our Speacial supports</h2>
                  <p>
                    Benefit from our exceptional support services tailored to
                    meet your unique needs.
                  </p>
                </div>
                <div className="row g-4">
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 wow fadeInUp"
                    data-wow-duration="0.8s"
                  >
                    <div className="support__contentbox">
                      <div className="thumb">
                        <img src={payment} alt="payment" />
                      </div>
                      <h5>
                        <a href="help-support.html">Secure Payment</a>
                      </h5>
                    </div>
                  </div>
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 wow fadeInUp"
                    data-wow-duration="1s"
                  >
                    <div className="support__contentbox">
                      <div className="thumb">
                        <img src={redericon} alt="redericon" />
                      </div>
                      <h5>
                        <a href="help-support.html">Refer & Earn</a>
                      </h5>
                    </div>
                  </div>
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 wow fadeInUp"
                    data-wow-duration="1.4s"
                  >
                    <div className="support__contentbox">
                      <div className="thumb">
                        <img src={payicon} alt="payicon" />
                      </div>
                      <h5>
                        <a href="help-support.html">Trust pay</a>
                      </h5>
                    </div>
                  </div>
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 wow fadeInUp"
                    data-wow-duration="1.6s"
                  >
                    <div className="support__contentbox">
                      <div className="thumb">
                        <img src={suppoticon} alt="img" />
                      </div>
                      <h5>
                        <a href="help-support.html">24X7 Support</a>
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5">
              <div className="support__thumb wow fadeInUp">
                <img src={support} alt="support" />
              </div>
            </div>
          </div>
        </div>
        <div className="flower__shape">
          <img src={flowerrefer} alt="flowerrefer" />
        </div>
      </section>

      {/* refer and earn */}

      <section className="refer__section__two pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section__header section__center pb__40 wow fadeInDown">
                <h2>Refer & Earn</h2>
                <p>
                  Refer your friends and earn up to $20. These rewards can be
                  applied towards airtime top-ups, bill payments, or withdrawn
                  as cash, providing you with versatile financial options
                </p>
              </div>
            </div>
          </div>
          <div className="row pb__40 g-4 align-items-center">
            <div
              className="col-xl-3 col-lg-3 col-md-6 wow fadeInDown"
              data-wow-duration="0.5s"
            >
              <div className="refer__item refer__item__grid">
                <div className="icon">
                  <img src={boxspeaker} alt="boxspeaker" />
                </div>
                <div className="content">
                  <h5>
                    <a href="help-support.html" className="dtext">
                      Refer your friends
                    </a>
                  </h5>
                  <p>Share your referral link with friends. Thry get &10.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-3 col-md-6 wow fadeInDown"
              data-wow-duration="0.9s"
            >
              <div className="refer__item refer__item__grid">
                <div className="icon">
                  <img src={boxregister} alt="boxregister" />
                </div>
                <div className="content">
                  <h5>
                    <a href="help-support.html" className="dtext">
                      Register yor friends
                    </a>
                  </h5>
                  <p>Your friends Register with using your referral link.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-3 col-md-6 wow fadeInDown"
              data-wow-duration="1s"
            >
              <div className="refer__item refer__item__grid">
                <div className="icon">
                  <img src={boxamount} alt="boxamount" />
                </div>
                <div className="content">
                  <h5>
                    <a href="help-support.html" className="dtext">
                      Earn You
                    </a>
                  </h5>
                  <p>$20. You can use these credits to take recharge.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-3 col-md-6 wow fadeInDown"
              data-wow-duration="1.5s"
            >
              <div className="refer__item refer__item__grid">
                <div className="icon">
                  <img src={boxwithdrow} alt="boxwithdrow" />
                </div>
                <div className="content">
                  <h5>
                    <a href="help-support.html" className="dtext">
                      Withdrow
                    </a>
                  </h5>
                  <p>$20. You can use these credits to take recharge.</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="more text-center wow fadeInDown"
            data-wow-duration="1.9s"
          >
            <a href="help-support.html" className="cmn__btn">
              <span>Get Started Earn</span>
            </a>
          </div>
        </div>
        <div className="refercard">
          <img src={redercards} alt="redercards" />
        </div>
        <div className="referman">
          <img src={referman} alt="referman" />
        </div>
      </section>

      <Footer />
    </>
  );
}
