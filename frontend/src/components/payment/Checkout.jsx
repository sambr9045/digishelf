import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Seo from "../Seo";
import GiftCardPaymentSteps2 from "../includes/steps/GiftCardPaymentSteps2";
import { createWebPageSchema } from "../../utils/seo";

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stepItems = [
    { label: "Review order", active: currentStep >= 1 },
    { label: "Delivery email", active: currentStep >= 2 },
    { label: "Secure payment", active: currentStep >= 2 },
  ];

  return (
    <div className="min-h-screen bg-[#fbf8f4] font-display text-[#211722]">
      <Seo
        title="Gift Card Checkout"
        description="Review your Digishelves gift card cart and complete checkout securely."
        path="/checkout"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Gift Card Checkout",
          description: "Review your Digishelves gift card cart and complete checkout securely.",
          path: "/checkout",
        })}
      />
      <Header />

      <main className="pt-20">
        <section className="border-b border-[#eadfe7] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f1e8] text-[#551839]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h1 className="mb-0 text-xl font-black tracking-[-0.04em] text-[#211722]">
                Checkout
              </h1>
            </div>
            <div className="inline-flex flex-wrap items-center gap-2 text-sm font-bold text-[#9a8b97]">
              <Link to="/" className="transition hover:text-[#551839]">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#551839]">Checkout</span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
          <div className="mb-6 grid gap-3 rounded-[2rem] border border-[#eadfe7] bg-white p-4 shadow-[0_18px_55px_rgba(33,23,34,0.06)] sm:p-5 md:grid-cols-3">
            {stepItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  item.active
                    ? "border-[#551839] bg-[#551839] text-white shadow-[0_14px_35px_rgba(85,24,57,0.12)]"
                    : "border-[#eadfe7] bg-[#fbf8f4] text-[#3d3440]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    item.active
                      ? "bg-white text-[#551839]"
                      : "bg-white text-[#8d7d89]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm font-black">{item.label}</span>
              </div>
            ))}
          </div>

          <GiftCardPaymentSteps2 onStepChange={setCurrentStep} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
