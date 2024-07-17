// Header.js
import React, { useContext } from "react";
import { TopUpContext } from "../../../components/Context/TopUpContext";

const Header = () => {
  const { country, oparatorData, editNumber, setSteps, setShowCustomInput } =
    useContext(TopUpContext);
  const HandleEditbutton = async () => {
    setSteps(1);
    setShowCustomInput(false);
  };

  return (
    <div className="header mb-4 mt-2 border p-4 shadow-sm ">
      <img
        src={`https://flagsapi.com/${oparatorData.data.country.isoName}/flat/64.png`}
        alt="Country Flag"
        className="flag"
      />
      <span className="phone-number basecolor_custom"> {editNumber} </span>
      <img
        src={oparatorData.data.logoUrls[2]}
        alt={oparatorData.data.name}
        className="operator-logo"
      />
      <button
        className="edit-button basecolor_custom"
        onClick={HandleEditbutton}
      >
        ✎
      </button>
    </div>
  );
};

export default Header;
