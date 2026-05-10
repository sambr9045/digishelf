import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, Search, TriangleAlert } from "lucide-react";

import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

export default function NotFound() {
  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="Page Not Found"
        description="The page you tried to open is not available. Return to Digishelves home or continue browsing gift cards."
        path="/404"
        robots="noindex, nofollow"
        schema={[
          createWebPageSchema({
            title: "Page Not Found",
            description:
              "The page you tried to open is not available. Return to Digishelves home or continue browsing gift cards.",
            path: "/404",
          }),
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "404", path: "/404" },
          ]),
        ]}
      />
      <Header />

      <main className="relative isolate overflow-hidden bg-[#f7f1e8] pb-20 pt-28 sm:pb-24 sm:pt-32">
        <div className="absolute left-[-9rem] top-16 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-0 h-[28rem] w-[28rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[2.25rem] border border-[#eadfe7] bg-white shadow-[0_24px_80px_rgba(33,23,34,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-[#211722] px-6 py-10 text-white sm:px-8 sm:py-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#9ff0d9]">
                  <TriangleAlert className="h-4 w-4" />
                  Error 404
                </span>
                <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-6xl">
                  This page does not exist.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-white/70 sm:text-lg">
                  The link may be broken, removed, or typed incorrectly. Use the
                  options here to get back to a valid page.
                </p>
              </div>

              <div className="px-6 py-10 sm:px-8 sm:py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#551839] text-white shadow-lg shadow-[#551839]/20">
                  <Compass className="h-8 w-8" />
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-[#9a8b97]">
                  What you can do
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.5rem] border border-[#efe7ed] bg-[#fbf8f4] p-5">
                    <p className="mb-1 text-lg font-black tracking-[-0.03em] text-[#211722]">
                      Return to the homepage
                    </p>
                    <p className="mb-0 text-sm leading-6 text-[#665b67]">
                      Restart from the main storefront and continue from there.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#efe7ed] bg-[#fbf8f4] p-5">
                    <p className="mb-1 text-lg font-black tracking-[-0.03em] text-[#211722]">
                      Browse available gift cards
                    </p>
                    <p className="mb-0 text-sm leading-6 text-[#665b67]">
                      Open the gift card catalog and continue shopping from a live page.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#551839] px-5 py-3 text-sm font-black text-white transition hover:bg-[#44122d]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                  </Link>
                  <Link
                    to="/gift-cards"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#551839]/15 bg-white px-5 py-3 text-sm font-black text-[#551839] transition hover:bg-[#fbf8f4]"
                  >
                    <Search className="h-4 w-4" />
                    Browse gift cards
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
