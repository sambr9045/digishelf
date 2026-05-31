import React, { useRef, useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { api_endpoint } from "../components/constant";
import Seo from "../components/Seo";
import { createWebPageSchema } from "../utils/seo";

const ADMIN_TOKEN_KEY = "digishelf_admin_token";
const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  "6LfHphYqAAAAANnmoQKL9PLw5nLOuejl4sbifpj_";

export default function AdminLogin() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [phase, setPhase] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCaptcha = () => {
    setCaptchaToken("");
    recaptchaRef.current?.reset();
  };

  const handleBackToCredentials = () => {
    setPhase("credentials");
    setVerificationCode("");
    setMaskedEmail("");
    setCodeExpiresIn(0);
    setLockoutMessage("");
    setFormError("");
    resetCaptcha();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLockoutMessage("");
    setFormError("");
    setIsSubmitting(true);

    try {
      if (phase === "credentials") {
        if (!captchaToken) {
          setCaptchaError("Please complete the reCAPTCHA challenge.");
          setIsSubmitting(false);
          return;
        }

        const response = await axios.post(`${api_endpoint}/api/admin/login/`, {
          step: "credentials",
          email,
          password,
          captcha_token: captchaToken,
        });

        setPhase("verify_code");
        setMaskedEmail(response.data.masked_email || email);
        setCodeExpiresIn(response.data.code_expires_in || 0);
        setVerificationCode("");
        setCaptchaError("");
        resetCaptcha();
        toast.success("Verification code sent to your admin email.");
      } else {
        const response = await axios.post(`${api_endpoint}/api/admin/login/`, {
          step: "verify_code",
          code: verificationCode,
        });
        localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
        navigate("/admin");
      }
    } catch (error) {
      const response = error?.response;
      const errorMessage = response?.data?.error || "Admin sign in failed.";
      setFormError(errorMessage);

      if (response?.status === 423) {
        setLockoutMessage(errorMessage);
        setPhase("credentials");
        setVerificationCode("");
        resetCaptcha();
      }

      if (phase === "credentials") {
        resetCaptcha();
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#211722] font-display text-white">
      <Seo
        title="Admin Login"
        description="Secure Digishelves admin sign in."
        path="/admin-login"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Admin Login",
          description: "Secure Digishelves admin sign in.",
          path: "/admin-login",
        })}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,172,132,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(85,24,57,0.5),transparent_36%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-12">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white p-6 text-[#211722] shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#551839] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#10ac84]">
                Digishelves admin
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">
                {phase === "credentials"
                  ? "Sign in to manage orders."
                  : "Confirm your verification code."}
              </h1>
              {phase === "verify_code" && (
                <p className="mt-3 text-sm leading-6 text-[#665b67]">
                  Enter the code sent to{" "}
                  <span className="font-black text-[#211722]">
                    {maskedEmail}
                  </span>
                  .
                  {codeExpiresIn > 0 &&
                    ` It expires in about ${Math.ceil(codeExpiresIn / 60)} minute(s).`}
                </p>
              )}
            </div>
          </div>

          {lockoutMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {lockoutMessage}
            </div>
          )}

          {formError && !lockoutMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid w-full gap-5">
            {phase === "credentials" ? (
              <>
                <label className="block w-full">
                  <span className="mb-2 block text-sm font-black">
                    Admin email
                  </span>
                  <div className="relative w-full">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f7f8c]" />
                    <input
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] pl-12 pr-4 font-bold outline-none transition focus:border-[#551839]"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      required
                    />
                  </div>
                </label>

                <label className="block w-full">
                  <span className="mb-2 block text-sm font-black">
                    Password
                  </span>
                  <div className="relative w-full">
                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f7f8c]" />
                    <input
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] pl-12 pr-4 font-bold outline-none transition focus:border-[#551839]"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      required
                    />
                  </div>
                </label>

                <div className="overflow-hidden rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] p-3">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(value) => {
                      setCaptchaToken(value || "");
                      setCaptchaError("");
                    }}
                  />
                </div>
                {captchaError && (
                  <span className="text-sm font-bold text-red-600">
                    {captchaError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex h-14 w-full items-center justify-center rounded-full bg-[#551839] font-black text-white shadow-lg shadow-[#551839]/20 transition hover:bg-[#44122d] disabled:opacity-60"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </>
            ) : (
              <>
                <label className="block w-full">
                  <span className="mb-2 block text-sm font-black">
                    Verification code
                  </span>
                  <div className="relative w-full">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f7f8c]" />
                    <input
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] pl-12 pr-4 font-bold tracking-[0.35em] outline-none transition focus:border-[#551839]"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(event) =>
                        setVerificationCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#eadfe7] bg-[#fbf8f4] font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-14 w-full items-center justify-center rounded-full bg-[#551839] font-black text-white shadow-lg shadow-[#551839]/20 transition hover:bg-[#44122d] disabled:opacity-60"
                  >
                    {isSubmitting ? "Verifying..." : "Verify and sign in"}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

export { ADMIN_TOKEN_KEY };
