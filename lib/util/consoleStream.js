'use strict'

var stream = require('stream')
var inspect = require('util').inspect

class ConsoleStream extends stream.Transform {
  constructor (opts) {
    super({ objectMode: true })
    this.opts = opts || {}
  }

  _transform (item, _, done) {
    console.log(inspect(item, this.opts))
    this.push(item)
    done()
  }
}

module.exports = ConsoleStream
