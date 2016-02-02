var scraper = require('./lib/sky/scraper')
var findGateway = require('./lib/util/findGateway')
var inspect = require('util').inspect

testFlight({
  host: findGateway(),
  pass: process.env.ROUTER_PASS
})

function testFlight (opts) {
  return scraper.getStatus(opts || {})
    .then(res => console.log(inspect(res, { colors: true, depth: 5 })))
    .catch(err => console.error(err.stack))
    .delay(15000)
    .finally(() => testFlight(opts))
}
