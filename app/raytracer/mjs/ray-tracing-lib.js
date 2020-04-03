import * as vec from './vec3.js';

import {
  fastLogisticFunction,
  assert,
} from './utils.js';


// -----------------------------------------------------------------------------
// From `main.js`

/** @typedef {{points: number[][], color: number[], specular: number, lambert: number, ambient: number}} Triangle */
/** @typedef {{pos: number[], color: number[], specular: number, lambert: number, ambient: number, radius: number, radius_squared: number}} Sphere */
/** @typedef {{ pos: number[], theta: number, phi: number, h_fov: number, v_fov: number}} Camera */
/** @typedef {{ pos: number[], color: number[] }} Light */
/** @typedef {{ light: Light[], object: { sphere: Sphere[], triangle: Triangle[] }, camera: Camera[] }} Scene */

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// From `ray-tracing-lib.js`

/** @typedef {{color: number[], specular: number, lambert: number, ambient: number}} SurfaceObject */

// -----------------------------------------------------------------------------





/**
 * 
 * @param {number} inclination 
 * @param {number} azimuth 
 */
export function getCameraDir(azimuth, inclination) {

  const a = Math.PI;
  const b = 2 * Math.PI;

  // const theta = ((inclination % a) + a) % a;
  // const phi = ((azimuth % b) + b) % b;
  const theta = inclination;
  const phi = azimuth;

  const x = 1 * Math.sin(theta) * Math.cos(phi);
  const y = 1 * Math.sin(theta) * Math.sin(phi);
  const z = 1 * Math.cos(theta);
  return [x, y, z];
}

/**
 * Returns the intersection point
 * 
 * @param {number[]} ray_pos 
 * @param {number[]} ray_dir 
 * @param {number[]} ip intersection point result
 * @param {number[]} sphere_pos
 * @param {number} sphere_radius_squared
 * @param {number[]} ffNormal
 */
export function raySphereIntersectionInline(ray_pos, ray_dir, ip, sphere_pos, sphere_radius_squared, ffNormal) {
  // https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection

  const c = sphere_pos;
  const r_sq = sphere_radius_squared;

  const o = ray_pos;
  // const l = vec.unit(ray_dir);
  const l = ray_dir;

  const ocx = o[0] - c[0];
  const ocy = o[1] - c[1];
  const ocz = o[2] - c[2];


  const _2 = l[0] * ocx + l[1] * ocy + l[2] * ocz;
  const _3 = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];

  const A = -2 * _2;

  const s = _2;

  const B_1 = s * s;
  const B_2 = _3 * (ocx * ocx + ocy * ocy + ocz * ocz - r_sq); // slowest

  if (B_1 < B_2) {
    return false;
  }

  const B = B_1 - B_2;

  const C = Math.sqrt(4 * B);
  const D = 2 * _3;

  const t1 = (A - C) / D;
  const t2 = (A + C) / D;



  if (t1 >= 0 && t1 < t2) {
    ip[0] = o[0] + t1 * l[0];
    ip[1] = o[1] + t1 * l[1];
    ip[2] = o[2] + t1 * l[2];

    ffNormal[0] = ip[0] - sphere_pos[0];
    ffNormal[1] = ip[1] - sphere_pos[1];
    ffNormal[2] = ip[2] - sphere_pos[2];

    return true;
  }

  if (t2 >= 0 && t2 < t1) {
    // vec.plus(o, vec.scale(l, t))
    ip[0] = o[0] + t2 * l[0];
    ip[1] = o[1] + t2 * l[1];
    ip[2] = o[2] + t2 * l[2];

    ffNormal[0] = ip[0] - sphere_pos[0];
    ffNormal[1] = ip[1] - sphere_pos[1];
    ffNormal[2] = ip[2] - sphere_pos[2];

    return true;
  }


  return false;
}

/**
 * 
 * @param {number[]} ray_pos 
 * @param {number[]} ray_dir 
 * @param {number[]} ip 
 * @param {number[][]} triangle points of triangle
 * @param {number[]} ffNormal forward facing normal results go here
 */
export function rayTriangleIntersectionInline(ray_pos, ray_dir, ip, triangle, ffNormal) {

  const p1 = triangle[0];
  const p2 = triangle[1];
  const p3 = triangle[2];

  const u = vec.minus(p2, p1);
  const v = vec.minus(p3, p1);

  const n = vec.cross(u, v);



  const L1 = ray_pos; // tail of ray
  const L2 = vec.plus(ray_pos, ray_dir); // head of ray

  const _temp1 = [0, 0, 0];

  vec.minusInline(L2, L1, _temp1)

  const b = vec.dot(n, _temp1);

  if (b === 0) {
    return false;
  }

  vec.minusInline(p1, L1, _temp1)

  const a = vec.dot(n, _temp1);

  const T = a / b;

  // Intersection point of plane
  const plane_ip = [0, 0, 0];

  vec.copyInline(ray_dir, _temp1);
  vec.scaleInline(_temp1, T, _temp1);
  vec.plusInline(L1, _temp1, plane_ip);


  // const plane_ip = vec.plus(L1, vec.scale(ray_dir, T));

  vec.minusInline(plane_ip, ray_pos, _temp1);

  // Check if in front or back
  if (vec.dot(ray_dir, _temp1) <= 0) {
    return false;
  }

  // Check if

  const w = vec.minus(plane_ip, p1);

  const uv = vec.dot(u, v);
  const uv_sq = uv * uv;

  const vw = vec.dot(v, w);

  const vv = vec.dot(v, v);
  const uu = vec.dot(u, u);

  const uw = vec.dot(u, w);

  const uu_vv = uu * vv;

  const _sub = uv_sq - uu_vv;

  const s_sup = uv * vw - vv * uw;
  const s_sub = _sub;

  const t_sup = uv * uw - uu * vw;
  const t_sub = _sub;

  if (_sub === 0) {
    return false;
  }

  const s = s_sup / s_sub;
  const t = t_sup / t_sub;

  if (s >= 0 && t >= 0 && (s + t) <= 1) {
    ip[0] = plane_ip[0];
    ip[1] = plane_ip[1];
    ip[2] = plane_ip[2];

    // TODO: Make sure the normal faces the ray
    ffNormal[0] = n[0];
    ffNormal[1] = n[1];
    ffNormal[2] = n[2];


    return true;
  }

  return false;
}


const COLOR_NONE = [0, 0, 0];


/**
 * 
 * @param {number[]} point 
 * @param {Scene} scene 
 * @param {number[]} lightPoint 
 * @param {any=} ignoreObj 
 */
function isLightVisible(point, scene, lightPoint, ignoreObj) {


  const dir = vec.minus(lightPoint, point);

  const ray = [point, dir];

  const intersectResult = intersectScene(ray, scene, ignoreObj);


  return intersectResult.entity === null;
}


// History
const ur = [0, 0, 0, 0];
window.ur = ur;


/**
 * Determines the color of the point.
 * 
 * `ray` is the ray that intersects the object, both which belong to the
 * scene `scene`.  The surface object properties of the ray-intersected object
 * is in `object` (assuming it is the object itself with the given properties).
 * 
 * `point` is where the intersection is. `normal` is a normal vector to the
 * surface, and `depth` is the level of recursion.
 * 
 * @param {number[][]} ray 
 * @param {Scene} scene 
 * @param {SurfaceObject} object 
 * @param {number[]} point 
 * @param {number[]} normal 
 * @param {number} depth 
 */
function surface(ray, scene, object, point, normal, depth) {

  if (true) {
    // NOTE: Type checking
    assert(Array.isArray(ray));
    assert(ray.length === 2);

    assert(Array.isArray(ray[0]));
    assert(ray[0].length === 3);
    assert(Number.isFinite(ray[0][0]));
    assert(Number.isFinite(ray[0][1]));
    assert(Number.isFinite(ray[0][2]));

    assert(Array.isArray(ray[1]));
    assert(ray[1].length === 3);
    assert(Number.isFinite(ray[1][0]));
    assert(Number.isFinite(ray[1][1]));
    assert(Number.isFinite(ray[1][2]));
    assert(vec.length(ray[1]) > 0);

    assert(Array.isArray(point));
    assert(point.length === 3);
    assert(Number.isFinite(point[0]));
    assert(Number.isFinite(point[1]));
    assert(Number.isFinite(point[2]));

    assert(Array.isArray(normal));
    assert(normal.length === 3);
    assert(Number.isFinite(normal[0]));
    assert(Number.isFinite(normal[1]));
    assert(Number.isFinite(normal[2]));
    assert(vec.length(normal) > 0);

    assert(depth >= 0 && Number.isFinite(depth));
  }

  const color = [0, 0, 0];

  const b = object.color;
  let c = [0, 0, 0];
  let lambertAmount = 0;



  // Lambert shading
  if (object.lambert) {
    for (let i = 0; i < scene.light.length; i++) {
      const light = scene.light[0];
      const lightPoint = light.pos;

      if (true) {
        // NOTE: type checking
        assert(Array.isArray(lightPoint));
        assert(lightPoint.length === 3);
        assert(Number.isFinite(lightPoint[0]));
        assert(Number.isFinite(lightPoint[1]));
        assert(Number.isFinite(lightPoint[2]));
      }

      if (!isLightVisible(point, scene, lightPoint, object)) {
        continue;
      }

      let dx = lightPoint[0] - point[0];
      let dy = lightPoint[1] - point[1];
      let dz = lightPoint[2] - point[2];

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

      dx /= len;
      dy /= len;
      dz /= len;

      let contribution = dx * normal[0] + dy * normal[1] + dz * normal[2];
      if (contribution > 0) {
        lambertAmount += contribution;
      }
    }
  }

  // Specular shading
  if (object.specular) {

    const rr_pos = point;
    const rr_dir = vec.reflect(ray[1], normal);

    if (true) {
      // NOTE: checking
      assert(Array.isArray(rr_dir));
      assert(rr_dir.length === 3);
      assert(Number.isFinite(rr_dir[0]), "", () => {
        console.info([ray[1], normal], rr_dir);
      });
      assert(Number.isFinite(rr_dir[1]));
      assert(Number.isFinite(rr_dir[2]));

      assert(object.specular >= 0 && object.specular < 1);
    }

    // reflect ray
    const rr = [rr_pos, rr_dir];

    const reflectedColor = trace(rr, scene, depth + 1, object);

    if (true) {
      assert(Array.isArray(reflectedColor));
      assert(reflectedColor.length === 3);
      assert(Number.isFinite(reflectedColor[0]));
      assert(Number.isFinite(reflectedColor[1]));
      assert(Number.isFinite(reflectedColor[2]));

    }

    if (true) {
      // Gather incremental mean
      ur[0] = ur[0] + (reflectedColor[0] - ur[0]) / (ur[3] + 1);
      ur[1] = ur[1] + (reflectedColor[1] - ur[1]) / (ur[3] + 1);
      ur[2] = ur[2] + (reflectedColor[2] - ur[2]) / (ur[3] + 1);

      ur[3] += 1;
    }

    const sm = 256;


    c[0] = c[0] + reflectedColor[0] * object.specular * sm;
    c[1] = c[1] + reflectedColor[1] * object.specular * sm;
    c[2] = c[2] + reflectedColor[2] * object.specular * sm;
  }

  lambertAmount = Math.min(1, lambertAmount);

  const k = 1 / 256;

  const q = lambertAmount * object.lambert + object.ambient;

  color[0] = k * (c[0] + b[0] * q);
  color[1] = k * (c[1] + b[1] * q);
  color[2] = k * (c[2] + b[2] * q);

  return color;
}

/**
 * 
 * @param {number[][]} ray 
 * @param {Scene} scene 
 * @param {any=} ignoreObj 
 */
function intersectScene(ray, scene, ignoreObj) {


  const ray_pos = ray[0];
  const ray_dir = ray[1];

  // Search for intersections with scene
  let closest_entity = null;
  let closest_distance = Infinity;
  let intersection_point = [0, 0, 0];

  const min_dist = 0.01;

  const min_dist_sq = min_dist * min_dist;

  let ret_normal = [0, 0, 0];
  let normal = [0, 0, 0];

  const ip = [0, 0, 0];

  const sphere_length = scene.object.sphere.length;
  const spheres = scene.object.sphere;

  // Check spheres
  for (let i = 0; i < sphere_length; i++) {
    const sphere = spheres[i];
    if (ignoreObj === sphere) continue;
    if (raySphereIntersectionInline(ray_pos, ray_dir, ip, sphere.pos, sphere.radius_squared, normal)) {

      const dx = ip[0] - ray_pos[0];
      const dy = ip[1] - ray_pos[1];
      const dz = ip[2] - ray_pos[2];

      const d = dx * dx + dy * dy + dz * dz;
      if (d >= min_dist_sq && d < closest_distance) {
        closest_entity = sphere;
        closest_distance = d;

        ret_normal[0] = normal[0];
        ret_normal[1] = normal[1];
        ret_normal[2] = normal[2];

        intersection_point[0] = ip[0];
        intersection_point[1] = ip[1];
        intersection_point[2] = ip[2];
      }
    }
  }

  const triangle_length = scene.object.triangle.length;
  const triangles = scene.object.triangle;
  for (let i = 0; i < triangle_length; i++) {
    const triangle = triangles[i];
    if (ignoreObj === triangle) continue;
    if (rayTriangleIntersectionInline(ray_pos, ray_dir, ip, triangle.points, normal)) {
      const dx = ip[0] - ray_pos[0];
      const dy = ip[1] - ray_pos[1];
      const dz = ip[2] - ray_pos[2];

      const d = dx * dx + dy * dy + dz * dz;
      if (d >= min_dist_sq && d < closest_distance) {
        closest_entity = triangle;
        closest_distance = d;

        ret_normal[0] = normal[0];
        ret_normal[1] = normal[1];
        ret_normal[2] = normal[2];

        intersection_point[0] = ip[0];
        intersection_point[1] = ip[1];
        intersection_point[2] = ip[2];
      }
    }
  }

  if (closest_entity === null) {
    intersection_point = null;
    ret_normal = null;
  }

  if (true) {
    if (ret_normal !== null) {
      assert(vec.length(ret_normal) > 0);
    }
  }

  return {
    distance: closest_distance,
    entity: closest_entity,
    point: intersection_point,
    normal: ret_normal
  };
}

/**
 * 
 * @param {number[][]} ray 
 * @param {Scene} scene 
 * @param {number} depth 
 * @param {any=} ignoreObj 
 */
export function trace(ray, scene, depth, ignoreObj) {

  const color = [0, 0, 0];

  if (depth >= 5) {
    // MAX DEPTH
    return [0, 0, 0];
  }

  const {
    distance,
    entity,
    point: intersection_point,
    normal
  } = intersectScene(ray, scene, ignoreObj);

  if (ignoreObj) {
    assert(entity !== ignoreObj);
  }

  if (entity !== null) {
    if (false) {
      // "normal" coloring
      let normal_x = 0.0;
      let normal_y = 0.0;
      let normal_z = 0.0;

      if ("pos" in entity) {
        // Sphere
        // const normal = vec.plus(vec.scale(vec.minus(intersection_point, closest_entity.pos), 0.5), [0.5, 0.5, 0.5]);
        normal_x = 0.5 * (intersection_point[0] - entity.pos[0]) + 0.5;
        normal_y = 0.5 * (intersection_point[1] - entity.pos[1]) + 0.5;
        normal_z = 0.5 * (intersection_point[2] - entity.pos[2]) + 0.5;
      }

      if ("points" in entity) {
        // Triangle
        const p1 = entity.points[0];
        const p2 = entity.points[1];
        const p3 = entity.points[2];

        const u = vec.minus(p2, p1);
        const v = vec.minus(p3, p1);

        const n = vec.cross(u, v);

        const camera_pos_unit = vec.unit(ray[0]);
        const normal_unit = vec.unit(n);

        const k = Math.abs(vec.dot(camera_pos_unit, normal_unit));

        normal_x = k;
        normal_y = k;
        normal_z = k;
      }

      const d_x = ray[0][0] - intersection_point[0];
      const d_y = ray[0][1] - intersection_point[1];
      const d_z = ray[0][2] - intersection_point[2];

      const d_xyz = d_x * d_x + d_y * d_y + d_z * d_z;

      // const dist = vec.length(vec.minus(camera.pos, intersection_point));
      const dist = Math.sqrt(d_xyz);

      const falloff = fastLogisticFunction(-(dist), 2, 0.025, 0);

      const x = normal_x * falloff;
      const y = normal_y * falloff;
      const z = normal_z * falloff;



      color[0] = Math.abs(x);
      color[1] = Math.abs(y);
      color[2] = Math.abs(z);
    } else {
      // Surface coloring
      const surfaceColor = surface(ray, scene, entity, intersection_point, normal, depth);

      color[0] = surfaceColor[0];
      color[1] = surfaceColor[1];
      color[2] = surfaceColor[2];
    }




  } else {
    // SPACE

    if (false) {
      const n = vec.unit(ray[1]);

      color[0] = 0.5 * n[0] + 0.5;
      color[1] = 0.5 * n[1] + 0.5;
      color[2] = 0.5 * n[2] + 0.5;
    } else {
      color[0] = 0;
      color[1] = 0;
      color[2] = 0;
    }



  }


  if (true) {
    // CHECK
    assert(Array.isArray(color));
    assert(color.length === 3);
    assert(Number.isFinite(color[0]));
    assert(Number.isFinite(color[1]));
    assert(Number.isFinite(color[2]));
    assert(color[0] >= 0);
    assert(color[1] >= 0);
    assert(color[2] >= 0);
    
    // Maybe
    assert(color[0] < 1000);
    assert(color[1] < 1000);
    assert(color[2] < 1000);
  }


  return color;
}