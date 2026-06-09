import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing, browsing, creating an account, or using any service provided by Digishelves, you acknowledge that you have read, understood, and agreed to these Terms of Use and our Privacy Policy.",
    ],
  },
  {
    title: "2. Services",
    body: [
      "Digishelves operates as an online marketplace that facilitates the purchase and delivery of digital gift cards, airtime top-ups, and other digital products.",
      "Products available on the platform may be sourced through third-party distribution providers.",
      "We reserve the right to modify, suspend, discontinue, or limit any service at any time without prior notice.",
    ],
  },
  {
    title: "3. Eligibility and Account Responsibility",
    body: [
      "You must provide accurate, complete, and current information when creating an account or placing an order.",
      "You are responsible for maintaining the confidentiality of your account credentials and all activities conducted through your account.",
      "Digishelves is not responsible for losses resulting from unauthorized access caused by your failure to protect your account credentials.",
    ],
  },
  {
    title: "4. Crypto Payments",
    body: [
      "Digishelves may accept cryptocurrency payments through third-party payment processors.",
      "Blockchain transactions are irreversible once confirmed.",
      "You are solely responsible for sending funds to the correct wallet address and network.",
      "Transactions sent to an incorrect address or network may be permanently lost.",
      "Orders are fulfilled only after payment confirmations and any required verification checks have been completed.",
    ],
  },
  {
    title: "5. Pricing, Availability, and Fees",
    body: [
      "Product availability, pricing, exchange rates, processing fees, and applicable charges may change without notice.",
      "The final amount payable will be displayed at checkout before you submit your order.",
      "We reserve the right to correct pricing errors, cancel affected orders, or limit quantities where necessary.",
    ],
  },
  {
    title: "6. Order Fulfillment",
    body: [
      "Order fulfillment depends on product availability, third-party provider availability, regional restrictions, payment verification, and the accuracy of information supplied by the customer.",
      "Digishelves may delay, reject, or cancel orders where payment verification fails, fraud is suspected, product availability changes, required information is incomplete, or provider restrictions apply.",
    ],
  },
  {
    title: "7. Refunds",
    body: [
      "Due to the digital nature of gift cards, airtime top-ups, and cryptocurrency transactions, completed and fulfilled transactions are generally non-refundable.",
      "Refunds may be issued only where required by applicable law or where Digishelves determines, at its sole discretion, that a refund is appropriate.",
    ],
  },
  {
    title: "8. Prohibited Use",
    body: [
      "You agree not to use Digishelves for fraudulent or deceptive activities, money laundering, unauthorized access attempts, malware distribution, or violations of applicable laws.",
      "You must not engage in activities that interfere with the security, stability, or operation of the platform.",
    ],
  },
  {
    title: "9. Third-Party Services",
    body: [
      "Digishelves relies on third-party providers for payment processing, identity verification, gift card fulfillment, airtime delivery, fraud prevention, hosting, infrastructure, and related services.",
      "We are not responsible for delays, outages, service interruptions, policy changes, pricing changes, or errors caused by third-party providers beyond our reasonable control.",
    ],
  },
  {
    title: "10. Intellectual Property",
    body: [
      "The Digishelves website, including its design, content, software, graphics, branding, text, and functionality, is owned by or licensed to Digishelves and is protected by applicable intellectual property laws.",
      "You may not copy, distribute, modify, reverse engineer, or exploit any portion of the platform without prior written permission.",
      "Third-party trademarks, logos, and brand names displayed on the platform remain the property of their respective owners.",
    ],
  },
  {
    title: "11. Compliance and Fraud Prevention",
    body: [
      "Digishelves reserves the right to conduct verification checks and monitor transactions to prevent fraud, abuse, unauthorized activity, and legal violations.",
      "We may request additional verification information, delay or cancel orders, refuse service, suspend accounts, or cooperate with payment providers, rights holders, law enforcement agencies, regulators, and service providers where required by law.",
    ],
  },
  {
    title: "12. Warranty Disclaimer",
    body: [
      'The Digishelves platform and services are provided on an "as is" and "as available" basis.',
      "To the maximum extent permitted by law, Digishelves disclaims all warranties, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted availability.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Digishelves shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages, including loss of profits, revenue, data, goodwill, business opportunities, digital assets, or funds arising from your use of the platform.",
      "Our total liability for any claim relating to the services shall not exceed the amount paid by you for the specific transaction giving rise to the claim.",
    ],
  },
  {
    title: "14. Suspension and Termination",
    body: [
      "Digishelves may suspend, restrict, or terminate access to the platform at any time where we determine that these Terms have been violated, fraud or abuse is detected, security risks exist, or legal concerns arise.",
    ],
  },
  {
    title: "15. Changes to These Terms",
    body: [
      "We may update these Terms from time to time.",
      "Updated versions become effective upon publication on our website. Continued use of Digishelves after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "16. Trademarks, Brand References, and Third-Party Products",
    body: [
      "All trademarks, service marks, logos, trade names, and brand names displayed on Digishelves are the property of their respective owners.",
      "References to third-party brands are provided solely for the purpose of identifying the products and services available through our platform.",
      "Digishelves operates as an independent marketplace and, unless expressly stated otherwise, is not affiliated with, endorsed by, sponsored by, or associated with any brand, trademark owner, product issuer, or rights holder featured on the website.",
      "Gift cards, airtime products, and other digital products available through Digishelves may be sourced through authorized third-party distribution providers.",
      "The appearance of a brand name, logo, trademark, or product on the platform does not imply any direct relationship, partnership, endorsement, sponsorship, or approval by the respective trademark owner.",
      "If you are a trademark owner, authorized representative, or rights holder and believe that content on Digishelves infringes your rights or may create confusion regarding affiliation, you may contact us and we will promptly review the matter and take appropriate action where necessary.",
    ],
  },
  {
    title: "17. Contact Information",
    body: [
      "For legal, compliance, intellectual property, or support inquiries, please contact:",
      "support@digishelves.com",
    ],
  },
];

export default function TermsOfUse() {
  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="Terms of Use | Digishelves"
        description="Read Digishelves Terms of Use governing digital gift cards, airtime top-ups, cryptocurrency payments, platform usage, trademarks, and legal policies."
        keywords={[
          "Digishelves terms of use",
          "gift card terms",
          "crypto checkout terms",
          "airtime top-up terms",
          "digital products terms",
          "gift card marketplace",
        ]}
        path="/terms-of-use"
        schema={[
          createWebPageSchema({
            title: "Terms of Use | Digishelves",
            description:
              "Read Digishelves Terms of Use governing digital gift cards, airtime top-ups, cryptocurrency payments, platform usage, trademarks, and legal policies.",
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
            Effective Date: June 9, 2026
          </p>

          <p className="mt-6 text-lg leading-8 text-[#5d505b]">
            These Terms of Use govern your access to and use of Digishelves,
            including the purchase of digital gift cards, airtime top-ups, and
            related digital products.
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

              {section.body.map((paragraph, index) => (
                <p key={index} className="mt-4 leading-8 text-[#5d505b]">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
