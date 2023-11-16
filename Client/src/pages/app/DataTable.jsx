import React from "react";

const DataTable = ({ team }) => {
  console.log(team);
  return (
    <div
      className="section"
      style={{
        borderRadius: "10px 0 0 10px",
        backgroundColor: "white",
      }}
    >
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(team) &&
            team.map((item) => (
              <tr key={item.id}>
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
