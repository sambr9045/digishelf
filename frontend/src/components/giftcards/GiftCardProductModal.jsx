import React, { useEffect } from "react";
import GiftCardProductDetail from "./GiftCardProductDetail";

export default function GiftCardProductModal({ productId, onClose }) {
  useEffect(() => {
    if (!productId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, productId]);

  if (!productId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close gift card details"
        className="fixed inset-0 bg-[#211722]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gift card details"
        className="relative z-[71] my-8 w-full max-w-6xl rounded-[2rem] border border-[#efe7ed] bg-white p-5 shadow-[0_28px_90px_rgba(33,23,34,0.22)] sm:p-8"
      >
        <GiftCardProductDetail productId={productId} onClose={onClose} />
      </div>
    </div>
  );
}
