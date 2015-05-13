var test = require('tape')
var htmlSelectToJSON = require('../')
var fs = require('fs')
var concat = require('concat-stream')

test('string interpreted as selector, default to element text', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      title: 'title'
    }))
    .pipe(concat(function (result) {
      t.deepEqual(JSON.parse(result), {
        title: 'Pug - Wikipedia, the free encyclopedia'
      })
    }))
})

test('object requires selector, defaults to element text', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      siteSub: {selector: '#siteSub'}
    }))
    .pipe(concat(function (result) {
      t.deepEqual(JSON.parse(result), {
        siteSub: 'From Wikipedia, the free encyclopedia'
      })
    }))
})

test('object accepts optional attribute', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      href: {selector: 'link[rel="canonical"]', attribute: 'href'}
    }))
    .pipe(concat(function (result) {
      t.deepEqual(JSON.parse(result), {
        href: 'http://en.wikipedia.org/wiki/Pug'
      })
    }))
})

test('array requires a single object schema and returns array of all matching elements', function (t) {
  t.plan(1)

  fs.createReadStream(__dirname + '/wikipedia-pug.html')
    .pipe(htmlSelectToJSON({
      thumbnails: [{selector: '.thumbimage', attribute: 'src'}],
      serious: [{selector: 'strong'}],
      sections: ['#toc .tocnumber']
    }))
    .pipe(concat(function (result) {
      t.deepEqual(JSON.parse(result), {
        thumbnails: [
          '//upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pug_in_Tallinn.JPG/220px-Pug_in_Tallinn.JPG',
          '//upload.wikimedia.org/wikipedia/commons/thumb/5/5a/William_Hogarth_006.jpg/220px-William_Hogarth_006.jpg',
          '//upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Louis-Michel_van_Loo_Princess_Ekaterina_Dmitrievna_Golitsyna.jpg/220px-Louis-Michel_van_Loo_Princess_Ekaterina_Dmitrievna_Golitsyna.jpg',
          '//upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Henry_Bernard_Chalon_-_A_favourite_Pug_bitch_%281802%29.jpg/220px-Henry_Bernard_Chalon_-_A_favourite_Pug_bitch_%281802%29.jpg',
          '//upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Bonny_Bonita.JPG/220px-Bonny_Bonita.JPG',
          '//upload.wikimedia.org/wikipedia/commons/thumb/9/97/Mops_555.jpg/170px-Mops_555.jpg'
        ],
        serious: ['Pug', 'Pug'],
        sections: ['1', '1.1', '1.2', '2', '2.1', '2.2', '2.3', '3', '3.1', '3.2', '4', '5', '6', '7']
      })
    }))
})
