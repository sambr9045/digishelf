import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import IntlTelInput from "react-intl-tel-input";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircle2, ChevronsRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { TopUpContext } from "../../components/Context/TopUpContext";
import { api_endpoint } from "../../components/constant";

export default function StepOne() {
  const {
    isLoading,
    country,
    number,
    setisLoading,
    setPhoneError,
    operatoCountryData,
    editNumber,
    setEditNumber,
    setOpararatorData,
    setSteps,
    setFx_rate,
    setSuggestedAmountsMap,
    setNumber,
    setOperatorCountryData,
    setAutoDetected,
  } = useContext(TopUpContext);

  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [failedToDetectData, setFailedToDetectData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [networkSelectionError, setNetworkSelectionError] = useState("");
  const defaultCountryCode = country.country?.toLowerCase() || "us";

  useEffect(() => {
    if (!country.country || !country.country_code) {
      return;
    }

    setOperatorCountryData({
      iso2: country.country.toLowerCase(),
      dialCode: country.country_code,
    });
  }, [country.country, country.country_code, setOperatorCountryData]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const formatTopupPhoneNumber = (rawPhoneNumber, countryData) => {
    const dialCode = String(
      countryData?.dialCode || country.country_code || "",
    ).replace(/\D/g, "");
    let digits = String(rawPhoneNumber || "").replace(/\D/g, "");

    if (!digits || !dialCode) {
      return "";
    }

    if (digits.startsWith(dialCode) && digits.length > dialCode.length) {
      digits = digits.slice(dialCode.length);
    }

    digits = digits.replace(/^0+/, "");

    return `+${dialCode}${digits}`;
  };

  const handleSelection = (index) => {
    const selectedNetwork = failedToDetectData[index];

    setSelected(index);
    setOpararatorData({ data: selectedNetwork });
    setFx_rate(selectedNetwork.fx);
    setSuggestedAmountsMap(selectedNetwork.suggestedAmountsMap);
    setNetworkSelectionError("");
  };

  const handleNetworkSelected = () => {
    if (selected !== null) {
      const selectedNetwork = failedToDetectData[selected];
      const formattedPhone = formatTopupPhoneNumber(
        editNumber || number,
        operatoCountryData,
      );

      navigate("/top-up/checkout", {
        state: {
          oparatorData: { data: selectedNetwork },
          suggestedAmountsMap: selectedNetwork.suggestedAmountsMap,
          fx_rate: selectedNetwork.fx,
          editNumber: formattedPhone || editNumber,
          operatorCountryData: operatoCountryData,
          autoDetected: false,
        },
      });
      handleClose();
      return;
    }

    setNetworkSelectionError("Please select a network provider to continue.");
  };

  const handleSteps2 = async (event) => {
    event.preventDefault();

    if (isNaN(number)) {
      toast.error("Invalid phone number");
      return;
    }

    await getOperator(number);
  };

  const getOperator = async (phoneNumber) => {
    setisLoading(true);

    if (phoneNumber === "") {
      setPhoneError("Please enter a valid number");
      setisLoading(false);
      toast.error("Please enter a valid number");
      return;
    }

    const selectedCountryData = operatoCountryData || {
      iso2: defaultCountryCode,
      dialCode: country.country_code || "1",
    };
    const formattedPhone = formatTopupPhoneNumber(
      phoneNumber,
      selectedCountryData,
    );

    setEditNumber(formattedPhone);

    const data = { phone: formattedPhone, country: selectedCountryData.iso2 };

    try {
      const response = await axios.post(
        `${api_endpoint}/api/getoparator/`,
        data,
      );

      if (!response.data) {
        return;
      }

      if (response.data.autoDetected === true) {
        setOpararatorData(response.data);
        setisLoading(false);
        navigate("/top-up/checkout", {
          state: {
            oparatorData: response.data,
            suggestedAmountsMap: response.data.data.suggestedAmountsMap,
            fx_rate: response.data.data.fx,
            editNumber: formattedPhone,
            operatorCountryData: selectedCountryData,
            autoDetected: true,
          },
        });
        return;
      }

      setisLoading(false);
      setSelected(null);
      setFailedToDetectData(response.data.data || []);
      handleShow();
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.autoDetected === false
      ) {
        navigate("/top-up/checkout", {
          state: {
            oparatorData: null,
            autoDetected: false,
            editNumber: formattedPhone,
            operatorCountryData: operatoCountryData,
          },
        });
      } else {
        toast.error(
          error.response?.data?.status ||
            "Unable to detect the network. Please try again.",
        );
      }

      setisLoading(false);
    }
  };

  const handlePhoneNumberChange = (status, value, countryData) => {
    if (isNaN(value)) {
      setPhoneError("Invalid phone number");
      return;
    }

    setNumber(value);
    setPhoneError("");
    setOperatorCountryData(countryData);
  };

  return (
    <div>
      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-[#120b12]/72 backdrop-blur-[2px]"
              onClick={handleClose}
            />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
              <div className="relative z-10 flex max-h-[calc(100vh-3rem)] w-full max-w-[36rem] flex-col overflow-hidden rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_32px_100px_rgba(18,11,18,0.35)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#eadfe7] px-6 py-5 sm:px-8">
                  <div>
                    <h3 className="mb-0 text-2xl font-black tracking-[-0.03em] text-[#211722]">
                      Select network
                    </h3>
                    <p className="mb-0 mt-2 text-sm font-medium text-[#665b67]">
                      We could not detect the provider automatically. Choose the
                      right network to continue.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfe7] bg-[#fbf8f4] text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839]"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto px-6 py-5 sm:px-8">
                  {networkSelectionError !== "" && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {networkSelectionError}
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {failedToDetectData.length > 0 &&
                      failedToDetectData.map((item, index) => {
                        const isSelected = selected === index;

                        return (
                          <button
                            key={item.id || item.name}
                            type="button"
                            onClick={() => handleSelection(index)}
                            className={`relative flex min-h-[88px] items-center gap-3 rounded-[1.25rem] border p-3 text-left transition ${
                              isSelected
                                ? "border-[#551839] bg-[#fff7fb] shadow-[0_12px_35px_rgba(85,24,57,0.12)]"
                                : "border-[#eadfe7] bg-[#fbf8f4] hover:border-[#551839]/30 hover:bg-white"
                            }`}
                            aria-pressed={isSelected}
                          >
                            <span
                              className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-[#10ac84] bg-[#10ac84] text-white"
                                  : "border-[#d8cfd6] bg-white text-transparent"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </span>

                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                              <img
                                src={item.logoUrls?.[2] || item.logoUrls?.[0]}
                                alt={`${item.name} logo`}
                                className="h-full w-full object-contain"
                              />
                            </span>

                            <span className="pr-8 text-sm font-black text-[#211722]">
                              {item.name}
                            </span>
                          </button>
                        );
                      })}

                    {failedToDetectData.length === 0 && (
                      <div className="rounded-2xl bg-[#fbf8f4] p-5 text-sm font-semibold text-[#665b67]">
                        No providers were returned for this number. Close this
                        dialog and check the phone number.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#eadfe7] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-[#eadfe7] bg-white px-5 py-2.5 text-sm font-black text-[#665b67] transition hover:border-[#551839]/30 hover:text-[#551839]"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="topup-continue-button w-full px-5 py-2.5 sm:w-auto"
                    onClick={handleNetworkSelected}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="mobile__recharge">
        <h5 className="mt-0 mb-1 text-left">Start your top-up</h5>
        <p className="modern-step-help mb-3">
          Enter the recipient phone number. We will detect the network
          automatically.
        </p>

        <form
          className="pb__40 mt-10"
          style={{ justifyContent: "left" }}
          onSubmit={handleSteps2}
        >
          <div className="row" style={{ width: "100%" }}>
            <div>
              <IntlTelInput
                key={defaultCountryCode}
                preferredCountries={["us", "gb"]}
                defaultCountry={defaultCountryCode}
                containerClassName="intl-tel-input topup-phone-field"
                inputClassName="topup-phone-input"
                onPhoneNumberChange={handlePhoneNumberChange}
                autoPlaceholder="aggressive"
                placeholder="Enter your phone number"
                formatOnInit={true}
                placeholderNumberType="MOBILE"
              />
            </div>
          </div>
        </form>

        <button
          type="button"
          className="topup-continue-button mb-4"
          onClick={handleSteps2}
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {!isLoading && (
            <>
              <span>Continue to amount</span>
              <ChevronsRight size={19} strokeWidth={2.5} />
            </>
          )}
          {isLoading && <span>Detecting network...</span>}
        </button>
      </div>
    </div>
  );
}
