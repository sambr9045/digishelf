import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Mail,
  Phone,
  Radio,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Loader from "../includes/Loader";
import Seo from "../Seo";
import { api_endpoint } from "../constant";
import { createWebPageSchema } from "../../utils/seo";

function formatDate(datetimeString) {
  if (!datetimeString) {
    return "N/A";
  }

  const date = new Date(datetimeString);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white">
          <Icon className="h-5 w-5 text-[#551839]" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            {label}
          </p>
          <p className="mb-0 break-words text-lg font-black text-[#211722]">
            {value || "N/A"}
          </p>
          {helper ? (
            <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
              {helper}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function TopUpSuccess() {
  const { reference: completionToken } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  const fetchOrderData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api_endpoint}/api/payments/completion/${completionToken}/`,
      );
      setOrderData(response.data?.data || null);
    } catch (error) {
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReference = async () => {
    if (!orderData?.reference) {
      return;
    }

    await navigator.clipboard.writeText(orderData.reference);
    toast.success("Transaction ID copied.");
  };

  useEffect(() => {
    fetchOrderData();
  }, [completionToken]);

  return (
    <>
      <Seo
        title="Top-up Complete"
        description="View your completed Digishelves airtime top-up and transaction details."
        path={`/top-up/success/${completionToken}`}
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Top-up Complete",
          description:
            "View your completed Digishelves airtime top-up and transaction details.",
          path: `/top-up/success/${completionToken}`,
        })}
      />
      <Header />
      {isLoading ? <Loader /> : null}

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(85,24,57,0.08),_transparent_34%),linear-gradient(180deg,#fbf8f4_0%,#fffdfb_100%)] pt-28">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-md border border-[#eadfe7] bg-white shadow-[0_28px_90px_rgba(33,23,34,0.12)]">
              <div className="bg-[#211722] px-6 py-8 text-white sm:px-8 sm:py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                      Top-up completed
                    </p>
                    <h1 className="mb-0 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                      Airtime sent successfully
                    </h1>
                    <p className="mt-3 mb-0 max-w-xl text-sm font-bold leading-6 text-white/72 sm:text-base">
                      Your payment was confirmed and the airtime order has been
                      completed.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 self-start rounded-full bg-white/10 px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff8ef]">
                      <CheckCircle2 className="h-5 w-5 text-[#067a5f]" />
                    </span>
                    <div>
                      <p className="mb-0 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Status
                      </p>
                      <p className="mb-0 text-sm font-black text-white">
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_340px]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                    icon={Receipt}
                    label="Transaction ID"
                    value={orderData?.reference}
                    helper="Keep this for support and order tracking."
                  />
                  <SummaryCard
                    icon={CalendarDays}
                    label="Completed on"
                    value={formatDate(orderData?.created_at)}
                  />
                  <SummaryCard
                    icon={Phone}
                    label="Phone number"
                    value={orderData?.phone_number}
                  />
                  <SummaryCard
                    icon={Radio}
                    label="Network"
                    value={orderData?.operator}
                  />
                  <SummaryCard
                    icon={CheckCircle2}
                    label="Recipient gets"
                    value={
                      orderData
                        ? `${orderData.receiver_amount} ${orderData.receiver_currency_code}`
                        : "N/A"
                    }
                  />
                  <SummaryCard
                    icon={Mail}
                    label="Receipt email"
                    value={orderData?.email}
                  />
                </div>

                <aside className="rounded-md border border-[#eadfe7] bg-[#fbf8f4] p-5">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#9a8b97]">
                    Completion summary
                  </p>
                  <h2 className="mb-0 text-2xl font-black tracking-[-0.04em] text-[#211722]">
                    Top-up completed
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#665b67]">
                    Your airtime has been delivered successfully. You can close
                    this page now. A confirmation email has also been sent.
                  </p>

                  <div className="mt-6 rounded-md bg-white p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                      Reference
                    </p>
                    <p className="mb-0 break-all text-base font-black text-[#211722]">
                      {orderData?.reference || completionToken}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <button
                      type="button"
                      onClick={copyReference}
                      disabled={!orderData?.reference}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#551839] px-5 text-sm font-black text-white disabled:opacity-60"
                    >
                      <Copy className="h-4 w-4" />
                      Copy transaction ID
                    </button>

                    <button
                      type="button"
                      onClick={fetchOrderData}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-white px-5 text-sm font-black text-[#551839]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh status
                    </button>

                    <Link
                      to="/top-up"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#eadfe7] bg-transparent px-5 text-sm font-black text-[#665b67]"
                    >
                      Start another top-up
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
