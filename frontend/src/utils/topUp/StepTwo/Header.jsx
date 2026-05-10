// Header.js
import React, { useContext } from "react";
import { PencilLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopUpContext } from "../../../components/Context/TopUpContext";

const Header = () => {
  const { oparatorData, editNumber, setShowCustomInput } =
    useContext(TopUpContext);
  const navigate = useNavigate();
  const HandleEditbutton = async () => {
    setShowCustomInput(false);
    navigate("/");
  };

  return (
    <div className="mb-6 rounded-[1.5rem] border border-[#eadfe7] bg-[#fbf8f4] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <img
              src={`https://flagsapi.com/${oparatorData.data.country.isoName}/flat/64.png`}
              alt={`${oparatorData.data.country.name || "country"} flag`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#9a8b97]">
              Recipient
            </p>
            <p className="mb-0 truncate text-lg font-black text-[#211722]">
              {editNumber}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {oparatorData.data.logoUrls?.[2] && (
            <img
              src={oparatorData.data.logoUrls[2]}
              alt={oparatorData.data.name}
              className="h-10 w-10 rounded-xl object-contain"
            />
          )}
          <div className="hidden text-right sm:block">
            <p className="mb-0 text-sm font-black text-[#551839]">
              {oparatorData.data.name}
            </p>
            <p className="mb-0 text-xs font-bold text-[#665b67]">
              {oparatorData.data.country.name}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#eadfe7] bg-white px-4 py-3 text-sm font-black text-[#551839] transition hover:border-[#551839]/30 hover:bg-[#fffaf4] sm:w-auto"
        onClick={HandleEditbutton}
      >
        <PencilLine className="h-4 w-4" />
        Edit number
      </button>
    </div>
  );
};

export default Header;
