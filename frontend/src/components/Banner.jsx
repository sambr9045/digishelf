import React, { useContext } from "react";
import { motion } from "framer-motion";
import Header from "./Header/Header";
import { TopUpContext } from "./Context/TopUpContext";

import "react-intl-tel-input/dist/main.css";
import StepOne from "../utils/topUp/StepOne";
import StepTwo from "../utils/topUp/StepTwo";
import StepThree from "../utils/topUp/StepThree";
import StepFour from "../utils/topUp/StepFour";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";
import { CircleCheck, ShieldCheck, Sparkles } from "lucide-react";

export default function Banner() {
  const { steps } = useContext(TopUpContext);
  const stepItems = [
    { id: 1, label: "Number" },
    { id: 2, label: "Amount" },
    { id: 3, label: "Payment" },
  ];

  return (
    <>
      <Header />
      <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#f7f1e8] pt-24 pb-14 md:pt-28 lg:pb-16">
        <div className="absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-[32rem] w-[32rem] rounded-full bg-[#551839]/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_0.82fr] lg:justify-between xl:gap-20">
            <motion.div
              className="order-2 space-y-6 lg:order-1"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#551839]/15 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" strokeWidth={2.3} />
                Instant global top-up
              </div>

              <div className="max-w-2xl space-y-4">
                <h1 className="text-5xl font-black leading-[0.96] tracking-[-0.055em] text-[#211722] sm:text-6xl">
                  Send airtime without the clutter.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-[#5f5360]">
                  Enter a number, choose an amount, and pay securely. The page
                  stays focused on the next action.
                </p>
              </div>

              <div className="grid max-w-xl gap-3 text-[#332834] sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 text-sm font-bold shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <CircleCheck className="h-5 w-5 text-[#10ac84]" />
                  Auto detects network
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 text-sm font-bold shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-[#551839]" />
                  Secure payment flow
                </div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 w-full lg:order-2"
              initial={{ opacity: 0, y: 34, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            >
              <div className="relative mx-auto max-w-lg rounded-[2rem] border border-white/70 bg-white/85 p-3 shadow-[0_30px_90px_rgba(33,23,34,0.18)] backdrop-blur-xl">
                <div className="rounded-[1.6rem] bg-white">
                  <div className="border-b border-[#efe7ed] p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      {stepItems.map((stepItem, index) => (
                        <React.Fragment key={stepItem.id}>
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all ${
                                steps >= stepItem.id
                                  ? "bg-[#551839] text-white shadow-lg shadow-[#551839]/20"
                                  : "bg-[#f0e9ef] text-[#7a6a76]"
                              }`}
                            >
                              {stepItem.id}
                            </div>
                            <span
                              className={`text-xs font-bold uppercase tracking-[0.18em] ${
                                steps >= stepItem.id
                                  ? "text-[#551839]"
                                  : "text-[#81727d]"
                              }`}
                            >
                              {stepItem.label}
                            </span>
                          </div>
                          {index < stepItems.length - 1 && (
                            <div
                              className={`mb-6 h-1 w-8 rounded-full sm:w-12 ${
                                steps > stepItem.id
                                  ? "bg-[#551839]"
                                  : "bg-[#eadfe7]"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    {steps === 1 && <StepOne />}
                    {steps === 2 && <StepTwo />}
                    {steps === 3 && <StepThree />}
                    {steps === 4 && <StepFour />}
                  </div>

                  <div className="flex items-start gap-3 border-t border-[#efe7ed] bg-[#fbf8f4] p-5">
                    <ShieldCheck
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#10ac84]"
                      strokeWidth={2.2}
                    />
                    <span className="text-sm leading-6 text-[#615768]">
                      <span className="font-black text-[#211722]">
                        Secure and encrypted.
                      </span>{" "}
                      Your top-up details stay protected during checkout.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
