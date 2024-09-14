import React from "react";
import user from "../../assets/images/account/user.png";

export default function SidePanel() {
  return (
    <>
      <div className="col-xxl-4 col-xl-4 col-lg-4">
        <div className="personal__infotabs">
          <ul className="nav">
            <li className="nav-item">
              <a
                href="personal-information.html"
                className="nav-link menu-active"
              >
                {/* <span className="icon">
                  <img src={user} alt="user" />
                </span> */}
                <span className="fs-4"> Account </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="personal-information.html" className="nav-link">
                {/* <span className="icon">
                  <img src="assets/img/svg/log.svg" alt="login" />
                </span> */}
                <span className="fs-4"> Personal Information </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="login-security.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/log.svg" alt="login" />
                </span>
                <span> Login and security </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="favourites.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/badge.svg" alt="login" />
                </span>
                <span> Favourites </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="debit-creadit.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/creadits.svg" alt="login" />
                </span>
                <span> Credit or Debit Cards </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="transaction.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/file-transfer.svg" alt="login" />
                </span>
                <span> Transaction </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="password-change.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/password-change.svg" alt="login" />
                </span>
                <span> Change Password </span>
              </a>
            </li>
            <li className="nav-item">
              <a href="notification.html" className="nav-link">
                <span className="icon">
                  <img src="assets/img/svg/notifications.svg" alt="login" />
                </span>
                <span> Notifications </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
