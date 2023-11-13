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
    <div>
      <h1>Select Options</h1>
      {options.map((option) => (
        <div key={option.name}>
          <input
            type="checkbox"
            id={option.name}
            name={option.name}
            value={option.name}
            checked={selectedOptions.includes(option)}
            onChange={() => handleOptionSelect(option)}
          />
          <label htmlFor={option.name}>{option.name}</label>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Team;
