import React from "react";
import loader from "../../assets/images/loader.svg";

export default function Loader() {
  return (
    <div>
      <div className="loader-container">
        <div className="loader-content">
          <img src={loader} alt="loader" className="loader" />
        </div>
      </div>
    </div>
  );
}
