uniform sampler2D field;
uniform float dt;
uniform vec2 d;

uniform float mousedown;
uniform vec2 mousepos;
uniform vec2 lastMousepos;

float force = pow(dt, 4.0);

void main() {
  gl_FragColor = texture2D(sampler, uv);
  vec2 mouseVelocity = -(lastMousepos - mousepos)/force;

  float gaussian = -dot(uv - mousepos, uv - mousepos);
  vec2 accel = resolution.xy * mousedown * mouseVelocity * exp(gaussian * 500.0);

  gl_FragColor.xy += accel;
}
