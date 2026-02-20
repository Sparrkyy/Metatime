import * as THREE from 'three'

const DAY_FOG_COLOR = new THREE.Color(0xfff0d8)
const NIGHT_FOG_COLOR = new THREE.Color(0x0a0a1e)

const TRANSITION_DURATION = 2 // seconds

export class ThemeManager {
  constructor(scene, lighting, clockFace, clockHands) {
    this.scene = scene
    this.lighting = lighting
    this.clockFace = clockFace
    this.clockHands = clockHands

    this.currentIsDay = true
    this.targetIsDay = true
    this.blendT = 1 // 1 = fully day, 0 = fully night
    this.transitioning = false
    this.transitionProgress = 0

    // Apply initial day theme
    this._applyBlend(1)
  }

  /**
   * Call every frame with delta time (seconds).
   * @param {boolean} isDay
   * @param {number} delta
   */
  update(isDay, delta) {
    if (isDay !== this.targetIsDay) {
      this.targetIsDay = isDay
      this.transitioning = true
      this.transitionProgress = 0
    }

    if (this.transitioning) {
      this.transitionProgress = Math.min(
        this.transitionProgress + delta / TRANSITION_DURATION,
        1
      )

      const easedProgress = easeInOut(this.transitionProgress)
      this.blendT = this.targetIsDay
        ? easedProgress  // transitioning to day
        : 1 - easedProgress  // transitioning to night

      this._applyBlend(this.blendT)

      if (this.transitionProgress >= 1) {
        this.transitioning = false
        this.currentIsDay = this.targetIsDay
        this._applyBlend(this.targetIsDay ? 1 : 0)
        this._updateBodyClass(this.targetIsDay)
      }
    }
  }

  _applyBlend(t) {
    // Fog
    const fogColor = DAY_FOG_COLOR.clone().lerp(NIGHT_FOG_COLOR, 1 - t)
    this.scene.fog.color.copy(fogColor)
    this.scene.fog.density = 0.02 + (1 - t) * 0.015

    // Lighting
    this.lighting.setBlend(t)

    // Clock face & hands
    const isDay = t > 0.5
    this.clockFace.applyTheme(isDay, Math.abs(t - (isDay ? 1 : 0)))
    this.clockHands.applyTheme(isDay, Math.abs(t - (isDay ? 1 : 0)))

    // Body class for CSS background gradient
    this._updateBodyClass(t > 0.5)
  }

  _updateBodyClass(isDay) {
    document.body.classList.toggle('day-mode', isDay)
    document.body.classList.toggle('night-mode', !isDay)
  }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
