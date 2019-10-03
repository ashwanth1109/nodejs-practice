# MICROSERVICES

A network is the sum of its parts and all the interactions between its parts.

To connect our microservices, we'll use a cross platform library called 0MQ (Zero Message Queue).
It provides high scalability, low latency messaging. Although Node's core has great support for
binding and connecting to sockets, it lacks in terms of higher level messaging patterns such as
handling server restarts, routing details, buffering of chunked data etc.

### Publishing and Subscribing to Messages

```js
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
```

Instead of the net module, we instead use the zeromq module to create a socket endpoint.
`publisher.send()` sends our message and `publisher.bind()` binds it to a TCP port for subscribers.
Note: A 0MQ server requires a 0MQ client to communicate.

```js
// zmq-watcher-sub.js
"use strict";

const zmq = require("zeromq");

// create subscriber endpoint
const subscriber = zmq.socket("sub");

// subscribe to all messages
subscriber.subscribe("");
// can provide a filter if you only want to listen to specific messages

// handle messages from publisher
subscriber.on("message", data => {
  const message = JSON.parse(data);
  const date = new Date(message.timestamp);
  console.log(`File ${message.file} changed at ${date}`);
});

// connect to publisher
subscriber.connect("tcp://localhost:3000");
```

The subscriber object inherits from the EventEmitter class and emits a message event when it receives it from the publisher.
The endpoints can be started in any order and they will wait till its counterpart is ready for communication.

### Responding to Requests

The request response pattern is very common in Node.

```js
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
```

We create a 0MQ responder socket and use it to respond to incoming requests. We bind the socket to the loopback interface (127.0.0.1) to wait for connections. This makes the responder the stable endpoint of the REQ/REP pair.

When a message event happens, we parse out the request from the raw data. We asynchronously retrieve the requested file's content. After we retrieve it, we respond with the file's content, the date and the process id of the Node process.

```js
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
```

Next, we create a 0MQ requester socket. We have it listen for incoming message events and interpret the data as a JSON serialized reponse. After setting up our listener, we make a request by connecting to the responder socket over TCP and then sending our request with the filename.

### Trading Synchronicity for Scale

There is a tradeoff when using 0MQ REP/REQ socket pairs with Node. Each endpoint on the application operates on only one request or one response at a time. There is no parallelism.

```js
for (let i = 1; i <= 5; i++) {
  console.log(`Sending a request for ${filename}`);
  requester.send(JSON.stringify({ path: filename }));
}
```

When we make multiple requests on our requester, we notice that our responder sends a response before even becoming aware of the next queued request. Hence, a simple REQ/REP pair is not suitable for a high performance Node application. We instead need a cluster of Node processes using more advanced 0MQ socket types to scale up our throughput.

### Routing and Dealing Messages

For parallel message processing, 0MQ provides more advanced socket types - ROUTER, DEALER.

A ROUTER socket is like a REP (responder) socket but can handle multiple messages simultaneously. It remembers which connection each request came from and will route reply messages accordingly. A ROUTER socket uses the sequence of low-overhead frames in the ZMTP protocol to route a reply message back to each connection that issued the request.

```js
const router = zmq.socket("router");
router.on("message", (...frames) => {
  // use frames
});
```

The message handler for a router takes an array of frames.

A DEALER socket is like a REQ (requester) socket but can send multiple requests simultaneously.

```js
​const​ router = zmq.socket(​'router'​);
const dealer = zmq.socket("dealer");
router.on(​'message'​, (...frames) => dealer.send(frames));
dealer.on(​'message'​, (...frames) => router.send(frames));
```

Here, we have a Node with a ROUTER socket and a DEALER socket. Either socket sends a message to the other socket, whenever either receives a message. You can have multiple REQ/REP sockets that connect to the ROUTER/DEALER pair which can distribute the requests and responses accordingly.

### Clustering Node.js Processes

In multi-threaded systems, doing more work in parallel means spinning up more threads. But Node uses a single-threaded event loop, so to take advantage of multiple cores in the same computer, you need to spin up more processes.

This is called clustering - a useful technique for scaling your Node application when there's unused CPU capacity available.
