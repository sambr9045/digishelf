import React, { useEffect } from "react";
import CheckoutBanner from "../CheckoutBanner";
import Footer from "../Footer/Footer";
import GiftCardPaymentSteps2 from "../includes/steps/GiftCardPaymentSteps2";

export default function Checkout() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <CheckoutBanner />
      <div className="container">
        <div className="cars__gridwrapper">
          <div className="row g-4 justify-content-center">
            <GiftCardPaymentSteps2 />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
