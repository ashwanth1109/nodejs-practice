# Networking with Sockets

Networked services: (1) Connect endpoints (2) Transmit information between them.
Regardless of information, a connection must always be made.

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
