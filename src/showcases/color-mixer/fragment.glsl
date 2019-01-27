#define MIXER_RADIUS 1.0
#define KNOB_RADIUS MIXER_RADIUS/4.0

uniform float theta;
uniform float amount;
uniform vec3 base;
uniform vec3 additive;

vec3 rgbryb (vec3 rgb) {
  vec4 rgby = vec4(rgb, rgb.y);

  float w = min(rgb.r, min(rgb.g, rgb.b));
  rgby -= w;

  float maxG = max(rgby.r, max(rgby.g, rgby.b));

  rgby.a = min(rgby.r, rgby.g);
  rgby.r -= rgby.a;
  rgby.g -= rgby.a;

  if (rgby.b > 0.0 && rgby.g > 0.0) {
    rgby.b /= 2.0;
    rgby.g /= 2.0;
  }

  rgby.a += rgby.g;
  rgby.b += rgby.g;

  float maxY = max(rgby.r, max(rgby.a, rgby.b));
  if (maxY > 0.0) {
    rgby *= maxG / maxY;
  }

  return vec3(rgby.r, rgby.a, rgby.b) + w;
}

vec3 rybrgb (vec3 ryb) {
  vec4 rybg = vec4(ryb, ryb.y);

  float w = min(ryb.r, min(ryb.y, ryb.b));
  rybg -= w;

  float maxY = max(rybg.r, max(rybg.y, rybg.b));

  rybg.a = min(rybg.y, rybg.b);
  rybg.y -= rybg.a;
  rybg.b -= rybg.a;

  if (rybg.b > 0.0 && rybg.a > 0.0) {
    rybg.b *= 2.0;
    rybg.a *= 2.0;
  }

  rybg.r += rybg.y;
  rybg.a += rybg.y;

  float maxG = max(rybg.r, max(rybg.a, rybg.b));
  if (maxG > 0.0) {
    rybg *= maxY / maxG;
  }

  return vec3(rybg.r, rybg.a, rybg.b) + w;
}

vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color, float antialiasing) {
  vec2 dist = uv - pos;
  float c = dot(dist, dist) * 4.0;
  float f = rad * antialiasing;

	return vec4(color, 1.0 - smoothstep(rad - f, rad + f, c));
}

void main() {
	vec2 center = resolution.xy * 0.5;
  vec2 knob = vec2(cos(theta), sin(theta)) * KNOB_RADIUS + vec2(0.5);

  vec3 res = rybrgb(mix(rgbryb(base), rgbryb(additive), clamp(amount, 0.0, 1.0)));

  vec4 c1 = circle(uv, center, MIXER_RADIUS, texture2D(sampler, uv).rgb, 0.03);
  vec4 c2 = circle(uv, knob, KNOB_RADIUS, res, 0.1);

  gl_FragColor = mix(c1, c2, c2.a);
}