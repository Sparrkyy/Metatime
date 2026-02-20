import * as THREE from 'three'

export class LightingRig {
  constructor(scene) {
    this.scene = scene
    this._buildDayRig()
    this._buildNightRig()
    // Start in day mode
    this._setDayIntensities(1)
    this._setNightIntensities(0)
  }

  _buildDayRig() {
    // Warm ambient
    this.dayAmbient = new THREE.AmbientLight(0xfff0d0, 0.7)

    // Sun — directional with shadows
    this.daySun = new THREE.DirectionalLight(0xfffbe0, 1.4)
    this.daySun.position.set(5, 8, 5)
    this.daySun.castShadow = true
    this.daySun.shadow.mapSize.set(1024, 1024)
    this.daySun.shadow.camera.near = 0.5
    this.daySun.shadow.camera.far = 30
    this.daySun.shadow.camera.left = -5
    this.daySun.shadow.camera.right = 5
    this.daySun.shadow.camera.top = 5
    this.daySun.shadow.camera.bottom = -5

    // Orange rim light
    this.dayRim = new THREE.DirectionalLight(0xff9944, 0.5)
    this.dayRim.position.set(-4, 2, -5)

    // Warm fill
    this.dayFill = new THREE.PointLight(0xffd080, 0.4, 15)
    this.dayFill.position.set(-3, 4, 2)

    this.scene.add(this.dayAmbient, this.daySun, this.dayRim, this.dayFill)
  }

  _buildNightRig() {
    // Cool blue ambient
    this.nightAmbient = new THREE.AmbientLight(0x1a2855, 0.5)

    // Moonlight
    this.nightMoon = new THREE.DirectionalLight(0xcce0ff, 0.8)
    this.nightMoon.position.set(-4, 8, 3)
    this.nightMoon.castShadow = true
    this.nightMoon.shadow.mapSize.set(1024, 1024)
    this.nightMoon.shadow.camera.near = 0.5
    this.nightMoon.shadow.camera.far = 30
    this.nightMoon.shadow.camera.left = -5
    this.nightMoon.shadow.camera.right = 5
    this.nightMoon.shadow.camera.top = 5
    this.nightMoon.shadow.camera.bottom = -5

    // Purple rim
    this.nightRim = new THREE.DirectionalLight(0x8844cc, 0.4)
    this.nightRim.position.set(5, 1, -5)

    // Teal fill point
    this.nightFill = new THREE.PointLight(0x22ccaa, 0.35, 15)
    this.nightFill.position.set(3, 3, -2)

    this.scene.add(this.nightAmbient, this.nightMoon, this.nightRim, this.nightFill)
  }

  _setDayIntensities(t) {
    this.dayAmbient.intensity = 0.7 * t
    this.daySun.intensity = 1.4 * t
    this.dayRim.intensity = 0.5 * t
    this.dayFill.intensity = 0.4 * t
  }

  _setNightIntensities(t) {
    this.nightAmbient.intensity = 0.5 * t
    this.nightMoon.intensity = 0.8 * t
    this.nightRim.intensity = 0.4 * t
    this.nightFill.intensity = 0.35 * t
  }

  /**
   * Set lighting blend. dayT = 1 → full day, dayT = 0 → full night.
   */
  setBlend(dayT) {
    const nightT = 1 - dayT
    this._setDayIntensities(dayT)
    this._setNightIntensities(nightT)
  }
}
