uniform float dt;

uniform vec2 d;
vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

float alpha = - d.x * d.x;
float rBeta = .25;

float samplePressure(sampler2D field, vec2 pos){
  vec2 offset = vec2(0.0, 0.0);

  if (pos.x < 0.0)      offset.x = 1.0;
  else if (pos.x > 1.0) offset.x = -1.0;
  if (pos.y < 0.0)      offset.y = 1.0;
  else if (pos.y > 1.0) offset.y = -1.0;

  return texture2D(field, pos + offset * d).w;
}

void main() {
  gl_FragColor = texture2D(sampler, uv);

  float l = samplePressure(sampler, uv - dx);
  float r = samplePressure(sampler, uv + dx);
  float b = samplePressure(sampler, uv - dy);
  float t = samplePressure(sampler, uv + dy);

  vec2 v = texture2D(sampler, uv).xy;

  gl_FragColor.xy = v - d * vec2(r - l, t - b);
}
