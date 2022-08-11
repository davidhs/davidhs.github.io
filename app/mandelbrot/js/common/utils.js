/**
 * TODO: add :asserts condition trick
 * 
 * @param {boolean} condition 
 * @param {string=} message 
 */
export function assert(condition, message = "") {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * 
 * @param {any[]} array 
 * 
 * @returns {void}
 */
export function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {number[]}           The HSL representation
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  const _t1 = (max + min) / 2;

  let h = _t1;
  let s = _t1;
  let l = _t1;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

/**
 *
 * @param {ImageData} imageData
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
export function setPixel(
  imageData,
  x,
  y,
  r,
  g,
  b,
  a
) {
  let index = (x + y * imageData.width) * 4;
  imageData.data[index] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

/**
 * 
 * @param {number} x_min 
 * @param {number} x_max 
 * @param {number} y_min 
 * @param {number} y_max 
 * @param {number} x_splits 
 * @param {number} y_splits 
 * @returns {{index: any[],x: any[],y: any[]}}
 */
export function getSSArray(
  x_min,
  x_max,
  y_min,
  y_max,
  x_splits,
  y_splits
) {
  let i;

  let x = [];
  let y = [];

  if (x_splits < 2) {
    x.push(0);
  } else {
    // Normalize
    x_splits = Math.round(x_splits);

    let dx = (x_max - x_min) / x_splits;

    // First element
    x.push(dx / 2 + x_min);

    for (i = 1; i < x_splits; i++) {
      x.push(x[i - 1] + dx);
    }
  }

  if (y_splits < 2) {
    y.push(0);
  } else {
    // Normalize
    y_splits = Math.round(y_splits);

    let dy = (y_max - y_min) / y_splits;

    // First element
    y.push(dy / 2 + y_min);

    for (let i = 1; i < y_splits; i++) {
      y.push(y[i - 1] + dy);
    }
  }

  ////////

  // TODO do I need to do this? Does the compiler realise this? this is const
  let LENGTH = x.length * y.length;

  let index = [];

  for (i = 0; i < LENGTH; i++) {
    index.push({
      x: x[i % x.length],
      y: y[Math.floor(i / x.length) % y.length]
    });
  }

  return {
    index: index,
    x: x,
    y: y
  };
}

/**
 * 
 * @param {any} obj 
 * 
 * @returns {number}
 */
export function getObjectSize(obj) {
  let key, count = 0;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      count++;
    }
  }

  return count;
}

/**
 * 
 * @param {number} p 
 * @param {number} q 
 * @param {number} t 
 * 
 * @returns {number}
 */
export function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {number[]}           The RGB representation
 */
export function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 
 * @param {number} f 
 * @returns 
 */
export function ditherToInt(f) {
  const co = f;
  const ci = Math.floor(co);
  const cf = co - ci;
  const c = ci + ((Math.random() < cf) ? 1 : 0);
  return c;
}

/**
 * 
 * @param {number} h 
 * @param {number} s 
 * @param {number} l 
 * @param {number[]} arr 
 * 
 * @returns {void}
 */
export function hslToRgbRW(h, s, l, arr) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  arr[0] = Math.round(r * 255);
  arr[1] = Math.round(g * 255);
  arr[2] = Math.round(b * 255);
}

/**
 * 
 * @param {number} v0 
 * @param {number} v1 
 * @param {number} t 
 */
export function lerp(v0, v1, t) {
  return (1.0 - t) * v0 + t * v1;
}

/**
 * 
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 */
export function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}

/**
 * Fractual equivalence given tolerance
 * 
 * @param {number} a 
 * @param {number} b 
 * @param {number} t 
 */
export function feq(a, b, t) {
  let d = a - b;

  if (d < 0) d = -d;

  return d <= t;
}

/**
 * 
 * @param {string} hex on the form `#aaaaaa`.
 */
export function hex2rgba(hex) {
  const r = Number.parseInt(hex.substring(1, 3), 16);
  const g = Number.parseInt(hex.substring(3, 5), 16);
  const b = Number.parseInt(hex.substring(5, 7), 16);

  return [r / 255, g / 255, b / 255, 1.0];
};
