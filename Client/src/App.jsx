import React, { useState } from "react";
import Function from "./pages/Function";
import Team from "./pages/Team";
import Main from "./pages/app/main";
import socket from "./service/socketio";
import { SocketContext } from "./service/socketContext";

const App = () => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleFunctionSubmit = (selectedFunction) => {
    console.log(selectedFunction);
    setSelectedFunction(selectedFunction);
  };

  const handleTeamSubmit = (selectedTeams) => {
    console.log(selectedTeams);
    setSelectedTeams(selectedTeams);
  };

  return (
    <SocketContext.Provider value={socket}>
      <div>
        {!selectedFunction && <Function onSubmit={handleFunctionSubmit} />}

        {selectedFunction && !selectedTeams.length && (
          <Team onSubmit={handleTeamSubmit} />
        )}

        {selectedFunction && selectedTeams.length > 0 && (
          <Main func={selectedFunction} teams={selectedTeams} />
        )}
      </div>
    </SocketContext.Provider>
  );
};

export default App;
