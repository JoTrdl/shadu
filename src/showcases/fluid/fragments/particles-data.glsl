uniform sampler2D field;
uniform float dt;
uniform vec2 d;

void main( ) {
  vec2 p = texture2D(sampler, uv).xy;
  vec2 v = texture2D(sampler, uv).zw;

  vec2 vf = texture2D(field, p).xy;
  v += (vf - v) * .5;
  p += dt * v * d;

  gl_FragColor = vec4(p, v);
}
