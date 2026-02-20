import * as THREE from 'three'

export class ClockScene {
  constructor(canvas) {
    this.canvas = canvas
    this._initRenderer()
    this._initCamera()
    this._initScene()
    this._bindResize()
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 1.5, 7)
    this.camera.lookAt(0, 0, 0)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.fog = new THREE.FogExp2(0xfff0d8, 0.035)
    this.scene.fog = this.fog
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth
      const h = window.innerHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
    })
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
