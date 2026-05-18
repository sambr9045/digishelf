import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  BellRing,
  Gift,
  Globe2,
  Headphones,
  LockKeyhole,
  Repeat2,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

import Footer from "../components/Footer/Footer";
import Banner from "../components/Banner";
import Seo from "../components/Seo";
import { TopUpProvider } from "../components/Context/TopUpContext";
import {
  createBreadcrumbSchema,
  createOrganizationSchema,
  createWebPageSchema,
  createWebsiteSchema,
} from "../utils/seo";

const processSteps = [
  {
    icon: Smartphone,
    title: "Enter the number",
    text: "Start with the recipient phone number and country. Digishelves checks the route before you pay.",
  },
  {
    icon: BadgeDollarSign,
    title: "Choose an amount",
    text: "Pick a popular amount or enter a custom value with fees shown before checkout.",
  },
  {
    icon: Send,
    title: "Send securely",
    text: "Confirm payment and track the top-up through a clean, guided final step.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Fast checkout",
    text: "A focused top-up flow keeps the page clear and removes avoidable steps.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    text: "Designed for cross-border airtime, gift cards, and digital payments.",
  },
  {
    icon: LockKeyhole,
    title: "Protected payments",
    text: "Payment and recipient details stay inside a secure transaction flow.",
  },
  {
    icon: Headphones,
    title: "Human support",
    text: "Support is available when a transaction needs attention or confirmation.",
  },
];

const rewardSteps = [
  "Share your referral link",
  "Friends complete signup",
  "You earn flexible credits",
  "Use rewards or withdraw",
];

const sectionFade = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const staggerGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const fadeItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <>
      <Seo
        title="Airtime Top-ups and Gift Cards"
        description="Buy airtime top-ups and digital gift cards with a streamlined checkout flow on Digishelves."
        keywords={[
          "Digishelves",
          "airtime top-up",
          "digital gift cards",
          "crypto checkout",
          "mobile recharge",
        ]}
        path="/"
        schema={[
          createOrganizationSchema(),
          createWebsiteSchema(),
          createWebPageSchema({
            title: "Digishelves Airtime Top-ups and Gift Cards",
            description:
              "Buy airtime top-ups and digital gift cards with a streamlined checkout flow on Digishelves.",
            path: "/",
          }),
          createBreadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />
      <TopUpProvider>
        <Banner />
      </TopUpProvider>

      <main className="bg-white font-display text-[#211722]">
        <motion.section
          className="relative overflow-hidden py-20 sm:py-24"
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
        >
          <div className="absolute inset-x-6 top-12 h-32 rounded-full bg-[#10ac84]/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              variants={fadeItem}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e8] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839]">
                <Sparkles className="h-4 w-4" />
                How it works
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                A cleaner top-up flow from number to payment.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#665b67]">
                The homepage now explains the product with short, scannable
                steps and a checkout-first experience.
              </p>
            </motion.div>

            <motion.div
              className="mt-14 grid gap-5 lg:grid-cols-3"
              variants={staggerGroup}
            >
              {processSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.article
                    key={step.title}
                    variants={fadeItem}
                    className="group relative rounded-[2rem] border border-[#efe7ed] bg-[#fbf8f4] p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-[#551839]/10"
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#551839] text-white">
                        <Icon className="h-6 w-6" strokeWidth={2.2} />
                      </div>
                      <span className="text-5xl font-black tracking-[-0.08em] text-[#e7dce5]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black tracking-[-0.03em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 leading-7 text-[#675d68]">{step.text}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="bg-[#211722] py-20 text-white sm:py-24"
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <motion.div variants={fadeItem}>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#9ff0d9]">
                Why Digishelves
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                Built for repeat transactions, not one-off landing page polish.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/68">
                The refreshed page puts trust, speed, and product clarity in the
                same place as the form, so users know what to do next.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/gift-cards"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#211722] transition hover:bg-[#f7f1e8]"
                >
                  Explore gift cards
                  <Gift className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10"
                >
                  Contact support
                  <BellRing className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="grid gap-4 sm:grid-cols-2"
              variants={staggerGroup}
            >
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <motion.article
                    key={benefit.title}
                    variants={fadeItem}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:bg-white/[0.1]"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10ac84] text-[#13251f]">
                      <Icon className="h-6 w-6" strokeWidth={2.2} />
                    </div>
                    <h3 className="text-xl font-black tracking-[-0.03em] text-white">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 leading-7 text-white/62">
                      {benefit.text}
                    </p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="relative overflow-hidden py-20 sm:py-24"
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
        >
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#551839]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#10ac84]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 rounded-[2.5rem] border border-[#efe7ed] bg-[#fbf8f4] p-6 shadow-2xl shadow-[#551839]/8 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
              <motion.div
                className="rounded-[2rem] bg-white p-8"
                variants={fadeItem}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#551839] text-white">
                  <Repeat2 className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Refer, earn, and keep more value in the wallet.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#665b67]">
                  Referral rewards are easier to understand when the process is
                  direct: share, onboard, earn, and use the credit.
                </p>
              </motion.div>

              <motion.div
                className="grid content-center gap-4"
                variants={staggerGroup}
              >
                {rewardSteps.map((step, index) => (
                  <motion.div
                    key={step}
                    variants={fadeItem}
                    className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10ac84]/15 text-lg font-black text-[#08745a]">
                      {index + 1}
                    </div>
                    <p className="text-lg font-black tracking-[-0.02em]">
                      {step}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              className="mt-8 grid gap-4 sm:grid-cols-3"
              variants={staggerGroup}
            >
              <motion.div
                className="rounded-3xl bg-[#f7f1e8] p-6"
                variants={fadeItem}
              >
                <WalletCards className="h-7 w-7 text-[#551839]" />
                <p className="mt-4 font-black">Flexible reward usage</p>
              </motion.div>
              <motion.div
                className="rounded-3xl bg-[#e9f8f3] p-6"
                variants={fadeItem}
              >
                <ShieldCheck className="h-7 w-7 text-[#08745a]" />
                <p className="mt-4 font-black">Transparent redemption</p>
              </motion.div>
              <motion.div
                className="rounded-3xl bg-[#211722] p-6 text-white"
                variants={fadeItem}
              >
                <Gift className="h-7 w-7 text-[#9ff0d9]" />
                <p className="mt-4 font-black">Gift cards and top-ups</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </>
  );
}
