
import Stats from 'stats.js'
import fragment from './fragment'

import TxtGL from '../../txtgl'

const BLOBS = 64
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

const blobs = []
const colors = []
const size = []
const directions = []

for (var i = 0; i < BLOBS; i++) {
  blobs.push(Math.random())
  blobs.push(Math.random())

  colors.push(Math.random())
  colors.push(Math.random())
  colors.push(Math.random())

  size.push(Math.random() / 3 + 0.1)

  directions.push(Math.random() < 0.5 ? -1 : 1)
  directions.push(Math.random() < 0.5 ? -1 : 1)
}

const uniforms = {
  'dt': { type: '1f', value: 0.0 },
  'blobs': { type: '2fv', value: new Float32Array(blobs) },
  'blobsColor': { type: '3fv', value: new Float32Array(colors) },
  'blobsSize': { type: '1fv', value: new Float32Array(size) }
}

const rtt = new TxtGL.Texture(gl, {
  width: WIDTH / 2,
  height: HEIGHT / 2,
  texture: { minFilter: gl.LINEAR, magFilter: gl.LINEAR }
}).fragment(fragment, uniforms)

const update = () => {
  const dx = 2 / WIDTH
  const dy = 2 / HEIGHT

  for (var i = 0; i < BLOBS * 2; i += 2) {
    if (blobs[i] <= 0.0 || blobs[i] >= 1.0) directions[i] = -directions[i]
    if (blobs[i + 1] <= 0.0 || blobs[i + 1] >= 1.0) directions[i + 1] = -directions[i + 1]

    blobs[i] = blobs[i] + dx * directions[i]
    blobs[i + 1] = blobs[i + 1] + dy * directions[i + 1]
  }

  uniforms.blobs.value = new Float32Array(blobs)
}

window.addEventListener('resize', () => {
  WIDTH = canvas.width = window.innerWidth
  HEIGHT = canvas.height = window.innerHeight
  rtt.resize(WIDTH / 2, HEIGHT / 2)
})

const render = () => {
  requestAnimationFrame(render)
  stats.update()

  update()
  uniforms.dt.value += 0.01

  rtt.render().paint()
}
render()
