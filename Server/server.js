const fs = require("fs");
const path = require("path");
const config = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8")
);
const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
  },
});
io.on("connection", (socket) => {
  console.log("connected to client", socket.id);

  socket.on("disconnect", () => {
    console.log("disconnected from client", socket.id);
  });

  socket.on("sendTeams", (data) => {
    console.log(`Received "SEND TEAMS" request from client`);
    socket.emit("teams", getTeams());
  });
});

function getTeams() {
  return config.Users;
}
