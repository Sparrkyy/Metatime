import * as THREE from 'three'

const PARTICLE_COUNT = 120
const SPREAD = 8

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene
    this.time = 0

    this._buildParticles()
  }

  _buildParticles() {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3 + 0] = (Math.random() - 0.5) * SPREAD * 2
      positions[i3 + 1] = (Math.random() - 0.5) * SPREAD
      positions[i3 + 2] = (Math.random() - 0.5) * SPREAD * 2 - 2

      velocities[i3 + 0] = (Math.random() - 0.5) * 0.003
      velocities[i3 + 1] = Math.random() * 0.004 + 0.001
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003

      sizes[i] = Math.random() * 3 + 1
      phases[i] = Math.random() * Math.PI * 2
    }

    this.positions = positions
    this.velocities = velocities
    this.phases = phases

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    this.dayMat = new THREE.PointsMaterial({
      color: 0xffd080,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      depthWrite: false,
    })

    this.nightMat = new THREE.PointsMaterial({
      color: 0x7ec8e3,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    })

    this.dayParticles = new THREE.Points(geo, this.dayMat)
    this.nightParticles = new THREE.Points(geo.clone(), this.nightMat)

    this.scene.add(this.dayParticles)
    this.scene.add(this.nightParticles)
  }

  /**
   * @param {number} delta - frame delta in seconds
   * @param {number} blendT - 1 = full day, 0 = full night
   */
  update(delta, blendT) {
    this.time += delta

    const pos = this.dayParticles.geometry.attributes.position.array
    const halfH = SPREAD / 2

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      pos[i3 + 0] += this.velocities[i3 + 0]
      pos[i3 + 1] += this.velocities[i3 + 1]
      pos[i3 + 2] += this.velocities[i3 + 2]

      // Gentle sine drift
      pos[i3 + 0] += Math.sin(this.time * 0.4 + this.phases[i]) * 0.001

      // Wrap vertically
      if (pos[i3 + 1] > halfH + 1) {
        pos[i3 + 1] = -halfH - 1
        pos[i3 + 0] = (Math.random() - 0.5) * SPREAD * 2
        pos[i3 + 2] = (Math.random() - 0.5) * SPREAD * 2 - 2
      }
    }

    // Copy positions to night particles
    const nightPos = this.nightParticles.geometry.attributes.position.array
    for (let j = 0; j < pos.length; j++) {
      nightPos[j] = pos[j]
    }

    this.dayParticles.geometry.attributes.position.needsUpdate = true
    this.nightParticles.geometry.attributes.position.needsUpdate = true

    // Blend opacity
    this.dayMat.opacity = 0.6 * blendT
    this.nightMat.opacity = 0.55 * (1 - blendT)
  }
}
