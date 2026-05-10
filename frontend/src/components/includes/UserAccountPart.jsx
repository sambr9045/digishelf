import React, { useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { SessionContext } from "../sessionContext";

export default function UserAccountPart({ logout }) {
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (session?.user === null) {
      navigate("/signin");
    }
  }, [navigate, session]);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  if (!session?.user) {
    return null;
  }

  const userInitial =
    session.user.email?.charAt(0)?.toUpperCase() ||
    session.user.username?.charAt(0)?.toUpperCase() ||
    "U";

  const userLabel =
    session.user.first_name ||
    session.user.username ||
    session.user.email?.split("@")[0] ||
    "My account";

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-3 rounded-full border border-[#eadfe7] bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-black text-[#211722] shadow-sm transition hover:border-[#551839]/30 hover:bg-white"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#551839] text-sm font-black text-white">
          {userInitial}
        </span>
        <span className="max-w-[8rem] truncate">{userLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#551839] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 overflow-hidden rounded-[1.25rem] border border-[#eadfe7] bg-white p-2 shadow-2xl shadow-[#211722]/15">
          <div className="border-b border-[#f0e6ed] px-3 py-3">
            <p className="mb-0 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
              Signed in
            </p>
            <p className="mb-0 mt-1 truncate text-sm font-black text-[#211722]">
              {session.user.email}
            </p>
          </div>

          <Link
            to="/account"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-[#332834] transition hover:bg-[#fbf8f4] hover:text-[#551839]"
          >
            <UserRound className="h-5 w-5 text-[#551839]" />
            My account
          </Link>

          <Link
            to="/profile-settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-[#332834] transition hover:bg-[#fbf8f4] hover:text-[#551839]"
          >
            <Settings className="h-5 w-5 text-[#551839]" />
            Profile settings
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-black text-[#d12f2f] transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
