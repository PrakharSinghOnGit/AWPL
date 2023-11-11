import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // replace with your server URL

function Team({ onSubmit }) {
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    socket.on("teams", (options) => {
      setOptions(options);
    });
  }, []);

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(selectedOptions);
  };

  return (
    <div>
      <h1>Select Options</h1>
      {options.map((option) => (
        <div key={option}>
          <input
            type="checkbox"
            id={option}
            name={option}
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleOptionSelect(option)}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Team;
