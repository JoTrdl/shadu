attribute vec2 position;
varying vec2 uv;

uniform vec3 resolution;
uniform sampler2D particlesData;

float ratio = resolution.x;

void main() {
  vec4 data = texture2D(particlesData, position);
  vec2 point = data.xy;

  uv = position;
  float size = 1.0;
  vec2 pos = point * 2.0 - 1.0;
  gl_PointSize = size * ratio;
  gl_Position = vec4(pos.x, pos.y, 0, 1);
}
