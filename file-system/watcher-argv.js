"use strict";

const fs = require("fs");

const filename = process.argv[2];

if (!filename) throw Error("File specified does not exist");

fs.watch(filename, () => console.log("File changed"));

console.log("Now watching file for changes. . .");
