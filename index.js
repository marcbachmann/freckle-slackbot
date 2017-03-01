var _ = require('lodash')
var fetch = require('./fetch')

var FRECKLE_TOKEN = process.env.FRECKLE_TOKEN
var SLACK_TOKEN = process.env.SLACK_TOKEN
var entries = fetch('entries', FRECKLE_TOKEN)
var projects = fetch('projects', FRECKLE_TOKEN)
var users = fetch('users', FRECKLE_TOKEN)
var track = require('./track')(entries, projects)

// https://my.slack.com/services/new/bot
var slack = require('@slack/client')
var RtmClient = slack.RtmClient
var RTM_EVENTS = slack.RTM_EVENTS
var CLIENT_EVENTS = slack.CLIENT_EVENTS
var MemoryDataStore = slack.MemoryDataStore
var rtm = new RtmClient(SLACK_TOKEN, {logLevel: 'error', dataStore: new MemoryDataStore()})
var logins = {}
var dates= {}

function postMessage (target, msg) {
  if (Array.isArray(msg)) msg = msg.join('\n')
  var user = rtm.dataStore.getUserById(target)
  var dm = rtm.dataStore.getDMByName(user.name)
  rtm.sendMessage(msg, dm.id)
}

rtm.start()
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (data) {
  console.log(`Logged in as ${data.self.name} of team ${data.team.name}`)
})

rtm.on(RTM_EVENTS.MESSAGE, function(msg) {
  if (msg.subtype) return

  _.each(msg.text.split('\n'), function (text) {
    var cmd = /^([^ ]*)( .*)?/.exec(text)

    if (cmd[1] === 'login') {
      login(msg, cmd)
    } else if (cmd[1] === 'track') {
      trackMessage(msg, cmd)
    } else if (Date.parse(cmd[0])) {
      changeDate(msg, cmd[0])
    } else if (/^projects?$/.test(cmd[1])) {
      listProjects(msg)
    } else {
      help(msg)
    }
  })
})

function login (msg, cmd) {
  var username = cmd[2] && cmd[2].split(' ').filter(Boolean)[0]
  if (!username) {
    users.list({}, function (err, users) {
      if (err) return postMessage(msg.user, err.stack)
      postMessage(msg.user, ['',
        logins[msg.user] ? `You are currently logged in as '${logins[msg.user].email}'` : '',
        "By typing 'login [username]' with one of the following users,",
        'you can log in to freckle.com.',
        '',
        _.map(users, 'email').join('\n')
      ])
    })
  } else {
    var isMail = /<mailto:(.*)\|/.exec(username)
    if (isMail) username = isMail[1]
    users.get({email: username}, function (err, user) {
      if (err) return postMessage(msg.user, err.stack)
      if (!user) return postMessage(msg.user, 'User not found')
      logins[msg.user] = user
      postMessage(msg.user, `Successfully logged in as '${user.email}'`)
    })
  }
}

function trackMessage (msg, cmd) {
  if (!logins[msg.user]) return notLoggedInMessage(msg)
  track({user: logins[msg.user], input: cmd[2], date: dates[msg.user]}, function (err, res) {
    if (err && /^No /.test(err.message)) postMessage(msg.user, err.message)
    else if (err) postMessage(msg.user, err.stack)
    else postMessage(msg.user, `Tracked ${res.minutes} minutes for '${res.description}' on the project '${res.project}'`)
  })
}

function help (msg) {
  postMessage(msg.user, ['',
    'Your last input isn\'t a supported command.',
    '',
    'You can use one of the following ones:',
    '```',
    'login                           : Shows you the current logged in user',
    'login username                  : Logs you in with a specific user',
    'track project 3 hours #li-123   : Tracks some time',
    'projects                        : Lists all projects',
    '```'
  ])
}

function changeDate (msg, date) {
  if (date === 'today') date = undefined
  else if (date === 'yesterday') date = new Date(Date.now() - (3600 * 1000 * 24))
  else date = new Date(date)

  if (!date) {
    delete dates[msg.user]
    postMessage(msg.user, `Changed date to today`)
  } else {
    dates[msg.user] = date
    postMessage(msg.user, `Changed date to ${date.toISOString()}`)
  }
}

function listProjects (msg) {
  if (!logins[msg.user]) return notLoggedInMessage(msg)
  projects.list({}, function (err, projects) {
    if (err) return postMessage(msg.user, err.stack)
    postMessage(msg.user, ['',
      "By typing 'track [projectname] 3 hours #some-tag' you can create a new entry.",
      '',
      _.map(projects, 'name').join('\n')
    ])
  })
}

function notLoggedInMessage (msg) {
  postMessage(msg.user, ['You are currently not logged in.',
    'Please use the \'login\' command to log in.'
  ])
}
