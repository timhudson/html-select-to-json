var eos = require('end-of-stream')
var once = require('once')

module.exports = StreamsEnd

function StreamsEnd (streams, callback) {
  if (!(this instanceof StreamsEnd)) return new StreamsEnd(streams, callback)

  if (typeof streams === 'function') {
    callback = streams
    streams = []
  }

  this._streams = streams || []
  this._endedCount = 0

  this.setCallback(callback)
}

StreamsEnd.prototype.push = function (stream) {
  var self = this
  var callback = this._callback
  var attemptEnd = this.attemptEnd

  this._streams.push(stream)

  eos(stream, function (err) {
    if (err) return callback(err)

    self._endedCount++
    attemptEnd.call(self)
  })
}

StreamsEnd.prototype.setCallback = function (callback) {
  this._callback = callback ? once(callback) : undefined
  if (this._callback) this.attemptEnd()
}

StreamsEnd.prototype.attemptEnd = function () {
  if (this._callback && this._endedCount === this._streams.length) {
    return this._callback()
  }
}
