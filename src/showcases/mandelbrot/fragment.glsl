#define SCALE vec2(3.0)
#define ITERATION 256

float distance = float(ITERATION * ITERATION);

void main( ) {
  vec2 c;
  vec2 z = vec2(0.0);
  vec3 color = vec3(0.0);

  c.x = (uv.x - 0.5) * SCALE.x * resolution.x - 0.5;
  c.y = (uv.y - 0.5) * SCALE.y * resolution.y;

  float l = 0.0;
  for(int i=0; i<ITERATION; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    
    if(dot(z, z) > distance) break;

    l += 1.0;
  }

  float sl = l - log2(log2(dot(z,z))) + 2.0;
  float al = smoothstep(-0.5, 0.0, sin(0.5 * 6.2831));
  l = mix(l, sl, al);

  color = 0.5 + 0.5 * cos(3.0 + l * 0.15 + vec3(0.0,0.6,1.0));

  gl_FragColor = vec4(color, 1.0);
}
