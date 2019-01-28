attribute vec2 position;
uniform sampler2D particles;
uniform vec3 resolution;
uniform float particleSize;
float ratio = resolution.y / resolution.x;
varying vec2 uv;

void main() {  
  vec4 data = texture2D(particles, position);
  vec2 point = data.xy;
  uv = position;
  float size = particleSize * data.a;
  vec2 pos = point * 2.0 - 1.0;
  gl_PointSize = size * ratio;
  gl_Position = vec4(pos.x, pos.y, 0, 1);
}
