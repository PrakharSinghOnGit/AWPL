import React from "react";
import ProgressBar from "./Components/ProgressBar";

const Menubar = ({ func, leader, progress, output }) => {
  console.log(func, leader, progress, output);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        width: "calc(100% - 20px)",
        height: "60px",
        borderColor: "red",
        borderWidth: "1px",
        borderStyle: "solid",
        margin: "10px",
        borderRadius: "10px",
        fontFamily: "Roboto",
        fontSize: "10px",
        backgroundColor: "white",
      }}
    >
      <h1>{func}</h1>
      <span>||</span>
      <h1>{leader}</h1>
      <ProgressBar percentage={progress} />
      <h2>{output}</h2>
    </div>
  );
};

export default Menubar;
