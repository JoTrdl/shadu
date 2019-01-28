
import Stats from 'stats.js'
import fragment from './fragment'

import TxtGL from 'txtgl'

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

const rtt = new TxtGL.Texture(gl, {
  width: WIDTH,
  height: HEIGHT
}).fragment(fragment)

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth
  HEIGHT = canvas.height = window.innerHeight
  rtt.resize(WIDTH, HEIGHT)
})

const render = () => {
  requestAnimationFrame(render)
  stats.update()

  rtt.render().paint()
}
render()
