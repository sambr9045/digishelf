// CustomAmountInput.js
import React from "react";

const CustomAmountInput = ({
  showCustomInput,
  setShowCustomInput,
  customAmount,
  handleCustomAmountChange,
  handleEnterCustomAmountClick,
}) => {
  return (
    <>
      {showCustomInput && (
        <div className="custom-amount-input-container">
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Enter amount (1-500 GHS)"
            className="custom-input form-control mb-4"
          />
        </div>
      )}
      {!showCustomInput && (
        <div className="recharge__numberbtn mb-5">
          <a
            href="javascript:void(0)"
            className="addanother"
            onClick={handleEnterCustomAmountClick}
          >
            <span className="plus">
              <i className="material-symbols-outlined">add </i>
            </span>
            <span className="text fz-18 fw-600">Enter custom amount</span>
          </a>
        </div>
      )}
    </>
  );
};

export default CustomAmountInput;
