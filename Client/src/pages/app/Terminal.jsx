import React, { useEffect, useState } from "react";
import { SocketContext } from "../../service/socketContext";

const Terminal = () => {
  const socket = React.useContext(SocketContext);
  const [messages, setMessages] = React.useState([]);

  useEffect(() => {
    socket.on("terminal", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("terminal");
    };
  }, [socket]);

  return (
    <div
      className="section"
      style={{
        borderRadius: "0 10px 10px 0",
        backgroundColor: "white",
      }}
    >
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
};

export default Terminal;
