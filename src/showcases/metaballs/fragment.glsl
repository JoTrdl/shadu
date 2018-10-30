uniform float dt;
uniform vec2 blobs[64];
uniform vec3 blobsColor[64];
uniform float blobsSize[64];

const int NBLOB = 64;

#define PI 3.1416

float cap(float dist, float begin, float end){
  if(dist < begin){
    return 0.0;
  } else if(dist > end){
    return 1.0;
  } else {
    return .5 + .5 * cos (PI * (-1.0 + 1.0/(end-begin) * (dist-begin)));
  }
}

float rand(vec2 seed) {
  return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453);
}

void main() { 
  vec2 pos = uv * resolution.xy;

  float dist = 0.0;
  vec3 color = vec3(0.0);

  for (int i = 0; i < NBLOB; i++) {
    vec2 rBlob = blobs[i] * resolution.xy;
    float d = 1.0 - smoothstep(0.0, 0.7, length(pos-rBlob)/blobsSize[i]);

    dist += d;
    color += d * blobsColor[i];
  }

  float it = cap(dist,0.7, 0.75);
  float specMap = cap(1.0 - dist, 0.0, 0.3);
  float alpha = it * (1.0 - 0.25 * cap(dist, 0.8, 1.0));
  float spec = it * specMap;
  vec4 specColor = .1 * vec4(spec);

  gl_FragColor = vec4(it * color, alpha) + specColor;
}
