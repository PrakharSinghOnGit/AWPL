import React, { useEffect } from "react";
import DataTable from "./DataTable";
import MenuBar from "./MenuBar";
import MineTable from "./MineTable";
import Terminal from "./Terminal";
import "./index.css";
import { SocketContext } from "../../service/socketContext";
import { csvToJson } from "../../service/csvToJson";

const main = ({ func, teams }) => {
  const socket = React.useContext(SocketContext);
  const [data, setData] = React.useState([]);
  useEffect(() => {
    async function fetchData(link) {
      const response = await fetch(link);
      const csvData = await response.text();
      const jsonData = csvToJson(csvData);
      socket.emit("mine", { data: jsonData, func: func, name: teams[0].name });
      setData(jsonData);
    }
    fetchData(teams[0].link);
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        backgroundColor: "aliceblue",
      }}
    >
      <MenuBar func={func[0]} leader={teams[0].name} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "calc(100% - 20px)",
          height: "100%",
          margin: "0 10px 10px 10px",
        }}
      >
        <DataTable team={data} />
        <MineTable />
        <Terminal />
      </div>
    </div>
  );
};

export default main;
