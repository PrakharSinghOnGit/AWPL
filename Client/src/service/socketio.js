// Import the Socket.IO client library
import io from "socket.io-client";

// Connect to the server
const socket = io("http://localhost:3000");

// Listen for a 'connect' event
socket.on("connect", () => {
  console.log("Connected to server");
});

// Listen for a 'disconnect' event
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

export default socket;
