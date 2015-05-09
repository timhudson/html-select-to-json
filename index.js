var duplexify = require('duplexify')
var pumpify = require('pumpify')
var through = require('through2')
var select = require('html-select')
var tokenize = require('html-tokenize')
var jsonComposeStream = require('json-compose-stream')

module.exports = function (schema) {
  var writeStream = createSelectStream(schema)
  var jsonStream = jsonComposeStream()
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

      if (!keySchema.selector) return dup.emit('error', new Error('Selector must be provided'))

      s.select(keySchema.selector, function (el) {
        if (keySchema.attribute) {
          var value = el.getAttribute(keySchema.attribute)

          if (keySchema.isArray) {
            return (cache[key] = cache[key] || []).push(value)
          } else {
            return jsonStream.set(key, value)
          }
        }

        var tr = through.obj(function (row, enc, callback) {
          if (row[0] === 'text') this.push(row[1].toString())
          callback()
        })

        pumpify(el.createReadStream(), tr)
          .pipe(jsonStream.createSetStream(key))
      })
    })

    return stream
  }

  function onFlush (flush) {
    if (Object.keys(cache).length) jsonStream.set(cache)
    flush()
  }
}

function skipThrough (chunk, enc, callback) {
  callback()
}
