var cheerio = require('cheerio')
var fetch = require('node-fetch')
fetch.Promise = require('bluebird');
var inspect = require('util').inspect;

// Because cheerio mimics jQuery and jQuery has icky array-like functions
function $(x, y, z) { return Array.from(cheerio(x, y, z)) }

function getStatusPage(url) {
  return fetch(url).then(data => data.text())
}

function getCurrentStatus(html) {
  if (!html) {
    throw new Error('No page returned')
  }

  return $('table', html)
    .reduce((tables, table) => {
      var headers = $('tr.header td', table)
        .map(cell => cell.children.reduce((a, b) => a + b.data, '').trim())
      var body = $('tr:not(.header)', table)
        .map(row =>
          $('td', row).map(cell => cell.children.reduce((a, b) => a + b.data, '').trim())
        )

      var groups = body.map(row => row[0])
      var contents = body.map(row => row.slice(1))

      var tableData = {};

      groups.forEach((group, row) => {
        var rowData = {}
        headers.slice(1).forEach((header, index) => rowData[header] = contents[row][index])
        tableData[group] = rowData;
      })

      return tables.concat([ tableData ])
    }, [])
}

function testFlight() {
  return getStatusPage(process.env.ROUTER_URL)
    .then(getCurrentStatus)
    .then(res => console.log(inspect(res, { colors: true, depth: 7 })))
    .catch(err => console.error(err.stack))
    .delay(15000)
    .finally(testFlight);
}

testFlight();
