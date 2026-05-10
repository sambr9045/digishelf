import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

const sections = [
  {
    title: "1. Scope",
    body: "This Privacy Policy describes how Digishelves collects, uses, stores, and shares personal data when you use our gift card and airtime top-up services.",
  },
  {
    title: "2. Information We Collect",
    body: "Depending on your use of the platform, we may collect account details (such as email and profile data), order and transaction data, gift card and top-up fulfillment details, support messages, analytics events, and security logs.",
  },
  {
    title: "3. IP Address And Device Data",
    body: "Yes, we may collect and process IP address and technical context. In our current implementation this may be used for analytics event logging, contact-form anti-abuse/rate limiting, admin security audits, and transaction support context.",
  },
  {
    title: "4. Transaction And Fulfillment Data",
    body: "We process payment references, wallet addresses, token and amount details, order status, blockchain confirmation data, recipient email/phone/country details, and provider response payloads required to fulfill your order.",
  },
  {
    title: "5. Analytics Data",
    body: "We process analytics session keys, event types, page path/title, product interactions, cart counts, metadata, IP address, and user-agent data to understand product usage, monitor performance, and improve service quality.",
  },
  {
    title: "6. How We Use Data",
    body: "We use personal data to provide services, process and fulfill orders, communicate status updates, prevent fraud and abuse, secure the platform, improve operations, and comply with legal obligations.",
  },
  {
    title: "7. Legal Bases",
    body: "Where applicable, we process data based on contract performance, legitimate interests (including security and fraud prevention), legal obligations, and consent where required.",
  },
  {
    title: "8. Sharing And Processors",
    body: "We may share data with service providers and infrastructure partners involved in payment processing, fulfillment, communications, abuse prevention, authentication, hosting, and analytics. We do not sell personal data for monetary compensation.",
  },
  {
    title: "9. Cookies And Local Storage",
    body: "Our frontend uses browser storage for operational needs, including session state, cart state, analytics session keys, country/IP helper values, and exchange-rate cache data.",
  },
  {
    title: "10. Data Retention",
    body: "We retain data for as long as needed for service delivery, support, fraud prevention, compliance, auditing, and dispute handling, or as required by law.",
  },
  {
    title: "11. Security",
    body: "We apply reasonable technical and organizational safeguards to protect data. No method of storage or transmission is fully secure, and you are responsible for safeguarding your account credentials.",
  },
  {
    title: "12. Your Rights",
    body: "Subject to applicable law, you may have rights to request access, correction, deletion, portability, objection, restriction, or withdrawal of consent. Contact us to make a request.",
  },
  {
    title: "13. Policy Updates",
    body: "We may revise this Privacy Policy from time to time. The updated version takes effect when posted on this page.",
  },
  {
    title: "14. Contact",
    body: "For privacy inquiries, contact info@digishelves.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="Privacy Policy | Digishelves"
        description="Read how Digishelves collects and uses personal data, including account, order, analytics, and security information."
        keywords={[
          "Digishelves privacy policy",
          "gift card privacy",
          "crypto payments privacy",
          "airtime top-up privacy",
        ]}
        path="/privacy-policy"
        schema={[
          createWebPageSchema({
            title: "Privacy Policy | Digishelves",
            description:
              "Read how Digishelves collects and uses personal data, including account, order, analytics, and security information.",
            path: "/privacy-policy",
          }),
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy-policy" },
          ]),
        ]}
      />
      <Header />

      <section className="bg-[#f7f1e8] pt-28 pb-12 sm:pt-32 sm:pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-[#665b67]">
            Effective Date: May 10, 2026
          </p>
          <p className="mt-6 text-lg leading-8 text-[#5d505b]">
            This policy explains the personal data we collect and process when
            you use Digishelves.
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
