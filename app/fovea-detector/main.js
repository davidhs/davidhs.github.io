// main.js
// Entry point for our WebGL + shader application, using ES modules.

// Grab our <canvas> element
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Utility function to load shader source from external file
async function loadShaderSource(url) {
  const response = await fetch(url);
  return response.text();
}

// Compile a shader
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Create the WebGL program from vertex + fragment shaders
function createProgram(gl, vsSource, fsSource) {
  const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      'Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

async function main() {
  // Load both vertex and fragment shader sources
  const vertexShaderSource = await loadShaderSource('vertex-shader.glsl');
  const fragmentShaderSource = await loadShaderSource('fragment-shader.glsl');

  // Create the shader program
  const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(shaderProgram);

  // Look up where the vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');

  // Create a buffer for our fullscreen quad
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  

  // A 2D full-screen quad: two triangles covering the full clip space
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // Setup the position attribute
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2,           // number of components (x, y)
    gl.FLOAT,    // the data is 32bit floats
    false,       // normalize
    0,           // stride (0 = auto)
    0            // offset
  );

  // Get uniform locations for iResolution and iTime
  const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution');
  const iTimeLocation       = gl.getUniformLocation(shaderProgram, 'iTime');

  // Resize function
  function resizeCanvasToDisplaySize(canvas) {
    const width  = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  // Render loop
  function render(time) {
    // time is in ms, convert to seconds
    const seconds = time * 0.001;

    // Resize and set viewport
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Pass iResolution and iTime to the shader
    gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(iTimeLocation, seconds);

    // Clear screen
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Request next frame
    requestAnimationFrame(render);
  }

  // Kick off render loop
  requestAnimationFrame(render);
}

main().catch((err) => console.error(err));
