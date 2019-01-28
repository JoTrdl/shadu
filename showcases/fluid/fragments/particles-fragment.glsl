uniform sampler2D particlesData;

//const vec4 color = vec4(1.0, 0.5, 0.166, 0.66); // gold
const vec4 color = vec4(0.0, 0.33, 2.0, 1.00);  // blue
const vec3 gamma = vec3(1.0/2.2);

void main( ) {
  vec2 p = texture2D(particlesData, uv).xy;
  vec2 v = texture2D(particlesData, uv).zw;
  
  float speed = length(v);
  gl_FragColor = clamp(speed, 0., 1.) * color;

  gl_FragColor.rgb = pow(gl_FragColor.rgb, gamma);

  float dist = distance(gl_PointCoord, vec2(0.5));
  gl_FragColor.a = 1.0 - smoothstep(0.45, 0.5, dist);
}
