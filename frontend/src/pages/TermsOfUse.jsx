import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

const sections = [
  {
    title: "1. Acceptance Of Terms",
    body: "By accessing or using Digishelves, including our gift card and airtime top-up services, you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the services.",
  },
  {
    title: "2. Services",
    body: "Digishelves provides digital gift card purchases and airtime top-ups, with checkout and fulfillment workflows that include cryptocurrency payment options.",
  },
  {
    title: "3. Eligibility And Account Responsibility",
    body: "You must provide accurate information when creating an account or placing an order. You are responsible for all activity under your account and credentials.",
  },
  {
    title: "4. Crypto Payments",
    body: "Blockchain transactions are final once confirmed. You are responsible for using the correct wallet address, token, and network details shown at checkout. Orders are fulfilled only after the required payment confirmation and verification checks.",
  },
  {
    title: "5. Pricing, Availability, And Fees",
    body: "Product availability, pricing, exchange rates, and processing fees may change without notice. Final payable amounts are shown at checkout before you submit your order.",
  },
  {
    title: "6. Order Fulfillment",
    body: "Gift card and airtime fulfillment depends on third-party providers, regional support, and correct recipient details. We may decline or delay fulfillment where data is incorrect, payments are incomplete, or provider restrictions apply.",
  },
  {
    title: "7. Refunds",
    body: "Due to the digital and irreversible nature of blockchain payments and digital goods, completed and fulfilled transactions are generally non-refundable except where required by applicable law.",
  },
  {
    title: "8. Prohibited Use",
    body: "You must not use Digishelves for fraud, abuse, unlawful activity, unauthorized access attempts, sanctions violations, or any activity that interferes with service integrity or security.",
  },
  {
    title: "9. Third-Party Services",
    body: "We integrate with third-party vendors for identity, payment, fulfillment, anti-abuse, and infrastructure services. We are not liable for third-party downtime, outages, delays, or policy changes outside our reasonable control.",
  },
  {
    title: "10. Warranty Disclaimer",
    body: 'Services are provided on an "as is" and "as available" basis. To the maximum extent permitted by law, Digishelves disclaims all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.',
  },
  {
    title: "11. Limitation Of Liability",
    body: "To the fullest extent allowed by law, Digishelves is not liable for indirect, incidental, special, consequential, or punitive damages, including loss of funds, data, profits, or business opportunities.",
  },
  {
    title: "12. Suspension And Termination",
    body: "We may suspend or terminate access where we detect abuse, policy violations, fraud risk, legal risk, or security threats.",
  },
  {
    title: "13. Changes To These Terms",
    body: "We may update these Terms of Use from time to time. Updated versions apply from the date posted. Continued use after updates means you accept the revised terms.",
  },
  {
    title: "14. Contact",
    body: "For legal or support inquiries, contact us at info@digishelves.com.",
  },
];

export default function TermsOfUse() {
  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="Terms of Use | Digishelves"
        description="Read Digishelves terms governing gift card and airtime top-up services, payment rules, and platform usage."
        keywords={[
          "Digishelves terms of use",
          "gift card terms",
          "crypto checkout terms",
          "airtime top-up terms",
        ]}
        path="/terms-of-use"
        schema={[
          createWebPageSchema({
            title: "Terms of Use | Digishelves",
            description:
              "Read Digishelves terms governing gift card and airtime top-up services, payment rules, and platform usage.",
            path: "/terms-of-use",
          }),
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Terms of Use", path: "/terms-of-use" },
          ]),
        ]}
      />
      <Header />

      <section className="bg-[#f7f1e8] pt-28 pb-12 sm:pt-32 sm:pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-[#665b67]">
            Effective Date: May 10, 2026
          </p>
          <p className="mt-6 text-lg leading-8 text-[#5d505b]">
            These Terms govern your use of Digishelves services for digital gift
            cards and airtime top-ups.
          </p>
        </div>
      </section>

      <main className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-[#efe7ed] bg-[#fbf8f4] p-6 sm:p-8"
            >
              <h2 className="text-2xl font-black tracking-[-0.02em]">
                {section.title}
              </h2>
              <p className="mt-4 leading-8 text-[#5d505b]">{section.body}</p>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
