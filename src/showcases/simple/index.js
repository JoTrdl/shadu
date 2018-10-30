
import Stats from 'stats.js'
import fragment from './fragment'

import TxtGL from '../../txtgl'

const OPTIMIZE_FACTOR = 0.5
let WIDTH = window.innerWidth
let HEIGHT = window.innerHeight

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

const uniform = {
  't': { type: '1f', value: 0 }
}

const rtt = new TxtGL.Texture(gl, {
  width: WIDTH * OPTIMIZE_FACTOR,
  height: HEIGHT * OPTIMIZE_FACTOR
}).fragment(fragment, uniform)

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth
  HEIGHT = canvas.height = window.innerHeight
  rtt.resize(WIDTH * OPTIMIZE_FACTOR, HEIGHT * OPTIMIZE_FACTOR)
})

const render = () => {
  requestAnimationFrame(render)
  stats.update()

  uniform.t.value += 0.05
  rtt.render().paint()
}
render()
