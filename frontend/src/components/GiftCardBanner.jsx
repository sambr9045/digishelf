import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Gift,
  Globe2,
  Search,
  X,
} from "lucide-react";

import Header from "./Header/Header";
import { countries } from "./Countries";
import { SessionContext } from "./sessionContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function GiftCardBanner({
  Search: runSearch,
  type = "",
  details = false,
}) {
  const location = useLocation();
  const query = useQuery();
  const navigate = useNavigate();
  const { country } = useContext(SessionContext);
  const [selectedCountry, setSelectedCountry] = useState(
    query.get("country") || "",
  );
  const [giftcardname, setGiftcardname] = useState(query.get("name") || "");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef(null);

  const selectedCountryInfo = useMemo(
    () => countries.find((item) => item.alpha2Code === selectedCountry) || null,
    [selectedCountry],
  );

  useEffect(() => {
    if (!selectedCountry && country.country) {
      setSelectedCountry(country.country);
    }
  }, [country.country, selectedCountry]);

  useEffect(() => {
    if (!countryMenuOpen) {
      return undefined;
    }

    const handleDocumentClick = (event) => {
      if (
        countryMenuRef.current &&
        !countryMenuRef.current.contains(event.target)
      ) {
        setCountryMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCountryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [countryMenuOpen]);

  const handleNameChange = (event) => {
    setGiftcardname(event.target.value);
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setCountryMenuOpen(false);
  };

  const handleSearchClick = async (event) => {
    event.preventDefault();

    if (selectedCountry !== "" || giftcardname !== "") {
      navigate(
        `/giftcard/search?country=${selectedCountry}&name=${giftcardname}`,
      );
    }

    if (runSearch && location.pathname !== "/giftcard/search") {
      runSearch(selectedCountry, giftcardname, 1);
    }
  };

  const handleSearchWithClose = async (event, closePopover) => {
    await handleSearchClick(event);
    closePopover?.();
  };

  const getFlagUrl = (countryCode) =>
    `https://flagsapi.com/${String(countryCode || "").toUpperCase()}/flat/64.png`;

  if (details) {
    return (
      <>
        <Header />
        <div className="h-20 bg-white" />
      </>
    );
  }

  return (
    <>
      <Header
        mobileSearchPopoverContent={({ closePopover }) => (
          <div className="w-full">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-0 text-xs font-black uppercase tracking-[0.22em] text-[#9a8b97]">
                  Search gift cards
                </p>
                <h3 className="mb-0 mt-1 text-xl font-black tracking-[-0.03em] text-[#211722]">
                  Find a brand
                </h3>
                <p className="mb-0 mt-2 text-sm font-bold text-[#665b67]">
                  {selectedCountryInfo?.name || "All countries"}
                </p>
              </div>
              <button
                type="button"
                onClick={closePopover}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadfe7] bg-white text-[#211722] transition hover:border-[#551839]/30 hover:text-[#551839]"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(event) => handleSearchWithClose(event, closePopover)}
              className="grid gap-3"
            >
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  Country
                </span>
                <div className="relative" ref={countryMenuRef}>
                  <button
                    type="button"
                    onClick={() => setCountryMenuOpen((open) => !open)}
                    className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 text-left outline-none transition hover:border-[#d8c5d1] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {selectedCountryInfo ? (
                        <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                          <img
                            src={getFlagUrl(selectedCountryInfo.alpha2Code)}
                            alt={`${selectedCountryInfo.name} flag`}
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#551839] shadow-sm">
                          <Globe2 className="h-4 w-4" />
                        </span>
                      )}
                      <span className="truncate text-sm font-black text-[#211722]">
                        {selectedCountryInfo?.name || "All countries"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#551839] transition ${
                        countryMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {countryMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[1.5rem] border border-[#eadfe7] bg-white shadow-[0_24px_50px_rgba(33,23,34,0.16)]">
                      <div className="max-h-72 overflow-y-auto p-2">
                        <button
                          type="button"
                          onClick={() => handleCountryChange("")}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                            !selectedCountry
                              ? "bg-[#551839] text-white"
                              : "text-[#4d4150] hover:bg-[#f7f1e8]"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#551839]">
                              <Globe2 className="h-4 w-4" />
                            </span>
                            <span>All countries</span>
                          </span>
                          {!selectedCountry ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                        </button>

                        {countries.map((item) => (
                          <button
                            key={item.alpha2Code}
                            type="button"
                            onClick={() => handleCountryChange(item.alpha2Code)}
                            className={`mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                              selectedCountry === item.alpha2Code
                                ? "bg-[#551839] text-white"
                                : "text-[#4d4150] hover:bg-[#f7f1e8]"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                                <img
                                  src={getFlagUrl(item.alpha2Code)}
                                  alt={`${item.name} flag`}
                                  className="h-full w-full object-cover"
                                />
                              </span>
                              <span className="truncate">{item.name}</span>
                            </span>
                            {selectedCountry === item.alpha2Code ? (
                              <Check className="h-4 w-4 shrink-0" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </label>

              <label className="block">
                <div className="relative">
                  <Gift className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#551839]" />
                  <input
                    type="text"
                    value={giftcardname}
                    placeholder="Search brand"
                    onChange={handleNameChange}
                    className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-11 text-sm font-black text-[#211722] outline-none transition placeholder:text-[#9b8d98] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#551839] px-6 text-sm font-black text-white transition hover:bg-[#44122d]"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </form>
          </div>
        )}
      />
      <section className="relative z-20 isolate overflow-x-hidden overflow-y-visible bg-[#f7f1e8] pt-28 pb-14 sm:pt-32 sm:pb-18">
        <div className="absolute left-[-10rem] top-4 h-80 w-80 rounded-full bg-[#10ac84]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#551839]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <div>
              <div className="mb-6 flex items-center gap-2 text-sm font-bold text-[#6c5f69]">
                <Link to="/" className="transition hover:text-[#551839]">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-[#551839]">
                  {type !== "" ? type : "Gift cards"}
                </span>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#551839]/15 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#551839] shadow-sm backdrop-blur">
                <Gift className="h-4 w-4" />
                Digital rewards
              </span>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#211722] sm:text-6xl">
                {type !== ""
                  ? `${type} gift cards`
                  : "Buy gift cards with crypto."}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f5360]">
                Search brands by country, choose a card, and check out with the
                same streamlined crypto payment flow.
              </p>
            </div>

            <form
              onSubmit={handleSearchClick}
              className="relative z-20 mt-8 hidden w-full rounded-[1.75rem] bg-transparent p-0 shadow-none md:block"
            >
              <div className="grid gap-2 md:grid-cols-[160px_minmax(0,2.8fr)_160px] xl:grid-cols-[170px_minmax(0,3.2fr)_160px]">
                <label className="block">
                  <div className="relative" ref={countryMenuRef}>
                    <button
                      type="button"
                      onClick={() => setCountryMenuOpen((open) => !open)}
                      className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 text-left outline-none transition hover:border-[#d8c5d1] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {selectedCountryInfo ? (
                          <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                            <img
                              src={getFlagUrl(selectedCountryInfo.alpha2Code)}
                              alt={`${selectedCountryInfo.name} flag`}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#551839] shadow-sm">
                            <Globe2 className="h-4 w-4" />
                          </span>
                        )}
                        <span className="truncate text-sm font-black text-[#211722]">
                          {selectedCountryInfo?.name || "All countries"}
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#551839] transition ${
                          countryMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {countryMenuOpen ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[1.5rem] border border-[#eadfe7] bg-white shadow-[0_24px_50px_rgba(33,23,34,0.16)]">
                        <div className="max-h-80 overflow-y-auto p-2">
                          <button
                            type="button"
                            onClick={() => handleCountryChange("")}
                            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                              !selectedCountry
                                ? "bg-[#551839] text-white"
                                : "text-[#4d4150] hover:bg-[#f7f1e8]"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#551839]">
                                <Globe2 className="h-4 w-4" />
                              </span>
                              <span>All countries</span>
                            </span>
                            {!selectedCountry ? (
                              <Check className="h-4 w-4" />
                            ) : null}
                          </button>

                          {countries.map((item) => (
                            <button
                              key={item.alpha2Code}
                              type="button"
                              onClick={() =>
                                handleCountryChange(item.alpha2Code)
                              }
                              className={`mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                                selectedCountry === item.alpha2Code
                                  ? "bg-[#551839] text-white"
                                  : "text-[#4d4150] hover:bg-[#f7f1e8]"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                                  <img
                                    src={getFlagUrl(item.alpha2Code)}
                                    alt={`${item.name} flag`}
                                    className="h-full w-full object-cover"
                                  />
                                </span>
                                <span className="truncate">{item.name}</span>
                              </span>
                              {selectedCountry === item.alpha2Code ? (
                                <Check className="h-4 w-4 shrink-0" />
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </label>

                <label className="block">
                  <div className="relative">
                    <Gift className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#551839]" />
                    <input
                      type="text"
                      value={giftcardname}
                      placeholder="Search brand"
                      onChange={handleNameChange}
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-11 text-sm font-black text-[#211722] outline-none transition placeholder:text-[#9b8d98] focus:border-[#551839] focus:bg-white focus:ring-4 focus:ring-[#551839]/10"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 self-stretch rounded-2xl bg-[#551839] px-7 text-sm font-black text-white transition hover:bg-[#44122d]"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
