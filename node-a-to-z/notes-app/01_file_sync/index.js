// const fs = require("fs");

// Initial write to file (sync method)
// fs.writeFileSync("notes.txt", "Hello darkness, my old friend!");

/**
 * CHALLENGE: Append a message to notes.txt
 *
 * 1. Use appendFileSync to append the file
 * 2. Run the script
 * 3. Check if text got appended
 */

"use strict";

const fs = require("fs");

try {
  fs.appendFileSync("notes.txt", "\nI've come to talk with you again");
} catch (err) {
  console.log("Error");
}
