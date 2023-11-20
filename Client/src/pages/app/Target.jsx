import React, { useEffect, useState } from "react";
import { SocketContext } from "../../service/socketContext";

const Target = () => {
  const socket = React.useContext(SocketContext);
  const [tableData, setTableData] = useState([]);

  const handleTargetEvent = (event) => {
    const { name, level, remainsaosp, remainsgosp } = event;
    setTableData((prevData) => [
      ...prevData,
      { name, level, remainsaosp, remainsgosp },
    ]);
  };

  useEffect(() => {
    socket.on("TARGET", handleTargetEvent);

    return () => {
      socket.off("TARGET", handleTargetEvent);
    };
  }, []);
  let serialNumber = 1; // initialize serial number variable
  return (
    <div
      className="section"
      style={{
        borderRadius: "0 10px 10px 0",
        backgroundColor: "white",
      }}
    >
      <h1 className="section-title">TARGET DATA</h1>
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

export default Target;
