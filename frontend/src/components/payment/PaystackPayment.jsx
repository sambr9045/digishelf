import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Seo from "../Seo";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { SessionContext } from "../sessionContext";
import { api_endpoint } from "../constant";

export default function PaystackPayment() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(SessionContext);
  const [message, setMessage] = useState("Checking your Paystack payment...");
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let polls = 0;
    const check = async () => {
      setChecking(true);
      try {
        const { data } = await axios.get(`${api_endpoint}/api/payments/paystack/verify/${reference}/`);
        if (cancelled) return;
        if (data.status === "paid") {
          clearCart();
          if (data.completion_token) {
            navigate(`/gift-card/payment-complete/${data.completion_token}`, { replace: true });
            return;
          }
          setMessage("Payment received. Your gift cards are being processed and will be sent to your email.");
        } else {
          setMessage("Payment is awaiting confirmation. You can check again or return to checkout.");
        }
        if (++polls < 12 && data.fulfillment_status !== "failed") timer = setTimeout(check, 10000);
      } catch {
        if (!cancelled) setMessage("We could not verify the payment yet. Check again to confirm its status.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    check();
    return () => { cancelled = true; clearTimeout(timer); };
    // Cart changes after confirmed payment must not restart verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, navigate, attempt]);

  return (
    <>
      <Seo title="Payment status | Digishelves" path={`/gift-card/paystack/${reference}`} robots="noindex,nofollow" />
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-2xl px-4 pb-16 pt-32">
        <h1 className="text-3xl font-black text-[#211722]">Paystack payment</h1>
        <p role="status" className="mt-4 text-lg">{message}</p>
        <button type="button" disabled={checking} onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-full bg-[#551839] px-6 py-3 font-bold text-white disabled:opacity-60">
          {checking ? "Checking..." : "Check payment status"}
        </button>
        <Link to="/gift-card" className="ml-4 text-[#551839]">Browse gift cards</Link>
      </main>
      <Footer />
    </>
  );
}
