
import Stats from 'stats.js'

import data from './data'
import vertex from './vertex'
import fragment from './fragment'

import ShadU from 'shadu'

let WIDTH = window.innerWidth
let HEIGHT = window.innerHeight
let RATIO = WIDTH / HEIGHT

// Number of particles
const PARTICLE_COUNT = 1024 * 256
const CELLS_PARTICLE_DATA = Math.ceil(Math.sqrt(PARTICLE_COUNT))

// How many particles can be emitted at a given time
const PARTICLE_EMIT_RATE = CELLS_PARTICLE_DATA

// Particles Geometry
const VERTICES = []
for (let i = 0, l = CELLS_PARTICLE_DATA * CELLS_PARTICLE_DATA; i < l; i++) {
  VERTICES.push(i % CELLS_PARTICLE_DATA / CELLS_PARTICLE_DATA)
  VERTICES.push(Math.floor(i / CELLS_PARTICLE_DATA) / CELLS_PARTICLE_DATA)
}

// PI 2
var PI_2 = Math.PI * 2

// Particle base size, age and radius
const PARTICLE_SIZE = 20.0
const PARTICLE_AGE = 1
const PARTICLE_RADIUS = 0.025

const canvas = document.getElementById('canvas')
canvas.width = WIDTH
canvas.height = HEIGHT

const stats = new Stats()
if (!document.location.search.match(/nostats/)) {
  document.body.appendChild(stats.domElement)
}

const gl = ShadU.get3DContext(canvas, {
  premultipliedAlpha: false,
  alpha: false,
  depth: false,
  stencil: false
})
gl.disable(gl.DEPTH_TEST)
gl.disable(gl.CULL_FACE)
gl.disable(gl.DITHER)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

var uniform = {
  dT: { type: '1f', value: 0 }
}

const velocity = new ShadU.Texture(gl, {
  width: CELLS_PARTICLE_DATA,
  height: CELLS_PARTICLE_DATA,
  texture: { type: gl.FLOAT }
}).render()

// Particles
const particles = new ShadU.Texture(gl, {
  width: CELLS_PARTICLE_DATA,
  height: CELLS_PARTICLE_DATA,
  texture: { type: gl.FLOAT }
}).fragment(data, {
  velocityData: { type: 't', value: velocity }
}).render()

// Output
const output = new ShadU.Texture(gl, {
  texture: { type: gl.FLOAT },
  geometry: {
    vertices: new Float32Array(VERTICES),
    arrays: [gl.POINTS, 0, VERTICES.length / 2]
  }
}).vertexFragment(vertex, fragment, {
  particleSize: { type: '1f', value: PARTICLE_SIZE },
  particles: { type: 't', value: particles }
})

let positionBuffer = []
let velocityBuffer = []
let bufferIndex = 0

let iPrev = -1
let jPrev = -1

const onMouseMove = (e) => {
  // Find the position on canvas
  const i = e.offsetX / canvas.width
  const j = 1.0 - e.offsetY / canvas.height

  // Determine the x and y coordinates in the particles data texture
  const x = ~~(bufferIndex % CELLS_PARTICLE_DATA)
  const y = ~~(bufferIndex / CELLS_PARTICLE_DATA)

  const di = i - iPrev
  const dj = j - jPrev

  for (let p = 0; p < PARTICLE_EMIT_RATE; p++) {
    const angle = Math.random() * PI_2
    const dist = 2 * Math.random()

    positionBuffer.push(
      i + dist * Math.cos(angle) * Math.random() * PARTICLE_RADIUS,
      j + dist * Math.sin(angle) * Math.random() * PARTICLE_RADIUS * RATIO,
      Math.random(),
      Math.random() * PARTICLE_AGE
    )

    velocityBuffer.push(
      (iPrev === -1) ? 0 : di * Math.random(),
      (jPrev === -1) ? 0 : dj * Math.random(),
      0,
      0
    )
  }

  iPrev = i
  jPrev = j

  // write position data in the texture
  particles.write(x, y, PARTICLE_EMIT_RATE, 1, gl.FLOAT, positionBuffer)

  // write velocity data in the texture
  velocity.write(x, y, PARTICLE_EMIT_RATE, 1, gl.FLOAT, velocityBuffer)

  positionBuffer = []
  velocityBuffer = []
  bufferIndex = (bufferIndex + PARTICLE_EMIT_RATE) % PARTICLE_COUNT
}

document.addEventListener('mouseup', () => {
  iPrev = jPrev = -1
  document.removeEventListener('mousemove', onMouseMove)
}, false)

document.addEventListener('mousedown', () => {
  document.addEventListener('mousemove', onMouseMove, false)
}, false)

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth
  HEIGHT = canvas.height = window.innerHeight
  RATIO = canvas.width / canvas.height
  output.resize(WIDTH, HEIGHT)
})

const render = () => {
  requestAnimationFrame(render)
  stats.update()

  uniform.dT.value += 0.1
  particles.render()

  gl.enable(gl.BLEND)
  output.clear().render().paint()
  gl.disable(gl.BLEND)
}
render()
