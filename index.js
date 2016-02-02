var cheerio = require('cheerio')
var fetch = require('node-fetch')
var inspect = require('util').inspect;
var duration = require('moment').duration;
fetch.Promise = require('bluebird');


testFlight({
  host: '192.168.0.1',
  user: 'admin',
  pass: process.env.ROUTER_PASS
});


// Because cheerio mimics jQuery and has icky array-like functions
function $(x, y, z) { return Array.from(cheerio(x, y, z)) }

function camelize(str) {
  return str.trim()
    .replace(/^[a-z]+/i, start => start.toLowerCase())
    .replace(/\s+([a-z]+)/gi, (_, word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
}

function getStatusPage(options) {
  var url = `http://${options.user}:${options.pass}@${options.host}/sky_system.html`
  return fetch(url).then(res => res.text())
}

function parseStatusPage(html) {
  if (!html) {
    throw new Error('No page returned')
  }

  var tables = $('table', html)
    .reduce((acc, table) => {
      var headers = $('tr.header td', table)
        .map(cell => cell.children.reduce((a, b) => a + b.data, ''))
        .map(camelize)
      var body = $('tr:not(.header)', table)
        .map(row =>
          $('td', row)
            .map(cell => cell.children.reduce((a, b) => a + b.data, '').trim())
        )

      var groups = body.map(row => row[0]).map(camelize)
      var contents = body.map(row => row.slice(1))

      var tableData = {}

      groups.forEach((group, row) => {
        var rowData = {}
        headers.slice(1).forEach((header, index) => {
          var value = contents[row][index];
          var parsed = parseKeyValuePair(header, value)
          rowData[parsed.key] = parsed.value
        })
        tableData[group] = rowData
      })

      return acc.concat([ tableData ])
    }, [])

  var connections = tables[0]
  Object.keys(tables[1]).forEach(key => connections.wan[key] = tables[1][key]);

  return connections;
}

function getStatus(opts) {
  return getStatusPage(opts).then(parseStatusPage)
}

function parseKeyValuePair(key, value) {
  var parser = parsers[key]

  if (!parser) {
    return { key, value }
  }

  var newKey = parser.key ? parser.key(key) : key
  var newValue = parser.value ? parser.value(value) : value

  return { key: newKey, value: newValue }
}

function testFlight(opts) {
  return getStatus(opts || {})
    .then(res => console.log(inspect(res, { colors: true, depth: 5 })))
    .catch(err => console.error(err.stack))
    .delay(15000)
    .finally(() => testFlight(opts));
}

function unitize(input) {
  var parsed = input.match(/^(-?[\d\.]+)\s*(.+)$/)
  if (!parsed) {
    return input;
  }
  var value = parsed[1] ? parseInt(parsed[1], 10) : null;
  var unit = parsed[2]
  return { value, unit }
}

var parsers = {
  upTime: { key: _ => 'uptime', value: x => ({ value: duration(x).asSeconds(), unit: 's' }) },
  status: { key: _ => 'connected', value: x => x !== 'Down' },
  downstream: { value: unitize },
  upstream: { value: unitize },
  'txB/s': { key: _ => 'sendRate', value: x => ({ value: parseInt(x, 10), unit: 'bps' }) },
  'rxB/s': { key: _ => 'receiveRate', value: x => ({ value: parseInt(x, 10), unit: 'bps' }) },
  txpkts: { key: _ => 'sentPackets', value: x => ({ value: parseInt(x, 10), unit: 'packets' }) },
  rxpkts: { key: _ => 'receivedPackets', value: x => ({ value: parseInt(x, 10), unit: 'packets' }) },
  collisionPkts: { key: _ => 'collisionPackets', value: x => ({ value: parseInt(x, 10), unit: 'packets' }) },
}
