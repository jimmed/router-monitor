'use strict'

var stream = require('stream')
var MongoClient = require('mongodb').MongoClient
var Promise = require('bluebird')
Promise.promisifyAll(MongoClient)

class DatabaseWriteStream extends stream.Writable {
  constructor (connectionStr) {
    super({ objectMode: true })
    this.ready = MongoClient.connectAsync(connectionStr)
  }

  _write (data, _, done) {
    this.ready.then(db => db.collection('router').insertOne(data, done))
  }
}

module.exports = DatabaseWriteStream
