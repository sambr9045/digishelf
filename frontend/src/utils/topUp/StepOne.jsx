import React, { useContext, useState } from "react";
import IntlTelInput from "react-intl-tel-input";
import { TopUpContext } from "../../components/Context/TopUpContext";
import { ToastContainer, toast } from "react-toastify";
import { api_endpoint } from "../../components/constant";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Card, Row, Col } from "react-bootstrap";

export default function StepOne() {
  const {
    isLoading,
    country,
    number,
    setisLoading,
    setPhoneError,
    operatoCountryData,
    setEditNumber,
    setOpararatorData,
    setSteps,
    setFx_rate,
    setSuggestedAmountsMap,
    setNumber,
    setOperatorCountryData,
    setAutoDetected,
  } = useContext(TopUpContext);

  const [show, setShow] = useState(false);
  const [FailedToDetectData, setFailedToDetectData] = useState({});
  const [selected, setSelected] = useState("");
  const [networkSelectionError, setNetworkSelectionError] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const HandleSelection = (id) => {
    setSelected(id);
    setOpararatorData({ data: FailedToDetectData[id] });
    setFx_rate(FailedToDetectData[id].fx);
    setSuggestedAmountsMap(FailedToDetectData[id].suggestedAmountsMap);
    setNetworkSelectionError("");
  };
  const HandleNetworkSelected = (e) => {
    if (selected !== "") {
      setSteps(2);
    } else {
      setNetworkSelectionError("Please select network provider to continue!!");
    }
  };

  const HandleSteps2 = async (e) => {
    e.preventDefault();

    if (isNaN(number)) {
      toast.error("Invalide phone number");
    } else {
      const result = await getOparator(number);
      console.log(result);
    }
  };

  const getOparator = async (number) => {
    setisLoading(true);

    if (number === "") {
      setPhoneError("Please enter a valid number");
      setisLoading(false);
      toast.error("Please enter a valid number");
    } else {
      let edit_number = 0;
      if (number.startsWith("0")) {
        edit_number = number.substring(1);
      } else {
        edit_number = number;
      }
      const phone_ = `+${operatoCountryData.dialCode}${edit_number}`;
      setEditNumber(phone_);
      const data = { phone: phone_, country: operatoCountryData.iso2 };
      try {
        const response = await axios.post(
          `${api_endpoint}/api/getoparator/`,
          data
        );
        if (response.data) {
          console.log(response.data);
          if (response.data.autoDetected === true) {
            setOpararatorData(response.data);
            console.log(operatoCountryData, "this is the oparator code");
            setSteps(2);
            setisLoading(false);
            setSuggestedAmountsMap(response.data.data.suggestedAmountsMap);
            setFx_rate(response.data.data.fx);
          } else {
            // setOpararatorData(response.data);
            // setSteps(2);
            setisLoading(false);
            setFailedToDetectData(response.data.data);
            console.log(response.data.data);
            // setSuggestedAmountsMap(null);
            // setFx_rate(null);
            handleShow();
          }
        }
      } catch (error) {
        console.log(error);
        if (
          error.response.status === 400 &&
          error.response.data.autoDetected === false
        ) {
          // Next steps

          setAutoDetected(false);
          setSteps(2);
        } else {
          toast.error(error.response.data.status);
        }

        setisLoading(false);
      }
    }
  };

  const handlePhoneNumberChange = (status, value, countryData, number, id) => {
    if (isNaN(value)) {
      setPhoneError("Invalid phone number");
      return;
    } else {
      setNumber(value);
      setPhoneError("");
      setOperatorCountryData(countryData);
    }
    console.log(status, value, countryData, number, id);
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Network</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {networkSelectionError !== "" && (
            <>
              <div className="alert alert-danger">{networkSelectionError}</div>
            </>
          )}
          <div className="col-lg-12 d-flex">
            {FailedToDetectData &&
              FailedToDetectData.length > 0 &&
              FailedToDetectData.map((item, index) => (
                <>
                  <div key={item.id} className="">
                    <div
                      onClick={() => HandleSelection(index)}
                      className={`selectNetwork ${
                        selected === index ? "selectNetwork-active" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card">
                        <div>
                          <img src={item.logoUrls[2]} alt="iamge" />
                        </div>
                        <b>{item.name}</b>
                      </div>
                    </div>
                  </div>
                </>
              ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>

          <button
            type="button"
            className="cmn__btn py-2"
            onClick={HandleNetworkSelected}
          >
            Continue
          </button>
        </Modal.Footer>
      </Modal>
      <div className="mobile__recharge ">
        <h5 className=" mt-3 mb-2 text-left"> Ready to send top - up ? </h5>
        <br />
        <form
          action="javascript:void(0)"
          className="pb__40 mt-10 "
          style={{
            justifyContent: "left",
          }}
        >
          <div
            className="row"
            style={{
              width: "100%",
            }}
          >
            <div className="">
              <IntlTelInput
                preferredCountries={["us", "gb"]}
                defaultCountry={
                  country.country !== null
                    ? country.country.toLowerCase()
                    : "us"
                }
                containerClassName="intl-tel-input"
                inputClassName="form-control selectCountryinput"
                onPhoneNumberChange={handlePhoneNumberChange}
                autoPlaceholder="aggressive"
                placeholder="Enter your phone number"
                formatOnInit={true}
                placeholderNumberType="MOBILE"
              />
            </div>
          </div>
        </form>
        <a
          href="#"
          className="cmn__btn mb-5 form-control text-center"
          onClick={HandleSteps2}
          style={{
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {!isLoading && (
            <>
              <span> Continue recharge </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              </svg>
            </>
          )}
          {isLoading && (
            <>
              <span> Processing... </span>
            </>
          )}
        </a>
      </div>
    </div>
  );
}
