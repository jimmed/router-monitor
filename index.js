var findGateway = require('./lib/util/findGateway')
var CompareStream = require('./lib/util/compareStream')
var ConsoleStream = require('./lib/util/consoleStream')
var DatabaseWriteStream = require('./lib/util/mongoStream')
var StatusStream = require('./lib/sky/stream')
var inspect = require('util').inspect

testFlight({
  router: {
    host: findGateway(),
    pass: process.env.ROUTER_PASS,
    timeout: 5000
  },
  watch: [
    'wan.connected',
    'wan.connectionSpeed.downstream',
    'wan.connectionSpeed.upstream'
  ],
  db: 'mongodb://localhost:27017/router'
})

function testFlight (opts) {
  makePipe([
    new StatusStream(opts.router),
    new CompareStream({ watch: opts.watch }),
    new ConsoleStream({ colors: true }),
    new DatabaseWriteStream(opts.db)
  ])
}

function makePipe (streams) {
  return streams
    .reduce((out, stream) => out ? out.pipe(stream) : stream, null)
}
