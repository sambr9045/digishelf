import React from "react";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { SessionContext } from "../../sessionContext";
import { api_endpoint } from "../../constant";
import { Link } from "react-router-dom";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { Box, Avatar, Typography, Collapse, Divider } from "@mui/material";
function RecentActivities() {
  const [recentActivities, setRecentActivities] = useState([]);
  const { session } = useContext(SessionContext);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const token = session?.accessToken; // Get the access token from the session context
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await axios.get(
          `${api_endpoint}/api/account/recent_activity/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setRecentActivities(response.data.data);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    fetchRecentActivities();
  }, [token]);

  return (
    <div className="col-md-8 ">
      <div className="card p-4 border-0 p-0 h-100">
        <div className="card-header border-0 text-muted bg-white">
          Recent activity
        </div>
        <div className="card-body p-0">
          {recentActivities.length === 0 ? (
            <>
              <h5 className="card-title">Send your first top-up</h5>
              <p className="card-text text-muted">
                Once you send your first top-up, your top-up history will appear
                here.
              </p>
              {/* <a href="#" className="btn btn-success fw-bold mt-5">
                Send now
              </a> */}
              <div className="mt-5">
                <Link
                  to="/"
                  className="cmn__btn mb-5 form-control text-center"
                  style={{ opacity: 1, cursor: "pointer", width: "200px" }}
                >
                  <span>Send Now</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {recentActivities.map((activity, index) => (
                <Box key={index}>
                  {/* MAIN ROW */}
                  <Box
                    onClick={() => toggleExpand(index)}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={2}
                    sx={{
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                    }}
                    className="shadow-sm px-3 mb-1"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: "#f1f3f5",
                          color: "#333",
                          width: 48,
                          height: 48,
                          mr: 2,
                        }}
                      >
                        {activity.operator && activity.operator !== "" ? (
                          <PhoneInTalkIcon />
                        ) : (
                          <CardGiftcardIcon />
                        )}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold">
                          {activity.operator && activity.operator !== ""
                            ? "Airtime"
                            : "Gift Card"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <span
                            className={
                              activity.status === "SUCCESSFUL"
                                ? "text-success"
                                : activity.status === "PENDING"
                                ? "text-dark"
                                : "text-danger"
                            }
                          >
                            {activity.status.toLowerCase()}
                          </span>
                        </Typography>

                        {activity.phone_number && (
                          <Typography variant="caption" color="text.secondary">
                            <b>{activity.phone_number}</b>
                          </Typography>
                        )}
                        <br />

                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography fontWeight="bold">
                      {activity.sender_currency} {activity.total_paid}
                    </Typography>
                  </Box>

                  {/* EXPANDED DETAILS */}
                  <Collapse in={expandedIndex === index}>
                    <Box px={4} pb={2} color="text.secondary">
                      <Divider sx={{ my: 1 }} />
                      {activity.transaction_id && (
                        <Typography variant="caption">
                          <strong>Transaction ID:</strong>{" "}
                          {activity.transaction_id}
                        </Typography>
                      )}
                      <br />
                      {activity.payment_method && (
                        <Typography variant="caption">
                          <strong>Payment Method:</strong>{" "}
                          {activity.payment_method}
                        </Typography>
                      )}

                      <br />
                      {activity.operator && activity.operator !== "" && (
                        <>
                          <Typography variant="caption">
                            <strong>reference:</strong> {activity.reference}
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            <strong>Operator:</strong> {activity.operator}
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            <strong>Receiver Country:</strong>{" "}
                            {activity.receiver_country}
                          </Typography>
                        </>
                      )}
                      {/* Add more if needed */}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentActivities;
