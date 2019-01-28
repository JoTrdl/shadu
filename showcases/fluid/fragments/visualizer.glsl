uniform sampler2D field;
uniform sampler2D curl;
uniform sampler2D density;
uniform sampler2D particles;

// #define OUTPUT_VELOCITY
// #define OUTPUT_PRESSURE
// #define OUTPUT_CURL

void main() {
  vec4 particles = texture2D(particles, uv);
  vec3 density = texture2D(density, uv).xyz;
  
  gl_FragColor = particles + vec4(density, 1.0);

  #ifdef OUTPUT_VELOCITY
    vec2 velocity = texture2D(field, uv).xy;
    float v = length(velocity) / 10.0;
    gl_FragColor = vec4(v, v, v, 1.0);
  #endif

  #ifdef OUTPUT_PRESSURE
    float pressure = texture2D(field, uv).w;
    float v = pressure / 2000.0;
    gl_FragColor = vec4(v, v, v, 1.0);
  #endif

  #ifdef OUTPUT_CURL
    float vx1 = texture2D(curl, uv - dx).y;
    float vx2 = texture2D(curl, uv + dx).y;
    float uy1 = texture2D(curl, uv - dy).x;
    float uy2 = texture2D(curl, uv + dy).x;

    float curl = vx2 - vx1 - uy2 + uy1;
    float value = (curl * 1000.0);
    gl_FragColor = vec4(value, max(value * .2, -value * .3), -value, 1.0);
  #endif
}
