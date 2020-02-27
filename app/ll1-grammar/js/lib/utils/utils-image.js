
import { clamp, inBounds } from './utils.js';

// Usage: ...
// Pre:   ...
// Post:  ...
const cropImage = (image, x, y, w, h) => {
    const iw = image.width;
    const ih = image.height;
    
    if (true) {
      // All of these should be true
      const condArr = [
        inBounds(x, 0, iw),
        inBounds(y, 0, ih),
    
        inBounds(w, 0, iw),
        inBounds(h, 0, ih),
    
        inBounds(x + w, 0, iw),
        inBounds(y + h, 0, ih),
      ];
    
      if (!booleanANDArray(condArr)) {
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

// Usage: ...
// Pre:   ...
// Post:  ...
const getCanvas = (image) => {
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

/**
 * @param {HTMLCanvasElement} canvas
 * @param {function} pixelFunction
 * @returns {HTMLCanvasElement}
 */

// Usage: ...
// Pre:   ...
// Post:  ...
const forAllPixels = (canvas, pixelFunction) => {
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


// Scale dst according to source but not
// exceedig max dimensions maxWidth, maxHeight,
// yet keeping same A/R.

// Usage: ...
// Pre:   ...
// Post:  ...
const scale = (src, dst, max_width, max_height) => {
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

// Usage: ...
// Pre:   ...
// Post:  ...
const rgb2str = (r, g, b) => {
  r = clamp(Math.floor(r), 0, 255);
  g = clamp(Math.floor(g), 0, 255);
  b = clamp(Math.floor(b), 0, 255);

  return `rgb(${r}, ${g}, ${b})`;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const clearCanvas = ctx => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

// Usage: ...
// Pre:   ...
// Post:  ...
const strokeCircle = (ctx, x, y, r) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
};

// Usage: ...
// Pre:   ...
// Post:  ...
const strokeRect = (ctx, x, y, w, h) => {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();
};

// Usage: ...
// Pre:   ...
// Post:  ...
const fillCircle = (ctx, x, y, r) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

// Usage: ...
// Pre:   ...
// Post:  ...
const fillBox = (ctx, x, y, w, h, style) => {
  const oldStyle = ctx.fillStyle;
  ctx.fillStyle = style;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = oldStyle;
};

export {
    cropImage
    , getCanvas
    , forAllPixels
    , scale
    , rgb2str
    , clearCanvas
    , strokeCircle
    , strokeRect
    , fillCircle
    , fillBox
};
