"use strict";

/**
 * CHALLENGE
 *
 * 1. Install "chalk" npm package
 * 2. Load "chalk" into file
 * 3. Use it to print the string 'Success!' to the console in green
 * 4. Bonus: Make text bold and inversed (what??)
 */

const chalk = require("chalk");
const mssg = chalk.green.bold.inverse("Success!");

const mssg2 = chalk.green.red("Test");
console.log(mssg2);
