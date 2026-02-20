import * as THREE from 'three'
import { requestLocation } from './ui/permission.js'
import { OverlayUI } from './ui/overlay.js'
import { computeMetaTime, computeHandAngles } from './metatime.js'
import { ClockScene } from './clock/scene.js'
import { ClockFace } from './clock/clock-face.js'
import { ClockHands } from './clock/clock-hands.js'
import { LightingRig } from './clock/lighting.js'
import { ThemeManager } from './clock/theme.js'
import { ParticleSystem } from './clock/particles.js'

async function main() {
  // ── 1. Request location ─────────────────────────────────────
  const { lat, lng, label } = await requestLocation()

  // ── 2. Show app ─────────────────────────────────────────────
  const appEl = document.getElementById('app')
  appEl.style.display = 'block'
  // Trigger fade-in on next frame
  requestAnimationFrame(() => appEl.classList.add('visible'))

  // ── 3. Set up UI ────────────────────────────────────────────
  const overlay = new OverlayUI()
  overlay.setLocation(label)

  // ── 4. Build Three.js scene ─────────────────────────────────
  const canvas = document.getElementById('clock-canvas')
  const clockScene = new ClockScene(canvas)
  const { scene } = clockScene

  // ── 5. Build clock parts ────────────────────────────────────
  const clockFace = new ClockFace()
  const clockHands = new ClockHands()

  // Clock group — slight X-tilt for pseudo-3D perspective
  const clockGroup = new THREE.Group()
  clockGroup.rotation.x = 0.12
  clockGroup.add(clockFace.group)
  clockGroup.add(clockHands.group)
  scene.add(clockGroup)

  // ── 6. Lighting + theme ─────────────────────────────────────
  const lighting = new LightingRig(scene)
  const theme = new ThemeManager(scene, lighting, clockFace, clockHands)

  // ── 7. Particles ─────────────────────────────────────────────
  const particles = new ParticleSystem(scene)

  // ── 8. Clock for frame timing ───────────────────────────────
  const clock = new THREE.Clock()

  // ── 9. Render loop ──────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    const elapsed = clock.getElapsedTime()

    // Compute meta-time
    const now = new Date()
    const metaState = computeMetaTime(now, lat, lng)
    const angles = computeHandAngles(metaState.metaSecondsTotal)

    // Update hands
    clockHands.setAngles(angles)

    // Gentle Y-sway
    clockGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.06

    // Theme transition
    theme.update(metaState.isDay, delta)

    // Particles
    particles.update(delta, theme.blendT)

    // UI overlay
    overlay.update(metaState)

    // Render
    clockScene.render()
  }

  animate()
}

main()
