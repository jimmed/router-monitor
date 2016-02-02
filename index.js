var findGateway = require('./lib/util/findGateway')
var StatusStream = require('./lib/sky/stream')
var inspect = require('util').inspect

testFlight({
  host: findGateway(),
  pass: process.env.ROUTER_PASS,
  timeout: 5000
})

function testFlight (opts) {
  var stream = new StatusStream(opts)

  stream.on('readable', () => {
    console.log(inspect(stream.read(), { colors: true, depth: 4 }))
  })
}
