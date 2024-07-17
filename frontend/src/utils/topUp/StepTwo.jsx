// StepTwo.js
import React, { useContext } from "react";
import TopUpOptions from "./StepTwo/TopUpOptions";
import CustomAmountInput from "./StepTwo/CustomAmountInput";
import ContinueButton from "./StepTwo/ContinueButton";
import Header from "./StepTwo/Header";
import { TopUpContext } from "../../components/Context/TopUpContext";

const StepTwo = () => {
  const {
    handleSubmitStepTwo,
    showCustomInput,
    selectedOptinData,
    autoDetected,
  } = useContext(TopUpContext);

  return (
    <div className="mobile__recharge text-left">
      {autoDetected && (
        <>
          <Header />
        </>
      )}
      <div className="mt-2">
        <div className="top-up-container">
          {!showCustomInput && (
            <>
              {!autoDetected ? (
                <>Select an option let select network</>
              ) : (
                <>
                  <h6 className="mb-3 basecolor_custom robot-thin">
                    {selectedOptinData === "" && (
                      <>
                        <b> 1. </b> Let’s select a top-up
                      </>
                    )}
                  </h6>
                  <TopUpOptions />
                  {/* <CustomAmountInput
                showCustomInput={showCustomInput}
                setShowCustomInput={setShowCustomInput}
                customAmount={customAmount}
                handleCustomAmountChange={handleCustomAmountChange}
                handleEnterCustomAmountClick={handleEnterCustomAmountClick}
              /> */}
                </>
              )}
            </>
          )}
          {/* Additional sections like payment methods can be added similarly */}
          <ContinueButton handleSubmitStepTwo={handleSubmitStepTwo} />
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
