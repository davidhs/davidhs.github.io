#ifdef GL_ES
precision highp float;
#endif

attribute vec2 aPosition;

void main(void) {
    // Transform the 2D attribute to clip-space
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
