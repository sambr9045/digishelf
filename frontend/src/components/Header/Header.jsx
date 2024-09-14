import React, { useContext, useState, useEffect } from "react";
import logo4 from "../../assets/images/NLogo/logo4.png";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Offcanvas from "react-bootstrap/Offcanvas";
import Cart from "../includes/Cart";
import { SessionContext } from "../sessionContext";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import UserAccountPart from "../includes/UserAccountPart";
import MobileMenu from "../includes/MobileMenu";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function Header() {
  const { cart } = useContext(SessionContext);
  const [pathActive, setPathActive] = useState(false);
  const { session, logout } = useContext(SessionContext);
  const pathname = window.location.pathname;
  console.log(pathname);

  const [showCart, setShowCart] = useState(false);

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  if (localStorage.getItem("sct") && session) {
    toast.success(`You sucessfully login as ${session.user.username}`);
    localStorage.removeItem("sct");
  }
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
              <a href="/" className="logo">
                <img
                  src={logo4}
                  alt="logo"
                  style={{ width: "160px", height: "auto" }}
                />
              </a>
              <a href="/" className="small__logo d-xl-none">
                <img
                  src={logo4}
                  alt="logo"
                  style={{ width: "100px", height: "auto" }}
                />
              </a>
            </div>
            <div className="menu__right__components d-flex align-items-center">
              <div className="sigup__grp d-lg-none">
                {session && session.user ? (
                  <></>
                ) : (
                  <>
                    <NavLink
                      to="/signin"
                      className="cmn__btn outline__btn mr-4"
                    >
                      <span>Signin</span>
                    </NavLink>
                    &nbsp; &nbsp;
                    <NavLink to="/signup" className="cmn__btn">
                      Signup
                    </NavLink>
                  </>
                )}
              </div>
              <div
                className="header-bar d-lg-none"
                style={{ cursor: "pointer" }}
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasRight"
                aria-controls="offcanvasRight"
              >
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
                  <UserAccountPart session={session} logout={logout} />
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

        {/* mobile menu  */}

        <MobileMenu session={session} />
      </header>
    </>
  );
}
