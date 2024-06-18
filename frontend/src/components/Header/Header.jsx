import React, { useContext } from "react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Cart from "../includes/Cart";
import { SessionContext } from "../sessionContext";

export default function Header() {
  const { cart } = useContext(SessionContext);

  return (
    <>
      <header className="header-section">
        <div className="container">
          <div className="header-wrapper">
            <div className="logo-menu">
              <a href="index.html" className="logo">
                <img src={logo} alt="logo" />
              </a>
              <a href="index.html" className="small__logo d-xl-none">
                <img src="assets/img/logo/favicon.png" alt="logo" />
              </a>
            </div>
            <div className="menu__right__components d-flex align-items-center">
              <div className="sigup__grp d-lg-none">
                <Link to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </Link>

                <Link to="/signup" className="cmn__btn">
                  Signup
                </Link>
              </div>
              <div className="header-bar d-lg-none">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <ul className="main-menu">
              <li className="grid__style">
                <Link to="/" className="d-flex">
                  Home
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/top-up" className="d-flex">
                  Top-up
                </Link>
              </li>
              <li>
                <Link to="/gift-cards" className="d-flex">
                  Gift cards
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/pay-bills" className="d-flex">
                  Pay Bills
                </Link>
              </li>
              <li className="grid__style">
                <Link to="/about" className="d-flex">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="d-flex">
                  Contact
                </Link>
              </li>
              <li className="sigup__grp d-lg-none d-flex align-items-center">
                <Link to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </Link>

                <Link to="/signup" className="cmn__btn">
                  Signup
                </Link>
              </li>
            </ul>
            <div className="sigin__grp d-flex align-items-center">
              <Link to="/signin" className="cmn__btn outline__btn">
                <span>Signin</span>
              </Link>

              <Link
                to=""
                className="text-black"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasRight"
                aria-controls="offcanvasRight"
              >
                {/* <span
                  className="material-symbols-outlined text-black "
                  style={{ fontSize: "25px" }}
                >
                  shopping_cart
                </span> */}
                <Stack
                  spacing={4}
                  direction="row"
                  sx={{ color: "action.active" }}
                >
                  <Badge
                    color="secondary"
                    badgeContent={cart ? cart.length : 0}
                    showZero
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#551839",
                        color: "white",
                      },
                    }}
                  >
                    <ShoppingCartOutlinedIcon color="white" />
                  </Badge>
                </Stack>
              </Link>

              <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="offcanvasRight"
                aria-labelledby="offcanvasRightLabel"
              >
                <div className="offcanvas-header">
                  <h5 id="offcanvasRightLabel">My Cart</h5>
                  <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="offcanvas-body empty-cart">
                  <Cart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
