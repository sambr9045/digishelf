import React, { useContext } from "react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Cart from "../includes/Cart";
import { SessionContext } from "../sessionContext";
import { NavLink } from "react-router-dom";

export default function Header() {
  const { cart } = useContext(SessionContext);
  // const location = useLocation();
  // const checkActive = (match, location) => {
  //   return (
  //     location.pathname === "/checkout" || location.pathname === "/gift-cards"
  //   );
  // };

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
                <NavLink to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </NavLink>

                <NavLink to="/signup" className="cmn__btn">
                  Signup
                </NavLink>
              </div>
              <div className="header-bar d-lg-none">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <ul className="main-menu">
              <li className="grid__style">
                {/* <NavLink
                  to="/"
                  // className="d-flex"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Home
                </NavLink> */}
              </li>
              <li className="grid__style">
                <NavLink
                  to="/"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Top-up
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/gift-cards"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Gift cards
                </NavLink>
              </li>
              <li className="grid__style">
                <NavLink
                  to="/pay-bills"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Pay Bills
                </NavLink>
              </li>
              <li className="grid__style">
                <NavLink
                  to="/about"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "menu-active" : ""
                  }
                >
                  Contact
                </NavLink>
              </li>
              <li className="sigup__grp d-lg-none d-flex align-items-center">
                <NavLink to="/signin" className="cmn__btn outline__btn">
                  <span>Signin</span>
                </NavLink>

                <NavLink to="/signup" className="cmn__btn">
                  Signup
                </NavLink>
              </li>
            </ul>
            <div className="sigin__grp d-flex align-items-center">
              <NavLink
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
              </NavLink>

              <NavLink to="/signin" className="cmn__btn outline__btn ml-3">
                <span>Signin</span>
              </NavLink>

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
