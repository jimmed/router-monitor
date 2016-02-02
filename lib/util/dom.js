var cheerio = require('cheerio')

module.exports = function getDOMElements (selector, context, root) {
  return Array.from(cheerio(selector, context, root))
}
