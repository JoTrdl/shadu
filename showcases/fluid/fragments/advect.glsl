uniform float dt;

uniform vec2 d;
vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

const float DIFFUSION = 0.999;

void main() {
  gl_FragColor = texture2D(sampler, uv);

  vec2 v = texture2D(sampler, uv).xy;
  vec2 pos = uv - d * dt * v;

  gl_FragColor.xy = texture2D(sampler, pos).xy * DIFFUSION;
}
