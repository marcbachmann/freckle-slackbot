var assert = require('assert')
var parser = require('./parser')

var a = parser('3.5h some-customer #foobar test')
assert.equal(a.minutes, 210)
assert.equal(a.project, 'some-customer')
assert.equal(a.tag, '#foobar test')

var b = parser('foo-bar 3 hours 30 minutes test #foobar')
assert.equal(b.minutes, 210)
assert.equal(b.project, 'foo-bar')
assert.equal(b.tag, 'test #foobar')

var c = parser('endsin8h 1h 10m everything #after #minutes are used')
assert.equal(c.minutes, 70)
assert.equal(c.project, 'endsin8h')
assert.equal(c.tag, 'everything #after #minutes are used')

var d = parser('"something with apostrophe" 1h 10min #development')
assert.equal(d.minutes, 70)
assert.equal(d.project, 'something with apostrophe')
assert.equal(d.tag, '#development')

assert.equal(parser('3.5h at some-customer #foobar test').project, 'some-customer')
assert.equal(parser('3.5h on website #foobar test').project, 'website')

assert.equal(parser('1.5h').minutes, 90)
assert.equal(parser('1.5 h').minutes, 90)
assert.equal(parser('1.5 hour').minutes, 90)
assert.equal(parser('1.5 hours').minutes, 90)

assert.equal(parser('1:30h').minutes, 90)
assert.equal(parser('1:30 h').minutes, 90)
assert.equal(parser('1:30 hour').minutes, 90)
assert.equal(parser('1:30 hours').minutes, 90)
assert.equal(parser('1:30     hours').minutes, 90)

assert.equal(parser('1.75h').minutes, 105)
assert.equal(parser('1:75h').minutes, 135)

assert.equal(parser('1h 30m').minutes, 90)
assert.equal(parser('1h 30 m').minutes, 90)
assert.equal(parser('1hour 30min').minutes, 90)
assert.equal(parser('1hours 30 min').minutes, 90)
assert.equal(parser('1hours 30 minute').minutes, 90)
assert.equal(parser('1hours 30    minutes').minutes, 90)
