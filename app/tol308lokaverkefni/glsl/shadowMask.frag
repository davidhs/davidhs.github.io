// Tells GPU to use lower precision floats.
precision mediump float;

// ======
// MACROS
// ======

#define PI  3.14
#define TAU 6.28

// ========
// VARYINGS
// ========

// Texture coordinates passed in from
// vertex shader.
varying vec2 v_tc;

// ========
// UNIFORMS
// ========

// Our 2D texture.
uniform sampler2D u_tex;
// Resalution of said texture.
uniform vec2 u_res;       

// ====
// MAIN
// ====

// Sample the 1D shadow map.  The shadow map
// is sampled with via `theta', since the
// shadow map axis corresponds to different
// angles, and the value at that coordinate
// correspons to the distance of the nearest
// occluder.
float sample(float theta, float radius) {
  
  // Texture sampled.
  vec4 ts = texture2D(u_tex, vec2(theta, 0));

  // The occlusion distance, i.e. how
  // far the nearest occluder is at
  // this angle `theta'.
  float occlusionDistance = ts.r;

  // Lorem ipsum.
  return step(radius, occlusionDistance);
}

void main(void) {

  // Convert from cartesian coordinates
  // to polar coordinates.
  
  // Convert from [[0, 1], [0, 1]] to [[-1, 1], [-1, 1]].s
  vec2 norm = v_tc.st * 2.0 - 1.0;
  
  // Get length of vector nrom.
  float radius = length(norm);

  // Angle, phase shiften and taken
  float theta = (atan(norm.y, norm.x) + PI) / TAU;

  // Width of GL viewport.
  float width = u_res.x;

  // More distance, more blur to apply.
  float blurFactor = smoothstep(0.0, 1.0, radius) / width;

  // Opa opa
  float opacity = 0.0;

  // Sample more and more from different angles from
  // the shadow map with increasing distance.  
  // Causes the shadow to blur when farther away.
  opacity += sample(theta - 2.0 * blurFactor, radius) * 0.1;
  opacity += sample(theta - 1.0 * blurFactor, radius) * 0.2;
  opacity += sample(theta + 0.0 * blurFactor, radius) * 0.4;
  opacity += sample(theta + 1.0 * blurFactor, radius) * 0.2;
  opacity += sample(theta + 2.0 * blurFactor, radius) * 0.1;

  // Alpha
  float alpha = opacity * smoothstep(1.0, 0.0, radius);

  gl_FragColor = vec4(vec3(1.0), alpha);
}
