# Networking with Sockets

Networked services: (1) Connect endpoints (2) Transmit information between them.
Regardless of the type of information, a connection must always be made.

A TCP (Transmission Control Protocol) socket connection has two endpoints - one endpoint `binds` to a numbered port and another that `connects` to a port. In Node, the `net` module provides the `bind` and `connect` methods.

```js
// basic-server.js
"use strict";

const net = require("net");
const server = net.createServer(connection => {
  // Use the connection object for data transfer
  console.log("Connection", connection);
});

server.listen(60300); // Port should be >= 0 and < 65536
```

The `createServer()` method takes a callback function and returns a `Server` object. Node will invoke the callback whenever another endpoint connects. The `connection` parameter is a `Socket` object that you can use to send or receive data. The `listen()` method binds the specified port (TCP port number 60300).

### Writing data to a socket

```js
// net-watcher.js
"use strict";

const fs = require("fs");
const net = require("net");
const filename = process.argv[2];

if (!filename) throw Error("Error: No file name specified");

net
  .createServer(connection => {
    // log start
    console.log("Subscriber has connected");
    connection.write(`Now watching ${filename}for changes`);

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
  .listen(3000, () => console.log("Listening for subscribers"));
```

You need 3 terminals to test this program:

```
$ watch -n 1 touch target.txt
```

This touches the `target.txt` file every 1s interval

```
$ node net-watcher.js target.txt
```

This creates a service listening on port 3000.

```
$ nc localhost 3000
```

We use `netcat`, a socket utility program to subscribe to the service and listen to the file for changes. You can have multiple terminals (subscribers) connect to the service.

TCP sockets are useful for communicating between networked computers. But you can also have processes on the same computer communicating using Unix sockets.

### Listening on Unix sockets

```js
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
```

Run the program:

```
$ node net-watcher-unix.js target.txt
```

Connect a client:

```
$ nc -U /tmp/watcher.sock
```

Unix sockets can be faster than TCP sockets because they don't involve networking hardware.

### Implementing a Messaging Protocol

A protocol is a set of rules that defines how endpoints in a system communicate. Moving from the plain text based protocol we have been using so far, we want to switch to an improved, computer accessible protocol - JSON.

```js
// net-watcher-json-server.js
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
```

### Creating Socket Client Connections

```js
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
```

We can also use `net` to write a client program in Node to receive json messages from our `net-watcher-json-server` program
. The client object is a Socket, just like the incoming connection on the server side.

This program only listens for `on()` data events, not `end()` or `error()` events. We need to refactor our code to handle this.

### Understanding the Message Boundary Problem

Networked programs in Node communicate by passing messages, which can arrive all at once, but mostly arrives in pieces split into distinct data events.

```js
// test-json-service.js
"use strict";

const server = require("net").createServer(conn => {
  console.log("Subscriber connected");

  const firstChunk = '{"type":"changed","timesta';
  const secondChunk = 'mp":1450694370094}​​​​n';

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
```

In the above code, we are simulating a network problem of broken connection with split data.
The client program attempts to send half the JSON through the parser and fails throwing a `SyntaxError: Unexpected token`.
So, any message that arrives as multiple data events will crash the client (which is especially the case with larger data transfers).
We want the client to buffer the data that arrives and then handle the message.

### Extending Core Classes in Custom Modules

```js
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
```

We create a class called `LDJClient` which extends from the `EventEmitter` class.
Then we capture incoming data in a buffer, look for a message separator in order to extract individual messages.
As soon as an individual message is extracted, we emit a message event with the parsed JSON input message.

This emitted data is then used in our client as follows.

```js
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
```

Thus we gracefully handle network errors and make our client more robust when consuming the service.

### Writing Mocha Unit Tests

```js
// ldj-client-test.js
"use strict";

const assert = require("assert");
const { EventEmitter } = require("events");
const LDJClient = require("../lib/ldj-client");

describe("LDJClient", () => {
  let stream = null;
  let client = null;

  beforeEach(() => {
    stream = new EventEmitter();
    client = new LDJClient(stream);
  });

  it("should emit a message event from a single data event", done => {
    client.on("message", message => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });
    stream.emit("data", `{"foo":"bar"}\n`);
  });
});
```

To run our basic unit test, we first pull in Node's built in `assert` module.
This modules contains useful functions for comparing values.

We use Mocha's `describe` method to create a named context for our test and pass in a callback with the test content.
We use Mocha's `beforeEach` hook to initialize our stream and ldj client.
Finally, we call the `it` method to test a specific behavior case of the class.
Once its done, it will invoke the done callback signalling to Mocha that the test has completed successfully.

The test we are running sets up a message event handler on the client and emits data on the stream to be captured by the client.

More Test Cases:

```js
it("should emit a message event from split data events", done => {
  client.on("message", message => {
    assert.deepEqual(message, { foo: "bar" });
    done();
  });
  stream.emit("data", '{"foo":');
  process.nextTick(() => stream.emit("data", '"bar"}\n'));
});
```

This test breaks up the message into two parts to be emitted from the stream one after another.
