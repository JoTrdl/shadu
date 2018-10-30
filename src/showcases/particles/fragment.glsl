uniform sampler2D particles;

const vec4 color = vec4(1.0, 0.5, 0.166, 0.66);
const vec3 gamma = vec3(1.0/2.2);

vec3 col(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
  return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  vec4 data = texture2D(particles, uv);
  float dist = distance(gl_PointCoord, vec2(0.5));
  float alpha = 1.0 - smoothstep(0.45, 0.5, dist);

  gl_FragColor.rgb = col(data.z, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.30,0.60) );
  gl_FragColor.a = 0.9 * alpha;

  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/gamma));
}
