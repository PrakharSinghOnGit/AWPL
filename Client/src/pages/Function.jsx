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
    <div className="con">
      <div className="box">
        <h1>Function Select</h1>
        <div className="wrapper">
          <div className="checkboxCon">
            <input
              type="checkbox"
              id="_level"
              checked={selectedOptions.includes("LEVEL")}
              onChange={() => handleOptionSelect("LEVEL")}
            />
            <label for="_level">
              <div className="tick_mark"></div>
            </label>
            <h2 onClick={() => handleOptionSelect("LEVEL")}>LEVEL</h2>
          </div>
          <div className="checkboxCon">
            <input
              type="checkbox"
              id="_target"
              checked={selectedOptions.includes("TARGET")}
              onChange={() => handleOptionSelect("TARGET")}
            />
            <label for="_target">
              <div className="tick_mark"></div>
            </label>
            <h2 onClick={() => handleOptionSelect("TARGET")}>TARGET</h2>
          </div>
          <div className="checkboxCon">
            <input
              type="checkbox"
              id="_cheque"
              checked={selectedOptions.includes("CHEQUE")}
              onChange={() => handleOptionSelect("CHEQUE")}
            />
            <label for="_cheque">
              <div className="tick_mark"></div>
            </label>
            <h2 onClick={() => handleOptionSelect("CHEQUE")}>CHEQUE</h2>
          </div>
        </div>
      </div>
      <button className="Submitbtn" role="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default Function;
