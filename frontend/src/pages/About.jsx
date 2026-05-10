import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  Globe2,
  Headphones,
  LockKeyhole,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

const services = [
  {
    icon: Smartphone,
    title: "Airtime top-up",
    text: "Send mobile credit through a guided checkout with operator detection and clear fees.",
  },
  {
    icon: Gift,
    title: "Digital gift cards",
    text: "Search brands by country and buy digital cards with a consistent purchase flow.",
  },
  {
    icon: LockKeyhole,
    title: "Secure payment",
    text: "Designed around protected checkout, transparent totals, and reliable order records.",
  },
];

const values = [
  { icon: Globe2, title: "Global access" },
  { icon: Headphones, title: "Responsive support" },
  { icon: WalletCards, title: "Flexible payments" },
];

export default function About() {
  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="About Digishelves"
        description="Learn how Digishelves combines airtime top-ups and digital gift cards into one focused digital checkout experience."
        keywords={[
          "about Digishelves",
          "digital checkout",
          "airtime top-up",
          "gift cards",
        ]}
        path="/about"
        schema={[
          createWebPageSchema({
            title: "About Digishelves",
            description:
              "Learn how Digishelves combines airtime top-ups and digital gift cards into one focused digital checkout experience.",
            path: "/about",
            type: "AboutPage",
          }),
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <Header />

      <section className="relative isolate overflow-hidden bg-[#f7f1e8] pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <motion.div
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm">
              <Sparkles className="h-4 w-4" />
              About Digishelves
            </span>
            <h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              A simpler way to send digital value.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#665b67]">
              Digishelves brings airtime top-ups and gift cards into one focused
              digital checkout experience built for speed, clarity, and trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#551839] px-5 py-3 font-black text-white transition hover:bg-[#44122d]"
              >
                Start a top-up
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/gift-cards"
                className="inline-flex items-center gap-2 rounded-full border border-[#551839]/15 bg-white/70 px-5 py-3 font-black text-[#551839] transition hover:bg-white"
              >
                Browse gift cards
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <main>
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="rounded-[2rem] border border-[#efe7ed] bg-[#fbf8f4] p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-[#551839]/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#551839] text-white">
                      <Icon className="h-6 w-6" strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-7 text-2xl font-black tracking-[-0.03em]">
                      {service.title}
                    </h3>
                    <p className="mt-3 leading-7 text-[#665b67]">
                      {service.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#211722] py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#9ff0d9]">
                Our approach
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                Keep every transaction understandable.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/68">
                We focus on the moments that matter: identify the recipient,
                show the value, confirm the payment, and keep the user informed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6"
                  >
                    <Icon className="h-7 w-7 text-[#10ac84]" />
                    <p className="mb-0 mt-5 font-black">{value.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
