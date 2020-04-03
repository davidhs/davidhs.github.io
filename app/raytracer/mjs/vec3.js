/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function cross(u, v) {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w 
 */
export function crossInline(u, v, w) {
  const x = u[1] * v[2] - u[2] * v[1];
  const y = u[2] * v[0] - u[0] * v[2];
  const z = u[0] * v[1] - u[1] * v[0];
  w[0] = x;
  w[1] = y;
  w[2] = z;
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function dot(u, v) {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

/**
 * 
 * @param {number[]} u 
 */
export function length(u) {
  return Math.hypot(u[0], u[1], u[2]);
}

/**
 * 
 * @param {number[]} u 
 */
export function lengthSquared(u) {
  return u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
}

/**
 * 
 * @param {number[]} u 
 */
export function unit(u) {
  const len = length(u);
  return [u[0] / len, u[1] / len, u[2] / len]
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} w 
 */
export function unitInline(u, w) {
  const len = length(u);
  w[0] = u[0] / len;
  w[1] = u[1] / len;
  w[2] = u[2] / len;
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function minus(u, v) {
  return [
    u[0] - v[0],
    u[1] - v[1],
    u[2] - v[2],
  ];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w 
 */
export function minusInline(u, v, w) {
  w[0] = u[0] - v[0];
  w[1] = u[1] - v[1];
  w[2] = u[2] - v[2];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function plus(u, v) {
  return [
    u[0] + v[0],
    u[1] + v[1],
    u[2] + v[2],
  ];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w
 */
export function plusInline(u, v, w) {
  w[0] = u[0] + v[0];
  w[1] = u[1] + v[1];
  w[2] = u[2] + v[2];
}

/**
 * 
 * @param {number[]} u 
 * @param {number} s 
 */
export function scale(u, s) {
  return [u[0] * s, u[1] * s, u[2] * s];
}

/**
 * 
 * @param {number[]} u 
 * @param {number} s 
 * @param {number[]} w
 */
export function scaleInline(u, s, w) {
  w[0] = u[0] * s;
  w[1] = u[1] * s;
  w[2] = u[2] * s;
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function project(u, v) {
  // that.scale(this.dot(that) / that.dot(that));
  return scale(v, dot(u, v) / dot(v, v));
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w
 */
export function projectInline(u, v, w) {

  const a = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const b = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];

  if (b === 0) {
    throw new Error('Unhandled!');
  }

  const c = a / b;

  const x = v[0] * c;
  const y = v[1] * c;
  const z = v[2] * c;

  w[0] = x;
  w[1] = y;
  w[2] = z;
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function reject(u, v) {
  // this.minus(this.project(that));
  return minus(u, project(u, v));
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w
 */
export function rejectInline(u, v, w) {

  const a = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const b = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];

  if (b === 0) {
    throw new Error('Unhandled!');
  }

  const c = a / b;

  const x = u[0] - v[0] * c;
  const y = u[1] - v[1] * c;
  const z = u[2] - v[2] * c;

  w[0] = x;
  w[1] = y;
  w[2] = z;
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 */
export function reflect(u, v) {
  // that.minus(this.project(that).scale(2));
  return minus(v, scale(project(u, v), 2));
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} v 
 * @param {number[]} w
 */
export function reflectInline(u, v, w) {

  const a = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const b = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];

  if (b === 0) {
    throw new Error('Unhandled!');
  }

  const c = a / b;

  const x = v[0] * (1 - 2 * c);
  const y = v[1] * (1 - 2 * c);
  const z = v[2] * (1 - 2 * c);

  w[0] = x;
  w[1] = y;
  w[2] = z;
}

/**
 * 
 * @param {number[]} u 
 */
export function neg(u) {
  return [
    -u[0],
    -u[1],
    -u[2]
  ];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} w
 */
export function negInline(u, w) {
  w[0] = -u[0];
  w[1] = -u[1];
  w[2] = -u[2];
}

/**
 * 
 * @param {number[]} u 
 * @param {number[]} w 
 */
export function copyInline(u, w) {
  w[0] = u[0];
  w[1] = u[1];
  w[2] = u[2];
}

/**
 * 
 * @param {number[]} u 
 */
export function copy(u) {
  return [u[0], u[1], u[2]];
}