"use strict";

const port = 3000;

const http = require("http");
const httpStatus = require("http-status-codes");

const getJSONString = obj => JSON.stringify(obj, null, 2);

const app = http.createServer((req, res) => {
  //   console.log(
  //     "Received an incoming request",
  //     getJSONString(req.headers)
  //     // req.method,
  //     // req.url,
  //     // req.headers
  //   );

  app.on("request", (req, res) => {
    let body = [];
    req.on("data", data => {
      body.push(data);
    });
    req.on("end", () => {
      body = Buffer.concat(body).toString();
      console.log("Req body contents", body);
    });
  });

  res.writeHead(httpStatus.OK, {
    "Content-Type": "text/html"
  });

  let mssg = "<h1>Hello from the other side</h1>";
  res.write(mssg);

  res.end(); // tell the client you are no longer writing content and can send response
  console.log("Sent a response");
});

app.listen(port);

console.log("The server is listening on port: ", port);
