import React from "react";
import { NavLink } from "react-router-dom";
import twitter from "../../assets/images/social/twitter.png";
import facebook from "../../assets/images/social/facebook.png";
import instagram from "../../assets/images/social/instagram.png";
import linkedin from "../../assets/images/social/linkedin.png";

export default function MobileMenu({ session }) {
  return (
    <div>
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
        style={{ width: "85%" }}
      >
        <div className="offcanvas-header">
          <h5 id="offcanvasRightLabel"></h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body mobile-menu">
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink to="/" className="nav-link active">
                Top-up
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/gift-cards" className="nav-link">
                Gift Cards
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className="nav-link">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/contact" className="nav-link">
                Contact us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/faq" className="nav-link">
                Faq
              </NavLink>
            </li>

            {session && session.user && (
              <>
                <br />
                <hr />
                <br />
                <div className="mobile-menu-account">
                  <li className="nav-item">
                    <NavLink to="/faq" className="nav-link">
                      <span className="material-symbols-outlined mobile-menu-icon">
                        account_circle
                      </span>
                      My Account
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/faq" className="nav-link">
                      <span className="material-symbols-outlined mobile-menu-icon">
                        person
                      </span>
                      Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/faq" className="nav-link">
                      <span className="material-symbols-outlined mobile-menu-icon">
                        manage_history
                      </span>
                      History
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/faq" className="nav-link">
                      <span className="material-symbols-outlined  mobile-menu-icon">
                        settings
                      </span>
                      Settings
                    </NavLink>
                  </li>
                </div>

                <br />
                <hr />
                <br />
                <li className="nav-item">
                  <NavLink to="/faq" className="nav-link">
                    <span className="material-symbols-outlined mobile-menu-icon">
                      logout
                    </span>
                    Logout
                  </NavLink>
                </li>
              </>
            )}

            <div className="d-flex justify-content-left mt-5">
              <a
                href="https://www.facebook.com"
                className="text-dark mx-2"
                aria-label="Facebook"
              >
                <img src={twitter} alt="twitter" className="social-menu-icon" />
              </a>

              <a
                href="https://www.instagram.com"
                className="text-dark mx-2"
                aria-label="Instagram"
              >
                <img
                  src={facebook}
                  alt="facebook"
                  className="social-menu-icon"
                />
              </a>
              <a
                href="https://www.instagram.com"
                className="text-dark mx-2"
                aria-label="Instagram"
              >
                <img
                  src={linkedin}
                  alt="linkeding"
                  className="social-menu-icon"
                />
              </a>
              <a
                href="https://www.instagram.com"
                className="text-dark mx-2"
                aria-label="Instagram"
              >
                <img
                  src={instagram}
                  alt="linkeding"
                  className="social-menu-icon"
                />
              </a>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}
