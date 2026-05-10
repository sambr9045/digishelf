import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import {
  TopUpProvider,
  TopUpContext,
} from "../components/Context/TopUpContext";
import StepTwo from "../utils/topUp/StepTwo";
import StepThree from "../utils/topUp/StepThree";
import { createWebPageSchema } from "../utils/seo";

export default function TopUpCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const init = location.state;

  if (!init) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <TopUpProvider initialData={{ ...init, steps: 2 }}>
      <CheckoutContent />
    </TopUpProvider>
  );
}

function CheckoutContent() {
  const { steps } = useContext(TopUpContext);
  const isPaymentStep = steps === 3;

  const stepItems = [
    { id: 1, label: "Number", done: true },
    { id: 2, label: "Amount" },
    { id: 3, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
      <Seo
        title="Airtime Top-up Checkout"
        description="Review your Digishelves airtime order and complete checkout securely."
        path="/top-up/checkout"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Airtime Top-up Checkout",
          description:
            "Review your Digishelves airtime order and complete checkout securely.",
          path: "/top-up/checkout",
        })}
      />
      <Header />
      <ToastContainer position="top-center" theme="colored" />

      <main className="relative overflow-hidden pt-28 pb-20 sm:pt-32">
        <div className="absolute left-[-10rem] top-12 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-[-8rem] top-24 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl pointer-events-none" />

        <div
          className={`relative mx-auto px-4 sm:px-6 ${
            isPaymentStep ? "max-w-6xl" : "max-w-2xl"
          }`}
        >
          {/* Step indicator */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-y-3">
            {stepItems.map((stepItem, index) => (
              <React.Fragment key={stepItem.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all ${
                      stepItem.done || steps >= stepItem.id
                        ? "bg-[#551839] text-white shadow-lg shadow-[#551839]/20"
                        : "bg-[#f0e9ef] text-[#7a6a76]"
                    }`}
                  >
                    {stepItem.id}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-[0.18em] ${
                      stepItem.done || steps >= stepItem.id
                        ? "text-[#551839]"
                        : "text-[#81727d]"
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
                {index < stepItems.length - 1 && (
                  <div
                    className={`mb-0 h-1 w-10 rounded-full sm:mb-6 sm:w-16 ${
                      stepItem.done || steps > stepItem.id
                        ? "bg-[#551839]"
                        : "bg-[#eadfe7]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="lg:rounded lg:border lg:border-[#eadfe7] lg:bg-white lg:p-5 lg:shadow-[0_30px_90px_rgba(33,23,34,0.1)] xl:p-7">
            {steps === 2 && <StepTwo />}
            {steps === 3 && <StepThree />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
