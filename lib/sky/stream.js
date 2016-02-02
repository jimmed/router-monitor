'use strict'
var stream = require('stream')
var events = require('events')
var scraper = require('./scraper')

class StatusPoller extends events.EventEmitter {
  constructor (options) {
    super()
    this.options = options
  }

  startFetching () {
    if (this._interval) { return }

    this.performFetch()
    this._interval = setInterval(this.performFetch.bind(this), this.options.timeout || 5000)
  }

  stopFetching () {
    clearInterval(this._interval)
  }

  performFetch () {
    scraper.getStatus(this.options)
      .then(status => this.emit('data', status))
  }
}

class StatusStream extends stream.Readable {
  constructor (options) {
    super({ objectMode: true })
    this._source = new StatusPoller(options)

    this._source.on('data', status => {
      if (!this.push(status)) {
        this._source.stopFetching()
      }
    })
  }

  _read () {
    this._source.startFetching()
  }
}

module.exports = StatusStream
