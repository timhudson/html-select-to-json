var duplexify = require('duplexify')
var pumpify = require('pumpify')
var through = require('through2')
var select = require('html-select')
var tokenize = require('html-tokenize')
var concat = require('concat-stream')
var streamsEnd = require('./streams-end')

module.exports = function (schema, options) {
  var writeStream = createSelectStream(schema)
  var readStream = through.obj()
  var data = {}

  var dup = duplexify.obj(writeStream, readStream)

  return dup

  function createSelectStream (schema) {
    var ender = streamsEnd()
    var s = select()
    var stream = pumpify.obj(tokenize(), s, through.obj(skipThrough, onFlush))

    Object.keys(schema).forEach(function (key) {
      var keySchema = schema[key]

      if (typeof keySchema === 'string') keySchema = {selector: keySchema}

      if (Array.isArray(keySchema)) {
        keySchema = {
          selector: keySchema[0].selector,
          attribute: keySchema[0].attribute,
          isArray: true
        }
      }

      if (!keySchema.selector) return dup.emit('error', new Error('Selector must be provided'))

      s.select(keySchema.selector, function (el) {
        if (keySchema.attribute) return setValue(el.getAttribute(keySchema.attribute))

        var tr = through.obj(function (row, enc, callback) {
          if (row[0] === 'text') this.push(row[1].toString())
          callback()
        })

        var textStream = pumpify(el.createReadStream(), tr, concat(setValue))
        ender.push(textStream)
      })

      function setValue (value) {
        if (keySchema.isArray) {
          data[key] = data[key] || []
          data[key].push(value)
        } else {
          data[key] = value
        }
      }
    })

    return stream

    function onFlush (flush) {
      ender.setCallback(function (err) {
        if (err) dup.emit('error', err)
        readStream.push(data)
        flush()
      })
    }
  }
}

function skipThrough (chunk, enc, callback) {
  callback()
}
