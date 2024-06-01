import React from "react";

const StackedImage = ({ src, alt }) => {
  return (
    <div className="stacked-image-container">
      <img src={src} alt={alt} className="stacked-image" />
    </div>
  );
};

export default StackedImage;
