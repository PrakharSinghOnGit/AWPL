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
  console.log("connected", socket.id);
  socket.emit("teams", getTeams());
});

function getTeams() {
  return config.Users;
}
