'use strict';

/* global document util :true */

// obj can be canvas or image
function FastImage(obj) {
  this.scale = obj.scale || 1.0;

  const image = obj.image;


  const canvas = document.createElement('canvas');
  canvas.width = image.width * this.scale;
  canvas.height = image.height * this.scale;

  const ctx = canvas.getContext('2d');


  if (image instanceof FastImage) {
    ctx.drawImage(
      image.getImage(),
      0, 0, image.width, image.height,
      0, 0, canvas.width, canvas.height,
    );
  } else {
    ctx.drawImage(
      image,
      0, 0, image.width, image.height,
      0, 0, canvas.width, canvas.height,

    );
  }

  this._ = {
    canvas,
    ctx,
  };

  if (obj.bias) {
    const x = obj.bias.x;
    const y = obj.bias.y;

    if (typeof x === 'number') biasX = x;
    if (typeof y === 'number') biasY = y;

    if (typeof x === 'string') {
      if (x.endsWith('%')) {
        const percentage = parseFloat(x.substring(0, x.length - 1));
        this.biasX = canvas.width * percentage / 100.0;
      }
    }

    if (typeof y === 'string') {
      if (y.endsWith('%')) {
        const percentage = parseFloat(y.substring(0, y.length - 1));
        this.biasY = canvas.height * percentage / 100.0;
      }
    }
  }

  this.width = canvas.width;
  this.height = canvas.height;
}

FastImage.prototype.biasX = 0;
FastImage.prototype.biasY = 0;


FastImage.prototype.width = 0;
FastImage.prototype.height = 0;


FastImage.prototype.getImage = function () {
  return this._.canvas;
};

FastImage.prototype.crop = function (x, y, w, h) {
  const iw = this._.canvas.width;
  const ih = this._.canvas.height;

  // Muna ad fjarlaegja true
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
  ctx.drawImage(this._.canvas, x, y, w, h, 0, 0, w, h);

  return new FastImage({
    image: canvas,
  });
};


FastImage.prototype.update = function (imageThing) {
  const thisCanvas = this._.canvas;
  const canvas = thisCanvas;
  let ctx = this._.ctx;

  const width = imageThing.width;
  const height = imageThing.height;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    this.width = width;
    this.height = height;

    ctx = canvas.getContext('2d');
    this._.ctx = ctx;
  }


  if (imageThing instanceof FastImage) {
    ctx.drawImage(imageThing.getImage(), 0, 0, width, height);
  } else {
    ctx.drawImage(imageThing, 0, 0, width, height);
  }
};

FastImage.prototype.copy = function () {
  const w = this._.canvas.width;
  const h = this._.canvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(this._.canvas, 0, 0, w, h);

  return new FastImage({
    image: canvas,
  });
};

FastImage.prototype.render = function (ctx, x, y, w, h) {
  x = x || 0;
  y = y || 0;

  w = w || this._.canvas.width;
  h = h || this._.canvas.height;

  if (w === this._.canvas.width && h === this._.canvas.height) {
    ctx.drawImage(this._.canvas, x + this.biasX, y + this.biasY);
  } else {
    ctx.drawImage(this._.canvas, x + this.biasX, y + this.biasY);
  }
};
