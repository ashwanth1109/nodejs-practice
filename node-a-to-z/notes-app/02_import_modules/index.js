const utils = require("./utils");

const { uppercase, add } = utils;

const name = "Paul McCartney";

// console.log(uppercase(name));
// console.log(add(2, 5));

/**
 * CHALLENGE: Define and use a function in a new file
 *
 * 1. Create a new file called notes.js
 * 2. Create getNotes function that returns "Your notes. . ."
 * 3. Export getNotes function
 * 4. Load in and call the function printing the message to the console
 */
const getNotes = require("./notes");

console.log(getNotes());
