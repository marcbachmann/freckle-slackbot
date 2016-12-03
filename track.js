var parser = require('./parser')

module.exports = function (entries, projects) {
  return function track (cmd, cb) {
    var parsed = parser(cmd.input)
    if (!parsed.minutes) return cb(new Error('No minutes used in sentence.'))
    if (!parsed.project) return cb(new Error('No project used in sentence.'))
    if (!parsed.tag) return cb(new Error('No tag used in sentence.'))

    projects.get(function (p) {
      return p.name.toLowerCase() === parsed.project.trim().toLowerCase()
    }, function (err, project) {
      if (!project) return cb(new Error(`No project found with the name '${parsed.project}'`))

      var data = {
        project_id: project.id,
        user_id: cmd.user.id,
        minutes: parsed.minutes,
        date: new Date().toISOString(),
        description: parsed.tag
      }
      entries.post(data, function (err, res) {
        if (err) cb(err)
        else cb(null, Object.assign(data, {project: project.name}))
      })
    })
  }
}
