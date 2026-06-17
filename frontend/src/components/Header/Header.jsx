import React, { useContext, useState, useEffect } from "react";
import logo5 from "../../assets/images/NLogo/logo5.png";
import Offcanvas from "react-bootstrap/Offcanvas";
import Cart from "../includes/Cart";
import { SessionContext } from "../sessionContext";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import UserAccountPart from "../includes/UserAccountPart";
import { LogIn, Menu, Search, ShoppingBag, UserPlus, X } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function Header({ mobileSearchPopoverContent = null }) {
  const { cart } = useContext(SessionContext);
  const [pathActive, setPathActive] = useState(false);
  const { session, logout } = useContext(SessionContext);
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const isGiftCardRoute =
    pathname.includes("gift-card") ||
    pathname.includes("giftcard") ||
    pathname.includes("checkout");
  const transparentHeaderRoutes = ["/", "/gift-card", "/signin", "/signup"];
  const canUseTransparentHeader = transparentHeaderRoutes.includes(pathname);
  const isTransparent =
    canUseTransparentHeader && !isScrolled && !mobileMenuOpen;

  const toggleCart = () => {
    setMobileSearchOpen(false);
    setShowCart(!showCart);
  };
  const closeMobileSearchPopover = () => {
    setMobileSearchOpen(false);
  };
  const toggleMobileSearchPopover = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen((open) => !open);
  };

  useEffect(() => {
    if (pathname.includes("gift-card") || pathname.includes("giftcard")) {
      setPathActive(true);
    } else {
      setPathActive(false);
    }
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (localStorage.getItem("sct") && session?.user?.username) {
      toast.success(`You sucessfully login as ${session.user.username}`);
      localStorage.removeItem("sct");
    }
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSearchOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-[#efe7ed] bg-white shadow-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <img src={logo5} alt="digishelves" className="h-12 w-auto" />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-bold transition-colors ${
                    isActive
                      ? "text-[#551839] border-b-2 border-[#551839] pb-1"
                      : "text-[#3d3440]/80 hover:text-[#551839]"
                  }`
                }
              >
                Top-up
              </NavLink>
              <NavLink
                to="/gift-card"
                className={({ isActive }) =>
                  `text-sm font-bold transition-colors ${
                    isActive || pathActive
                      ? "text-[#551839] border-b-2 border-[#551839] pb-1"
                      : "text-[#3d3440]/80 hover:text-[#551839]"
                  }`
                }
              >
                Gift Cards
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm font-bold transition-colors ${
                    isActive
                      ? "text-[#551839] border-b-2 border-[#551839] pb-1"
                      : "text-[#3d3440]/80 hover:text-[#551839]"
                  }`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-sm font-bold transition-colors ${
                    isActive
                      ? "text-[#551839] border-b-2 border-[#551839] pb-1"
                      : "text-[#3d3440]/80 hover:text-[#551839]"
                  }`
                }
              >
                Contact
              </NavLink>
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              {isGiftCardRoute && (
                <button
                  onClick={toggleCart}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfe7] bg-white/70 text-[#3d3440] shadow-sm transition-colors hover:border-[#551839]/30 hover:text-[#551839]"
                  aria-label="Open cart"
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
                  <span className="absolute -right-1.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d12f2f] px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
                    {cart ? cart.length : 0}
                  </span>
                </button>
              )}

              {isGiftCardRoute && mobileSearchPopoverContent ? (
                <>
                  <button
                    onClick={toggleMobileSearchPopover}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfe7] bg-white/70 text-[#3d3440] shadow-sm transition-colors hover:border-[#551839]/30 hover:text-[#551839] md:hidden"
                    aria-label="Open gift card search"
                    aria-expanded={mobileSearchOpen}
                    aria-controls="giftcard-mobile-search-panel"
                  >
                    <Search className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                </>
              ) : null}

              {/* User Account or Auth */}
              {session && session.user ? (
                <UserAccountPart session={session} logout={logout} />
              ) : (
                <div className="hidden items-center md:flex md:space-x-2">
                  <NavLink
                    to="/signin"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#551839] transition-colors hover:bg-white/70"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-[#551839] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#551839]/15 transition-colors hover:bg-[#44122d]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </NavLink>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => {
                  closeMobileSearchPopover();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="rounded-full border border-[#211722] bg-[#211722] p-2 text-white shadow-sm transition hover:bg-[#551839] hover:border-[#551839] md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {isGiftCardRoute && mobileSearchPopoverContent && mobileSearchOpen ? (
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Close search"
              className="fixed inset-0 z-[58] bg-[#211722]/25 backdrop-blur-[1px]"
              onClick={closeMobileSearchPopover}
            />
            <div
              id="giftcard-mobile-search-panel"
              className="fixed left-4 right-4 top-[5.75rem] z-[59] max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.75rem] border border-[#efe7ed] bg-white p-4 text-[#211722] shadow-[0_28px_80px_rgba(33,23,34,0.22)]"
              role="dialog"
              aria-modal="true"
              aria-label="Gift card search"
            >
              {mobileSearchPopoverContent({
                closePopover: closeMobileSearchPopover,
              })}
            </div>
          </div>
        ) : null}

        {mobileMenuOpen ? (
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[60] bg-[#211722]/30 backdrop-blur-[1px]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              className="fixed inset-y-0 right-0 z-[61] flex w-[85vw] max-w-[360px] flex-col border-l border-[#efe7ed] bg-white shadow-[0_30px_90px_rgba(33,23,34,0.22)]"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-[#efe7ed] px-5 py-5">
                <div>
                  <p className="mb-0 text-xs font-black uppercase tracking-[0.22em] text-[#9a8b97]">
                    Navigation
                  </p>
                  <h2 className="mb-0 mt-1 text-2xl font-black tracking-[-0.04em] text-[#211722]">
                    Menu
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfe7] bg-white text-[#211722] transition hover:border-[#551839]/30 hover:text-[#551839]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid gap-2">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-base font-black transition-colors ${
                        isActive
                          ? "bg-[#551839] text-white"
                          : "text-[#3d3440] hover:bg-[#f9f3f7] hover:text-[#551839]"
                      }`
                    }
                  >
                    Top-up
                  </NavLink>
                  <NavLink
                    to="/gift-card"
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-base font-black transition-colors ${
                        isActive || pathActive
                          ? "bg-[#551839] text-white"
                          : "text-[#3d3440] hover:bg-[#f9f3f7] hover:text-[#551839]"
                      }`
                    }
                  >
                    Gift Cards
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-base font-black transition-colors ${
                        isActive
                          ? "bg-[#551839] text-white"
                          : "text-[#3d3440] hover:bg-[#f9f3f7] hover:text-[#551839]"
                      }`
                    }
                  >
                    About
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-base font-black transition-colors ${
                        isActive
                          ? "bg-[#551839] text-white"
                          : "text-[#3d3440] hover:bg-[#f9f3f7] hover:text-[#551839]"
                      }`
                    }
                  >
                    Contact
                  </NavLink>
                </div>

                {!session?.user ? (
                  <div className="mt-5 grid gap-3 border-t border-[#efe7ed] pt-5">
                    <NavLink
                      to="/signin"
                      className="inline-flex items-center justify-center rounded-full border border-[#eadfe7] px-4 py-3 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-[#f9f3f7]"
                    >
                      Sign in
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="inline-flex items-center justify-center rounded-full bg-[#551839] px-4 py-3 text-sm font-black text-white transition hover:bg-[#44122d]"
                    >
                      Sign up
                    </NavLink>
                  </div>
                ) : null}
              </nav>
            </aside>
          </div>
        ) : null}

        {/* Cart Offcanvas */}
        {isGiftCardRoute && (
          <Offcanvas
            show={showCart}
            onHide={() => setShowCart(false)}
            placement="end"
          >
            <Offcanvas.Header
              closeButton
              className="border-b border-[#eadfe7] px-6 py-5"
            >
              <Offcanvas.Title className="text-lg font-black tracking-[-0.03em] text-[#211722]">
                My cart{cart?.length > 0 ? ` (${cart.length})` : ""}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-4">
              <Cart />
            </Offcanvas.Body>
          </Offcanvas>
        )}
      </header>
    </>
  );
}
