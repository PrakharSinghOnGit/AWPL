const fs = require("fs");
const path = require("path");
const miner = require("./functions/miner.js");
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

  socket.on("sendTeams", () => {
    console.log(`Received "SEND TEAMS" request from client`);
    socket.emit("teams", getTeams());
  });

  socket.on("mine", ({ data, func }) => {
    console.log(`Received "MINE" request from client`);
    miner(data, func, socket);
  });
});

function getTeams() {
  return config.Users;
}
