// ContinueButton.js
import React, { useContext } from "react";
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
    <a
      href="#"
      className="cmn__btn mb-5 form-control text-center"
      onClick={handleSubmitStepTwo}
    >
      <span> NEXT </span>{" "}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
      </svg>{" "}
    </a>
  );
};

export default ContinueButton;
