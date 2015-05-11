var select = require('./')
var request = require('request')

request('https://github.com/timhudson/html-select-to-json')
  .pipe(select({
    title: 'title',
    href: {selector: 'link[rel="canonical"]', attribute: 'href'},
    readme: '.markdown-body'
  }))
  .pipe(process.stdout)
