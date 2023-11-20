import React, { useState, useEffect } from "react";
import { SocketContext } from "../../service/socketContext";

const Level = () => {
  const socket = React.useContext(SocketContext);
  const [tableData, setTableData] = useState([]);

  const handleLevelEvent = (event) => {
    const { name, level, remainsaosp, remainsgosp } = event;
    setTableData((prevData) => [
      ...prevData,
      { name, level, remainsaosp, remainsgosp },
    ]);
  };

  useEffect(() => {
    socket.on("LEVEL", handleLevelEvent);

    return () => {
      socket.off("LEVEL", handleLevelEvent);
    };
  }, []);
  let serialNumber = 1; // initialize serial number variable
  return (
    <div
      className="section"
      style={{
        margin: "0 10px",
        backgroundColor: "white",
      }}
    >
      <h1 className="section-title">LEVEL DATA</h1>

      <table className="table">
        <thead className="thead">
          <tr>
            <th>SNO</th>
            <th>NAME</th>
            <th>LEVEL</th>
            <th>SAO</th>
            <th>SGO</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {tableData.map((data, index) => (
            <tr key={index}>
              <td>{serialNumber++}</td>
              <td>{data.name}</td>
              <td>{data.level}</td>
              <td>{data.remainsaosp}</td>
              <td>{data.remainsgosp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Level;
