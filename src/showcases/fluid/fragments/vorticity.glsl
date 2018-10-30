uniform sampler2D curl;
uniform float dt;
uniform vec2 d;

vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

const float VORTICITY = 0.00001;

void main() {
  gl_FragColor = texture2D(sampler, uv);

  vec2 v = texture2D(sampler, uv).xy;

  vec2 l = texture2D(curl, uv - dx).xy;
  vec2 r = texture2D(curl, uv + dx).xy;
  vec2 b = texture2D(curl, uv - dy).xy;
  vec2 t = texture2D(curl, uv + dy).xy;
  vec2 c = texture2D(curl, uv).xy;

  vec2 dw = normalize(.5 * d * vec2(t.x - b.x, r.y - l.y) + VORTICITY) * vec2(-1, 1);

  gl_FragColor.xy += dw * c * dt * VORTICITY;
}
