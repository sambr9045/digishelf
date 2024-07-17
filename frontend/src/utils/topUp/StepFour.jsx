import React, { useContext } from "react";
import { TopUpContext } from "../../components/Context/TopUpContext";

export default function StepFour() {
  const { oparatorData, setSteps } = useContext(TopUpContext);

  return (
    <>
      <div className="container">
        <div className="card p-4 border-0 ">
          <div className="row align-items-center">
            <div className="col-12 text-left mb-4">
              <h5 className="font-weight-bold">Your order</h5>
            </div>

            <div className="col-md-12 mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <p className="mb-1 font-weight-bold mr-2">+233500872933</p>
                </div>

                <div className="d-flex align-items-center">
                  <img
                    src={oparatorData.data.logoUrls[2]}
                    alt="Vodafone"
                    style={{
                      width: "20px",
                      marginRight: "10px",
                    }}
                  />

                  <span
                    onClick={() => {
                      setSteps(1);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                    </svg>
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-muted mb-1">Receives</p>
                <h4 className="font-weight-bold text__base">83.46 GHS</h4>
              </div>
              <hr />
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="mb-0 font-weight-bold text-muted">
                        Your Total
                      </p>
                      <p className="mb-0 font-weight-bold text__base">
                        8.93 USD
                      </p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-1 text-muted">Top-up subtotal</p>
                      <p className="mb-1 text__base">7.49 USD</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-1 text-muted">Top-up fee</p>
                      <p className="mb-1 text__base">1.44 USD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a
            href="#"
            className="cmn__btn mb-5 mt-4 text-center"
            onClick={() => {
              setSteps(4);
            }}
          >
            <span>Continue to payment</span>
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
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
