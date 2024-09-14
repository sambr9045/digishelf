import React from "react";
import Header from "../Header/Header";
import { Link } from "react-router-dom";

export default function AccountBanner({ title }) {
  return (
    <>
      <Header />

      <section className="breadcumnd__banner">
        <div className="container">
          <div className="breadcumnd__wrapper">
            <h2 className="bread__title ">{title}</h2>
            <ul className="breadcumnd__link">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li>

              <li>{title}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
