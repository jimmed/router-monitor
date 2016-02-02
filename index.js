var scraper = require('./lib/sky/scraper')
var inspect = require('util').inspect

testFlight({
  host: '192.168.0.1',
  pass: process.env.ROUTER_PASS
})

function testFlight (opts) {
  return scraper.getStatus(opts || {})
    .then(res => console.log(inspect(res, { colors: true, depth: 5 })))
    .catch(err => console.error(err.stack))
    .delay(15000)
    .finally(() => testFlight(opts))
}
