
import Stats from 'stats.js'

import advect from './fragments/advect'
import substract from './fragments/substract'
import divergence from './fragments/divergence'
import jacobi from './fragments/jacobi'
import curl from './fragments/curl'
import vorticity from './fragments/vorticity'
import velocityAdd from './fragments/velocity-add'
import densityAdd from './fragments/density-add'
import densityAdvect from './fragments/density-advect'
import particlesData from './fragments/particles-data'
import particlesInit from './fragments/particles-init'
import particlesFragment from './fragments/particles-fragment'
import particlesVertex from './fragments/particles-vertex'
import visualizer from './fragments/visualizer'

import TxtGL from '../../txtgl'

let WIDTH = window.innerWidth
let HEIGHT = window.innerHeight

const CELLS = 256
const TIMESTEP = 16 / 60
const PARTICLES_COUNT = 1024 * 64
const PARTICLES_CELLS_DATA = Math.ceil(Math.sqrt(PARTICLES_COUNT))

const canvas = document.getElementById('canvas')
canvas.width = WIDTH
canvas.height = HEIGHT

const stats = new Stats()
if (!document.location.search.match(/nostats/)) {
  document.body.appendChild(stats.domElement)
}

const gl = TxtGL.get3DContext(canvas, {
  premultipliedAlpha: false,
  alpha: false,
  depth: false,
  stencil: false
})
gl.disable(gl.DEPTH_TEST)
gl.disable(gl.CULL_FACE)
gl.disable(gl.DITHER)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

// Base options for textures
const OPTIONS = {
  width: CELLS,
  height: CELLS,
  texture: {
    type: gl.FLOAT,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT
  }
}

const uniforms = {
  d: { type: '2f', value: [1 / CELLS, 1 / CELLS] },
  dt: { type: '1f', value: TIMESTEP },
  mousedown: { type: '1f', value: 0 },
  lastMousepos: { type: '2f', value: [0, 0] },
  mousepos: { type: '2f', value: [0, 0] },

  // textures
  field: { type: 't', value: null },
  curl: { type: 't', value: null },
  density: { type: 't', value: null },
  particlesData: { type: 't', value: null },
  particles: { type: 't', value: null }
}

/**
 * Particles data
 */
const VERTICES = []
for (var i = 0, l = PARTICLES_CELLS_DATA * PARTICLES_CELLS_DATA; i < l; i++) {
  VERTICES.push(i % PARTICLES_CELLS_DATA / PARTICLES_CELLS_DATA)
  VERTICES.push(Math.floor(i / PARTICLES_CELLS_DATA) / PARTICLES_CELLS_DATA)
}
uniforms.particlesData.value = new TxtGL.Texture(gl, {
  width: PARTICLES_CELLS_DATA,
  height: PARTICLES_CELLS_DATA,
  texture: { type: gl.FLOAT }
}).fragment(particlesInit)
  .render().reset(true)
  .fragment(particlesData, uniforms)

uniforms.particles.value = new TxtGL.Texture(gl, {
  texture: { type: gl.FLOAT },
  geometry: {
    vertices: new Float32Array(VERTICES),
    arrays: [gl.POINTS, 0, VERTICES.length / 2]
  }
}).vertexFragment(particlesVertex, particlesFragment, uniforms)

/**
 * Density field
 */
uniforms.density.value = new TxtGL.Texture(gl, OPTIONS)
  .fragment(densityAdd, uniforms)
  .fragment(densityAdvect, uniforms)

/**
 * Curl field
 */
uniforms.curl.value = new TxtGL.Texture(gl, OPTIONS)
  .fragment(curl, uniforms)

/**
 * Field
 * (x, y): velocity
 * z: divergence
 * w: pressure
 */
uniforms.field.value = new TxtGL.Texture(gl, OPTIONS)
  .fragment(advect, uniforms)
  .callback(() => {
    // compute curl effect
    uniforms.curl.value.render()
    // advect density & particles
    uniforms.density.value.render()
    uniforms.particlesData.value.render()
  })
  .fragment(velocityAdd, uniforms)
  .fragment(vorticity, uniforms)
  .fragment(divergence, uniforms)
  .fragment(jacobi, uniforms)
  .iterate(8)
  .fragment(substract, uniforms)

const output = new TxtGL.Texture(gl, {
  texture: {
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR
  }
}).fragment(visualizer, uniforms)

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth
  HEIGHT = canvas.height = window.innerHeight
  output.resize(WIDTH, HEIGHT)
})

document.addEventListener('mouseup', e => {
  e.preventDefault()
  uniforms.mousedown.value = 0.0
})
document.addEventListener('mousedown', e => {
  e.preventDefault()
  uniforms.mousedown.value = 1.0
})
document.addEventListener('mousemove', e => {
  e.preventDefault()
  const x = (((e.offsetX / WIDTH) * CELLS) | 0) / CELLS
  const y = 1.0 - (((e.offsetY / HEIGHT) * CELLS) | 0) / CELLS

  uniforms.lastMousepos.value = uniforms.mousepos.value
  uniforms.mousepos.value = [x, y]
})

const render = () => {
  requestAnimationFrame(render)
  stats.update()

  uniforms.field.value.render()
  gl.enable(gl.BLEND)
  uniforms.particles.value.clear().render()
  gl.disable(gl.BLEND)
  output.render().paint()
}
render()
