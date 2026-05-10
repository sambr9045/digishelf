import React, { useContext, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { SessionContext } from "../components/sessionContext";
import { api_endpoint } from "../components/constant";
import { createWebPageSchema } from "../utils/seo";

export default function Signup() {
  const [signupError, setSignupError] = useState("");
  const [accountCreated, setAccountCreated] = useState("");
  const [processing, setProcessing] = useState(false);
  const { setSession, setCartUpdated } = useContext(SessionContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const clientId =
    "1014448615483-g62js5lep5uq3lulr4tnquqkc0bvv5ab.apps.googleusercontent.com";

  const validateForm = () => {
    const errors = {};

    if (!formData.fullname || formData.fullname.length <= 2) {
      errors.fullname = "Enter your full name.";
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: "" }));
    setSignupError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setAccountCreated("");

    try {
      const response = await axios.post(
        `${api_endpoint}/api/auth/email/signup/`,
        formData,
      );

      if (response.status === 201) {
        setFormData({ fullname: "", email: "", password: "" });
        setAccountCreated(
          "Account created successfully. Please check your inbox to complete setup.",
        );
      }
    } catch (error) {
      setSignupError(
        error.response?.data?.error || "An error occurred during signup.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSignUp = (data) => {
    const session = {
      user: data.user,
      accessToken: data.access,
      refreshToken: data.refresh,
    };

    setSession(session);
    localStorage.setItem("sct", "ls");
    localStorage.setItem("session", JSON.stringify(session));
    setCartUpdated(true);
    navigate("/");
  };

  const handleError = (error) => {
    setSignupError(error.response?.data?.error || "Google sign up failed.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
      <Seo
        title="Create Account"
        description="Create a Digishelves account for faster checkout, saved activity, and digital gift card purchases."
        path="/signup"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Create a Digishelves Account",
          description:
            "Create a Digishelves account for faster checkout, saved activity, and digital gift card purchases.",
          path: "/signup",
        })}
      />
      <Header />

      <main className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_0.8fr] lg:px-8">
          <section>
            <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm">
              Create account
            </span>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              Set up a faster way to top up and buy gift cards.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#665b67]">
              Save time at checkout, manage activity, and keep your payment
              journey consistent across Digishelves.
            </p>

            <div className="mt-8 rounded-[2rem] bg-[#211722] p-6 text-white shadow-2xl shadow-[#551839]/15">
              <CheckCircle2 className="h-7 w-7 text-[#10ac84]" />
              <p className="mb-0 mt-4 text-xl font-black">
                One account for top-ups, gift cards, and rewards.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(33,23,34,0.18)] sm:p-8">
            <h2 className="text-3xl font-black tracking-[-0.04em]">Sign up</h2>
            <p className="mt-2 text-[#665b67]">
              Continue with Google or create an email account.
            </p>

            {signupError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {signupError}
              </div>
            )}

            {accountCreated && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {accountCreated}
              </div>
            )}

            <div className="mt-6">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLoginButton
                  onLogin={handleSignUp}
                  onError={handleError}
                  label="Continue with Google"
                  url={`${api_endpoint}/api/auth/google/`}
                />
              </GoogleOAuthProvider>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#eadfe7]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#9b8d98]">
                or email
              </span>
              <div className="h-px flex-1 bg-[#eadfe7]" />
            </div>

            <form className="auth-form" onSubmit={handleFormSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#332834]">
                  Full name
                </span>
                <div className="auth-input-wrap relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    placeholder="Jane Doe"
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {formError.fullname && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {formError.fullname}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#332834]">
                  Email address
                </span>
                <div className="auth-input-wrap relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="name@example.com"
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {formError.email && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {formError.email}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#332834]">
                  Password
                </span>
                <div className="auth-input-wrap relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Minimum 8 characters"
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {formError.password && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {formError.password}
                  </span>
                )}
              </label>

              <p className="text-xs font-bold leading-6 text-[#7c7079]">
                By creating an account, you agree to Digishelves{" "}
                <Link to="/terms-of-use" className="text-[#551839] underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-[#551839] underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#551839] font-black text-white transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Creating account..." : "Create account"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <p className="mb-0 mt-6 text-center text-sm font-bold text-[#665b67]">
              Already have an account?
              <Link to="/signin" className="ml-1 text-[#551839]">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
