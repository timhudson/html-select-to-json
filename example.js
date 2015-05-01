var select = require('./')
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
