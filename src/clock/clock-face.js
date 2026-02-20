import * as THREE from 'three'

const DISC_RADIUS = 2.4
const DISC_HEIGHT = 0.15
const RIM_TUBE = 0.12
const NUM_TICKS = 60

export class ClockFace {
  constructor() {
    this.group = new THREE.Group()
    this.materials = []

    this._buildDisc()
    this._buildRim()
    this._buildTicks()
    this._buildNumerals()
    this._buildCenterPeg()
  }

  _buildDisc() {
    const geo = new THREE.CylinderGeometry(DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 64)
    this.discMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.6,
      metalness: 0.05,
    })
    this.materials.push(this.discMat)
    this.disc = new THREE.Mesh(geo, this.discMat)
    this.disc.receiveShadow = true
    this.group.add(this.disc)
  }

  _buildRim() {
    const geo = new THREE.TorusGeometry(DISC_RADIUS, RIM_TUBE, 16, 100)
    this.rimMat = new THREE.MeshStandardMaterial({
      color: 0xc8952a,
      roughness: 0.3,
      metalness: 0.7,
    })
    this.materials.push(this.rimMat)
    const rim = new THREE.Mesh(geo, this.rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = DISC_HEIGHT / 2
    this.group.add(rim)
  }

  _buildTicks() {
    this.tickMats = {
      major: new THREE.MeshStandardMaterial({ color: 0x3d2c1e, roughness: 0.5 }),
      minor: new THREE.MeshStandardMaterial({ color: 0x8a7060, roughness: 0.6 }),
    }
    this.materials.push(this.tickMats.major, this.tickMats.minor)

    for (let i = 0; i < NUM_TICKS; i++) {
      const isMajor = i % 5 === 0
      const w = isMajor ? 0.06 : 0.025
      const h = isMajor ? 0.32 : 0.16
      const geo = new THREE.BoxGeometry(w, DISC_HEIGHT + 0.01, h)

      const mesh = new THREE.Mesh(geo, isMajor ? this.tickMats.major : this.tickMats.minor)

      const angle = (i / NUM_TICKS) * Math.PI * 2
      const r = DISC_RADIUS - h / 2 - 0.04
      mesh.position.set(Math.sin(angle) * r, DISC_HEIGHT / 2, Math.cos(angle) * r)
      mesh.rotation.y = angle
      mesh.castShadow = false

      this.group.add(mesh)
    }
  }

  _buildNumerals() {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Transparent background
    ctx.clearRect(0, 0, size, size)

    ctx.fillStyle = 'rgba(61, 44, 30, 0.85)'
    ctx.font = `bold ${size * 0.095}px "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38

    for (let i = 0; i < 12; i++) {
      const numeral = i === 0 ? '12' : String(i)
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      ctx.fillText(numeral, x, y)
    }

    const texture = new THREE.CanvasTexture(canvas)
    const geo = new THREE.PlaneGeometry(DISC_RADIUS * 2 * 0.98, DISC_RADIUS * 2 * 0.98)
    this.numeralMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    })
    this.materials.push(this.numeralMat)

    const mesh = new THREE.Mesh(geo, this.numeralMat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = DISC_HEIGHT / 2 + 0.01
    this.group.add(mesh)
  }

  _buildCenterPeg() {
    const geo = new THREE.CylinderGeometry(0.07, 0.07, 0.35, 16)
    this.pegMat = new THREE.MeshStandardMaterial({
      color: 0xc8952a,
      roughness: 0.2,
      metalness: 0.85,
    })
    this.materials.push(this.pegMat)
    const peg = new THREE.Mesh(geo, this.pegMat)
    peg.position.y = DISC_HEIGHT / 2 + 0.15
    peg.castShadow = true
    this.group.add(peg)
  }

  /**
   * Update material colors for day/night theming.
   * @param {boolean} isDay
   * @param {number} t lerp factor 0→1
   */
  applyTheme(isDay, t) {
    const discColor = isDay
      ? new THREE.Color(0xf5f0e8)
      : new THREE.Color(0x1a2035)
    const rimColor = isDay
      ? new THREE.Color(0xc8952a)
      : new THREE.Color(0x4a7fa8)
    const majorTickColor = isDay
      ? new THREE.Color(0x3d2c1e)
      : new THREE.Color(0xc8d8f0)
    const minorTickColor = isDay
      ? new THREE.Color(0x8a7060)
      : new THREE.Color(0x5a7090)

    this.discMat.color.lerp(discColor, t)
    this.rimMat.color.lerp(rimColor, t)
    this.tickMats.major.color.lerp(majorTickColor, t)
    this.tickMats.minor.color.lerp(minorTickColor, t)
    this.pegMat.color.lerp(rimColor, t)
  }
}
