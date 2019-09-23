"use strict";

const fs = require("fs");

fs.watch("target.txt", () => console.log("File has been changed"));

console.log('Now watching "target.txt" for changes . . .');
