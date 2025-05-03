import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import { Link } from "react-router-dom";
import AccountBanner from "./AccountBanner";
import SidePanel from "./SidePanel";
import share from "../../assets/images/svg/share.svg";
import RecentActivities from "./details/RecentActivities";
import Footer from "../Footer/Footer";
export default function MyAccount() {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [contactInformation, setContactInformation] = useState({});
  // fetch transaction history
  // saved contact information
  //
  useEffect(() => {}, []);
  return (
    <>
      <AccountBanner title="Account" />
      <section className="personal__information pt__60 pb__60">
        <div className="container">
          <div className="row justify-content-center">
            {/* <SidePanel /> */}
            {/* col-xxl-8 col-xl-8 col-lg-10 */}
            <div className="col-xxl-12 col-xl-12 col-lg-12">
              <div className="">
                <div className="row g-3">
                  <RecentActivities />

                  <div className="col-md-4 border-1 g-1 ">
                    <div className="card p-4 shadow-sm border-0 text-center h-100">
                      <div className="card-body">
                        <img
                          src={share}
                          alt="Celebration"
                          width={169}
                          className="mb-5 not-visited:"
                        />
                        ;<h5 className="card-title">Refer a friend</h5>
                        <p className="card-text text-muted fs-6">
                          Make 5 top-ups to invite friends and get a discount
                        </p>
                        <a href="#" className="text-primary">
                          Read more &gt;
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="personal__information pt__60 pb__60"></section>
      <Footer />
    </>
  );
}
