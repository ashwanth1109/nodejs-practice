// basic-server.js
"use strict";

const net = require("net");
const server = net.createServer(connection => {
  // Use the connection object for data transfer
  console.log("Connection", connection);
});

server.listen(60300); // Port should be >= 0 and < 65536
