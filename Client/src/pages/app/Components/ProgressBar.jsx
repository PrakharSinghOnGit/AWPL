import React from "react";

const ProgressBar = ({ percentage }) => {
  return (
    <div
      style={{
        flexGrow: 1,
        height: "20px",
        backgroundColor: "#e0e0de",
        borderRadius: 10,
        marginRight: 10,
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: "rgb(6, 148, 132)",
          borderRadius: 10,
        }}
      />
    </div>
  );
};

export default ProgressBar;
