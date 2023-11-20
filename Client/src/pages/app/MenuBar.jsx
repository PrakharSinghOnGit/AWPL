import React, { useEffect } from "react";
import ProgressBar from "./Components/ProgressBar";
import { SocketContext } from "../../service/socketContext";

const Menubar = ({ func, leader, progress }) => {
  console.log(func, leader);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "calc(100% - 40px)",
        height: "60px",
        borderColor: "lightblue",
        borderWidth: "1px",
        borderStyle: "solid",
        margin: "10px",
        borderRadius: "10px",
        backgroundColor: "white",
        padding: "0 10px",
        userSelect: "none",
      }}
    >
      <h1 className="heading">{func}</h1>
      <h1 style={{ fontWeight: 500 }} className="heading">
        {leader}
      </h1>
      <p style={{ fontFamily: "cascadia code", padding: 10 }}>{progress}%</p>
      <ProgressBar percentage={progress} />
    </div>
  );
};

export default Menubar;
