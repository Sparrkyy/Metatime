import SunCalc from 'suncalc'

/**
 * Returns { sunrise, sunset } for a given date and location.
 * Handles polar regions where SunCalc may return NaN.
 */
function getSunTimes(date, lat, lng) {
  const times = SunCalc.getTimes(date, lat, lng)
  const sunrise = times.sunrise
  const sunset = times.sunset

  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
    return getPolarFallback(date, lat)
  }
  return { sunrise, sunset }
}

/**
 * For polar regions, split day at noon/midnight depending on season.
 * In polar summer (sun never sets), we treat noon as "sunrise" and midnight as "sunset".
 * In polar winter (sun never rises), we treat midnight as "sunrise" and noon as "sunset".
 */
function getPolarFallback(date, lat) {
  const noon = new Date(date)
  noon.setHours(12, 0, 0, 0)

  const midnight = new Date(date)
  midnight.setHours(0, 0, 0, 0)

  // Rough check: if in northern summer (May-Aug) and high latitude → polar day
  const month = date.getMonth() // 0-indexed
  const isNorth = lat > 0
  const isSummerMonth = month >= 4 && month <= 8

  if ((isNorth && isSummerMonth) || (!isNorth && !isSummerMonth)) {
    // Polar day — treat as 0:00→12:00 day, 12:00→24:00 night (split at noon)
    const nextMidnight = new Date(midnight)
    nextMidnight.setDate(nextMidnight.getDate() + 1)
    return { sunrise: midnight, sunset: noon, _nextSunrise: noon }
  } else {
    // Polar night — treat as 12:00→24:00 day, 0:00→12:00 night (split at noon)
    return { sunrise: noon, sunset: midnight }
  }
}

/**
 * Returns a date object set to the given date but shifted by +/- days.
 * Uses setDate() for DST-safe arithmetic.
 */
function shiftDate(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Returns all the sunrise/sunset times needed to determine the current meta-time cycle.
 * @param {Date} now
 * @param {number} lat
 * @param {number} lng
 * @returns {{ todaySunrise, todaySunset, yesterdaySunset, tomorrowSunrise }}
 */
export function getSunData(now, lat, lng) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const yesterday = shiftDate(today, -1)
  const tomorrow = shiftDate(today, +1)

  const todayTimes = getSunTimes(today, lat, lng)
  const yesterdayTimes = getSunTimes(yesterday, lat, lng)
  const tomorrowTimes = getSunTimes(tomorrow, lat, lng)

  return {
    todaySunrise: todayTimes.sunrise,
    todaySunset: todayTimes.sunset,
    yesterdaySunset: yesterdayTimes.sunset,
    tomorrowSunrise: tomorrowTimes.sunrise,
  }
}
