'use strict';

/* global glutil document :true */

const shadows = (function () {
  const DEBUG = false;

  // Plural is canvases, but I'm lazy.
  // TODO ONLY FOR DEBUGGING PURPOSES, REMOVE LATER
  let canvi;
  if (DEBUG) {
    canvi = {
      original: {
        canvas: document.createElement('canvas'),
      },
      projected: {
        canvas: document.createElement('canvas'),
      },
      shadowMap: {
        canvas: document.createElement('canvas'),
      },
      shadowMask: {
        canvas: document.createElement('canvas'),
      },
    };

    canvi.original.ctx = canvi.original.canvas.getContext('2d');
    canvi.projected.ctx = canvi.projected.canvas.getContext('2d');
    canvi.shadowMap.ctx = canvi.shadowMap.canvas.getContext('2d');
    canvi.shadowMask.ctx = canvi.shadowMask.canvas.getContext('2d');
  }

  const square = [
    // Triangle 1
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    // Triangle 2
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ];

  // Occlusion image is drawn into this canvas.
  const canvasOccluders = document.createElement('canvas');
  let ctxOccluders = null;

  let initialized = false;

  const stuff = {
    // This refers to both width and height, since we assert the image
    // must be square.
    size: 256,
  };

  const src = {};

  const gShadowMap = {
    canvas: document.createElement('canvas'),
  };

  const gShadowMask = {
    canvas: document.createElement('canvas'),
  };

  function _copyImage(x, y, occluders) {
    // DEBUG
    if (DEBUG) {
      canvi.original.canvas.width = occluders.width;
      canvi.original.canvas.height = occluders.height;
      util.clearCanvas(canvi.original.ctx);
      canvi.original.ctx.drawImage(occluders, 0, 0);
    }

    // Clear canvas
    ctxOccluders.clearRect(0, 0, stuff.size, stuff.size);

    const w = occluders.width;
    const h = occluders.height;

    const sx = x - w / 2;
    const sy = y - h / 2;
    const sw = w;
    const sh = h;

    const s = Math.max(h, w);

    const xPad = stuff.size * Math.max(0, (h - w) / (2 * s));
    const yPad = stuff.size * Math.max(0, (w - h) / (2 * s));

    const dx = Math.round(xPad);
    const dy = Math.round(yPad);
    const dw = stuff.size - 2 * dx;
    const dh = stuff.size - 2 * dy;

    util.clearCanvas(ctxOccluders);
    // ctxOccluders.drawImage(occluders, 0, 0, w, h, 0, 0, stuff.size, stuff.size);
    ctxOccluders.drawImage(occluders, sx, sy, sw, sh, dx, dy, dw, dh);

    if (DEBUG) {
      canvi.projected.width = canvasOccluders.width;
      canvi.projected.height = canvasOccluders.height;
      util.clearCanvas(canvi.projected.ctx);
      canvi.projected.ctx.drawImage(canvasOccluders, 0, 0);
    }
  }

  function initShadowMap() {
    // Set up canvas.
    gShadowMap.canvas.width = stuff.size;
    gShadowMap.canvas.height = 1;
    gShadowMap.gl = gShadowMap.canvas.getContext('webgl');

    // Get from gShadowMap.
    const canvas = gShadowMap.canvas;
    const gl = gShadowMap.gl;

    // Get from src.
    const vertexShaderSource = src.lights;
    const fragmentShaderSource = src.shadowMap;

    // Create "program" from vertex shader and fragment shader.
    const program = glutil.createProgramFromScripts(
      gl,
      [vertexShaderSource],
      [fragmentShaderSource],
    );

    if (DEBUG) glutil.validateProgram(gl, program);

    // Handles on attributes (in vertex shader file);

    // Tell WebGL to use this program.
    gl.useProgram(program);

    // Set up texture.
    gShadowMap.texture = glutil.createAndSetupTexture(gl);

    // Square texture
    const buff_tc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_tc);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(square),
      gl.STATIC_DRAW,
    );

    // Create a buffer to put 2D clip space points in.
    const buff_pos = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of ARRAY_BUFFER = positionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_pos);
    // Set a rectangle the same size as the image. (to the buffer)
    glutil.setRectangle(gl, 0, 0, canvasOccluders.width, canvasOccluders.height);

    // Handles on uniforms.
    const u_res = gl.getUniformLocation(program, 'u_res');
    const u_flipY = gl.getUniformLocation(program, 'u_flipY');


    const a_pos = gl.getAttribLocation(program, 'a_pos');
    const a_tc = gl.getAttribLocation(program, 'a_tc');

    // Turn on attributes.
    gl.enableVertexAttribArray(a_pos);
    gl.enableVertexAttribArray(a_tc);


    // Add to gShadowMap.
    gShadowMap.u_res = u_res;
    gShadowMap.u_flipY = u_flipY;

    gShadowMap.a_tc = a_tc;
    gShadowMap.buff_tc = buff_tc;

    gShadowMap.a_pos = a_pos;
    gShadowMap.buff_pos = buff_pos;

    gShadowMap.program = program;
  }

  function initShadowMask() {
    // Setup canvas.
    gShadowMask.canvas.width = stuff.size;
    gShadowMask.canvas.height = stuff.size;
    gShadowMask.gl = gShadowMask.canvas.getContext('webgl');

    // Get from gShadowMask.
    const canvas = gShadowMask.canvas;
    const gl = gShadowMask.gl;

    // Get from source.
    const vertexShaderSource = src.lights;
    const fragmentShaderSource = src.shadowMask;

    // Create program from vertex shader and fragment shader.
    const program = glutil.createProgramFromScripts(
      gl,
      [vertexShaderSource],
      [fragmentShaderSource],
    );

    // Verify the program isn't buggy (slow).
    if (DEBUG) glutil.validateProgram(gl, program);

    // Set up texture.
    gShadowMask.texture = glutil.createAndSetupTexture(gl);

    // Square texture.
    const buff_tc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_tc);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(square),
      gl.STATIC_DRAW,
    );

    // Create a buffer to put 2D clip space points in.
    const buff_pos = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of ARRAY_BUFFER = positionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_pos);
    // Set a rectangle the same size as the image. (to the buffer)
    glutil.setRectangle(gl, 0, 0, stuff.size, stuff.size);

    // Tell WebGL to use this program.
    gl.useProgram(program);

    const u_res = gl.getUniformLocation(program, 'u_res');
    const u_flipY = gl.getUniformLocation(program, 'u_flipY');


    // Handle on attributes.
    const a_pos = gl.getAttribLocation(program, 'a_pos');
    const a_tc = gl.getAttribLocation(program, 'a_tc');

    // Turn on attributes.
    gl.enableVertexAttribArray(a_pos);
    gl.enableVertexAttribArray(a_tc);


    // Add to gShadowMask
    gShadowMask.u_res = u_res;
    gShadowMask.u_flipY = u_flipY;

    gShadowMask.a_tc = a_tc;
    gShadowMask.buff_tc = buff_tc;

    gShadowMask.a_pos = a_pos;
    gShadowMask.buff_pos = buff_pos;

    gShadowMask.program = program;
  }


  function getShadowMap(occluders) {
    if (!initialized) return null;

    // Target object
    const to = gShadowMap;

    const canvas = to.canvas;
    const gl = to.gl;
    const program = to.program;

    const a_pos = to.a_pos;
    const buff_pos = to.buff_pos;

    const a_tc = to.a_tc;
    const buff_tc = to.buff_tc;

    const imageTT = occluders; // Image to texture.
    const texture = to.texture;

    const u_flipY = to.u_flipY;
    const u_res = to.u_res;

    // Frame buffer width and height.
    const fbw = stuff.size;
    const fbh = stuff.size;

    // View port width and height.
    const vpw = canvas.width;
    const vph = canvas.height;


    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_pos);
    // Tell position attr. how to get out of positionBuffer.
    gl.vertexAttribPointer(
      a_pos, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_tc);
    // Tell the textCoord attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      a_tc, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Set the size of the image.


    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTT);

    // Flip y coordinate for canvas.
    gl.uniform1f(u_flipY, -1);

    // Tell WebGL to render to Canvas instead of framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Tell the shader the resolution of the framebuffer
    gl.uniform2f(u_res, fbw, fbh);
    // Tell WebGL the viewport setting needed for framebuffer.
    gl.viewport(0, 0, vpw, vph);


    // Draw rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (DEBUG) {
      canvi.shadowMap.width = vpw;
      canvi.shadowMap.height = vph;
      util.clearCanvas(canvi.shadowMap.ctx);
      canvi.shadowMap.ctx.drawImage(canvas, 0, 0);
    }

    return canvas;
  }

  //
  // x should be between 0 and 1
  // y should be between 0 and 1
  function getShadowMask(cfg) {
    if (!initialized) return null;

    _copyImage(cfg.x, cfg.y, cfg.occluder);

    const shadowMap = getShadowMap(canvasOccluders);

    // Target object.
    const to = gShadowMask;

    const canvas = to.canvas;
    const gl = to.gl;
    const program = to.program;
    const tex = to.texture;


    const u_res = to.u_res;
    const u_flipY = to.u_flipY;

    const a_pos = to.a_pos;
    const buff_pos = to.buff_pos;

    const a_tc = to.a_tc;
    const buff_tc = to.buff_tc;


    const smw = shadowMap.width;
    const smh = shadowMap.height;

    const imageTT = shadowMap;

    // Frame buffer width and height.
    const fbw = stuff.size;
    const fbh = stuff.size;

    // View port width and height.
    const vpw = canvas.width;
    const vph = canvas.height;

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_pos);
    // Tell position attr. how to get out of positionBuffer.
    gl.vertexAttribPointer(
      a_pos, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buff_tc);
    // Tell the textCoord attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      a_tc, // Attribute location
      2, // Nr. of elements in attribute.
      gl.FLOAT, // Type of elements
      false, // Whether data is normalized
      0, // Size of an individual vertex
      0, // Offset from the begiing of a single vertex to this attribute
    );

    // Set the size of the image.
    gl.uniform2f(u_res, smw, smh);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTT);

    // Flip y coordinate for canvas.
    gl.uniform1f(u_flipY, 1);

    // Tell WebGL to render to Canvas instead of framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Tell the shader the resolution of the framebuffer
    gl.uniform2f(u_res, fbw, fbh);


    // Tell WebGL the viewport setting needed for framebuffer.
    gl.viewport(0, 0, vpw, vph);

    // Draw rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (DEBUG) {
      canvi.shadowMask.canvas.width = canvas.width;
      canvi.shadowMask.canvas.height = canvas.height;
      util.clearCanvas(canvi.shadowMask.ctx);
      canvi.shadowMask.ctx.drawImage(canvas, 0, 0);
    }

    return canvas;
  }


  function init(glslLights, glslShadowMap, glslShadowMask, size) {
    src.lights = glslLights;
    src.shadowMap = glslShadowMap;
    src.shadowMask = glslShadowMask;

    stuff.size = size || stuff.size;

    canvasOccluders.width = stuff.size;
    canvasOccluders.height = stuff.size;
    ctxOccluders = canvasOccluders.getContext('2d');

    if (DEBUG) {
      canvi.projected.canvas.width = stuff.size;
      canvi.projected.canvas.height = stuff.size;

      canvi.shadowMap.canvas.width = stuff.size;
      canvi.shadowMap.canvas.height = stuff.size;

      canvi.shadowMask.canvas.width = stuff.size;
      canvi.shadowMask.canvas.height = stuff.size;
    }

    initShadowMap();
    initShadowMask();

    initialized = true;
  }

  const returnObject = {};

  returnObject.getShadowMask = getShadowMask;
  returnObject.init = init;

  if (DEBUG) {
    returnObject.debug = canvi;
  }


  return returnObject;
}());
