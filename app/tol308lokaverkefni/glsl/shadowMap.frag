// Tells GPU to use lower precision floats.
precision mediump float;

// This shader is responsible for creating a one dimensional
// shadow map from the occluder image.

// I'm thinking of abandoing this method and instead use
// a extrusion method which is conceptually simpler.

// ======
// MACROS
// ======

#define PI  3.14

// ========
// VARYINGS
// ========

// Texture coordinates passed in from the
// Vertex shader.
varying vec2 v_tc;

// ========
// UNIFORMS
// ========

// Our 2D texture.
uniform sampler2D u_tex;
// Resolution of said texture
uniform vec2 u_res;

// ====
// MAIN
// ====

void main() {

  // Wouldn't compile unless I gave it an upper
  // limit.
  const float MAX_ITERATIONS = 1000.0;

  // Distance 1.0 is at edge.
  float distance = 1.0;

  // y here is the radius.  Start by scanning what
  // is closes to us (y) all the way to the
  // edge.
  for (float y = 0.0; y < MAX_ITERATIONS; y += 1.0) {

    // If y exceeds `u_res.y' break.  Ideally I
    // wanted `y >= u_res.y' but then the compiler
    // complained.
    if (y >= u_res.y) {
      break;
    }

    // We're currently in polar coordinates.

    // About to convert from polar coordinates to
    // cartesian coordinates.

    // `v_tc.s' is an angular coordinate from [0, 1].
    float angle1 = v_tc.s;

    // `y / u_res.y' is a radial coordinate
    // on the interval [0, 1].
    float radius1 = y / u_res.y;

    // Convert to a normalized from, i.e. from
    // [[0, 1], [0, 1]] to [[-1, 1], [-1, 1]].
    float angle2 = 2.0 * angle1 - 1.0;
    float radius2 = 2.0 * radius1 - 1.0;

    // Convert the angle from [-1, 1] to [-PI, +PI] and
    // adding phase `1.5 * PI' to it.
    float angle3 = 1.5 * PI + (angle2) * PI;
    // Convert radius from [-1, 1] to [0, 1].
    float radius3 = (1.0 + radius2) * 0.5;

    // Coorespondeing cartesian coordinates
    float x2 = -radius3 * sin(angle3);
    float y2 = -radius3 * cos(angle3);

    // Coordinates which we'll use to sample from the occlusion map.
    // Convert from [[-1, 1], [-1, 1]] to [[0, 1], [0, 1]].
    vec2 coord = vec2(x2, y2) / 2.0 + 0.5;

    // Sample texture at coordinates `coord'.
    vec4 data = texture2D(u_tex, coord);

    // If we hit an opaque fragment, the we get a new distance.
    // Compare that distance to new distance (radius1).
    float opacity = data.a;

    // If opacity is greater than, say 0.9, then cast shadow.
    if (opacity > 0.9) {
      distance = min(distance, radius1);
      break;
    }
  }

  // The distance of the nearest occluder is
  // stored as a color.
  gl_FragColor = vec4(vec3(distance), 1.0);
}
