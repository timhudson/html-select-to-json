#!/usr/bin/env node

var fs = require('fs')
var selectStream = require('../')
var omit = require('omit-keys')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {h: 'help'}
})

if (argv.help) {
  fs.createReadStream(__dirname + '/usage.txt')
    .pipe(process.stdout)
} else {
  cmd()
}

function cmd () {
  var schema = omit(argv, ['_', 'h', 'help'])

  for (var key in schema) {
    if (schema[key][0] !== '{' && schema[key][0] !== '[') continue

    try {
      schema[key] = JSON.parse(schema[key])
    } catch (err) {
      console.error('Could not parse ' + key + ': ' + err.message)
    }
  }

  process.stdin
    .pipe(selectStream(schema))
    .pipe(process.stdout)
}
