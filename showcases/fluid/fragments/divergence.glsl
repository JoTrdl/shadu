uniform float dt;

uniform vec2 d;
vec2 dx = vec2(d.x, 0);
vec2 dy = vec2(0, d.y);

vec2 sampleVelocity(sampler2D field, vec2 pos){
  vec2 offset = vec2(0.0, 0.0);
  vec2 multiplier = vec2(1.0, 1.0);

  if (pos.x < 0.0) { offset.x = 1.0; multiplier.x = -1.0;} 
  else if(pos.x > 1.0) { offset.x = -1.0; multiplier.x = -1.0;}

  if (pos.y < 0.0) { offset.y = 1.0; multiplier.y = -1.0;}
  else if(pos.y > 1.0) { offset.y = -1.0; multiplier.y = -1.0;}

  return multiplier * texture2D(field, pos + offset * d).xy;
}

void main() {
  gl_FragColor = texture2D(sampler, uv);

  float l = sampleVelocity(sampler, uv - dx).x;
  float r = sampleVelocity(sampler, uv + dx).x;
  float b = sampleVelocity(sampler, uv - dy).y;
  float t = sampleVelocity(sampler, uv + dy).y;

  gl_FragColor.z = .5 * d.x * ((r - l) + (t - b));
}
