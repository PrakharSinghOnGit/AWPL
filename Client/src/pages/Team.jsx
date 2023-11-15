import React, { useEffect, useState } from "react";
import { SocketContext } from "../service/socketContext";

function Team({ onSubmit }) {
  const socket = React.useContext(SocketContext);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  useEffect(() => {
    socket.emit("sendTeams");
    socket.on("teams", (options) => {
      setOptions(options);
    });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(selectedOptions);
  };

  return (
    <div className="con">
      <div className="box">
        <h1>Select Teams</h1>
        <div className="wrapper">
          {options.map((option) => (
            <div
              className={
                option.status == "active"
                  ? "checkboxCon"
                  : "checkboxCon disabled"
              }
              key={option.name}
            >
              <input
                type="checkbox"
                id={option.name}
                name={option.name}
                value={option.name}
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionSelect(option)}
              />
              <label htmlFor={option.name}>
                <div className="tick_mark"></div>
              </label>
              <h2 onClick={() => handleOptionSelect(option)}>{option.name}</h2>
            </div>
          ))}
        </div>
      </div>
      <button className="Submitbtn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

export default Team;
