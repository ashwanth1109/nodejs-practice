// write-simple.js

"use strict";

const fs = require("fs");

fs.writeFile("target.txt", "Hello file write", err => {
  if (err) throw err;
  console.log("File content written");
});
