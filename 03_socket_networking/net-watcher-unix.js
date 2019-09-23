// net-watcher-unix.js
"use strict";

const fs = require("fs");
const net = require("net");
const filename = process.argv[2];

if (!filename) throw Error("Error: No file name specified");

net
  .createServer(connection => {
    // log start
    console.log("Subscriber has connected");
    connection.write(`Now watching ${filename} for changes`);

    // watcher
    const watcher = fs.watch(filename, () =>
      connection.write(`File changed: ${new Date()} \n`)
    );

    // clean up
    connection.on("close", () => {
      console.log("Subscriber has disconnected");
      watcher.close();
    });
  })
  .listen("/tmp/watcher.sock", () => console.log("Listening for subscribers"));
