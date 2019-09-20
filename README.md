# NODE.JS

`While functionality is an asset, code is a liability. The best line of code is the one you never had to write.`

### INTRODUCTION

A platform for interpreting JS code and running applications. Built with Google Chrome's JS engine (interpreter).

It operates on an event loop that uses a single thread. A thread is a bundle of computing power and resources needed for the execution of a programmed task and is responsible for starting and completing a task. So more tasks you need to run simultaneously, the more threads you are going to need.

Unlike multi-threaded languages in which tasks are managed by a pool of threads that the computer can run at the same time (concurrently), Node.js can only handle one task at a time and uses more threads only for tasks that can't be handled by the main thread.

![Node.js Event Loop](https://raw.githubusercontent.com/ashwanth1109/nodejs-practice/master/assets/node-js-event-loop.png)

1. When tasks are prepared to run, they enter a queue to be processed by specific phases of the event loop.
2. The event loop cycles forever in a loop, listening for JS events triggered by the server to notify of a new task or a completed one.
3. The Node.js architecture schedules task handling for you behind the scenes.
4. The event loop handles a series of tasks, always working on one task at a time and using the computers processing power to offload larger tasks while the event loop shortens the list of tasks.
5. Node.js doesn't necessarily use its single thread to run each task to completion since its designed to pass off larger tasks to the host computer.

Issue with multi-threaded model: Incoming tasks are assigned to new processes, each creating a new evevnt loop. Increasing the number of tasks causes us to run into issues such as cost, computing power, and shared resources.

A process is a bundle of computing power and resources used for the execution of a task and you can have multiple instances of processes running in parallel and processing incoming requests and tasks. This is the reason why Node.js scales well, since it schedules tasks asynchronously, using additional threads and processes only when necessary. As demand increases, it works best to minimize the number of concurrent processes. Node.js’s philosophy is to give you low-level access to the event loop and to system resources.

`In Node.js, everything runs in parallel, except the code.`

Node gets away with the single threaded model by using non-blocking techniques.

### STRICT MODE

```
"use strict";
```

Add this at the top of all files.

### Web Servers

A web server is a software designed to respond to requests over the internet by loading or processing data. Web servers follow the HyperText Transfer Protocol (HTTP), a standardized system globally observed for the viewing of web pages and sending of data over the internet.

Client and server communicate through HTTP verbs which indicate the type of request being made. This context of a user's interaction is an important part of the request response cycle.

HTTP Secure (HTTPS) is a protocol in which the transmission of data is encrypted.

### HTTP Status Codes

```json
{
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "103": "Early Hints",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a Teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}
```

### Routing

Routing is a way for your application to determine how to respond to a requesting client. Some routes are designed by matching the URL in the request object.

### Readable Streams

Posted data comes into the http server via chunks. Data chunks allow information to stream into and out of a server. Instead of waiting for a large set of information to arrive at the server, Node allows you to work with parts of that information as it arrives via the ReadableStream library.

To collect all the posted data with a server, you need to listen for each piece of data received and arrange the data yourself. The request listens for a specific data event req.on('data') to be triggered when the data is received for a specific request. You need to define a new array `body` to sequentially add the data chunks to it as they arrive at the server.

![Readable Streams](https://raw.githubusercontent.com/ashwanth1109/nodejs-practice/master/assets/readable-streams.png)
