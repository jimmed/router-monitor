'use strict'

var stream = require('stream')
var inspect = require('util').inspect
var get = require('lodash/get')
var notifier = require('node-notifier')

class NotificationStream extends stream.Transform {
  constructor (opts) {
    super({ objectMode: true })
    this.opts = opts || { watch: {} }
  }

  _transform (item, _, done) {
    var generator = this.opts.watch[item.variable]

    if (generator) {
      notifier.notify(generator(item.value))
    }

    this.push(item)
    done()
  }
}

module.exports = NotificationStream
