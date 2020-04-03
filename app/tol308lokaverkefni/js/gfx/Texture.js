'use strict';

/* global document FastImage g_viewport:true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// =======
// TEXTURE
// =======

// The name is probably a misnomer, since it ought to be named `RepeatingImage'
// or something like that.  Currently it takes an image and repeatedly draws
// it into a larger image to form a pattern.


/**
 * TODO: optimize this thing!  If the map is large then
 * this image is absolutely huge!
 *
 * @param {{scale: number, image: [Image|HTMLCanvasElement], width: number, height: number}} obj
 */
function Texture(obj) {
  const scale = obj.scale || 1;

  this._ = { image: obj.image, scale };

  this.resize(obj.width, obj.height);
}


/**
 * @param {number} textureWidth
 * @param {number} textureHeight
 */
Texture.prototype.resize = function (textureWidth, textureHeight) {
  this._.width = textureWidth;
  this._.height = textureHeight;

  const image = this._.image;
  const scale = this._.scale;

  const w = image.width;
  const h = image.height;

  const dw = scale * w;
  const dh = scale * h;

  const m = 1 + Math.floor(textureHeight / dh);
  const n = 1 + Math.floor(textureWidth / dw);

  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < m; i += 1) {
    const y = i * dh;
    for (let j = 0; j < n; j += 1) {
      const x = j * dw;

      ctx.drawImage(
        image,
        0, 0, w, h,
        x, y, dw, dh,
      );
    }
  }

  this._.texture = canvas;
};


/**
 * @returns {HTMLCanvasElement}
 */
Texture.prototype.getTexture = function () {
  return this._.texture;
};


/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} cfg
 */
Texture.prototype.render = function (ctx, cfg) {
  const w = this._.texture.width;
  const h = this._.texture.height;

  const x = -g_viewport.getOX();
  const y = -g_viewport.getOY();

  ctx.drawImage(this._.texture, x, y);
};
