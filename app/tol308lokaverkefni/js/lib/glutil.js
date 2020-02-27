'use strict';

/* global  :true */

/* jslint browser: true, devel: true, white: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// Web GL utilities

const glutil = (function () {
  const glutil = {};

  /**
   * @param {WebGLRenderingContext} gl
   * @param {number} type
   * @param {string} source
   *
   * @returns {WebGLShader}
   */
  glutil.createShader = function (gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
      return shader;
    }
    console.error(
      'ERROR compiling shader!',
      gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);

    return null;
  };

  /**
   * @param {WebGLRenderingContext} gl
   * @param {string} vertexShader
   * @param {string} fragmentShader
   * @param {boolean} [validate]
   *
   * @returns {WebGLProgram}
   */
  glutil.createProgram = function (gl, vertexShader, fragmentShader, validate) {
    validate = validate || false;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!success) {
      console.error(
        'ERROR linking program!',
        gl.getProgramInfoLog(program),
      );
      gl.deleteProgram(program);
      return null;
    }

    if (validate) {
      const status = glutil.validateProgram(gl, program);
      if (!status) {
        return null;
      }
    }

    return program;
  };

  /**
   * Assumes that a buffer has already been bound, i.e.,
   *
   *   // Initialization of the buffer.
   *   var someBuffer = gl.createBuffer();
   *
   *   // Some code...
   *
   *   // Binding the buffer.
   *   gl.bindBuffer(gl.ARRAY_BUFFER, someBuffer);
   *
   *   // Call this function.
   *   glutil.setRectangle(gl, 10, 20, 70, 60);
   *
   * @param {WebGLRenderingContext} gl
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  glutil.setRectangle = function (gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    // Position of 2 triangles, forming a rectangle.
    const positions = [
      // Triangle 1
      x1, y1,
      x2, y1,
      x1, y2,
      // Triangle 2
      x1, y2,
      x2, y1,
      x2, y2,
    ];

    // Create and initialize the bound buffer's object's
    // data store.
    gl.bufferData(
      gl.ARRAY_BUFFER, // Vertex attributes
      new Float32Array(positions), // Position of vertices of triangles.
      gl.STATIC_DRAW, // Data store contents will be modified once and used many times.
    );
  };

  /**
   * Checks if program has successfully linked.
   *
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   *
   * @returns {boolean}
   */
  glutil.validateProgram = function (gl, program) {
    gl.validateProgram(program);
    const status = gl.getProgramParameter(program, gl.VALIDATE_STATUS);
    if (!status) {
      console.error(
        'ERROR validating program!',
        gl.getProgramInfoLog(program),
      );
    }
    return status;
  };

  /**
   * Compiles the vertex shaders in `arrVS' and fragment shaders in `arrFS'
   * and compiles and links them into a program, and returns the program.
   *
   * @param {WebGLRenderingContext} gl
   * @param {string[]} arrVS
   * @param {string[]} arrFS
   *
   * @returns {WebGLProgram}
   */
  glutil.createProgramFromScripts = function (gl, arrVS, arrFS) {
    // TODO: implement remainder

    const vs = arrVS[0];
    const fs = arrFS[0];

    const vertexShader = glutil.createShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = glutil.createShader(gl, gl.FRAGMENT_SHADER, fs);

    const program = glutil.createProgram(gl, vertexShader, fragmentShader);

    return program;
  };

  /**
   * Sets up and binds a 2D texture and returns it.
   *
   * @param {WebGLRenderingContext} gl
   *
   * @returns {WebGLTexture}
   */
  glutil.createAndSetupTexture = function (gl) {
    // Initialize a WebGLTexture object.
    const texture = gl.createTexture();

    // Binds texture `texture' as a 2D texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture so we can render any size image and so we are
    // working with pixels.

    // Set texture parameters of bound texture.

    // Prevents s (=x) coordinate from wrapping, it'll instead clamp to the edge.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Prevents t (=y) coordinate from wrapping, it'll instead clamp to the edge.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Nearest here is Manhattan distance
    // Set texture minification filter to
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // Set texture magnification filter.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  };

  return glutil;
}());
