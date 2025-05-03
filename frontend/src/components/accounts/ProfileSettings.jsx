import React, { useState, useContext, useEffect } from "react";
import AccountBanner from "./AccountBanner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { SessionContext } from "../sessionContext";
import { api_endpoint } from "../../../src/components/constant";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import creditCard from "../../assets/images/svg/credit-card.svg";

export default function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const { session } = useContext(SessionContext);
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone_number: "", // Updated field name
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${api_endpoint}/api/account/delete/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.status === 204) {
        toast.success("Account deleted successfully");
        window.location.href = "/signin"; // Redirect to login page after deletion
      } else {
        toast.error("Unexpected response from the server");
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      toast.error("Error deleting account, please try again");
      console.error("Error deleting account:", error);
    }
    setOpen(false);
  };

  // Fetch user data from the server when the page loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${api_endpoint}/api/account/profile/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          const userData = response.data;
          setFormData({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            phone_number: userData.phone_number, // Updated field name
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [session.accessToken]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);

    try {
      const response = await axios.post(
        `${api_endpoint}/api/account/update-profile/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        console.log("Profile updated successfully", response.data);
      } else {
        toast.error("Error updating profile, please try again");
        console.error("Error updating profile", response.data);
      }
    } catch (error) {
      toast.error("Error updating profile, please try again");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <AccountBanner title="Profile Settings" />

      <section className="personal__information pt__60 pb__60">
        <div className="container">
          <div className="row g-3">
            <div className="col-lg-12 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h6>
                    <Link
                      to="/account"
                      className="text-decoration-none text-dark"
                    >
                      <ArrowBackIcon fontSize="medium" /> My Account{" "}
                    </Link>
                  </h6>
                </div>
                <div>
                  <h4 className="mb-0">Profile Settings</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xxl-12 col-xl-12 col-lg-12">
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card p-4 shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-4">
                        <h5 className="card-title">Personal Details</h5>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleEditClick}
                        >
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="d-block">
                        <div className="mb-3 form-group text-start">
                          <label htmlFor="name" className="form-label">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            className="form-control py-3"
                            id="name"
                            value={formData.name ?? ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                          />
                        </div>
                        <br />

                        <div className="mb-3 text-start  form-group">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="form-control py-3"
                            id="email"
                            value={formData.email ?? ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                          />
                        </div>

                        <div className="mb-3 text-start">
                          <label htmlFor="phone_number" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone_number" // Updated field name
                            className="form-control py-3"
                            id="phone_number" // Updated field name
                            value={formData.phone_number ?? ""} // Updated field name
                            onChange={handleChange}
                            readOnly={!isEditing}
                          />
                        </div>

                        {isEditing && (
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                          >
                            Save Changes
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-lg-4 d-flex flex-column gap-4">
                  {/* Payment Methods Card */}
                  <div className="card p-4 shadow-sm border-0 h-100">
                    <div className="card-body text-center">
                      <img
                        src={creditCard}
                        alt="Credit Card"
                        width="100"
                        className="mb-5"
                      />
                      <h5 className="card-title">Payment Methods</h5>
                      <p className="text-muted">You have no saved methods</p>
                    </div>
                  </div>

                  {/* Delete Account Card */}
                </div>
              </div>
            </div>
            <div className="card p-4 shadow-sm border-0 h-100 mt-5 ">
              <div className="card-body text-left">
                <h5 className="card-title ">Delete Account</h5>
                <p className="text-muted py-3">
                  By opting to delete account, this will raise a request for
                  your Ding account to be closed and all personal data
                  associated with it to be erased. It may take up to one month
                  to process your request.
                </p>
                <p
                  className="text-danger "
                  onClick={handleClickOpen}
                  style={{ cursor: "pointer" }}
                >
                  Delete My Account
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Delete Account Confirmation"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete your account? This action cannot
              be undone. All your data will be permanently removed from our
              system.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleConfirmDelete}
              autoFocus
              className="btn btn-danger text-danger"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </section>
    </>
  );
}
