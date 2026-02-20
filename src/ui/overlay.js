export class OverlayUI {
  constructor() {
    this.timeEl = document.getElementById('meta-time-string')
    this.periodEl = document.getElementById('meta-period-label')
    this.secondInfoEl = document.getElementById('meta-second-info')
    this.sunInfoEl = document.getElementById('sun-info')
    this.locationEl = document.getElementById('location-label')
  }

  setLocation(label) {
    this.locationEl.textContent = label
  }

  /**
   * @param {import('../metatime.js').computeMetaTime} metaState
   */
  update(metaState) {
    const {
      metaTimeString,
      isDay,
      realSecondsPerMetaSecond,
      sunData,
    } = metaState

    this.timeEl.textContent = metaTimeString
    this.periodEl.textContent = isDay ? 'Day' : 'Night'

    const rps = realSecondsPerMetaSecond
    let rpsStr
    if (rps >= 60) {
      rpsStr = `${(rps / 60).toFixed(1)} min`
    } else {
      rpsStr = `${rps.toFixed(1)} s`
    }
    this.secondInfoEl.textContent = `1 meta-second = ${rpsStr} real`

    const { todaySunrise, todaySunset } = sunData
    const riseStr = formatTime(todaySunrise)
    const setStr = formatTime(todaySunset)
    this.sunInfoEl.textContent = `Sunrise ${riseStr}  ·  Sunset ${setStr}`
  }
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
