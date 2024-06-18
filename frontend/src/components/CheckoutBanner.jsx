import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header/Header";

export default function CheckoutBanner() {
  return (
    <>
      <Header />
      <section className="breadcumnd__banner">
        <div className="container">
          <div className="breadcumnd__wrapper">
            <h2 className="bread__title">Checkout</h2>
            <ul className="breadcumnd__link">
              {/* <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li> */}

              {/* {type !== "" ? (
                <>
                  <li>
                    <Link to={`/gift-cards/`}>Gift Cards</Link>
                  </li>
                  <li>
                    <i className="material-symbols-outlined">chevron_right</i>
                  </li>
                  <li>
                    <a href="javascript:void(0)">{type}</a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="javascript:void(0)">Gift Cards</a>
                  </li>
                </>
              )} */}

              {}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
