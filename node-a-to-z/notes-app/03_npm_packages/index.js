"use strict";

const validator = require("validator");

const email1 = "ashwanth1109@gmail.com";

const email2 = "test";

console.log(validator.isEmail(email1));
console.log(validator.isEmail(email2));

const url1 = "https://github.com/validatorjs/validator.js";
const url2 = "https/github.com/validatorjs/validator.js";

console.log(validator.isURL(url1));
console.log(validator.isURL(url2));
