import React from "react";
import loader from "../../assets/images/loader.svg";
import processing from "../../assets/images/processing.svg";
export default function Loader({ beforeLoaderContent = false }) {
  return (
    <div>
      {beforeLoaderContent && (
        <>
          <div className="before-loader-container">
            <img src={processing} alt="processing iamge" />
          </div>
        </>
      )}
      <div className="loader-container">
        <div className="loader-content">
          <img src={loader} alt="loader" className="loader" />
        </div>
      </div>
    </div>
  );
}
