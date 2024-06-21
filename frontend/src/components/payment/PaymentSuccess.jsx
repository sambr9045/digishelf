import React, { useState, useContext, useEffect } from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { api_endpoint } from "../constant";
import GiftCardBanner from "../GiftCardBanner";
import { useParams } from "react-router-dom";
import Loader from "../includes/Loader";
import orde_success from "../../assets/images/orde_success.svg";
import order_completed from "../../assets/images/order_completed.svg";

function formatDate(datetimeString) {
  const date = new Date(datetimeString);
  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
}

export default function PaymentSuccess() {
  const { reference } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [redeemLoading, setRedeemLoading] = useState(false);

  const fetchOrderData = async () => {
    const response = await axios.post(`${api_endpoint}/api/giftcardorder/`, {
      reference: reference,
    });
    if (response.data) {
      setOrderData(response.data.data);
      console.log(response.data.data);
      if (response.data.data.transactionData.length === 0) {
        setRedeemLoading(true);
      } else {
        setRedeemLoading(false);
      }
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    await fetchOrderData();
  };

  useEffect(() => {
    handleRequest();
  }, []);
  return (
    <div>
      <GiftCardBanner type={name} details={true} />
      {isLoading && (
        <>
          <Loader />
        </>
      )}
      <section className="flight__onewaysection pb__60">
        <div className="container">
          <div className="cars__gridwrapper">
            <div className="row g-4 ">
              <div className="container gift-card-step-2 ">
                <div className="row justify-content-center">
                  <div className="col-lg-6 ">
                    <div className=" p-2 mb-3 border-0">
                      <div className="payment__success__inner">
                        {!isLoading && (
                          <>
                            <div className="payment__success__header">
                              <div className="">
                                {/* <i className="material-symbols-outlined">
                                  done
                                </i> */}
                                <img
                                  src={order_completed}
                                  alt="success"
                                  style={{ width: "150px", height: "auto" }}
                                  className="mt-5 mb-5"
                                />
                              </div>
                              <h4 className="basecolor_custom mb-2">
                                Payment completed
                              </h4>
                              <div>
                                Your payment has been successfully processed, a
                                confirmation email will be sent to you shortly.
                              </div>
                            </div>
                            <div className="payment__success__body shadow-sm p-1">
                              <ul className="p-0">
                                <li>
                                  <span>Transactions ID</span>
                                  <span className="textbo">
                                    {orderData.product_data.reference}
                                  </span>
                                </li>
                                <li>
                                  <span>Date</span>
                                  <span className="textbo">
                                    {formatDate(
                                      orderData.product_data.created_at
                                    )}
                                  </span>
                                </li>
                                <li>
                                  <span>Email</span>
                                  <span className="textbo">
                                    {" "}
                                    {orderData.product_data.email}
                                  </span>
                                </li>

                                <li>
                                  <span>Amount Paid</span>
                                  <span className="textbo">
                                    <b>
                                      {orderData.product_data.country ===
                                      "GH" ? (
                                        <>
                                          GHS&nbsp;
                                          {orderData.product_data.amount}
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </b>
                                  </span>
                                </li>
                              </ul>
                            </div>

                            <div className="payment__success__body shadow-sm table-responsive p-1">
                              {redeemLoading ? (
                                <>
                                  <div className="loading text-center pt-4 pb-4">
                                    <h6> Processing card...</h6>
                                    <div className="fs-6 text-muted">
                                      <p className="fs-6">
                                        Please wait while we process your
                                        transaction.
                                      </p>
                                      <p className="fs-6">
                                        Refreshe in a few seconds...
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-outline-secondary mt-4"
                                      onClick={handleRequest}
                                    >
                                      Refresh
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <table className="table table-borderless ">
                                    <thead>
                                      <tr>
                                        <th scope="col">Product</th>
                                        <th scope="col">Card</th>
                                        <th scope="col">Pin</th>
                                      </tr>
                                    </thead>
                                    {orderData.transactionData.map((item) => (
                                      <>
                                        <tbody key={item.id}>
                                          {item.redeem_data &&
                                            JSON.parse(item.redeem_data).map(
                                              (redeem) => (
                                                <>
                                                  <tr>
                                                    <td className="fs-8">
                                                      {
                                                        JSON.parse(item.product)
                                                          .productName
                                                      }
                                                      &nbsp; (
                                                      <b className="fs-8">
                                                        {
                                                          JSON.parse(
                                                            item.product
                                                          ).unitPrice
                                                        }
                                                        &nbsp;
                                                        {
                                                          JSON.parse(
                                                            item.product
                                                          ).currencyCode
                                                        }
                                                      </b>
                                                      ) &nbsp;
                                                    </td>

                                                    <td>{redeem.cardNumber}</td>
                                                    <td>{redeem.pinCode}</td>
                                                  </tr>
                                                </>
                                              )
                                            )}
                                        </tbody>
                                      </>
                                    ))}
                                  </table>
                                </>
                              )}
                            </div>
                            <div className="payment__success__footer">
                              <div className="payment-success__footer-inner">
                                <a href="javascript:void(0)">
                                  <span className="icon">
                                    <i className="material-symbols-outlined">
                                      download
                                    </i>
                                  </span>
                                  <span>Download</span>
                                </a>
                                <a href="javascript:void(0)">
                                  <span className="icon">
                                    <i className="material-symbols-outlined">
                                      print
                                    </i>
                                  </span>
                                  <span>Print Receipt</span>
                                </a>
                                <a href="hotel-email.html">
                                  <span className="icon">
                                    <i className="material-symbols-outlined">
                                      drafts
                                    </i>
                                  </span>
                                  <span>Email Receipt</span>
                                </a>
                              </div>
                              <div className="dbutton">
                                <a href="/gift-cards" className="cmn__btn">
                                  <span> Keep Shoping</span>
                                </a>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
}
