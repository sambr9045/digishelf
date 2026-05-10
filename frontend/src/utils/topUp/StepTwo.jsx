// StepTwo.js
import React, { useContext } from "react";
import TopUpOptions from "./StepTwo/TopUpOptions";
import ContinueButton from "./StepTwo/ContinueButton";
import Header from "./StepTwo/Header";
import { TopUpContext } from "../../components/Context/TopUpContext";

const StepTwo = () => {
  const { showCustomInput, oparatorData } = useContext(TopUpContext);
  const hasSelectedOperator = Boolean(oparatorData?.data);

  return (
    <div className="mobile__recharge text-left">
      {hasSelectedOperator && <Header />}

      <div className="mt-2">
        <div className="top-up-container">
          <div className="mb-5">
            <span className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#551839]">
              Step 2
            </span>
            <h5 className="mb-1 mt-3">Choose top-up amount</h5>
          </div>
          <p className="modern-step-help mb-4">
            Pick a suggested amount or enter a custom value, then continue to
            payment.
          </p>
          {!showCustomInput && (
            <>
              {!hasSelectedOperator ? (
                <div className="rounded-[1.5rem] border border-[#eadfe7] bg-[#fbf8f4] p-5 text-sm font-bold text-[#665b67]">
                  Please select your network provider to continue.
                </div>
              ) : (
                <TopUpOptions />
              )}
            </>
          )}
          <ContinueButton />
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
