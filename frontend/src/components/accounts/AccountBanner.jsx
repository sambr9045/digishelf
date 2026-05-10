import React from "react";
import { ChevronRight, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import Header from "../Header/Header";

export default function AccountBanner({ title }) {
  return (
    <>
      <Header />

      <section className="relative overflow-hidden bg-[#211722] pt-32 text-white">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[#10ac84]/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-16 h-96 w-96 rounded-full bg-[#551839]/45 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#9ff1dd]">
                <UserRound className="h-4 w-4" />
                Account
              </span>
              <h1 className="mt-5 text-5xl font-black tracking-[-0.055em] sm:text-6xl">
                {title}
              </h1>
              <p className="mb-0 mt-4 max-w-2xl text-lg leading-8 text-white/65">
                Manage your Digishelves activity, profile details, and checkout
                history in one place.
              </p>
            </div>

            <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm font-black text-white/70">
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-white/35" />
              <span className="text-white">{title}</span>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
