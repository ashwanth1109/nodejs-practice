// net-watcher-ldj-client.js
"use strict";

const netClient = require("net").connect({ port: 3000 });
const ldjClient = require("./lib/ldj-client").connect(netClient);

ldjClient.on("message", message => {
  if (message.type === "watching") console.log(`Now watching: ${message.file}`);
  else if (message.type === "changed")
    console.log(`File Changed: ${new Date(message.timestamp)}`);
  else throw Error(`Unrecognized message type: ${message.type}`);
});
