import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import emptycart from "../../assets/images/cart/cart.svg";
import { SessionContext } from "../sessionContext";

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, mainCurrency } =
    useContext(SessionContext);

  const subtotal = cart
    ? cart.reduce(
        (sum, item) =>
          sum + parseFloat(item.AmountToPay || 0) * (item.quantity || 1),
        0,
      )
    : 0;

  const handleQtyChange = (id, delta, current) => {
    const next = Math.max(1, Math.min(100, Number(current) + delta));
    updateCartItem(id, next);
  };

  return (
    <div className="flex h-full flex-col">
      {cart && cart.length > 0 ? (
        <>
          {/* Item list */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {cart.map((item) => {
              const image = Array.isArray(item.img) ? item.img[0] : item.img;
              const lineTotal = (
                parseFloat(item.AmountToPay || 0) * (item.quantity || 1)
              ).toFixed(2);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[1.5rem] border border-[#eadfe7] bg-[#fbf8f4] p-4"
                >
                  {image && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                      <img
                        src={image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="mb-0 truncate text-sm font-black tracking-[-0.02em] text-[#211722]">
                          {item.productName}
                        </h4>
                        <p className="mb-0 mt-0.5 text-xs font-bold text-[#9a8b97]">
                          {item.recipientAmount} {item.recipientCurrency}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#b5a6b2] transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-[#eadfe7] bg-white p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(item.id, -1, item.quantity)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#551839] transition hover:bg-[#f7f1e8] disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-black text-[#211722]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(item.id, 1, item.quantity)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#551839] transition hover:bg-[#f7f1e8] disabled:opacity-40"
                          disabled={item.quantity >= 100}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-[#211722]">
                        {lineTotal} {mainCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-[#eadfe7] pt-5">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#fbf8f4] px-4 py-3">
              <span className="text-sm font-bold text-[#665b67]">Subtotal</span>
              <span className="text-base font-black text-[#211722]">
                {subtotal.toFixed(2)} {mainCurrency}
              </span>
            </div>
            <Link
              to="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#551839] px-6 py-4 text-base font-black text-white shadow-lg shadow-[#551839]/20 transition hover:bg-[#44122d]"
            >
              Checkout
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <img src={emptycart} alt="empty cart" className="w-44 opacity-80" />
          <p className="mt-6 text-base font-bold text-[#9a8b97]">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-[#b5a6b2]">
            Add gift cards to get started.
          </p>
        </div>
      )}
    </div>
  );
}
