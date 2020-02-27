// Tells GPU to use lower precision floats.
precision mediump float;

// ==========
// ATTRIBUTES
// ==========

attribute vec2 a_pos;
attribute vec2 a_tc;

// ========
// VARYINGS
// ========

// Texture coordinate.
varying vec2 v_tc;

// ========
// UNIFORMS
// ========

// If set to 1, then y will stay the same, otherwise
// if it's set to -1, then y = -y.
uniform float u_flipY;

// Resolution (width and height) of the rectangle.
uniform vec2 u_res;

void main() {

  v_tc = a_tc;

  // Converting from screen space to clip space.

  // a_position is in screen space.

  // Convert from (0 - w, 0 - h) to (0 - 1, 0 - 1).
  vec2 zeroToOne = a_pos / u_res;

  // Convert from (0 - 1, 0 - 1) to (0 - 2, 0 - 2).
  vec2 zeroToTwo = zeroToOne * 2.0;

  // Convert from (0 - 2, 0 - 2) to (-1 - 1, -1 - 1) (i.e. clip space.)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
}
