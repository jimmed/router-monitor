var duration = require('moment').duration

module.exports = function formatter (key, value) {
  var formatter = formatters[key]

  if (!formatter) {
    return { key, value }
  }

  var newKey = formatter.key ? formatter.key(key) : key
  var newValue = formatter.value ? formatter.value(value) : value

  return { key: newKey, value: newValue }
}

function unitize (input) {
  var formatted = input.match(/^(-?[\d\.]+)\s*(.+)$/)
  if (!formatted) {
    return input
  }
  var value = formatted[1] ? parseDecimal(formatted[1]) : null
  var unit = formatted[2]
  return { value, unit }
}

function parseDecimal (int) {
  return parseInt(int, 10)
}

var formatters = {
  upTime: { key: _ => 'uptime', value: x => ({ value: duration(x).asSeconds(), unit: 's' }) },
  status: { key: _ => 'connected', value: x => x !== 'Down' },
  downstream: { value: unitize },
  upstream: { value: unitize },
  'txB/s': { key: _ => 'sendRate', value: x => ({ value: parseDecimal(x), unit: 'bps' }) },
  'rxB/s': { key: _ => 'receiveRate', value: x => ({ value: parseDecimal(x), unit: 'bps' }) },
  txpkts: { key: _ => 'sentPackets', value: x => ({ value: parseDecimal(x), unit: 'packets' }) },
  rxpkts: { key: _ => 'receivedPackets', value: x => ({ value: parseDecimal(x), unit: 'packets' }) },
  collisionPkts: { key: _ => 'collisionPackets', value: x => ({ value: parseDecimal(x), unit: 'packets' }) }
}
