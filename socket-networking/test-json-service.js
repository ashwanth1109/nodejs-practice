// test-json-service.js
"use strict";

const server = require("net").createServer(conn => {
  console.log("Subscriber connected");

  const firstChunk = `{"type":"changed","timesta`;
  const secondChunk = `mp":1450694370094}\n​​​​`;

  conn.write(firstChunk);

  const timer = setTimeout(() => {
    conn.write(secondChunk);
    conn.end();
  }, 100);

  conn.on("end", () => {
    clearTimeout(timer);
    console.log("Subscriber disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server up and running");
});
