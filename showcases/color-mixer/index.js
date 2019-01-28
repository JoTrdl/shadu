import fragment from './fragment'

import ShadU from 'shadu'

const canvas = document.getElementById('canvas')
let CANVAS_RECT

const gl = ShadU.get3DContext(canvas, {
  preserveDrawingBuffer: true
})

const colors = {
  base: [255 / 255, 220 / 255, 0 / 255],
  additive: [0 / 255, 116 / 255, 217 / 255]
}

const uniforms = {
  theta: { type: '1f', value: 0 },
  amount: { type: '1f', value: 0 },
  base: { type: '3f', value: colors.base },
  additive: { type: '3f', value: colors.additive }
}

const rtt = new ShadU.Texture(gl)
  .fragment(fragment, uniforms)
  .render().paint()

const updateCanvasRect = () => {
  const rect = canvas.getBoundingClientRect()
  CANVAS_RECT = {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  }
}
window.addEventListener('resize', () => {
  updateCanvasRect()
})
updateCanvasRect()

/*
The coords space is [0,0] to [1,1]
where bottom-left is [0,0]

0,1 ---------- 1,1
|               |
|       +       |
|               |
0,0 ---------- 1,0

(x,y) = 2 * (x,y) - 1
*/
const getCoords = e => {
  const coords = {
    x: (e.clientX - CANVAS_RECT.left) / CANVAS_RECT.width,
    y: 1 - (e.clientY - CANVAS_RECT.top) / CANVAS_RECT.height
  }

  return {
    x: coords.x * 2 - 1,
    y: coords.y * 2 - 1
  }
}

const getKnobCoords = (theta, w, h) => {
  const a = (Math.cos(theta) * 0.5 + 1) / 2
  const b = (Math.sin(theta) * 0.5 + 1) / 2

  return {
    x: a * w,
    y: (1 - b) * h
  }
}

const getKnobTheta = coords => {
  let theta = Math.atan2(coords.y, coords.x)

  return theta < 0
    ? theta + 2 * Math.PI
    : theta
}

const knob = document.querySelector('#knob')
const setKnob = theta => {
  const pos = getKnobCoords(theta, CANVAS_RECT.width, CANVAS_RECT.height)

  knob.style.left = `${pos.x}px`
  knob.style.top = `${pos.y}px`
}

setKnob(0)
knob.style.width = `${gl.canvas.offsetWidth * 0.5}px`
knob.style.height = `${gl.canvas.offsetHeight * 0.5}px`
knob.style.opacity = 1

const getBaseColor = () => {
  const pos = getKnobCoords(
    uniforms.theta.value,
    gl.drawingBufferWidth, gl.drawingBufferHeight
  )
  var pixels = new Uint8Array(4)
  gl.readPixels(
    pos.x,
    gl.drawingBufferHeight - pos.y,
    1, 1,
    gl.RGBA, gl.UNSIGNED_BYTE,
    pixels)

  return {
    r: pixels[0],
    g: pixels[1],
    b: pixels[2]
  }
}

const output = document.querySelector('#output')
const rgbToHex = (r, g, b) => (
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
)
const getLuminance = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b)
const updateOutputColor = () => {
  const col = getBaseColor()

  const l = getLuminance(col.r, col.g, col.b)
  const v = rgbToHex(col.r, col.g, col.b)
  output.style.backgroundColor = output.innerHTML = v
  output.style.color = l > 127 ? '#000' : '#fff'
  knob.style.borderColor = l > 127 ? 'rgba(0,0,0,.75)' : 'rgba(255,255,255,.75)'
  knob.style.boxShadow = l > 127 ? 'var(--knob-shadow-dark)' : 'var(--knob-shadow-light)'
}
updateOutputColor()

let thetaLast = 0
let thetaStart = 0
const TOTAL = 2 * 2 * Math.PI
const STEPS = TOTAL / 360

const renderMixer = theta => {
  let diff = Math.abs(thetaLast - theta)
  if (diff > Math.PI) {
    diff = 2 * Math.PI - diff
  }

  const dir = Math.sign(theta - thetaLast)
  const steps = Math.round(diff / STEPS)
  for (let i = 0; i < steps; i++) {
    requestAnimationFrame(() => {
      uniforms.theta.value += dir * STEPS
      uniforms.amount.value = (uniforms.theta.value - thetaStart) / TOTAL
      setKnob(uniforms.theta.value)

      // render
      rtt.render().paint()
    })
  }
  thetaLast = theta
  updateOutputColor()
}

const onMouseMove = e => {
  e.preventDefault()

  const coords = getCoords(e)
  const theta = getKnobTheta(coords)

  renderMixer(theta)
}

document.addEventListener('mouseup', e => {
  e.preventDefault()

  knob.classList.remove('active')
  document.removeEventListener('mousemove', onMouseMove)

  // update base color
  const col = getBaseColor()
  uniforms.base.value = [col.r / 255, col.g / 255, col.b / 255]
}, false)

knob.addEventListener('mousedown', e => {
  e.preventDefault()
  const coords = getCoords(e)

  uniforms.theta.value = thetaStart = thetaLast = getKnobTheta(coords)
  uniforms.amount.value = 0

  knob.classList.add('active')
  document.addEventListener('mousemove', onMouseMove, false)
}, false)

document.querySelectorAll('#palette li').forEach(el => {
  el.addEventListener('click', e => {
    document.querySelector('#palette li.active').classList.remove('active')
    e.target.classList.add('active')

    const rgb = window.getComputedStyle(e.target).backgroundColor
    const m = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
    if (m) {
      uniforms.additive.value = [m[1] / 255, m[2] / 255, m[3] / 255]
    }
  })
})
