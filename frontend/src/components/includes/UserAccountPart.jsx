import React from "react";

export default function UserAccountPart({ session, logout }) {
  return (
    <div>
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
            <b className="pl-2"> &nbsp; My account </b>
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
                <span className="text-muted mt-3"> Hello </span>
                <span className="basecolor_custom"> Shamsu </span>
              </h6>
              <div className="popover-body p-0">
                <ul className="list-group p-0 bg-white">
                  <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                    <span className="material-symbols-outlined user-account-icon">
                      person
                    </span>
                    <span className="user-account-icon-name">account </span>
                  </li>
                  <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                    <span className="material-symbols-outlined user-account-icon">
                      history
                    </span>
                    <span className="user-account-icon-name">profile </span>
                  </li>
                  <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                    <span className="material-symbols-outlined user-account-icon">
                      history
                    </span>
                    <span className="user-account-icon-name">History </span>
                  </li>
                  <li className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center">
                    <span className="material-symbols-outlined user-account-icon">
                      settings
                    </span>
                    <span className="user-account-icon-name">Settings </span>
                  </li>
                  <hr />
                  <li
                    className="list-group-item list-group-item-secondary bg-white border-0 fs-6 d-flex align-items-center flex-row"
                    onClick={logout}
                  >
                    <span className="material-symbols-outlined user-account-icon">
                      logout
                    </span>
                    <span className="user-account-icon-name">Logout </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* <div className="pop ">Hello world crazy world</div> */}
        </div>
      </div>
    </div>
  );
}
