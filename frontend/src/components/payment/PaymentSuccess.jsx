import React, { useState, useContext, useEffect } from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { api_endpoint } from "../constant";
import GiftCardBanner from "../GiftCardBanner";
import { useParams } from "react-router-dom";
import Loader from "../includes/Loader";
// import Footer from "../Footer/Footer";

function formatDate(datetimeString) {
  const date = new Date(datetimeString);
  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
}

export default function PaymentSuccess() {
  const { reference } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);

  const fetchOrderData = async () => {
    const response = await axios.get(`${api_endpoint}/api/giftcardorder/`, {
      params: { reference: reference },
    });
    if (response.data) {
      setOrderData(response.data.data);
      console.log(response.data.data);
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    fetchOrderData();
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
                    {/* Stage 1: Gift Card Details */}
                    <div className=" p-2 mb-3 border-0">
                      <div className="payment__success__inner">
                        {!isLoading && (
                          <>
                            <div className="payment__success__header">
                              <div className="icon">
                                <i className="material-symbols-outlined">
                                  done
                                </i>
                              </div>
                              <h3 className="">Payment Successful</h3>
                              <p
                                className="primary-text fs-7"
                                style={{ fontSize: "11px!important" }}
                              >
                                Your payment has been successfully processed,
                                and a confirmation email will be sent to you
                                shortly.
                              </p>
                            </div>
                            <div className="payment__success__body">
                              <ul>
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
                                  <span>Mode of Payment</span>
                                  {orderData.product_data.payment_method ===
                                    "cbc" && (
                                    <>
                                      <span className="textbo">
                                        Credit/Visa - MoMo
                                      </span>
                                    </>
                                  )}
                                  {orderData.product_data.payment_method ===
                                    "crypto" && (
                                    <>
                                      <span className="textbo">
                                        Credit/Visa - MoMo
                                      </span>
                                    </>
                                  )}
                                </li>
                                <li>
                                  <span>Transaction Status</span>
                                  <span className="textbo text-success">
                                    {orderData.transactionData.status}
                                  </span>
                                </li>
                                <li>
                                  <span>Customer Name</span>
                                  <span className="textbo">Wade Warren</span>
                                </li>
                                <li>
                                  <span>Redeem Code</span>
                                  <span className="textbo">
                                    {orderData.redeem_code.redeem_card_number}
                                    <br />

                                    {orderData.redeem_code.redeem_card_pin && (
                                      <>
                                        <span className="textbo">
                                          PIN:&nbsp;
                                          {
                                            orderData.redeem_code
                                              .redeem_card_pin
                                          }
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </li>
                                <li>
                                  <span>Product</span>
                                  <span className="textbo">
                                    {orderData.product_data.product_name}&nbsp;
                                    <span className="fs-8">
                                      ({orderData.product_data.recipient_amount}
                                      &nbsp;
                                      {
                                        orderData.product_data
                                          .receiver_currency_code
                                      }
                                      )
                                    </span>
                                  </span>
                                </li>
                                <li>
                                  <span>Payment Amount</span>
                                  <span className="textbo">
                                    {orderData.product_data.country === "GH" ? (
                                      <>
                                        GHS&nbsp;{orderData.product_data.amount}
                                      </>
                                    ) : (
                                      <>
                                        $&nbsp;{orderData.product_data.amount}
                                      </>
                                    )}
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div className="payment__success__footer">
                              {/* <div className="payment-success__footer-inner">
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
                              </div> */}
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
