// random
// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl

uniform float dT;
uniform sampler2D velocityData;

const float PI = 3.1415;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 data = texture2D(sampler, uv);
  vec4 velocity = texture2D(velocityData, uv);

  data.xy = data.xy + 0.05 * velocity.xy;

  if (data.a > 0.0) {
    data.a -= 0.01;
  }
  else {
    data = vec4(-1);
  }

  gl_FragColor = data;
}