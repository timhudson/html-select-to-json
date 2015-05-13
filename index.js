var duplexify = require('duplexify')
var pumpify = require('pumpify')
var through = require('through2')
var select = require('html-select')
var tokenize = require('html-tokenize')
var jsonComposeStream = require('json-compose-stream')
var concat = require('concat-stream')
var streamsEnd = require('./streams-end')

module.exports = function (schema) {
  var writeStream = createSelectStream(schema)
  var jsonStream = jsonComposeStream({end: false})
  var ender = streamsEnd()
  var cache = {}

  var dup = duplexify.obj(writeStream, jsonStream)

  return dup

  function createSelectStream (schema) {
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

      if (!keySchema.selector) throw new Error('Selector must be provided')

      s.select(keySchema.selector, function (el) {
        if (keySchema.attribute) {
          var value = el.getAttribute(keySchema.attribute)

          if (keySchema.isArray) {
            return addToCache(key, value)
          } else {
            return jsonStream.set(key, value)
          }
        }

        var tr = through.obj(function (row, enc, callback) {
          if (row[0] === 'text') this.push(row[1].toString())
          callback()
        })

        var textStream = pumpify(el.createReadStream(), tr)

        if (keySchema.isArray) {
          textStream.pipe(concat(function (data) {
            addToCache(key, data.toString())
          }))
        } else {
          textStream.pipe(jsonStream.createSetStream(key))
        }

        ender.push(textStream)
      })
    })

    return stream
  }

  function onFlush (flush) {
    if (Object.keys(cache).length) jsonStream.set(cache)
    if (ender.ended()) {
      jsonStream.end()
      flush()
    } else {
      ender.setCallback(function () {
        jsonStream.end()
        flush()
      })
    }
  }

  function addToCache (key, value) {
    (cache[key] = cache[key] || []).push(value)
  }
}

function skipThrough (chunk, enc, callback) {
  callback()
}
