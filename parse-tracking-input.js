var hoursRegExp = /(^|\s)([0-9\.,:]{1,5})\s*(hours|hour|h)(\s|$)/
var minutesRegExp = /(^|\s)([0-9]{1,2})\s*(minutes|minute|min|m)(\s|$)/

module.exports = function (string) {
  if (!string) string = ''
  return {
    project: extractProject(string),
    tag: extractTags(string),
    minutes: stringToMinutes(string),
    input: string.trim()
  }
}

function extractProject (str) {
  var s = removeTime(str).replace(/^(\son\s|\sat\s)*/g, '')
  var m = /^\s*(".*"|'.*'|[^ ]*)/.exec(s)
  if (!m) return
  return m[1].replace(/(^['"]|['"]$)/g, '')
}

function extractTags (str) {
  str = removeTime(str)
  var m = /^\s*(".*"|'.*'|[^ ]*)(.*)/.exec(str)
  return m && m[2].trim()
}

function removeTime (str) {
  return str.replace(hoursRegExp, ' ').replace(minutesRegExp, ' ')
}

function stringToMinutes (str) {
  var hours = hoursRegExp.exec(str)
  var minutes = minutesRegExp.exec(str)
  return (hours && hoursToMinutes(hours[2])) + (minutes && parseInt(minutes[2]) || 0)
}

function hoursToMinutes (str) {
  var split = str.split(/[:,;\.]/)
  var hours = (parseInt(split[0]) || 0) * 60
  if (/:/.test(str)) return hours + Math.floor((split[1] || 0))
  if (/[\.;,]/.test(str)) return hours + Math.floor(split[1] * 60 / Math.pow(10, String(split[1]).length))
  else return hours
}
