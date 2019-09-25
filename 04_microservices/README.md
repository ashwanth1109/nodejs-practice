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
