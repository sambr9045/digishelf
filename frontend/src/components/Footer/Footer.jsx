import React from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";

import logo5 from "../../assets/images/NLogo/logo5.png";

const footerLinks = [
  { label: "Top-up", to: "/" },
  { label: "Gift Cards", to: "/gift-cards" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const supportLinks = [
  { label: "Support", to: "/contact" },
  { label: "Terms of Use", to: "/terms-of-use" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61560111105801",
    Icon: FacebookIcon,
  },

  { label: "X", href: "https://x.com/digishelves", Icon: XIcon },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#551839]/20 bg-[#211722] font-display text-white">
      <div className="absolute left-[-10rem] top-[-10rem] h-80 w-80 rounded-full bg-[#10ac84]/15 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-8rem] h-96 w-96 rounded-full bg-[#551839]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.7fr_1.1fr]">
          <div>
            <Link to="/" className="inline-flex">
              <img
                src={logo5}
                alt="Digishelves"
                className="h-auto w-44 brightness-0 invert"
              />
            </Link>

            <p className="mb-0 mt-5 max-w-sm text-base leading-7 text-white/62">
              Fast airtime top-ups, giflt card with crypto currency
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-[#10ac84]/40 hover:bg-[#10ac84]/10 hover:text-[#9ff1dd]"
                >
                  <item.Icon sx={{ fontSize: 18 }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#9ff1dd]">
              Explore
            </h3>
            <div className="mt-5 grid gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="group inline-flex items-center justify-between py-2 text-base font-black text-white/72 transition hover:text-white"
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#9ff1dd]">
              Contact
            </h3>
            <div className="mt-5 grid gap-4 text-white/75 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href="mailto:info@digishelves.com"
                className="flex gap-3 font-bold transition hover:text-white"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#9ff1dd]" />
                <span>
                  <span className="block">support@digishelves.com</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm font-bold text-white/58 md:flex-row md:items-center md:justify-between">
          <p className="mb-0">
            Copyright &copy; {new Date().getFullYear()}{" "}
            <Link to="/" className="text-white">
              Digishelves.
            </Link>{" "}
            All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {supportLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
