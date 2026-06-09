import React, { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Loader from "../components/includes/Loader";
import { api_endpoint } from "../components/constant";
import Seo from "../components/Seo";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    lines: ["support@digishelves.com"],
  },
];

export default function Contact() {
  const [capTchaToken, setCapTchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const sitekey = "6LfHphYqAAAAANnmoQKL9PLw5nLOuejl4sbifpj_";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevState) => ({
      ...prevState,
      [name]: "",
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!formState.name) {
      validationErrors.name = "Name is required";
    }

    if (!formState.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      validationErrors.email = "Email is invalid";
    }

    if (!formState.message) {
      validationErrors.message = "Message is required";
    }

    return validationErrors;
  };

  const submitData = async (data) => {
    try {
      const response = await axios.post(`${api_endpoint}/api/contact/`, data);

      if (response.data) {
        setSuccess(
          "Thank you for reaching out. Our team will get back to you as soon as possible.",
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong. Please try again later.",
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setSuccess("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    if (capTchaToken === "") {
      setCaptchaError("Please complete the CAPTCHA.");
      setIsLoading(false);
      return;
    }

    await submitData({ formData: formState, token: capTchaToken });
    setFormState({ name: "", email: "", message: "" });
    setErrors({});
    setCaptchaError("");
    setIsLoading(false);
  };

  return (
    <div className="bg-white font-display text-[#211722]">
      <Seo
        title="Contact Digishelves Support"
        description="Contact Digishelves support for help with top-ups, gift cards, checkout issues, and order questions."
        keywords={[
          "Digishelves support",
          "contact Digishelves",
          "gift card help",
          "airtime support",
        ]}
        path="/contact"
        schema={[
          createWebPageSchema({
            title: "Contact Digishelves Support",
            description:
              "Contact Digishelves support for help with top-ups, gift cards, checkout issues, and order questions.",
            path: "/contact",
            type: "ContactPage",
          }),
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <Header />

      {isLoading && <Loader />}

      <section className="relative isolate overflow-hidden bg-[#f7f1e8] pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_0.8fr] lg:px-8">
          <div>
            <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm">
              Contact support
            </span>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              Need help with a top-up or gift card?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#665b67]">
              Send a message and we will help with transactions, account access,
              payments, or product questions.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#211722] p-7 text-white shadow-2xl shadow-[#551839]/15">
            <Headphones className="h-8 w-8 text-[#10ac84]" />
            <p className="mb-0 mt-5 text-2xl font-black tracking-[-0.03em]">
              Support that stays close to the transaction.
            </p>
            <p className="mb-0 mt-3 text-white/65">
              Include the email or reference used for faster review.
            </p>
          </div>
        </div>
      </section>

      <main className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <aside className="grid h-fit gap-4">
            {contactMethods.map((method) => {
              const Icon = method.icon;

              return (
                <article
                  key={method.title}
                  className="rounded-[1.75rem] border border-[#efe7ed] bg-[#fbf8f4] p-6"
                >
                  <Icon className="h-7 w-7 text-[#551839]" />
                  <h3 className="mt-4 text-xl font-black">{method.title}</h3>
                  {method.lines.map((line) => (
                    <p key={line} className="mb-1 font-bold text-[#665b67]">
                      {line}
                    </p>
                  ))}
                </article>
              );
            })}
          </aside>

          <section className="rounded-[2rem] border border-[#efe7ed] bg-white p-6 shadow-2xl shadow-[#551839]/8 sm:p-8">
            <h2 className="text-3xl font-black tracking-[-0.04em]">
              Send a message
            </h2>
            <p className="mt-2 text-[#665b67]">
              We usually respond within 24 hours.
            </p>

            {success && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black">Name</span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      placeholder="Your name"
                      onChange={handleChange}
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                    />
                  </div>
                  {errors.name && (
                    <span className="mt-2 block text-sm font-bold text-red-600">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#551839]" />
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      placeholder="name@example.com"
                      onChange={handleChange}
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                    />
                  </div>
                  {errors.email && (
                    <span className="mt-2 block text-sm font-bold text-red-600">
                      {errors.email}
                    </span>
                  )}
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Message</span>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-4 top-5 h-5 w-5 text-[#551839]" />
                  <textarea
                    name="message"
                    value={formState.message}
                    placeholder="Tell us what happened..."
                    rows="5"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-12 py-4 font-bold outline-none transition focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
                {errors.message && (
                  <span className="mt-2 block text-sm font-bold text-red-600">
                    {errors.message}
                  </span>
                )}
              </label>

              <div className="overflow-hidden rounded-2xl">
                <ReCAPTCHA
                  sitekey={sitekey}
                  onChange={(value) => {
                    setCapTchaToken(value);
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
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#551839] font-black text-white transition hover:bg-[#44122d]"
              >
                Send message
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
