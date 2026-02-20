import { getSunData } from './suncalc-wrapper.js'

const TWO_PI = Math.PI * 2
const SECONDS_IN_12H = 43200 // 12 * 3600

/**
 * Determine the current meta-time cycle (day or night) and return cycle bounds.
 */
function getCycle(now, sunData) {
  const { todaySunrise, todaySunset, yesterdaySunset, tomorrowSunrise } = sunData
  const t = now.getTime()

  if (t >= todaySunrise.getTime() && t < todaySunset.getTime()) {
    // Daytime cycle
    return {
      isDay: true,
      periodStart: todaySunrise,
      periodEnd: todaySunset,
    }
  } else if (t >= todaySunset.getTime()) {
    // After sunset → night cycle until tomorrow's sunrise
    return {
      isDay: false,
      periodStart: todaySunset,
      periodEnd: tomorrowSunrise,
    }
  } else {
    // Before today's sunrise → night cycle from yesterday's sunset
    return {
      isDay: false,
      periodStart: yesterdaySunset,
      periodEnd: todaySunrise,
    }
  }
}

/**
 * Compute all meta-time values from the current time and location.
 * @param {Date} now
 * @param {number} lat
 * @param {number} lng
 * @returns {Object} meta-time state
 */
export function computeMetaTime(now, lat, lng) {
  const sunData = getSunData(now, lat, lng)
  const { isDay, periodStart, periodEnd } = getCycle(now, sunData)

  const periodDurationMs = periodEnd.getTime() - periodStart.getTime()
  const elapsedMs = Math.max(
    0,
    Math.min(now.getTime() - periodStart.getTime(), periodDurationMs)
  )

  const msPerMetaSecond = periodDurationMs / SECONDS_IN_12H
  const metaSecondsTotal = elapsedMs / msPerMetaSecond

  const metaHours = Math.floor(metaSecondsTotal / 3600)
  const metaMinutes = Math.floor((metaSecondsTotal % 3600) / 60)
  const metaSeconds = Math.floor(metaSecondsTotal % 60)

  const hh = String(metaHours).padStart(2, '0')
  const mm = String(metaMinutes).padStart(2, '0')
  const ss = String(metaSeconds).padStart(2, '0')
  const metaTimeString = `${hh}:${mm}:${ss}`

  const realSecondsPerMetaSecond = msPerMetaSecond / 1000

  return {
    metaSecondsTotal,
    metaHours,
    metaMinutes,
    metaSeconds,
    metaTimeString,
    realSecondsPerMetaSecond,
    isDay,
    periodStart,
    periodEnd,
    periodDurationMs,
    sunData,
  }
}

/**
 * Compute hand rotation angles from metaSecondsTotal.
 * All angles are in radians, continuous floats (no ticking).
 * @param {number} metaSecondsTotal
 * @returns {{ hourAngle, minuteAngle, secondAngle }}
 */
export function computeHandAngles(metaSecondsTotal) {
  const hourAngle = (metaSecondsTotal / SECONDS_IN_12H) * TWO_PI
  const minuteAngle = ((metaSecondsTotal % 3600) / 3600) * TWO_PI
  const secondAngle = ((metaSecondsTotal % 60) / 60) * TWO_PI

  return { hourAngle, minuteAngle, secondAngle }
}
