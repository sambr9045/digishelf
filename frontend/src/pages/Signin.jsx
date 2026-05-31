import React, { useContext, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { toast } from "react-toastify";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Seo from "../components/Seo";
import GoogleLoginButton from "../components/includes/GoogleLogin";
import { SessionContext } from "../components/sessionContext";
import { api_endpoint } from "../components/constant";
import { createWebPageSchema } from "../utils/seo";

export default function Signin() {
  const clientId =
    "449377331234-rr3sbk3ahcdotn8lv8nt8cfighqa1h4q.apps.googleusercontent.com";
  const navigate = useNavigate();
  const { setSession, setCartUpdated } = useContext(SessionContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [processing, setProcessing] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const saveSession = (data) => {
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (email.trim() === "" || !emailRegex.test(email)) {
      setEmailError("Enter a valid email address.");
      setProcessing(false);
      return;
    }

    if (password === "") {
      setPasswordError("Enter your password.");
      setProcessing(false);
      return;
    }

    setEmailError("");
    setPasswordError("");

    try {
      const response = await axios.post(`${api_endpoint}/api/login/`, {
        email,
        password,
      });

      if (response.status === 200) {
        saveSession(response.data);
      }
    } catch (error) {
      const response = error?.response;
      if (
        response?.status === 403 &&
        response.data?.email_verification_required
      ) {
        navigate("/verify-email", {
          replace: true,
          state: {
            verificationSession: response.data.verification_session,
            email: response.data.email || email,
          },
        });
        return;
      }

      toast.error(response?.data?.error || "Invalid credentials.");
    } finally {
      setProcessing(false);
    }
  };

  const handleGoogleLogin = (data) => {
    saveSession(data);
  };

  const handleError = (error) => {
    toast.error(error.response?.data?.error || "Sign in failed.");
    localStorage.removeItem("session");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] font-display text-[#211722]">
      <Seo
        title="Sign In"
        description="Sign in to Digishelves to access saved carts, checkout history, and digital gift card orders."
        path="/signin"
        robots="noindex,nofollow"
        schema={createWebPageSchema({
          title: "Digishelves Sign In",
          description:
            "Sign in to Digishelves to access saved carts, checkout history, and digital gift card orders.",
          path: "/signin",
        })}
      />
      <Header />

      <main className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_0.8fr] lg:px-8">
          <section>
            <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm">
              Welcome back
            </span>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              Sign in to continue your digital payments.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#665b67]">
              Access saved carts, faster checkout, top-up history, and gift card
              orders from one clean account.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(33,23,34,0.18)] sm:p-8">
            <h2 className="text-3xl font-black tracking-[-0.04em]">Sign in</h2>
            <p className="mt-2 text-[#665b67]">
              Use Google or your email and password.
            </p>

            <div className="mt-6">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLoginButton
                  onLogin={handleGoogleLogin}
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

            <form onSubmit={handleFormSubmit} className="auth-form">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#332834]">
                  Email address
                </span>
                <div className="auth-input-wrap relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                  <input
                    type="email"
                    value={email}
                    placeholder="name@example.com"
                    onChange={(event) => {
                      setEmail(event.target.value.trim());
                      setEmailError("");
                    }}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {emailError && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {emailError}
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
                    value={password}
                    placeholder="Enter your password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError("");
                    }}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {passwordError && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {passwordError}
                  </span>
                )}
              </label>

              <div className="flex justify-end">
                <Link
                  to="/change-password"
                  className="text-sm font-black text-[#551839]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#551839] font-black text-white transition hover:bg-[#44122d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <p className="mb-0 mt-6 text-center text-sm font-bold text-[#665b67]">
              Don&apos;t have an account?
              <Link to="/signup" className="ml-1 text-[#551839]">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
