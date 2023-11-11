import React, { useState } from "react";

const Function = ({ onSubmit }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(
        selectedOptions.filter((selectedOption) => selectedOption !== option)
      );
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
      <label>
        <input
          type="checkbox"
          checked={selectedOptions.includes("LEVEL")}
          onChange={() => handleOptionSelect("LEVEL")}
        />
        LEVEL
      </label>
      <label>
        <input
          type="checkbox"
          checked={selectedOptions.includes("TARGET")}
          onChange={() => handleOptionSelect("TARGET")}
        />
        TARGET
      </label>
      <label>
        <input
          type="checkbox"
          checked={selectedOptions.includes("CHEQUE")}
          onChange={() => handleOptionSelect("CHEQUE")}
        />
        CHEQUE
      </label>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Function;
