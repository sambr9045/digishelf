import React from "react";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Check from "@mui/icons-material/Check";
import Person3OutlinedIcon from "@mui/icons-material/Person3Outlined";
import ManageHistoryOutlinedIcon from "@mui/icons-material/ManageHistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Link } from "react-router-dom";

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
              <Paper
                sx={{
                  width: 220,
                  paddingTop: "10px",
                  border: "1px solid lightgray",
                }}
                className="shadow-sm"
              >
                <MenuList dense>
                  <MenuItem>
                    <Link
                      to="/account"
                      className="text-black menu-link"
                      style={{ verticalAlign: "middle" }}
                    >
                      <ListItemIcon>
                        <Person3OutlinedIcon fontSize="large" />
                      </ListItemIcon>
                      My account
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <Link to="/history" className="text-dark menu-link">
                      <ListItemIcon>
                        <ManageHistoryOutlinedIcon fontSize="large" />
                      </ListItemIcon>
                      History
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/settings" className="text-dark menu-link">
                      <ListItemIcon>
                        <SettingsOutlinedIcon fontSize="large" />
                      </ListItemIcon>
                      Setting
                    </Link>
                  </MenuItem>
                  <Divider />
                  <MenuItem>
                    <Link to="/Logout" className="text-dark menu-link">
                      <ListItemIcon>
                        <LogoutOutlinedIcon fontSize="large" />
                      </ListItemIcon>
                      Logout
                    </Link>
                  </MenuItem>
                </MenuList>
              </Paper>
            </div>
          </div>

          {/* <div className="pop ">Hello world crazy world</div> */}
        </div>
      </div>
    </div>
  );
}
