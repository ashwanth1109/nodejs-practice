// zmq-filer-rep.js
"use strict";

const fs = require("fs");
const zmq = require("zeromq");

// socket to reply to client requests
const responder = zmq.socket("rep");

// handle incoming requests
responder.on("message", data => {
  // parse the incoming message
  const request = JSON.parse(data);
  console.log(`Received request: ${request.path}`);

  // read the file and reply with content
  fs.readFile(request.path, (err, content) => {
    console.log("Sending response content");
    responder.send(
      JSON.stringify({
        content: content.toString(),
        timestamp: Date.now(),
        pid: process.pid
      })
    );
  });
});

// bind to TCP port
responder.bind("tcp://127.0.0.1:3000", err => {
  console.log("Listening for zmq requesters");
});

// close responder when the process ends
process.on("SIGINT", () => {
  console.log("Shutting down");
  responder.close();
});
