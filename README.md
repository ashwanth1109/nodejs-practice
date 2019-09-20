# NODE.JS

A platform for interpreting JS code and running applications. Built with Google Chrome's JS engine (interpreter).

It operates on an event loop that uses a single thread. A thread is a bundle of computing power and resources needed for the execution of a programmed task and is responsible for starting and completing a task. So more tasks you need to run simultaneously, the more threads you are going to need.

Unlike multi-threaded languages in which tasks are managed by a pool of threads that the computer can run at the same time (concurrently), Node.js can only handle one task at a time and uses more threads only for tasks that can't be handled by the main thread.

![Node.js Event Loop](https://raw.githubusercontent.com/ashwanth1109/nodejs-practice/master/assets/node-js-event-loop.png)
