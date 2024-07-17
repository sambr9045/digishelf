import React, { useState } from "react";
import { Card, Row, Col } from "react-bootstrap";

const CardSelectBase = ({ networks, onSelect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const handleSelect = (network) => {
    setSelectedNetwork(network);
    onSelect(network);
  };

  return (
    <Row>
      {networks.map((network, index) => (
        <Col key={index} sm={4} md={3} lg={2} className="mb-3">
          <Card
            onClick={() => handleSelect(network)}
            className={`network-card ${
              selectedNetwork === network ? "selected" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <Card.Img variant="top" src={network.image} />
            <Card.Body>
              <Card.Title className="text-center">{network.name}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CardSelectBase;
