# Router Monitor

This is a toy project I wrote to try implementing my own Node.js streams, and also keep an eye on my terrible internet connection.

## Architecture

There are 4 stream implementations:

 - A readable stream which emits the status of my router every `x` seconds
 - A transform stream which listens for changes in the router status, emitting a description of the changes
 - A transform (pass-through) stream which logs to the console using `util.inspect`
 - A writeable stream which pushes each change event to a MongoDB collection.

There's also a small bit of code for scraping the router's status page.
