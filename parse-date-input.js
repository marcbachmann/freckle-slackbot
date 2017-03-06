const days = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
}

module.exports = function parseDateInput (day) {
  day = day.replace('last', '').trim()
  if (day === 'today') return undefined
  if (day === 'yesterday') return new Date(Date.now() - 864e5)

  if (days[day]) {
    const now = Date.now()
    const minus = 7 - (days[day] - new Date().getDay())
    return new Date(now - (864e5 * minus))
  } else {
    return new Date(Date.parse(day))
  }
}

const dayRegExp = /^(last )?(today|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/
module.exports.isDate = function (day) {
  if (!day) {
    return false
  } else if (dayRegExp.test(day)) {
    return true
  } else if (Date.parse(day)) {
    return true
  } else {
    return false
  }
}
