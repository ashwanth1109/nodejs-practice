// net-watcher-json.js
"use strict";

const fs = require("fs");
const net = require("net");
const filename = process.argv[2];

if (!filename) throw Error("Error: No file name specified");

net
  .createServer(connection => {
    // log start
    console.log("Subscriber has connected");
    connection.write(
      JSON.stringify({ type: "watching", file: filename }) + "\n"
    );

    // watcher
    const watcher = fs.watch(filename, () =>
      connection.write(
        `${JSON.stringify({ type: "changed", timestamp: Date.now() })} \n`
      )
    );

    // clean up
    connection.on("close", () => {
      console.log("Subscriber has disconnected");
      watcher.close();
    });
  })
  .listen(3000, () => console.log("Listening for subscribers"));
