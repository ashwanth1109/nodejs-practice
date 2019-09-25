// zmq-watcher-pub.js
"use strict";

const fs = require("fs");
const zmq = require("zeromq");
const filename = process.argv[2];

// create publisher endpoint
const publisher = zmq.socket("pub");

fs.watch(filename, () => {
  // send message to all subscribers
  publisher.send(
    JSON.stringify({
      type: "changed",
      file: filename,
      timestamp: Date.now()
    })
  );
});

// listen to tcp port 3000
publisher.bind("tcp://*:3000", err => {
  if (err) throw err;
  console.log("Listening for zmq subscribers");
});
