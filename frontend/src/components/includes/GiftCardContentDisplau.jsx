import React from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import loader from "../../assets/images/loader.svg";
import empty_search from "../../assets/images/empty_search.svg";

export default function GiftCardContentDisplau({
  GIFTCARD,
  isLoading,
  type = "",
  paginationLoading = false,
}) {
  return (
    <>
      <div className="col-xxl-9 col-xl-9 col-lg-9">
        <div className="row g-4 justify-content-center">
          {isLoading ? (
            <>
              <Loader beforeLoaderContent={true} />
            </>
          ) : (
            <>
              {GIFTCARD.length > 0 ? (
                GIFTCARD.map((item) => (
                  <>
                    <div
                      key={item.productId}
                      className={
                        type !== "search"
                          ? "col-xl-4 col-lg-4 col-md-4  giftcard search"
                          : "col-xl-3 col-lg-4 col-md-4 col-sm-9 giftcard"
                      }
                    >
                      <div className="carferrari__item flex-wrap d-flex align-items-center bgwhite p__10">
                        <Link
                          to={
                            type === "search"
                              ? `/gift-card/${item.productName}/${item.productId}`
                              : type !== ""
                              ? `/gift-card/${type}/${item.productId}`
                              : `/gift-card/${item.productName}`
                          }
                          className="thumb"
                        >
                          {item.logoUrls && (
                            <>
                              <img
                                src={item.logoUrls[0]}
                                alt="giftcard"
                                className={`giftcard_img big_image shadow-lg ${type}_img`}
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
                                <Link
                                  to={
                                    type !== ""
                                      ? `/gift-card/${type}/${item.productId}`
                                      : `/gift-card/${item.productName}`
                                  }
                                >
                                  <h5
                                    className={
                                      type === "search"
                                        ? "dtext fs-6 text-lowercase"
                                        : "dtext"
                                    }
                                  >
                                    {item.productName}
                                  </h5>
                                </Link>
                                {item.country && (
                                  <>
                                    {type === "search" ? (
                                      <>
                                        <span className="suv fz-16 fw-400 lato d-block countryflag countryflag_search shadow-lg">
                                          <img
                                            src={item.country.flagUrl}
                                            alt="flag"
                                          />
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="suv fz-16 fw-400 lato d-block countryflag">
                                          <img
                                            src={item.country.flagUrl}
                                            alt="flag"
                                          />
                                        </span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ))
              ) : (
                <>
                  <div className="mt-5 mb-5 pb__60 text-center">
                    <img
                      src={empty_search}
                      alt="empty search"
                      width={"250px"}
                    />
                    <h5 className="mt-5">
                      <b className="text-muted">No results found</b>
                    </h5>
                  </div>
                </>
              )}

              {paginationLoading && (
                <>
                  <div
                    className="mt-5 mb-5 justify-content-center text-center"
                    style={{ margin: "0 auto" }}
                  >
                    <img
                      src={loader}
                      alt="loading"
                      className="text-center loader"
                    />
                    <p>
                      <b>Loading...</b>
                    </p>
                  </div>
                </>
              )}
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
