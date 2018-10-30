/*
 * Original shader from https://www.shadertoy.com/view/MsjSW3
 */
uniform float t;

mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}
float map(vec3 p){
    p.xz*= m(t * 0.2);
    p.xy*= m(t * 0.1);
    vec3 q = p*2.+t*1.;
    return length(p+vec3(sin(t*0.7)))*log(length(p)+1.) + sin(q.x+sin(q.z+sin(q.y)))*0.25 - 1.;
}

void main() { 
  gl_FragColor = texture2D(sampler, uv) * 0.25;
  vec2 p = (uv - vec2(.5,.5) ) * resolution.xy;
  vec3 cl = vec3(0.);
  float d = 2.5;

  for(int i=0; i<=5; i++) {
    vec3 p = vec3(0,0,5.) + normalize(vec3(p, -1.))*d;
    float rz = map(p);
    float f =  clamp((rz - map(p+.1))*0.5, -.1, 1. );
    vec3 l = vec3(0.1,0.3,.45) + vec3(5., 2.5, 3.)*f;
    cl = cl*l + (1.-smoothstep(0., 2.5, rz))*.7*l;
    d += min(rz, 1.);
  }

  gl_FragColor += vec4(cl, 1.);
}