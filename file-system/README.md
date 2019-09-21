# File System: Watching a file for changes

```js
// watcher.js
"use strict"; // disables certain problematic JS features

const fs = require("fs"); // pulls in the built-in filesystem module

fs.watch("target.txt", () => console.log("File has been changed"));

console.log('Now watching "target.txt" for changes . . .');
```

Here, `watcher.js` is at the same level as `target.txt`. A module is a self-contained bit of JavaScript that provides functionality to be used elsewhere.

The `fs module` provides a watch method which takes a path to a file and a callback which gets triggered everytime the file's content changes. In JS, functions are first-class citizens, which means they can be assigned to variables and passed as parameters to other functions.

To run this program, Node does the following:

- Loads the script, all the way to the last line
- Starts waiting for something to happen (fs.watch)
- Executes a callback when the change is detected
- Determines program is not complete and resumes waiting

The event loop spins until there is nothing left to do.

### CLI ARGUMENT

```js
// watcher-argv.js

"use strict";

const fs = require("fs");

const filename = process.argv[2];

if (!filename) throw Error("File specified does not exist");

fs.watch(filename, () => console.log("File changed"));

console.log("Now watching file for changes. . .");
```

This program is run with `node watcher-argv.js​​ ​​target.txt`. It uses process.argv (argument vector) to access the inline command line arguments.

### ERROR HANDLING

If file doesn't exist, we throw an error.

```
internal/fs/watchers.js:173
    throw error;
    ^

Error: ENOENT: no such file or directory, watch 'target'
    at FSWatcher.start (internal/fs/watchers.js:165:26)
    at Object.watch (fs.js:1258:11)
    at Object.<anonymous> (/home/ashwanth/Desktop/GITHUB/nodejs-practice/file-system/watcher-argv.js:9:4)
    at Module._compile (internal/modules/cjs/loader.js:776:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:787:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:829:12)
    at startup (internal/bootstrap/node.js:283:19)
```

Any unhandled exception thrown in Node.js will halt the process. Processes are important in Node. It’s pretty common in Node.js development to spawn separate processes as a way of breaking up work, rather than putting everything into one big Node.js program.

### Spawning a child process

```js
// watcher-spawn.js

"use strict";

const fs = require("fs");
const spawn = require("child_process").spawn;
const filename = process.argv[2];

if (!filename) throw Error("File specified does not exist");

fs.watch(filename, () => {
  const ls = spawn("ls", ["-l", "-h", filename]);
  ls.stdout.pipe(process.stdout);
});

console.log("Now watching file for changes. . .");
```

The 1st parameter to spawn is the name of the program we wish to execute. In our case, it's ls. The 2nd parameter is an array of command-line arguments which contains the flags and the target filename.

The object returned by spawn() is a ChildProcess. It's stdin, stdout and stderr are Streams that can be used to read or write data. We want to send the standard output from the child process directly to our own standard output stream. This is what the pipe() method does.

### Capturing data from an EventEmitter

EventEmitter provides a channel for events to be dispatched and listeners to be notified. Streams amongst many objects, inherits from EventEmitter.

```js
// watcher-spawn-parse.js

"use strict";

const fs = require("fs");
const spawn = require("child_process").spawn;
const filename = process.argv[2];

if (!filename) throw Error("File specified does not exist");

fs.watch(filename, () => {
  const ls = spawn("ls", ["-l", "-h", filename]);
  let output = "";

  ls.stdout.on("data", chunk => (output += chunk));

  ls.on("close", () => {
    const parts = output.split(/\s+/);
    console.log([parts[0], parts[4], parts[8]]);
  });
});

console.log("Now watching file for changes. . .");
```

The new callback starts out the same as before, creating a child process and assigning it to a variable called ls. It also creates an output variable, which will buffer the output coming from the child process.

Since the Stream class inherits from EventEmitter, we can listen for events from the child process’s standard output stream:

```
ls.stdout.on(​'data'​, chunk => output += chunk);
```

The on() method helps us listen to data coming out of the stream. Each time we get a chunk of data, we append it to our output. A Buffer is Node's way of representing binary data. It points to a blob of memory allocated by Node.js’s native core, outside of the JavaScript engine. Buffers can’t be resized and they require encoding and decoding to convert to and from JavaScript strings. Any time you add a non-string to a string in JavaScript, the runtime will implicitly call the object’s toString() method. This means copying the content into Node's heap using the default encoding (UTF-8). Shuttling data this way can be a slow process, so it's often better to work with Buffers directly.

We can add an `on close` event listener to the child process which gets triggered after a child process has exited and all its streams have been flushed.

```js
ls.on("close", () => {
  const parts = output.split(/\s+/); // parse the output data here
  console.log([parts[0], parts[4], parts[8]]);
});
```

### Reading and Writing Files Asynchronously

```js
// read-simple.js

"use strict";

const fs = require("fs");

fs.readFile("target.txt", (err, data) => {
  if (err) throw ("Error reading file:", err);
  console.log(data.toString());
});
```

Here, we read the entire file at once which is a simpler approach that works for small files. Better approaches involve creating streams or staging content in buffers.

If the file read was successful, the `err` will be null and if there were errors it will contain an `Error` object and we throw it. An uncaught exception in Node will halt the program by escaping the event loop.

Similarly, for writing a file:

```js
// write-simple.js

"use strict";

const fs = require("fs");

fs.writeFile("target.txt", "Hello file write", err => {
  if (err) throw err;
  console.log("File content written");
});
```

The program writes the text into the file, creating the file if it doesn't exist.

### Creating Read and Write Streams

Running executable files directly in node:

```js
#!/usr/bin/env node // the #! makes it possible to execute on Unix
"use strict";

require("fs")
  .createReadStream(process.argv[2])
  .pipe(process.stdout);
```

```
$ ​​chmod​​ ​​+x​​ ​​cat.js
$ ​​./cat.js​​ ​​target.txt
```

```js
// read-stream.js

"use strict";

require("fs")
  .createReadStream(process.argv[2])
  .on("data", chunk => process.stdout.write(chunk))
  .on("error", err => process.stderr.write(`ERROR: ​${err.message}​\n`​));
```

We use the `process.stdout.write` to echo data rather than using console. The incoming data chunks already contain any newline characters from the input file.

We can chain our event listeners because the return value of `on()` is the same `EventEmitter` object.

### Synchronous File Access

The async methods we've used so far, perform their IO duties, waiting in the background to invoke callbacks later.

There are methods (like `readFileSync`) which lets you perform these operations synchronously but it comes at a substantial cost. In sync methods, the process blocks until the IO finishes.

```js
// read-sync.js
"use strict";

const fs = require("fs");
const data = fs.readFileSync("target.txt");
process.stdout.write(data.toString());
```

The return value of `readFileSync()` is a Buffer object.

### Explore More:

The `fs` module comes with many other methods that map onto POSIX conventions. POSIX is a family of standards for interoperability between operating systems which includes file system utilities.

### Sync vs Async (Blocking vs Non-blocking)

Given that sync is blocking, it might feel like a bad idea to ever use it. However, in the initialization phase, as the program is getting set up, bringing in libraries, reading configuration parameters and doing other mission critical tasks, you can consider synchronous file access. This is because in initialization, if something goes wrong, its better to fail fast since not much can be done.

The `require()` method is an example of synchronous file access during the initialization phase.

In the operation phase, the program churns through the event loop and synchronous file access methods should never be used here.
