import * as vec from './vec3.js';

import {
  clamp,
} from './utils.js';

import {
  getCameraDir,
  trace,
} from './ray-tracing-lib.js';

import {
  q2
} from './qrsqrt.js';

const div_root = document.querySelector("#root");
const canvas = document.createElement('canvas');



// -----------------------------------------------------------------------------
// From `main.js`

/** @typedef {{points: number[][], color: number[], specular: number, lambert: number, ambient: number}} Triangle */
/** @typedef {{pos: number[], color: number[], specular: number, lambert: number, ambient: number, radius: number, radius_squared: number}} Sphere */
/** @typedef {{ pos: number[], theta: number, phi: number, h_fov: number, v_fov: number}} Camera */
/** @typedef {{ pos: number[], color: number[] }} Light */
/** @typedef {{ light: Light[], object: { sphere: Sphere[], triangle: Triangle[] }, camera: Camera[] }} Scene */

// -----------------------------------------------------------------------------

// 640 x 480 = 160 x (4 x 3)

// 4:3
// 16:9

const rgba = new Uint8ClampedArray(4);

const aspectRatioW = 1;
const aspectRatioH = 1;

const canvasResolution = 600;
let viewportResolution = 200;

canvas.width = aspectRatioW * canvasResolution;
canvas.height = aspectRatioH * canvasResolution;

const ctx = canvas.getContext('2d');

// Draw onto canvas from viewport
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;




div_root.appendChild(canvas);

// Is true if still rendering.
let active = false;

// keyboard.x is true if that key is down.
let keyboard = {};

let pointerLocked = false;

const fov_scale = 0.1;

const mouse = {
  p: {
    x: 0,
    y: 0,
  },
  c: {
    x: 0,
    y: 0,
  },
  dx: 0,
  dy: 0
};

// How much to rotate when you move mouse.
let mouse_move_scalar = 0.0005;

// Whether some mouse buton is pressed.
let button_down = false;

const scene = {
  light: [{
    pos: [25, 23, 16],
    color: [0.9, 0.5, 0.3],
  }, {
    pos: [-13, 21, -5],
    color: [0.9, 0.5, 0.3],
  }],
  object: {
    /** @type {Sphere[]} */
    sphere: [{
        pos: [5, 10, 2],


        radius: 2,
        radius_squared: 2 * 2,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      },
      {
        pos: [5, 9, 4],
        radius: 1,
        radius_squared: 1 * 1,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      },
      {
        pos: [0, 0, 0],
        radius: 1,
        radius_squared: 1 * 1,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [1, 0, 0],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.5,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [0, 1, 0],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [0, 2, 0],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [0, 0, 1],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [0, 0, 2],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }, {
        pos: [0, 0, 3],
        radius: 0.25,
        radius_squared: 0.25 * 0.25,

        color: [235, 122, 220],
        specular: 0.2,
        lambert: 0.7,
        ambient: 0.1,
      }
    ],
    /** @type {Triangle[]} */
    triangle: [
      /*
      {
      points: [
        [3.14, 0.1, -0.01],
        [1, 5.2, 0],
        [-0.3, 0, 2.3]
      ],
      color: [235, 122, 220],
      specular: 0.2,
      lambert: 0.7,
      ambient: 0.1,
    }
    */
  
  
  ]
  },
  camera: [
    // camera 1
    {
      pos: [0, 0, 0],

      theta: 0,
      phi: 0,


      h_fov: 30, // degrees
      v_fov: 30,
    }
  ],
};

/**
 * 
 * @param {number} x0 
 * @param {number} y0 
 * @param {number} z0 
 * @param {number} sx 
 * @param {number} sy 
 * @param {number} sz 
 */
function createBox(x0, y0, z0, sx, sy, sz) {
  const p1 = [x0, y0, z0];
  const p2 = [x0, y0 + sy, z0];
  const p3 = [x0 + sx, y0 + sy, z0];
  const p4 = [x0 + sx, y0, z0];

  const p5 = [x0, y0, z0 + sz];
  const p6 = [x0, y0 + sy, z0 + sz];
  const p7 = [x0 + sx, y0 + sy, z0 + sz];
  const p8 = [x0 + sx, y0, z0 + sz];

  // Respect cross product
  // Cross product should be computed as follows
  // T[1]: root
  // T[2]: index finger tip
  // T[3]: middle finger tip
  // 
  //
  // u = T[2] - T[1] // index finger
  // v = T[3] - T[1] // middle finger
  // w = cross(u, v) // thumb


  const triangles = [
    // top (1)
    [p5, p8, p7],
    // top (2)
    [p5, p7, p6],
    // front (1)
    [p8, p4, p7],
    // front (2)
    [p7, p4, p3],
    // left (1)
    [p7, p3, p2],
    // left (2)
    [p6, p7, p2],
    // right (1)
    [p1, p4, p5],
    // right (2)
    [p8, p5, p4],
    // back (1)
    [p2, p1, p6],
    // back (2)
    [p5, p6, p1],
    // bottom (1)
    [p3, p4, p2],
    // bottom (2)
    [p1, p2, p4],
  ];

  /** @type {Triangle[]} */
  const trianglesCopy = [];
  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[0];
    const copiedTriangle = [];
    for (let j = 0; j < triangle.length; j++) {
      const point = triangle[j];
      const copiedPoint = [];
      for (let k = 0; k < point.length; k++) {
        const component = point[k];
        copiedPoint.push(component);
      }
      copiedTriangle.push(point);
    }
    trianglesCopy.push({
      points: triangle,
      color: [235, 122, 220],
      specular: 0.2,
      lambert: 0.7,
      ambient: 0.1,
    });
  }

  return trianglesCopy;
}



if (false) {

  const x0 = -20;
  const y0 = 3;
  const z0 = 7;

  const sx = 10; // width
  const sy = 3;
  const sz = 7;


  const box = createBox(x0, y0, z0, sx, sy, sz);

  box.forEach((triangle) => {
    scene.object.triangle.push(triangle);
  });

}

(() => {
  // Add random boxes

  const n = 0;
  const spread = 25;
  const min_size = 1;
  const max_size = 10;

  for (let i = 0; i < n; i++) {
    const x0 = spread * (2 * Math.random() - 1);
    const y0 = spread * (2 * Math.random() - 1);
    const z0 = spread * (2 * Math.random() - 1);

    const sx = min_size + Math.random() * Math.abs(max_size - min_size);
    const sy = min_size + Math.random() * Math.abs(max_size - min_size);
    const sz = min_size + Math.random() * Math.abs(max_size - min_size);

    const box = createBox(z0, y0, z0, sx, sy, sz);

    box.forEach((triangle) => {
      scene.object.triangle.push(triangle);
    });
  }
})();



(() => {

  // Add random balls

  const n = 40;
  const spread = 50;

  const minRadius = 0.5;
  const maxRadius = 10;

  for (let i = 0; i < n; i++) {
    const radius = minRadius + Math.random() * Math.abs(maxRadius - minRadius);
    const x = spread * (2 * Math.random() - 1);
    const y = spread * (2 * Math.random() - 1);
    const z = spread * (2 * Math.random() - 1);

    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const specular = 0.1 + 0.9 * Math.random();
    const lambert = 0.1 + 0.8 * Math.random();
    const ambient = 0.1 + 0.4 * Math.random();

    const sphere = {
      pos: [x, y, z],
      radius: radius,
      radius_squared: radius * radius,
      color: [r, g, b],
      specular,
      lambert,
      ambient,
    };

    scene.object.sphere.push(sphere);
  }
})();

// Add random triangles
(() => {

  const n = 0;
  const spread = 25;
  const max_size = 5;

  for (let i = 0; i < n; i++) {
    const points = [];

    const x0 = spread * (2 * Math.random() - 1);
    const y0 = spread * (2 * Math.random() - 1);
    const z0 = spread * (2 * Math.random() - 1);

    for (let j = 0; j < 3; j++) {

      const dx = max_size * (2 * Math.random() - 1);
      const dy = max_size * (2 * Math.random() - 1);
      const dz = max_size * (2 * Math.random() - 1);


      const x = x0 + dx;
      const y = y0 + dy;
      const z = z0 + dz;

      const point = [x, y, z];
      points.push(point);
    }

    scene.object.triangle.push({
      points: points,
      color: [235, 122, 220],
      specular: 0.2,
      lambert: 0.7,
      ambient: 0.1,
    });
  }
})();



const viewport = ((paramAspectRatioW, paramAspectRatioH, paramViewportResolution, paramCanvasResoltuion) => {

  let aspectRatioH = paramAspectRatioW;
  let aspectRatioW = paramAspectRatioH;
  let viewportResolution = paramViewportResolution;

  let canvasResolution = paramCanvasResoltuion;
  let canvasWidth = aspectRatioW * canvasResolution;
  let canvasHeight = aspectRatioH * canvasResolution;

  let viewportWidth = aspectRatioW * viewportResolution;
  let viewportHeight = aspectRatioH * viewportResolution;

  let data = [];
  let viewportSize = 0;
  let canvasSize = 4 * canvasWidth * canvasHeight;

  function update() {
    if (viewportResolution > canvasResolution) {
      viewportResolution = canvasResolution;
    }

    if (viewportResolution < 0) {
      viewportResolution = 0;
    }

    viewportWidth = aspectRatioW * viewportResolution;
    viewportHeight = aspectRatioH * viewportResolution;
    viewportSize = 4 * viewportWidth * viewportHeight;
  }

  function setAspectRatioW(paramAspectRatioW) {
    const recompute = paramAspectRatioW !== aspectRatioW;
    aspectRatioW = paramAspectRatioW;
    if (recompute) {
      update();
    }

  }

  function setAspectRatioH(paramAspectRatioW) {
    const recompute = paramAspectRatioW !== aspectRatioH;
    aspectRatioH = paramAspectRatioW;
    if (recompute) {
      update();
    }
  }

  function setResolution(paramResolution) {
    const recompute = paramResolution !== viewportResolution;
    viewportResolution = paramResolution;
    if (recompute) {
      update();
    }
  }

  function getResolution() {
    return viewportResolution;
  }

  function getData() {
    return data;
  }

  function getWidth() {
    return viewportWidth;
  }

  function getHeight() {
    return viewportHeight;
  }

  function getSize() {
    return viewportSize;
  }

  for (let i = 0; i < canvasSize; i++) {
    data.push(0);
  }

  update();

  return {
    getData,
    getWidth,
    getHeight,
    getSize,
    update: update,
    setAspectRatioW: setAspectRatioW,
    setAspectRatioH: setAspectRatioH,
    setResolution: setResolution,
    getResolution: getResolution,
  };
})(aspectRatioW, aspectRatioH, viewportResolution);





if (true) {
  scene.camera[0].pos = [
    24.908605341053764,
    10.877150597086661,
    11.950531956115146
  ];
  scene.camera[0].theta = -15.503000000000002;
  scene.camera[0].phi = 1.9679999999999995;
}

// scene.camera[0].theta = 5.399502190157158 + -0.3;
// scene.camera[0].phi = 4.374378145708351;


const c_mousemove = (e) => {
  mouse.p.x = mouse.c.x;
  mouse.p.y = mouse.c.y;

  mouse.dx = e.movementX;
  mouse.dy = e.movementY;

  mouse.c.x += mouse.dx;
  mouse.c.y += mouse.dy;


  if (button_down || pointerLocked) {

    const camera = scene.camera[0];

    // left mouse button
    camera.theta += mouse.dx * mouse_move_scalar;
    camera.phi += mouse.dy * mouse_move_scalar;

    // Normalization of values.
    camera.theta = ((camera.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    camera.phi = clamp(camera.phi, 0.0000001, Math.PI - 0.0000001);
  }
};



window.onkeydown = (e) => {
  keyboard[e.key] = true;
}

window.onkeyup = (e) => {
  keyboard[e.key] = false;
};

document.onpointerlockchange = (e) => {
  if (document.pointerLockElement === canvas) {
    pointerLocked = true;
    document.addEventListener("mousemove", c_mousemove, false);
  } else {
    pointerLocked = false;
    document.removeEventListener("mousemove", c_mousemove, false);
  }
};

canvas.onmousedown = (e) => {

  canvas.requestPointerLock();

  mouse.p.x = mouse.c.x;
  mouse.p.y = mouse.c.y;

  mouse.c.x = e.clientX;
  mouse.c.y = e.clientY;

  button_down = true;

};

canvas.onmousemove = (e) => {
  c_mousemove(e);
};

canvas.onwheel = (e) => {
  // console.info(e.deltaY);
  const camera = scene.camera[0];
  const delta = 3 * Math.sign(+e.deltaY);
  camera.h_fov += delta;
  camera.v_fov += delta;

  camera.h_fov = clamp(camera.h_fov, 0.00001, 360 - 0.00001);
  camera.v_fov = clamp(camera.v_fov, 0.00001, 360 - 0.00001);
  // console.info("FOV", scene.camera[0].h_fov, scene.camera[0].v_fov)
}

canvas.onmouseleave = (e) => {
  button_down = false;
}

canvas.onmouseup = (e) => {
  mouse.p.x = mouse.c.x;
  mouse.p.y = mouse.c.y;

  mouse.c.x = e.clientX;
  mouse.c.y = e.clientY;

  button_down = false;
};



/**
 * 
 * @param {number} dt How much time has passed since last frame.
 */
function processInput(dt) {
  // Check if keys are still down.  

  const camera = scene.camera[0];

  // console.info(e);
  const dirFrontVec = getCameraDir(camera.theta, camera.phi)
  const dirSideVec = getCameraDir(camera.theta + Math.PI / 2, camera.phi)
  const dirUp = getCameraDir(camera.theta, camera.phi + Math.PI / 2)

  if (keyboard['w']) {
    // FORWARD
    camera.pos = vec.plus(camera.pos, dirFrontVec);
  }
  if (keyboard['a']) {
    // LEFT
    camera.pos = vec.minus(camera.pos, dirSideVec);
  }
  if (keyboard['s']) {
    // BACK
    camera.pos = vec.minus(camera.pos, dirFrontVec);
  }
  if (keyboard['d']) {
    // RIGHT
    camera.pos = vec.plus(camera.pos, dirSideVec);
  }
  if (keyboard['Shift'] || keyboard['c']) {
    // DOWN
    camera.pos = vec.plus(camera.pos, dirUp);
  }
  if (keyboard[' ']) {
    // UP
    camera.pos = vec.minus(camera.pos, dirUp);
  }

  if (keyboard['-']) {
    viewport.setResolution(viewport.getResolution() - 10);
  }

  if (keyboard['+']) {
    viewport.setResolution(viewport.getResolution() + 10);
  }

  if (keyboard['z']) {
    viewport.setResolution(canvasResolution);
  }
}

/**
 * 
 * @param {number} dt 
 */
function diagnostics(dt) {

  const camera = scene.camera[0];

  const x0 = 25;
  const y0 = 25;
  const x_step = 0;
  const y_step = 16;

  const viewVec = vec.unit(getCameraDir(camera.theta, camera.phi));

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#000";
  ctx.fillText(`theta: ${(camera.theta * 180 / Math.PI).toFixed(2)}° |
phi: ${(camera.phi * 180 / Math.PI).toFixed(2)}°`, x0 + x_step * 0, y0 + y_step * 0);

  ctx.fillText(`Hor. FOV: ${camera.h_fov.toFixed(2)}° | Ver. FOV: ${camera.v_fov.toFixed(2)}°`, x0 + x_step * 0, y0 +
    y_step * 1);
  ctx.fillText(`Pos. x: ${camera.pos[0].toFixed(4)} | y: ${camera.pos[1].toFixed(4)} | z: ${camera.pos[2].toFixed(4)}`, x0 + x_step * 0, y0 + y_step * 2);
  ctx.fillText(`View dir. dx: ${viewVec[0].toFixed(4)} | dy: ${viewVec[1].toFixed(4)} | dz: ${viewVec[2].toFixed(4)}`, x0 + x_step * 0, y0 + y_step * 3);
}

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {*} camera 
 * @param {*} scene 
 */
function render(canvas, viewport, camera, scene) {

  const ctx = canvas.getContext('2d');

  const viewport_width = viewport.getWidth();
  const viewport_height = viewport.getHeight();
  const viewport_size = viewport.getSize();
  const viewport_data = viewport.getData();

  const canvas_width = canvas.width;
  const canvas_height = canvas.height;


  const camera_pos = camera.pos;
  const camera_phi = camera.phi;
  const camera_theta = camera.theta;
  const camera_h_fov = camera.h_fov;
  const camera_v_fov = camera.v_fov;


  // Clear canvas
  ctx.fillStyle = "#f0f";
  ctx.fillRect(0, 0, canvas_width, canvas_height);

  // Draw onto veiwport
  if (false) {
    // Random noise
    for (let i = 0; i < viewport_size; i += 4) {
      viewport_data[i + 0] = Math.random();
      viewport_data[i + 1] = Math.random();
      viewport_data[i + 2] = Math.random();
      viewport_data[i + 3] = 1;
    }
  } else if (true) {
    const or_ray_dir = getCameraDir(camera_theta, camera_phi);

    const v_hor = getCameraDir(camera_theta + 0.01, camera_phi);
    const v_ver = getCameraDir(camera_theta, camera_phi + 0.01);

    v_hor[0] = v_hor[0] - or_ray_dir[0];
    v_hor[1] = v_hor[1] - or_ray_dir[1];
    v_hor[2] = v_hor[2] - or_ray_dir[2];

    v_ver[0] = v_ver[0] - or_ray_dir[0];
    v_ver[1] = v_ver[1] - or_ray_dir[1];
    v_ver[2] = v_ver[2] - or_ray_dir[2];


    const v_hor_distSq = v_hor[0] * v_hor[0] + v_hor[1] * v_hor[1] + v_hor[2] * v_hor[2];
    const v_ver_distSq = v_ver[0] * v_ver[0] + v_ver[1] * v_ver[1] + v_ver[2] * v_ver[2];

    // const v_hor_invsqrt = 1.0 / Math.sqrt(v_hor_distSq);
    // const v_ver_invsqrt = 1.0 / Math.sqrt(v_ver_distSq);

    const v_hor_invsqrt = q2(v_hor_distSq);
    const v_ver_invsqrt = q2(v_ver_distSq);

    v_hor[0] = v_hor[0] * v_hor_invsqrt;
    v_hor[1] = v_hor[1] * v_hor_invsqrt;
    v_hor[2] = v_hor[2] * v_hor_invsqrt;

    v_ver[0] = v_ver[0] * v_ver_invsqrt;
    v_ver[1] = v_ver[1] * v_ver_invsqrt;
    v_ver[2] = v_ver[2] * v_ver_invsqrt;


    let vidx = 0;


    const __ys_offset = -0.5 * camera_v_fov * fov_scale;
    const __ys_slope = camera_v_fov * fov_scale / viewport_height;

    const __xs_offset = -0.5 * camera_h_fov * fov_scale;
    const __xs_slope = camera_h_fov * fov_scale / viewport_width;

    // Ray trace: depth
    for (let y_step = 0; y_step < viewport_height; y_step++) {
      const __ys = __ys_offset + y_step * __ys_slope;

      const ray_delta_y = vec.scale(v_ver, __ys);
      for (let x_step = 0; x_step < viewport_width; x_step++) {


        const __xs = __xs_offset + x_step * __xs_slope;

        const ray_delta_x = vec.scale(v_hor, __xs);
        const ray_delta = vec.plus(ray_delta_x, ray_delta_y);
        const ray_dir = vec.plus(or_ray_dir, ray_delta);


        const ray = [camera.pos, ray_dir];

        const color = trace(ray, scene, 0);

        if (color !== null) {
          viewport_data[vidx + 0] = color[0];
          viewport_data[vidx + 1] = color[1];
          viewport_data[vidx + 2] = color[2];
          viewport_data[vidx + 3] = 1;

        } else {
          if (true) {
            viewport_data[vidx + 0] = 0.5 * ray_dir[0] + 0.5;
            viewport_data[vidx + 1] = 0.5 * ray_dir[1] + 0.5;
            viewport_data[vidx + 2] = 0.5 * ray_dir[2] + 0.5;
            viewport_data[vidx + 3] = 1;
          }

          if (false) {
            viewport_data[vidx + 0] = 0.15 * Math.random();
            viewport_data[vidx + 1] = 0.15 * Math.random();
            viewport_data[vidx + 2] = 0.15 * Math.random();
            viewport_data[vidx + 3] = 1;
          }

        }

        // const vidx = 4 * (x_step + y_step * viewport_width);


        vidx += 4;
      }
    }
  }

  let cidx = 0;

  const rat_w = viewport_width / canvas.width;
  const rat_h = viewport_height / canvas.height;

  for (let y = 0; y < canvas_height; y++) {
    const vyp = Math.floor(y * rat_h) * viewport_width;
    for (let x = 0; x < canvas_width; x++) {
      // Place in data
      // const idx = 4 * (x + y * canvas_width);
      const vidx = 4 * (Math.floor(x * rat_w) + vyp);

      rgba[0] = 256 * viewport_data[vidx + 0];
      rgba[1] = 256 * viewport_data[vidx + 1];
      rgba[2] = 256 * viewport_data[vidx + 2];
      rgba[3] = 256 * viewport_data[vidx + 3];;

      data[cidx + 0] = rgba[0];
      data[cidx + 1] = rgba[1];
      data[cidx + 2] = rgba[2];
      data[cidx + 3] = rgba[3];

      cidx += 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}



let last_timestamp = null;

/**
 * 
 * @param {number} timestamp 
 */
function step(timestamp) {

  if (last_timestamp === null) {
    last_timestamp = timestamp;
  }

  const dt = timestamp - last_timestamp;

  const camera = scene.camera[0];

  // Process input
  processInput(dt);

  render(canvas, viewport, camera, scene);

  if (true) {
    diagnostics(dt);
  }

  last_timestamp = timestamp;

  window.requestAnimationFrame(step);
}

async function main() {
  window.requestAnimationFrame(step);
}

////////////////////////////////////////////////////////////////////////////////

main().catch((reason) => {
  console.error(reason);
  throw new Error(reason);
});