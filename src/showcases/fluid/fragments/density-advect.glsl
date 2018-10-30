uniform sampler2D field;
uniform float dt;
uniform vec2 d;

vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

void main() {
  vec2 v = texture2D(field, uv).xy;
  vec2 pos = uv - d * dt * v;

  gl_FragColor = texture2D(sampler, pos);
}
