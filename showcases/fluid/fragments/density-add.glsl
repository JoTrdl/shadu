uniform float dt;
uniform vec2 d;

uniform float mousedown;
uniform vec2 mousepos;
uniform vec2 lastMousepos;

const float DIFFUSION = 0.995;
const vec3 DYE_COLOR = vec3(0.1, 0.3, 0.7) / 4.0;

float force = pow(dt, 4.0);

void main() {
  gl_FragColor = texture2D(sampler, uv);
  vec2 mouseVelocity = -(lastMousepos - mousepos)/force;
  float speed = length(mouseVelocity);
  vec3 color = clamp(speed, 0., 1.) * DYE_COLOR;

  float gaussian = -dot(uv - mousepos, uv - mousepos);
  float density = mousedown * exp(gaussian * 2000.0);

  gl_FragColor.xyz = gl_FragColor.xyz * DIFFUSION + speed * density * color;
  gl_FragColor.a = 1.0;
}
