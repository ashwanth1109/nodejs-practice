// zmq-filer-req.js
"use strict";

const zmq = require("zeromq");
const filename = process.argv[2];

// create a request endpoint
const requester = zmq.socket("req");

// handle replies from the responder
requester.on("message", data => {
  const response = JSON.parse(data);
  console.log("Received response", response);
});

requester.connect("tcp://localhost:3000");

// send a request for content
console.log(`Sending a request for ${filename}`);
requester.send(JSON.stringify({ path: filename }));

// make multiple requests for content
// for (let i = 1; i <= 5; i++) {
//   console.log(`Sending a request for ${filename}`);
//   requester.send(JSON.stringify({ path: filename }));
// }
