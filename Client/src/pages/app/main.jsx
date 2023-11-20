import React, { useEffect } from "react";
import DataTable from "./DataTable";
import MenuBar from "./MenuBar";
import Level from "./Level";
import Target from "./Target";
import "./index.css";
import { SocketContext } from "../../service/socketContext";
import { csvToJson } from "../../service/csvToJson";

const main = ({ func, teams }) => {
  const socket = React.useContext(SocketContext);
  const [data, setData] = React.useState([]);
  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    async function fetchData(link) {
      const loader = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress >= 95 ? 0 : prevProgress + 1
        );
      }, 50);
      const response = await fetch(link);
      const csvData = await response.text();
      const jsonData = csvToJson(csvData);
      socket.emit("mine", { data: jsonData, func: func, name: teams[0].name });
      setData(jsonData);
      clearInterval(loader);
      setProgress(100);
    }
    fetchData(teams[0].link);

    socket.on("progress", ({ done, total }) => {
      setProgress(Math.round((done / total) * 100));
    });
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
      <MenuBar func={func[0]} leader={teams[0].name} progress={progress} />
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
        <Level />
        <Target />
      </div>
    </div>
  );
};

export default main;
