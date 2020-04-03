'use strict';

/* global document Image :true */

// =====
// UTILS
// =====

const util = (function () {
  const util = {};

  util.extendObject = (object, extensions) => {
    if (!extensions) return;

    for (let i = 0, keys = Object.keys(extensions); i < keys.length; i += 1) {
      object[keys[i]] = extensions[keys[i]];
    }
  };

  util.snapshot = obj => JSON.parse(JSON.stringify(obj));


  util.createPicker = comparator => function (...args) {
    if (args.length === 0) {
      return undefined; // undefined
    }

    let arr;

    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        arr = args[0];
      } else {
        return args[0];
      }
    } else {
      arr = args;
    }

    let best = arr[0];

    for (let i = 1; i < arr.length; i += 1) {
      if (comparator(arr[i], best)) {
        best = arr[i];
      }
    }

    return best;
  };


  util.pickMin = util.createPicker((a, b) => a < b);
  util.pickMax = util.createPicker((a, b) => a > b);
  util.minIndex = (...args) => args.indexOf(util.pickMin(args));

  util.cropImage = (image, x, y, w, h) => {
    const iw = image.width;
    const ih = image.height;

    if (true) {
      // All of these should be true
      const condArr = [
        util.inBounds(x, 0, iw),
        util.inBounds(y, 0, ih),

        util.inBounds(w, 0, iw),
        util.inBounds(h, 0, ih),

        util.inBounds(x + w, 0, iw),
        util.inBounds(y + h, 0, ih),
      ];

      if (!util.booleanANDArray(condArr)) {
        console.error(image);
        console.error(iw, ih);
        console.error(x, y, w, h);
        console.error(condArr);
        throw Error();
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

    const newImage = new Image();
    newImage.src = canvas.toDataURL('image/png');

    return newImage;
  };

  /**
   * Assumes left1 <= right1 and left2 <= right2.
   */
  util.isIntervalIntersection = (left1, right1, left2, right2) => {
    const c1 = left1 <= right2;
    const c2 = right1 >= left2;

    return c1 && c2;
  };

  util.clampRange = (value, lowBound, highBound) => {
    if (value < lowBound) {
      value = lowBound;
    } else if (value > highBound) {
      value = highBound;
    }
    return value;
  };

  util.wrapRange = (value, lowBound, highBound) => {
    // TODO: use remainder operator instead of while loop.
    while (value < lowBound) {
      value += (highBound - lowBound);
    }
    while (value > highBound) {
      value -= (highBound - lowBound);
    }
    return value;
  };

  /**
   *
   * @param {number} value
   * @param {number} lowBound
   * @param {number} highBound
   * @returns {boolean}
   */
  util.isBetween = (value, lowBound, highBound) => !(value < lowBound || value > highBound);

  util.randRange = (min, max) => (min + Math.random() * (max - min));


  util.getCanvas = (image) => {
    if (image instanceof HTMLCanvasElement) {
      return image;
    } else if (image instanceof Image) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return canvas;
    }

    throw Error();
  };

  util.range = (a, b) => {
    const l = [];
    for (let i = a; i < b; i += 1) {
      l.push(i);
    }
    return l;
  };

  util.square = x => (x * x);

  util.cube = x => (x * x * x);

  util.distSq = (x1, y1, x2, y2) => (util.square(x2 - x1) + util.square(y2 - y1));

  util.dist = (x1, y1, x2, y2) => Math.sqrt(util.distSq(x1, y1, x2, y2));

  util.wrappedDistSq = (x1, y1, x2, y2, xWrap, yWrap) => {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    if (dx > xWrap / 2) {
      dx = xWrap - dx;
    }

    if (dy > yWrap / 2) {
      dy = yWrap - dy;
    }
    return util.square(dx) + util.square(dy);
  };

  util.booleanANDArray = (arr) => {
    for (let i = 0; i < arr.length; i += 1) if (!arr[i]) return false;

    return true;
  };

  util.booleanORArray = (arr) => {
    for (let i = 0; i < arr.length; i += 1) if (arr[i]) return true;

    return false;
  };

  util.timestamp = () => {
    const d = new Date();

    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();

    const ms = d.getMilliseconds();

    const str = `${year} - ${month} - ${day} ${hour} : ${minute} : ${second} . ${ms}`;

    return str;
  };

  function objectStringReplacement(obj, stringTarget, replacement) {
    const c1 = obj === null;
    const c2 = typeof obj === 'undefined';
    const c3 = typeof el === 'number';
    const c4 = typeof el === 'boolean';
    const c5 = typeof el === 'function';

    if (obj === null || typeof obj === 'undefined' || typeof el === 'number' || typeof el === 'boolean') {
      return;
    }

    // Check if object is array,
    // Check if object is "object"

    if (Array.isArray(obj)) {
      // Assume is array
      const arr = obj;
      for (let i = 0; i < arr.length; i += 1) {
        const el = arr[i];
        if (typeof el === 'string') {
          if (el === stringTarget) {
            arr[i] = replacement;
          } else {
            objectStringReplacement(el, stringTarget, replacement);
          }
        }
      }
    } else if (obj !== null && typeof obj !== 'undefined') {
      // Assume is object
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const el = obj[key];

        if (typeof el === 'string') {
          if (el === stringTarget) {
            obj[key] = replacement;
          }
        } else {
          objectStringReplacement(el, stringTarget, replacement);
        }
      }
    }
  }

  util.objectStringReplacement = objectStringReplacement;

  // Returns a value that is always positive,
  // or to be more accurate non-negative.
  util.posmod = (value, modulus) => (modulus + (value % modulus)) % modulus;

  util.inBounds = (value, minValue, maxValue) => (value >= minValue) && (value <= maxValue);

  util.clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  util.strokeCircle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  util.strokeRect = (ctx, x, y, w, h) => {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
  };

  util.fillCircle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  util.fillBox = (ctx, x, y, w, h, style) => {
    const oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
  };

  util.clamp = (value, minValue, maxValue) => {
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
  };

  util.rgb2str = (r, g, b) => {
    r = util.clamp(Math.floor(r), 0, 255);
    g = util.clamp(Math.floor(g), 0, 255);
    b = util.clamp(Math.floor(b), 0, 255);

    return `rgb(${r}, ${g}, ${b})`;
  };

  util.sgn = x => (x < 0 ? -1 : 1);


  // Returns a random integer between 0 and range - 1.
  util.randomInt = range => Math.floor(Math.random() * range);

  // Concatenates prefix to urls
  util.prefixStrings = (prefix, strings) => {
    const obj = {};

    for (let i = 0, keys = Object.keys(strings); i < keys.length; i += 1) {
      const key = keys[i];
      obj[key] = prefix + strings[key];
    }

    return obj;
  };

  // Scale dst according to source but not
  // exceedig max dimensions maxWidth, maxHeight,
  // yet keeping same A/R.
  util.scale = (src, dst, max_width, max_height) => {
    const w = src.width;
    const h = src.height;

    max_width = max_width || w;
    max_height = max_height || h;

    const mw = max_width;
    const mh = max_height;

    const sw = mw / w;
    const sh = mh / h;

    const s = Math.min(sw, sh);

    dst.width = w * s;
    dst.height = h * s;
  };

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {function} pixelFunction
   * @returns {HTMLCanvasElement}
   */
  util.forAllPixels = (canvas, pixelFunction) => {
    const w = canvas.width;
    const h = canvas.height;


    const rgba1 = {
      r: 0, g: 255, b: 0, a: 127,
    };
    const rgba2 = {
      r: 0, g: 0, b: 255, a: 127,
    };


    const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;

    const canvas2 = document.createElement('canvas');
    canvas2.width = w;
    canvas2.height = h;
    const ctx = canvas2.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);
    const data2 = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      rgba1.r = data[i];
      rgba1.g = data[i + 1];
      rgba1.b = data[i + 2];
      rgba1.a = data[i + 3];

      pixelFunction(rgba1, rgba2);

      data2[i] = rgba2.r;
      data2[i + 1] = rgba2.g;
      data2[i + 2] = rgba2.b;
      data2[i + 3] = rgba2.a;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas2;
  };

  util.objPropsToList = (obj) => {
    const l = [];
    for (let i = 0, keys = Object.keys(obj); i < keys.length; i += 1) {
      const key = keys[i];
      l.push(obj[key]);
    }

    return l;
  };

  /**
   *
   * @param {*} value
   * @param {*} defaultValue
   * @returns {*}
   */
  util.value = (value, defaultValue) => {
    if (typeof value !== 'undefined') {
      return value;
    }
    return defaultValue;
  };

  /**
   *
   * @param {XMLDocument} xml
   * @returns *
   */
  function xml2json(xml) {
    let obj = {};


    if (typeof xml === 'undefined') throw Error();

    const ignoreEmptyStrings = true;

    // I'll do this later.  I want to be able to replace
    // every of this names with something else.
    const attributeHandle = '@attributes';
    const textHandle = '#text';

    if (xml.nodeType === XMLDocument.ELEMENT_NODE) {
      if (xml.attributes.length > 0) {
        obj[attributeHandle] = {};
        for (let i = 0; i < xml.attributes.length; i += 1) {
          const attribute = xml.attributes.item(i);
          obj[attributeHandle][attribute.nodeName] = attribute.nodeValue;
        }
      }
    }

    if (xml.nodeType === XMLDocument.TEXT_NODE) {
      obj = xml.nodeValue;
    }

    if (xml.nodeType === XMLDocument.DOCUMENT_NODE) { /* ... */ }


    if (typeof xml.hasChildNodes !== 'undefined' && xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i += 1) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (typeof obj[nodeName] === 'undefined') {
          const subtree = xml2json(item);

          if (typeof subtree === 'string') {
            const str = ignoreEmptyStrings ? subtree.trim() : subtree;
            if (str.length !== 0) {
              obj[nodeName] = str;
            }
          } else {
            obj[nodeName] = xml2json(item);
          }
        } else {
          // Multi line text?
          if (typeof obj[nodeName].push === 'undefined') {
            const oldObject = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(oldObject);
          }

          const subtree = xml2json(item);

          if (typeof subtree === 'string') {
            const str = ignoreEmptyStrings ? subtree.trim() : subtree;
            if (str.length !== 0) {
              obj[nodeName] = str;
            }
          } else {
            obj[nodeName].push(subtree);
          }
        }
      }
    }

    return obj;
  }

  util.xml2json = xml2json;


  return util;
})();
