// read-simple.js

"use strict";

const fs = require("fs");

fs.readFile("target.txt", (err, data) => {
  if (err) throw ("Error reading file:", err);
  console.log(data.toString());
});
