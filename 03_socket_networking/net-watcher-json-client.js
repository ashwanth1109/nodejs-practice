// net-watcher-json-client.js
"use strict";

const net = require("net");
const client = net.connect({ port: 3000 });

client.on("data", data => {
  const message = JSON.parse(data);
  if (message.type === "watching")
    console.log(`Now watching file ${message.file}`);
  else if (message.type === "changed")
    console.log(`File Changed: ${new Date(message.timestamp)}`);
  else console.log(`Unrecognized message type ${message.type}`);
});
