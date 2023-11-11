import React, { useState, useEffect } from "react";
import Function from "./pages/Function";
import Team from "./pages/Team";
import Main from "./pages/app/main";

const App = () => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [progressData, setProgressData] = useState([]);

  const handleFunctionSubmit = (selectedFunction) => {
    setSelectedFunction(selectedFunction);
  };

  const handleTeamSubmit = (selectedTeams) => {
    setSelectedTeams(selectedTeams);
  };

  return (
    <div>
      <h1>AWPL HELPER</h1>
      {/* Step 1: Select Function */}
      {!selectedFunction && <Function onSubmit={handleFunctionSubmit} />}

      {/* Step 2: Select Team */}
      {selectedFunction && !selectedTeams.length && (
        <Team onSubmit={handleTeamSubmit} />
      )}

      {/* Step 3: Progress Table */}
      {selectedFunction && selectedTeams.length > 0 && (
        <Main data={progressData} />
      )}
    </div>
  );
};

export default App;
