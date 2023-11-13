import React from "react";
import DataTable from "./DataTable";
import MenuBar from "./MenuBar";
import MineTable from "./MineTable";
import Terminal from "./Terminal";
import { SocketContext } from "../../service/socketContext";

const main = ({ func, teams }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <MenuBar
        func={func[0]}
        leader={teams[0].name}
        progress={50}
        output={"Getting List"}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <DataTable />
        <MineTable />
        <Terminal />
      </div>
    </div>
  );
};

export default main;
