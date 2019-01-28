
import Glide from '@glidejs/glide'
import TxtGL from 'txtgl'

// https://www.shadertoy.com/view/lldyDs
const fragment = `
uniform float iTime;
uniform vec2 ratio;

float distLine(vec2 p, vec2 a, vec2 b) {
  vec2 ap = p - a;
  vec2 ab = b - a;
  float aDotB = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
  return length(ap - ab * aDotB);
}

float drawLine(vec2 uv, vec2 a, vec2 b) {
  float line = smoothstep(0.014, 0.01, distLine(uv, a, b));
  float dist = length(b-a);
  return line * (smoothstep(1.3, 0.8, dist) * 0.5 + smoothstep(0.04, 0.03, abs(dist - 0.75)));
}

float n21(vec2 i) {
  i += fract(i * vec2(223.64, 823.12));
  i += dot(i, i + 23.14);
  return fract(i.x * i.y);
}

vec2 n22(vec2 i) {
  float x = n21(i);
  return vec2(x, n21(i+x));
}

vec2 getPoint (vec2 id, vec2 offset) {
  return offset + sin(n22(id + offset) * iTime * 1.0) * 0.4;
}

float layer (vec2 uv) {
  float m = 0.0;
  float t = iTime * 2.0;
  
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv) - 0.5;
  
  vec2 p[9];

  p[0] = getPoint(id, vec2(-1.0, -1.0));
  p[1] = getPoint(id, vec2(0.0, -1.0));
  p[2] = getPoint(id, vec2(1.0, -1.0));

  p[3] = getPoint(id, vec2(-1.0, 0.0));
  p[4] = getPoint(id, vec2(0.0, 0.0));
  p[5] = getPoint(id, vec2(1.0, 0.0));

  p[6] = getPoint(id, vec2(-1.0, 1.0));
  p[7] = getPoint(id, vec2(0.0, 1.0));
  p[8] = getPoint(id, vec2(1.0, 1.0));

  for (int i = 0; i < 9; i++) {
    m += drawLine(gv, p[4], p[i]);
    float sparkle = 1.0 / pow(length(gv - p[i]), 1.5) * 0.005;
    m += sparkle * (sin(t + fract(p[i].x) * 12.23) * 0.4 + 0.6);
  }
  
  m += drawLine(gv, p[1], p[3]);
  m += drawLine(gv, p[1], p[5]);
  m += drawLine(gv, p[7], p[3]);
  m += drawLine(gv, p[7], p[5]);
    
  return m;
}

void main() {
  vec2 pos = uv - .5;
  vec3 c = sin(iTime * 2.0 * vec3(.234, .324,.768)) * 0.4 + 0.6;
  vec3 col = vec3(0);
  c.x += (pos.x + 0.5);

  float m = 0.0;
  float x = sin(iTime * 0.1);
  float y = cos(iTime * 0.2);
  
  mat2 rotMat = mat2(x, y, -y, x);
  vec2 newPos = pos * rotMat;
  
  for (float i = 0.0; i <= 1.0; i+= 1.0/4.0) {
    float z = fract(i + iTime * 0.05);
    float size = mix(15.0, .1, z) * 1.50;
    float fade = smoothstep(0.0, 1.0,  z) * smoothstep(1.0, 0.9, z);
    m += layer((size * newPos) + i * 10.0 ) * fade;
  }
  
  col += m * c;
  gl_FragColor = vec4(col, 1.0);
}
`

const canvas = document.getElementById('bg')
const { width, height } = window.getComputedStyle(canvas)
canvas.width = parseInt(width)
canvas.height = parseInt(height)

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
  'iTime': { type: '1f', value: 0 },
  'ratio': { type: '2f', value: [canvas.width / 2, canvas.height / 2] }
}

const rtt = new TxtGL.Texture(gl).fragment(fragment, uniform)

function debounce (func, wait, immediate) {
  var timeout
  return function () {
    const context = this
    const args = arguments

    var later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
};

window.addEventListener('resize', debounce(() => {
  const { width, height } = window.getComputedStyle(canvas)
  canvas.width = parseInt(width)
  canvas.height = parseInt(height)

  uniform.ratio.value = [canvas.width / 2, canvas.height / 2]
  rtt.resize()
}, 60))

const render = () => {
  requestAnimationFrame(render)

  uniform.iTime.value += 32 / 1000
  rtt.render().paint()
}
render()

const glider = new Glide('.glide', {
  type: 'carousel',
  hoverpause: false,
  autoplay: 6000
}).on('move', index => {
  console.log(glider.index)
  // Logic fired after mounting
})

glider.mount()
