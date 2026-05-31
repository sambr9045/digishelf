import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import { SessionContext } from "../components/sessionContext";
import { api_endpoint } from "../components/constant";
import { createWebPageSchema } from "../utils/seo";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession, setCartUpdated } = useContext(SessionContext);

  const stateEmail = location.state?.email || "";
  const stateSession = location.state?.verificationSession || "";

  const [verificationSession, setVerificationSession] = useState(stateSession);
  const [email, setEmail] = useState(stateEmail);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(stateEmail);

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const codeRefs = useRef([]);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // If the page was reached without a session, redirect to signup
  useEffect(() => {
    if (!stateSession) {
      navigate("/signup", { replace: true });
    }
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setCode(next);
    const lastFilled = Math.min(pasted.length, CODE_LENGTH - 1);
    codeRefs.current[lastFilled]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      toast.error("Enter the full 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      await axios.post(`${api_endpoint}/api/auth/email/verify/`, {
        code: fullCode,
        verification_session: verificationSession,
      });
      setVerified(true);
      toast.success("Email verified! You can now sign in.");
      setTimeout(() => navigate("/signin"), 2200);
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid or expired code.");
      setCode(Array(CODE_LENGTH).fill(""));
      codeRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const response = await axios.post(
        `${api_endpoint}/api/auth/email/resend-verification/`,
        {
          verification_session: verificationSession,
          email: email,
        },
      );
      const data = response.data;
      if (data.verification_session) {
        setVerificationSession(data.verification_session);
      }
      if (data.email) {
        setEmail(data.email);
        setNewEmail(data.email);
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("A new code was sent to your email.");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Could not resend code. Try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleSaveEmail = async () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (trimmed === email) {
      setEditingEmail(false);
      return;
    }
    setResending(true);
    try {
      const response = await axios.post(
        `${api_endpoint}/api/auth/email/resend-verification/`,
        {
          verification_session: verificationSession,
          email: trimmed,
        },
      );
      const data = response.data;
      if (data.verification_session) {
        setVerificationSession(data.verification_session);
      }
      setEmail(data.email || trimmed);
      setNewEmail(data.email || trimmed);
      setEditingEmail(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCode(Array(CODE_LENGTH).fill(""));
      toast.success("Email updated and a new code was sent.");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Could not update email. Try again.",
      );
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
        <Header />
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#10ac84]" />
            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">
              Email verified!
            </h1>
            <p className="mt-3 text-[#665b67]">Redirecting you to sign in…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
      <Seo
        title="Verify Your Email"
        description="Verify your Digishelves email address to activate your account."
        path="/verify-email"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Verify Your Email — Digishelves",
          description:
            "Verify your Digishelves email address to activate your account.",
          path: "/verify-email",
        })}
      />
      <Header />

      <main className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_0.8fr] lg:px-8">
          <section>
            <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm">
              Email verification
            </span>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              Check your inbox for your verification code.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#665b67]">
              We sent a 6-digit code to{" "}
              <span className="font-black text-[#211722]">{email}</span>. Enter
              it below to activate your account.
            </p>

            <div className="mt-8 rounded-[2rem] bg-[#211722] p-6 text-white shadow-2xl shadow-[#551839]/15">
              <ShieldCheck className="h-7 w-7 text-[#10ac84]" />
              <p className="mb-0 mt-4 text-xl font-black">
                The code expires in 15 minutes.
              </p>
              <p className="mb-0 mt-2 text-sm font-bold text-white/60">
                Check your spam folder if you don't see it.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(33,23,34,0.18)] sm:p-8">
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f1e8]">
              <Mail className="h-6 w-6 text-[#551839]" />
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
              Verify your email
            </h2>
            <p className="mt-2 text-[#665b67]">
              Enter the 6-digit code sent to your email.
            </p>

            {/* Email display / edit */}
            <div className="mt-5 rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 py-3">
              {editingEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-[#eadfe7] bg-white px-3 py-2 text-sm font-bold text-[#211722] outline-none focus:border-[#551839] focus:ring-2 focus:ring-[#551839]/10"
                    placeholder="new@email.com"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    disabled={resending}
                    className="shrink-0 rounded-xl bg-[#551839] px-3 py-2 text-sm font-black text-white transition hover:bg-[#44122d] disabled:opacity-60"
                  >
                    {resending ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmail(false);
                      setNewEmail(email);
                    }}
                    className="shrink-0 rounded-xl border border-[#eadfe7] px-3 py-2 text-sm font-black text-[#665b67] transition hover:border-[#551839]/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-black text-[#211722]">
                    {email}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingEmail(true)}
                    className="shrink-0 text-xs font-black text-[#551839] transition hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Code input */}
            <form onSubmit={handleVerify} className="mt-6">
              <p className="mb-3 text-sm font-black text-[#332834]">
                Verification code
              </p>
              <div className="flex gap-2" onPaste={handleCodePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      codeRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleCodeChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleCodeKeyDown(index, event)}
                    className="h-14 w-full max-w-[3rem] rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] text-center text-xl font-black text-[#211722] outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={verifying || code.join("").length < CODE_LENGTH}
                className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#551839] font-black text-white transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying ? "Verifying…" : "Verify email"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eadfe7] pt-5">
              <span className="text-sm font-bold text-[#665b67]">
                Didn't receive the code?
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-sm font-black text-[#551839] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resending
                    ? "Sending…"
                    : "Resend code"}
              </button>
            </div>

            <p className="mb-0 mt-5 text-center text-sm font-bold text-[#665b67]">
              Wrong account?{" "}
              <Link to="/signup" className="text-[#551839]">
                Start over
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
