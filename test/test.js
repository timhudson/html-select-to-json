var test = require('tape')
var htmlSelectToJSON = require('../')
var fs = require('fs')

test('string interpreted as selector, default to element text', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      title: 'title'
    }))
    .on('data', function (data) {
      t.equal(data.title, 'Pug - Wikipedia, the free encyclopedia')
    })
})

test('object requires selector, defaults to element text', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      siteSub: {selector: '#siteSub'}
    }))
    .on('data', function (data) {
      t.equal(data.siteSub, 'From Wikipedia, the free encyclopedia')
    })
})

test('object accepts optional attribute', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      href: {selector: 'link[rel="canonical"]', attribute: 'href'}
    }))
    .on('data', function (data) {
      t.equal(data.href, 'http://en.wikipedia.org/wiki/Pug')
    })
})

test('array requires a single object schema and returns array of all matching elements', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      thumbnails: [{selector: '.thumbimage', attribute: 'src'}]
    }))
    .on('data', function (data) {
      t.deepEqual(data.thumbnails, [
        '//upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pug_in_Tallinn.JPG/220px-Pug_in_Tallinn.JPG',
        '//upload.wikimedia.org/wikipedia/commons/thumb/5/5a/William_Hogarth_006.jpg/220px-William_Hogarth_006.jpg',
        '//upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Louis-Michel_van_Loo_Princess_Ekaterina_Dmitrievna_Golitsyna.jpg/220px-Louis-Michel_van_Loo_Princess_Ekaterina_Dmitrievna_Golitsyna.jpg',
        '//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Henry_Bernard_Chalon_-_A_favourite_Pug_bitch_%281802%29.jpg/220px-Henry_Bernard_Chalon_-_A_favourite_Pug_bitch_%281802%29.jpg',
        '//upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Bonny_Bonita.JPG/220px-Bonny_Bonita.JPG',
        '//upload.wikimedia.org/wikipedia/commons/thumb/9/97/Mops_555.jpg/170px-Mops_555.jpg'
      ])
    })
})