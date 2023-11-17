import React from "react";

const DataTable = ({ team }) => {
  console.log(team);
  let serialNumber = 1; // initialize serial number variable
  return (
    <div
      className="section"
      style={{
        borderRadius: "10px 0 0 10px",
        backgroundColor: "white",
      }}
    >
      <table className="table">
        <thead className="thead">
          <tr>
            <th>SNO</th>
            <th>Name</th>
            <th>ID</th>
            <th>PASS</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {Array.isArray(team) &&
            team.map((item) => (
              <tr className="tr" key={item.id}>
                <td>{serialNumber++}</td>
                <td>{item.name}</td>
                <td>{item.id}</td>
                <td>{item.pass}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
