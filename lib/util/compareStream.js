'use strict'

var stream = require('stream')
var get = require('lodash/get')
var isEqual = require('lodash/isEqual')

class CompareStream extends stream.Transform {
  constructor (opts) {
    super({ objectMode: true })
    this.opts = opts || {}
    this.opts.watch = this.opts.watch || []
    this._previousState = {}
    this.push({
      event: 'START_WATCHING',
      time: new Date(),
      watching: this.opts.watch
    })
  }

  _transform (currentState, _, done) {
    this.opts.watch
      .map(variable => {
        var value = get(currentState, variable)
        var previous = get(this._previousState, variable)
        if (!isEqual(value, previous)) {
          return {
            event: 'VALUE_CHANGE',
            time: new Date(),
            variable,
            value
          }
        }
      })
      .filter(x => x)
      .map(event => this.push(event))
    this._previousState = currentState
    done()
  }
}

module.exports = CompareStream
