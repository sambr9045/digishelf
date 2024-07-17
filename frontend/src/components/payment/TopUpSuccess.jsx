import React, { useState, useContext, useEffect } from "react";

import axios from "axios";
import { api_endpoint } from "../constant";
import GiftCardBanner from "../GiftCardBanner";
import { useParams } from "react-router-dom";
import Loader from "../includes/Loader";
import order_completed from "../../assets/images/order_completed.svg";
import server_down from "../../assets/images/topup/server_down.svg";

function formatDate(datetimeString) {
  const date = new Date(datetimeString);
  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
}

export default function TopUpSuccess() {
  const { reference } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);

  const fetchOrderData = async () => {
    try {
      const response = await axios.post(
        `${api_endpoint}/api/airtime-topup-order/`,
        {
          reference: reference,
        }
      );
      if (response.data) {
        console.log(response.data);
        setOrderData(response.data);

        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setOrderData(null);
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
                        {!isLoading && orderData !== null ? (
                          <>
                            <div className="payment__success__header">
                              <div className="">
                                {/* <i className="material-symbols-outlined">
                                                      done
                                                    </i> */}
                                <img
                                  src={order_completed}
                                  alt="success"
                                  style={{
                                    width: "150px",
                                    height: "auto",
                                  }}
                                  className="mt-5 mb-5"
                                />
                              </div>
                              <h4 className="basecolor_custom mb-2">
                                Top-up Sent
                              </h4>
                              <div>Airtime top-up completed successfully!</div>
                            </div>
                            <div className="payment__success__body shadow-sm p-1">
                              <ul className="p-0">
                                <li>
                                  <span> Transactions ID </span>
                                  <span className="textbo">
                                    <b>{orderData.reference}</b>
                                  </span>
                                </li>
                                <li>
                                  <span> Date </span>
                                  <span className="textbo">
                                    <b>{formatDate(orderData.created_at)}</b>
                                  </span>
                                </li>
                                <li>
                                  <span> Phone Number </span>
                                  <span className="textbo">
                                    <b> {orderData.phone_number}</b>
                                  </span>
                                </li>
                                <li>
                                  <span> Network </span>
                                  <span className="textbo">
                                    <b> {orderData.operator}</b>
                                  </span>
                                </li>
                                <li>
                                  <span> Amount Sent </span>
                                  <span className="textbo">
                                    <b>
                                      {" "}
                                      {orderData.receiver_amount}&nbsp;
                                      {orderData.receiver_currency_code}
                                    </b>
                                  </span>
                                </li>
                                <li>
                                  <span> Email </span>
                                  <span className="textbo">
                                    <b> {orderData.email}</b>
                                  </span>
                                </li>
                              </ul>
                            </div>
                            {/* <div className="payment__success__body shadow-sm table-responsive p-1">
                              {redeemLoading ? (
                                <>
                                  <div className="loading text-center pt-4 pb-4">
                                    <h6> Processing card... </h6>
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
                                        <th scope="col"> Product </th>
                                        <th scope="col"> Card </th>
                                        <th scope="col"> Pin </th>
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
                                                      & nbsp; (
                                                      <b className="fs-8">
                                                        {
                                                          JSON.parse(
                                                            item.product
                                                          ).unitPrice
                                                        }
                                                        & nbsp;
                                                        {
                                                          JSON.parse(
                                                            item.product
                                                          ).currencyCode
                                                        }
                                                      </b>
                                                      ) & nbsp;
                                                    </td>
                                                    <td>{redeem.cardNumber}</td>
                                                    <td> {redeem.pinCode} </td>
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
                                  <span> Download </span>
                                </a>
                                <a href="javascript:void(0)">
                                  <span className="icon">
                                    <i className="material-symbols-outlined">
                                      print
                                    </i>
                                  </span>
                                  <span> Print Receipt </span>
                                </a>
                                <a href="hotel-email.html">
                                  <span className="icon">
                                    <i className="material-symbols-outlined">
                                      drafts
                                    </i>
                                  </span>
                                  <span> Email Receipt </span>
                                </a>
                              </div>
                              <div className="dbutton">
                                <a href="/gift-cards" className="cmn__btn">
                                  <span> Keep Shoping </span>
                                </a>
                              </div>
                            </div> */}
                          </>
                        ) : (
                          <>
                            <div className="text-center mt-4 mb-4">
                              <div>
                                <img
                                  src={server_down}
                                  alt="failed"
                                  style={{
                                    width: "150px",
                                    height: "auto",
                                  }}
                                  className="mt-5 mb-5"
                                />
                              </div>
                              <h3 className="text-muted fs-4">
                                Failed to Fetch Order
                              </h3>
                              <p className="text-muted pl-4 pr-4">
                                Oops, it seems like we couldn't fetch your order
                                at this time! <br /> Please try again later.
                              </p>
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
