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
