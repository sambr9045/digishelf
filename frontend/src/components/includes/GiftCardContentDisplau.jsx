import React from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";

export default function GiftCardContentDisplau({ GIFTCARD, isLoading }) {
  return (
    <>
      <div className="col-xxl-9 col-xl-9 col-lg-9">
        <div className="row g-4 justify-content-center">
          {isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>
              {GIFTCARD.map((item) => (
                <div
                  key={item.productId}
                  className="col-xl-4 col-lg-4 col-md-4 giftcard"
                >
                  <div className="carferrari__item flex-wrap d-flex align-items-center bgwhite p__10">
                    <Link
                      to={`/gift-card/${item.productName}`}
                      className="thumb"
                    >
                      {item.logoUrls && (
                        <>
                          <img
                            src={item.logoUrls[0]}
                            alt="giftcard"
                            className="giftcard_img"
                          />
                        </>
                      )}

                      {item.img && (
                        <>
                          <img
                            src={item.img}
                            alt="giftcard"
                            className="giftcard_img"
                          />
                        </>
                      )}
                    </Link>

                    <div className="carferrari__content">
                      <div className="d-flex carferari__box justify-content-center">
                        <div className="farrari__left">
                          <div className="d-flex  align-items-center gap-4">
                            <Link to={`/gift-card/${item.productName}`}>
                              <h5 className="dtext">{item.productName}</h5>
                            </Link>
                            {item.country && (
                              <>
                                <span className="suv fz-16 fw-400 lato d-block countryflag">
                                  <img src={item.country.flagUrl} alt="flag" />
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* <div className="pagination justify-content-center pt__40">
                  <a href="javascript:void(0)">
                    <span>
                      <i className="material-symbols-outlined">
                        navigate_before
                      </i>
                    </span>
                  </a>
                  <a href="javascript:void(0)">1</a>
                  <a href="javascript:void(0)">2</a>
                  <a href="javascript:void(0)">3</a>
                  <a href="javascript:void(0)">....</a>
                  <a href="javascript:void(0)">30</a>
                  <a href="javascript:void(0)">
                    <span>
                      <i className="material-symbols-outlined">chevron_right</i>
                    </span>
                  </a>
                </div> */}
      </div>
    </>
  );
}
