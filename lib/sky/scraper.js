var fetch = require('node-fetch')
var url = require('url')
var formatter = require('./formatter')
var dom = require('../util/dom')
var camelize = require('../util/camelize')
var wrapError = require('../util/wrapError')

fetch.Promise = require('bluebird')

function getStatusPage (options) {
  var statusPageUrl = url.format({
    protocol: 'http',
    host: options.host,
    auth: `admin:${options.pass}`,
    pathname: 'sky_system.html'
  })

  return fetch(statusPageUrl).then(res => res.text())
}

function parseStatusPage (html) {
  if (!html) {
    throw new Error('No page returned')
  }

  var tables = dom('table', html)
    .reduce((acc, table) => {
      var headers = dom('tr.header td', table)
        .map(cell => cell.children.reduce((a, b) => a + b.data, ''))
        .map(camelize)
      var body = dom('tr:not(.header)', table)
        .map(row => dom('td', row)
          .map(cell => cell.children.reduce((a, b) => a + b.data, '').trim())
      )

      var groups = body.map(row => row[0]).map(camelize)
      var contents = body.map(row => row.slice(1))

      var tableData = {}

      groups.forEach((group, row) => {
        var rowData = {}
        headers.slice(1).forEach((header, index) => {
          var value = contents[row][index]
          var parsed = formatter(header, value)
          rowData[parsed.key] = parsed.value
        })
        tableData[group] = rowData
      })

      return acc.concat([ tableData ])
    }, [])

  if (!tables[0]) {
    throw new Error('Data missing from page')
  }

  if (!tables[1]) {
    return tables[0]
  }

  var connections = tables[0]
  Object.keys(tables[1]).forEach(key =>
    connections.wan[key] = tables[1][key]
  )

  return connections
}

module.exports = {
  getStatus: function getStatus (opts) {
    return getStatusPage(opts)
      .then(parseStatusPage)
      .catch(wrapError.bind(null, 'Could not get status'))
  }
}
