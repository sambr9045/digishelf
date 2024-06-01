import React from "react";

export default function Filter({ country }) {
  return (
    <>
      <div className="col-xxl-3 col-xl-3 col-lg-3">
        <div className="common__filter__wrapper most_popular">
          <h3 className="filltertext borderb pb__20 mb__20 text-start">
            Filter
          </h3>
          {/* <div className="search__item borderb pb__10 mb__20">
                    <div className="common__sidebar__head">
                      <button className="w-100 fw-400 lato dtext fz-24 d-flex align-items-center justify-content-between">
                        Car Name
                        <img src="assets/img/svg/dropdown.svg" alt="svg" />
                      </button>
                    </div>
                    <div className="common__sidebar__content">
                      <form
                        action="#"
                        className="d-flex align-items-center justify-content-between"
                      >
                        <input
                          type="text"
                          placeholder="Search by Flight name"
                        />
                        <button className="search">
                          <i className="material-symbols-outlined">search</i>
                        </button>
                      </form>
                    </div>
                  </div> */}
          <div className="search__item borderb pb__10 mb__20">
            <div className="common__sidebar__head">
              <button className="w-100 fw-400 lato dtext fz-24 d-flex align-items-center justify-content-between">
                Most Popupaler
                {/* <img src="assets/img/svg/dropdown.svg" alt="svg" /> */}
              </button>
            </div>
            <div className="common__sidebar__content">
              <div className="common__typeproperty">
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper1"
                              checked
                            /> */}
                    <label className="form-check-label" htmlFor="proper1">
                      <span className="fz-16 lato fw-400 dtext">
                        PlayStation Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper2"
                            /> */}
                    <label className="form-check-label" htmlFor="proper2">
                      <span className="fz-16 lato fw-400 dtext">
                        Xbox Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper3"
                            /> */}
                    <label className="form-check-label" htmlFor="proper3">
                      <span className="fz-16 lato fw-400 dtext">
                        Itunes Gift Card
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4">
                      <span className="fz-16 lato fw-400 dtext">
                        Netflix Gift Card
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4re"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4re">
                      <span className="fz-16 lato fw-400 dtext">
                        Amazon Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4size"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4size">
                      <span className="fz-16 lato fw-400 dtext">
                        Spotify Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4suv"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4suv">
                      <span className="fz-16 lato fw-400 dtext">
                        Steam Gift Cards
                      </span>
                    </label>
                  </div>
                </div>

                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4suv"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4suv">
                      <span className="fz-16 lato fw-400 dtext">
                        Google Play Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    {/* <input
                              className="form-check-input"
                              type="checkbox"
                              id="proper4van"
                            /> */}
                    <label className="form-check-label" htmlFor="proper4van">
                      <span className="fz-16 lato fw-400 dtext">
                        AirBnB Gift Cards
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="search__item borderb pb__10 mb__20">
            <div className="common__sidebar__head">
              <button className="w-100 fw-400 lato dtext fz-24 d-flex align-items-center justify-content-between">
                Pricing scale
                {/* <img src="assets/img/svg/dropdown.svg" alt="svg" /> */}
              </button>
            </div>
            <div className="common__sidebar__content">
              <div className="range__barcustom">
                <div className="slider">
                  <div className="progress"></div>
                </div>
                <div className="range-input mb__10">
                  <input
                    type="range"
                    className="range-min"
                    min="0"
                    max="10000"
                    value="2500"
                    step="100"
                  />
                  <input
                    type="range"
                    className="range-max"
                    min="0"
                    max="10000"
                    value="7500"
                    step="100"
                  />
                </div>
                <div className="price-input">
                  <div className="field">
                    <span>$</span>
                    <input type="number" className="input-min" value="2500" />
                  </div>
                  <div className="separator">-</div>
                  <div className="field">
                    <span>$</span>
                    <input type="number" className="input-max" value="7500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="search__item">
            <div className="common__sidebar__head">
              <button className="w-100 fw-400 lato dtext fz-24 d-flex align-items-center justify-content-between">
                Payment type
                {/* <img src="assets/img/svg/dropdown.svg" alt="svg" /> */}
              </button>
            </div>
            <div className="common__sidebar__content">
              <div className="common__typeproperty">
                <div className="type__radio mb__10 d-flex align-items-center justify-content-between">
                  {country.country === "GH" && (
                    <>
                      <div className="radio__left d-flex align-items-center gap-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="proper1s2"
                          checked
                        />
                        <label className="form-check-label" htmlFor="proper1s2">
                          <span className="fz-16 lato fw-400 dtext">
                            Debit/Credit -Mobile Money
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
                <div className="type__radio d-flex align-items-center justify-content-between">
                  <div className="radio__left d-flex align-items-center gap-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="proper2sa"
                    />
                    <label className="form-check-label" htmlFor="proper2sa">
                      <span className="fz-16 lato fw-400 dtext">Crypto</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
