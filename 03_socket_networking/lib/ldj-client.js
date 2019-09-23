// ldj-client.js
"use strict";

const EventEmitter = require("events").EventEmitter;

// under the hood JS uses prototypal inheritance
class LDJClient extends EventEmitter {
  // stream parameter is an object that emits data events
  // such as a Socket Connection
  constructor(stream) {
    super(); // invoke EventEmitter's constructor function

    let buffer = "";
    stream.on("data", data => {
      buffer += data; // capture incoming data
      let boundary = buffer.indexOf("\n"); // check for message separator
      while (boundary !== -1) {
        // if data is complete
        const input = buffer.substring(0, boundary); // extract input
        buffer = buffer.substring(boundary + 1); // remove input from buffer
        this.emit("message", JSON.parse(input)); // emit input as a message
        boundary = buffer.indexOf("\n"); // look for next message separator
      }
    });
  }

  // create static method to create an instance of class
  static connect(stream) {
    return new LDJClient(stream);
  }
}

module.exports = LDJClient;
