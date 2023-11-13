import React from "react";

const ProgressBar = ({ percentage }) => {
  return (
    <div style={{ flexGrow: 1, height: "20px", backgroundColor: "#e0e0de" }}>
      <div
        style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: "#2ecc71",
        }}
      />
    </div>
  );
};

export default ProgressBar;
