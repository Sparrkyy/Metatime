import * as THREE from 'three'

const Y_OFFSET = 0.12 // hands sit above disc surface

export class ClockHands {
  constructor() {
    this.group = new THREE.Group()
    this.group.position.y = Y_OFFSET
    // Rotate the group so hands lie flat in the XZ plane (clock face plane)
    // rather than sticking up along world Y
    this.group.rotation.x = -Math.PI / 2

    this.hourMat = new THREE.MeshStandardMaterial({
      color: 0x2d1a00,
      roughness: 0.4,
      metalness: 0.2,
    })
    this.minuteMat = new THREE.MeshStandardMaterial({
      color: 0x3d2c1e,
      roughness: 0.45,
      metalness: 0.15,
    })
    this.secondMat = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      roughness: 0.3,
      metalness: 0.5,
    })

    this.hourHand = this._makeHand(0.14, 1.45, this.hourMat, 0.06)
    this.minuteHand = this._makeHand(0.09, 1.9, this.minuteMat, 0.03)
    this.secondHand = this._makeSecondHand()

    this.group.add(this.hourHand.pivot)
    this.group.add(this.minuteHand.pivot)
    this.group.add(this.secondHand.pivot)
  }

  /**
   * Create a hand with pivot at the base.
   * The geometry is translated so that rotation.z pivots from the bottom.
   * @param {number} width
   * @param {number} length
   * @param {THREE.Material} mat
   * @param {number} taper - narrowing at tip (0 = uniform box)
   */
  _makeHand(width, length, mat, taper = 0) {
    const pivot = new THREE.Group()

    let geo
    if (taper > 0) {
      // Use a tapered shape via ConeGeometry-like approach with BoxGeometry scaling
      // We'll use a custom BufferGeometry for a tapered hand
      geo = this._makeTaperedHandGeo(width, length, taper)
    } else {
      geo = new THREE.BoxGeometry(width, length, width * 0.6)
      geo.translate(0, length / 2, 0)
    }

    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = false
    pivot.add(mesh)
    return { pivot, mesh }
  }

  _makeTaperedHandGeo(baseWidth, length, tipWidth) {
    // Build a simple tapered box using BufferGeometry
    const hw = baseWidth / 2
    const tw = tipWidth / 2
    const d = baseWidth * 0.5

    // Vertices: bottom-rect (base) + top-rect (tip)
    const verts = new Float32Array([
      // Bottom face (y=0)
      -hw, 0, -d,
       hw, 0, -d,
       hw, 0,  d,
      -hw, 0,  d,
      // Top face (y=length)
      -tw, length, -d * 0.5,
       tw, length, -d * 0.5,
       tw, length,  d * 0.5,
      -tw, length,  d * 0.5,
    ])

    const indices = [
      // bottom
      0, 2, 1, 0, 3, 2,
      // top
      4, 5, 6, 4, 6, 7,
      // front
      3, 7, 6, 3, 6, 2,
      // back
      0, 1, 5, 0, 5, 4,
      // left
      0, 4, 7, 0, 7, 3,
      // right
      1, 2, 6, 1, 6, 5,
    ]

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }

  _makeSecondHand() {
    const pivot = new THREE.Group()

    // Main shaft (forward)
    const shaftGeo = new THREE.BoxGeometry(0.04, 2.1, 0.04)
    shaftGeo.translate(0, 2.1 / 2 - 0.3, 0)
    const shaft = new THREE.Mesh(shaftGeo, this.secondMat)
    shaft.castShadow = true

    // Counterweight tail (backward)
    const tailGeo = new THREE.BoxGeometry(0.055, 0.55, 0.055)
    tailGeo.translate(0, -(0.55 / 2 + 0.05), 0)
    const tail = new THREE.Mesh(tailGeo, this.secondMat)
    tail.castShadow = true

    // Small disc at center
    const discGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12)
    const disc = new THREE.Mesh(discGeo, this.secondMat)
    disc.castShadow = true

    pivot.add(shaft)
    pivot.add(tail)
    pivot.add(disc)

    return { pivot }
  }

  /**
   * Update hand rotations. Angles in radians (0 = 12 o'clock position).
   * rotation.z is negated because Three.js CCW vs. clockwise visual.
   */
  setAngles({ hourAngle, minuteAngle, secondAngle }) {
    this.hourHand.pivot.rotation.z = -hourAngle
    this.minuteHand.pivot.rotation.z = -minuteAngle
    this.secondHand.pivot.rotation.z = -secondAngle
  }

  applyTheme(isDay, t) {
    const hourColor = isDay ? new THREE.Color(0x2d1a00) : new THREE.Color(0xd4e8ff)
    const minuteColor = isDay ? new THREE.Color(0x3d2c1e) : new THREE.Color(0xa8c8e8)
    const secondColor = isDay ? new THREE.Color(0xc0392b) : new THREE.Color(0x7ec8e3)

    this.hourMat.color.lerp(hourColor, t)
    this.minuteMat.color.lerp(minuteColor, t)
    this.secondMat.color.lerp(secondColor, t)
  }
}
