uniform sampler2D field;
uniform float dt;
uniform vec2 d;

vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

void main() {
  gl_FragColor = texture2D(sampler, uv);

  vec2 l = texture2D(field, uv - dx).xy;
  vec2 r = texture2D(field, uv + dx).xy;
  vec2 b = texture2D(field, uv - dy).xy;
  vec2 t = texture2D(field, uv + dy).xy;

  gl_FragColor.xy = .5 * d * ((t.x - b.x) - (r.y - l.y));
}
