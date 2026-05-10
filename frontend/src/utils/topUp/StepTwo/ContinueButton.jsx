// ContinueButton.js
import React, { useContext } from "react";
import { ArrowRight } from "lucide-react";
import { TopUpContext } from "../../../components/Context/TopUpContext";
import { validateEmail } from "../../../components/includes/Functions";
import { toast } from "react-toastify";

const ContinueButton = () => {
  const { EmailAddress, selectedOptinData, setEmailError, setSteps } =
    useContext(TopUpContext);
  console.log(selectedOptinData);

  const handleSubmitStepTwo = async (e) => {
    e.preventDefault();

    if (!validateEmail(EmailAddress) || EmailAddress === "") {
      setEmailError("Invalide email address");
      toast.error("Invalide email address !!");
      return;
    } else if (selectedOptinData === "" || selectedOptinData === undefined) {
      toast.error("Please select amount to top-up!!");
      return;
    } else {
      setEmailError("");
      setSteps(3);
    }
  };
  return (
    <button
      type="button"
      className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#551839] px-6 text-base font-black text-white shadow-lg shadow-[#551839]/15 transition hover:bg-[#44122d] focus:outline-none focus:ring-4 focus:ring-[#551839]/15"
      onClick={handleSubmitStepTwo}
    >
      <span>Continue to payment</span>
      <ArrowRight className="h-5 w-5" />
    </button>
  );
};

export default ContinueButton;
