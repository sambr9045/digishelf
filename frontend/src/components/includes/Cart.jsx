import React, { useContext } from "react";
import emptycart from "../../assets/images/cart/cart.svg";
import { SessionContext } from "../sessionContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, mainCurrency } =
    useContext(SessionContext);
  const HandleCardOnCahnge = async (e, id) => {
    const cartValue = e.target.value;
    updateCartItem(id, cartValue);
  };

  const handleOnCHange = (e) => {
    console.log(e.target.value);
  };
  return (
    <div>
      {cart && cart.length > 0 ? (
        <>
          {cart.map((item) => (
            <>
              <div key={item.id} className="card p-0 shadow-sm border-1 mb-2">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-1">
                    <img
                      src={item.img}
                      alt="Airbnb Gift Card"
                      className="img-fluid"
                      style={{
                        width: "80px",
                        height: "60px",
                        borderRadius: "5px",
                      }}
                    />
                    <div className="ms-3">
                      <h5 className="mb-0"> {item.productName} </h5>
                      <p className="text-muted mb-0">
                        {item.recipientAmount} &nbsp; {item.recipientCurrency}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-footer mt-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fs-6">
                      {(parseFloat(item.AmountToPay) * item.quantity).toFixed(
                        2
                      )}
                      &nbsp; {mainCurrency}
                    </div>
                    <input
                      type="number"
                      className="form-control"
                      style={{
                        width: "100px",
                      }}
                      min="1"
                      max="100"
                      value={item.quantity}
                      onChange={(e) => HandleCardOnCahnge(e, item.id)}
                    />
                    <span
                      className="material-symbols-outlined fs-5 text-danger"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      delete
                    </span>
                  </div>
                </div>
              </div>
            </>
          ))}
          <div className="terms-and-condition mt-5">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckIndeterminate"
                onChange={handleOnCHange}
                checked
              />
              <label
                className="form-check-label"
                htmlFor="flexCheckIndeterminate"
              >
                I have read and agree to the Privacy Policy.
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckIndeterminate"
                onChange={handleOnCHange}
                checked
              />
              <label
                className="form-check-label fs-8"
                htmlFor="flexCheckIndeterminate"
              >
                I have read and agree to the Refund and Cancellation Policy.
              </label>
            </div>
          </div>
          <div className="cart-checkout mt-4">
            <Link
              to="/checkout"
              className="cmn__btn mb-5  form-control"
              onClick=""
            >
              <span> Checkout </span>
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
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="justify-content-center mt-5 mb-5 text-center">
            <img src={emptycart} alt="empty cart" />
            <p className="text-muted mt-5">Your cart is currently empty</p>
          </div>
        </>
      )}
      {/* <hr className="mt-5" /> */}
    </div>
  );
}
