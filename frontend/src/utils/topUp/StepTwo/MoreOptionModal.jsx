import React, { useState, useContext } from "react";
import { Modal, Button, Col } from "react-bootstrap";
import { TopUpContext } from "../../../components/Context/TopUpContext";
import Form from "react-bootstrap/Form";

const MoreOptionModal = ({ show, setShow }) => {
  const {
    suggestedAmountsMap,
    country,
    customAmount,
    fx_rate,
    setSelectedOptionData,
    setCustomAmount,
  } = useContext(TopUpContext);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 1 && Number(value) <= 500)) {
      setCustomAmount(value);
    }
  };

  const HandleConfirmClick = () => {
    console.log(customAmount, country);
    setSelectedOptionData({
      name: "customAmount",
      amount: customAmount,
      currency: country.country === "GH" ? "GHS" : "USD",
    });

    setShow(false);
  };

  const HandleClick = () => {
    console.log("hello world");
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-muted">
            {suggestedAmountsMap.lenght > 0 ? "More option" : "Custom amount"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="cutom-form-input">
              <label
                htmlFor="customAmount"
                className="custom-form-input-label text-muted"
              >
                Enter Amount
              </label>
              <input
                type="number"
                placeholder="0.00 GHS"
                id="customAmount"
                className="shadow-sm"
                onChange={handleCustomAmountChange}
                value={customAmount}
              />
              <p className="fs-6 text-muted mt-1">Min 1 GHS - Max 500 GHS</p>
              <h2 className="mt-4 text-muted">
                Receive :
                <b className="basecolor_custom">
                  {(fx_rate.rate * customAmount).toFixed(2)}
                  {fx_rate.currencyCode}
                </b>
              </h2>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary-info"
            onClick={handleClose}
          >
            Close
          </button>

          <button
            type="button"
            className="cmn__btn py-2"
            onClick={HandleConfirmClick}
          >
            Continue
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MoreOptionModal;
