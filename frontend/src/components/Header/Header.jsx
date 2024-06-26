import React, { useContext, useState, useEffect } from "react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Offcanvas from "react-bootstrap/Offcanvas";
import Cart from "../includes/Cart";
import { SessionContext } from "../sessionContext";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function Header() {
  const { cart } = useContext(SessionContext);
  const [pathActive, setPathActive] = useState(false);
  const { session } = useContext(SessionContext);
  const pathname = window.location.pathname;
  console.log(pathname);

  const [showCart, setShowCart] = useState(false);

  const toggleCart = () => {
    setShowCart(!showCart);
  };
  // const location = useLocation();
  // const checkActive = (match, location) => {
  //   return (
  //     location.pathname === "/checkout" || location.pathname === "/gift-cards"
  //   );
  // };

  useEffect(() => {
    if (pathname.includes("gift-card") || pathname.includes("giftcard")) {
      setPathActive(true);
    }
  }, []);

  return (
    <>
      <ToastContainer position="top-center" theme="colored" />

      <header className="header-section shadow-sm">
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
                  Top-<span className="text-lowercase">up</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/gift-cards"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex"
                      : isActive || pathActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Gift&nbsp;<span className="text-lowercase">cards</span>
                </NavLink>
              </li>
              <li className="grid__style">
                <NavLink
                  to="/pay-bills"
                  className={({ isActive, isPending }) =>
                    isPending
                      ? "pending d-flex "
                      : isActive
                      ? "menu-active d-flex"
                      : "d-flex"
                  }
                >
                  Pay&nbsp;<span className="text-lowercase">bills</span>
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
              <li className="grid__style">
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
              <NavLink to="" className="text-black" onClick={toggleCart}>
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

              {session && session.user ? (
                <>
                  <div className="user-account ">
                    <div className="container d-flex align-items-center text-center">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#551839",
                        }}
                      >
                        {session.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="me-2">
                        <b className="pl-2">&nbsp;My account</b>
                        <span
                          className="material-symbols-outlined text-black"
                          style={{
                            fontSize: "18px",
                            verticalAlign: "middle",
                            marginTop: "0px",
                            paddingLeft: "3px",
                          }}
                        >
                          keyboard_arrow_down
                        </span>
                      </div>

                      <div className="popover-custom">
                        {/* <button className="btn">Hover me to see</button> */}

                        <div className="popover">
                          {/* <div className="arrow"></div> */}
                          <h6 className="popover-custom-header">
                            <span className="text-muted mt-3">Hello</span>{" "}
                            <span className="basecolor_custom">Shamsu</span>
                          </h6>
                          <div className="popover-body p-0">
                            <ul className="list-group p-0 bg-white">
                              <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                                <span className="material-symbols-outlined user-account-icon">
                                  person
                                </span>
                                <span className="user-account-icon-name">
                                  account
                                </span>
                              </li>
                              <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                                <span className="material-symbols-outlined user-account-icon">
                                  history
                                </span>
                                <span className="user-account-icon-name">
                                  profile
                                </span>
                              </li>
                              <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                                <span className="material-symbols-outlined user-account-icon">
                                  history
                                </span>
                                <span className="user-account-icon-name">
                                  History
                                </span>
                              </li>

                              <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                                <span className="material-symbols-outlined user-account-icon">
                                  settings
                                </span>
                                <span className="user-account-icon-name">
                                  Settings
                                </span>
                              </li>

                              <hr />

                              <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center flex-row">
                                <span className="material-symbols-outlined user-account-icon">
                                  logout
                                </span>
                                <span className="user-account-icon-name">
                                  Logout
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* <div className="pop ">Hello world crazy world</div> */}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/signin" className="cmn__btn outline__btn ml-3">
                    <span>Signin</span>
                  </NavLink>
                </>
              )}

              {/* Button to toggle Offcanvas */}

              {/* Offcanvas component */}
              <Offcanvas
                show={showCart}
                onHide={() => setShowCart(false)}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>My Cart</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  {/* Your Cart component or content */}
                  <div className="empty-cart">
                    <Cart />
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
