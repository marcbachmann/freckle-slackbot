module.exports = fetch

function fetch (type, key, opts) {
  var fetch = require('fetch').fetchUrl
  var _ = require('lodash')
  var EventEmitter = require('events').EventEmitter

  var all = {}
  var isLoaded = false
  var isLoading = false
  var ee = new EventEmitter()

  ee.on('load', function () {
    if (isLoading) return
    isLoading = true
    fetch('https://api.letsfreckle.com/v2/' + type, {
      headers: {'X-FreckleToken': key}
    }, function (err, meta, buffer) {
      if (err || meta.status !== 200) return console.error(err)

      try {
        var res = JSON.parse(buffer.toString())
      } catch (err) {
        return console.error(err)
      }
      _.each(res, function (entry) {
        all[entry.id] = entry
      })
      isLoaded = true
      isLoading = false
      ee.emit('loaded')
    })
  })

  var api = {
    get: function (query, cb) {
      if (isLoaded) return cb(null, _.find(all, query))
      ee.emit('load')
      ee.once('loaded', function () {
        api.get(query, cb)
      })
    },
    list: function (query, cb) {
      if (isLoaded) return cb(null, _.values(all))
      ee.emit('load')
      ee.once('loaded', function () {
        api.list(query, cb)
      })
    },
    post: function (body, cb) {
      fetch('https://api.letsfreckle.com/v2/' + type, {
        method: 'POST',
        headers: {'X-FreckleToken': key},
        payload: JSON.stringify(body)
      }, function (err, meta, buffer) {
        if (err) return cb(err)

        try {
          var res = JSON.parse(buffer.toString())
        } catch (err) {
          return cb(err)
        }

        if (meta.status !== 201) {
          err = new Error('Invalid response: ' + JSON.stringify(res))
          err.meta = meta
          err.body = res
          cb(err)
        } else {
          cb(null, res)
        }
      })
    }
  }

  return api
}
