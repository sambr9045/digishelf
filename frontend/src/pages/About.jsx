import React from "react";
import Header from "../components/Header/Header";

export default function About() {
  return (
    <div>
      <Header />
      <section className="breadcumnd__banner">
        <div className="container">
          <div className="breadcumnd__wrapper">
            <h2 className="bread__title">About us</h2>
            <ul className="breadcumnd__link">
              <li>
                <a href="index.html">Home</a>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li>
              <li>
                <a href="javascript:void(0)">Pages</a>
              </li>
              <li>
                <i className="material-symbols-outlined">chevron_right</i>
              </li>
              <li>About us</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
