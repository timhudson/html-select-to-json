# html-select-to-json

Convert html stream to json based on a schema of selectors

[![build status](http://img.shields.io/travis/timhudson/html-select-to-json.svg?style=flat)](http://travis-ci.org/timhudson/html-select-to-json)

## Example

``` js
var select = require('html-select-to-json')
var request = require('request')

request('https://github.com/mafintosh/torrent-mount')
  .pipe(select({
    title: 'title',
    href: {selector: 'link[rel="canonical"]', attribute: 'href'},
    readme: '.markdown-body'
  }))
  .on('data', function (data) {
    console.log(data)
  })
```

## License

MIT