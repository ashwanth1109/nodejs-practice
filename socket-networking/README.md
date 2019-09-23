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
