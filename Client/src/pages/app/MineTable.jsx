import React, { useState, useEffect } from "react";
import { SocketContext } from "../../service/socketContext";

const MineTable = () => {
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

  return (
    <div
      className="section"
      style={{
        margin: "0 10px",
        backgroundColor: "white",
      }}
    >
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>SAO SP</th>
            <th>SGO SP</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr key={index}>
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

export default MineTable;
