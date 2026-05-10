import React, { useContext } from "react";
import { Gift, UserRound, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

import AccountBanner from "./AccountBanner";
import RecentActivities from "./details/RecentActivities";
import Footer from "../Footer/Footer";
import Seo from "../Seo";
import { SessionContext } from "../sessionContext";
import { createWebPageSchema } from "../../utils/seo";

export default function MyAccount() {
  const { session } = useContext(SessionContext);
  const firstName = session?.user?.first_name || session?.user?.username;
  const email = session?.user?.email;

  return (
    <>
      <Seo
        title="My Account"
        description="Manage your Digishelves account activity, saved details, and repeat purchases."
        path="/account"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves My Account",
          description: "Manage your Digishelves account activity, saved details, and repeat purchases.",
          path: "/account",
        })}
      />
      <AccountBanner title="Account" />

      <main className="bg-[#fbf8f4] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-[2rem] border border-[#eadfe7] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#551839] text-2xl font-black text-white">
                  {(email || firstName || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="mb-1 text-sm font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                    Welcome back
                  </p>
                  <h2 className="mb-0 text-3xl font-black tracking-[-0.05em] text-[#211722]">
                    {firstName || "Your Digishelves account"}
                  </h2>
                  {email && (
                    <p className="mb-0 mt-1 text-sm font-bold text-[#665b67]">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/profile-settings"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-[#fbf8f4] px-5 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-white"
              >
                <UserRound className="h-4 w-4" />
                Edit profile
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
            <RecentActivities />

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-[#eadfe7] bg-[#211722] p-6 text-white shadow-2xl shadow-[#551839]/15">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10ac84] text-[#13251f]">
                  <Gift className="h-6 w-6" />
                </div>
                <h3 className="mb-0 mt-5 text-2xl font-black tracking-[-0.04em] text-white">
                  Refer a friend
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-white/65">
                  Make 5 top-ups to unlock friend invites and discount rewards.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex text-sm font-black text-[#9ff1dd] transition hover:text-white"
                >
                  Start with a top-up
                </Link>
              </div>

              <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf8f4] text-[#551839]">
                  <WalletCards className="h-6 w-6" />
                </div>
                <h3 className="mb-0 mt-5 text-2xl font-black tracking-[-0.04em] text-[#211722]">
                  Faster checkout
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-[#665b67]">
                  Your account keeps activity and profile details ready for
                  repeat top-ups and gift-card purchases.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
