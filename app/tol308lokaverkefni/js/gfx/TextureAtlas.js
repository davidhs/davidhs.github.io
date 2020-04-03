'use strict';

/* global FastImage:true */


/**
 * Uniformly-sized sub-images.
 *
 * TODO: I don't know if it's such a good idea to split a large
 * sprite sheet into 1000 images.
 *
 * https://en.wikipedia.org/wiki/Texture_atlas
 *
 * {
 *  image, tileWidth, tileHeight, nrOfTiles
 * }
 *
 * image, subimageHeight, nrOfSubimages
 */
function TextureAtlas(cfg) {
  // If cfg.image is Image, convert to canvas


  const self = this;


  if (cfg.paths) {
    let paths = cfg.paths;

    if (paths.eval) {
      // This is intentional.
      paths = eval(paths.eval);
    }

    if (cfg.pathPrefix) {
      for (let i = 0; i < paths.length; i += 1) {
        paths[i] = cfg.pathPrefix + paths[i];
      }
    }

    const lobj = {
      image: [],
    };

    for (let i = 0; i < paths.length; i += 1) {
      lobj.image[i] = paths[i];
    }


    loader.load(lobj, (assets) => {
      const images = assets.image;
      cfg.image = TextureAtlas.createTextureAtlas(images);

      self._init(cfg);
    });
  } else {
    this._init(cfg);
  }
}


TextureAtlas.createTextureAtlas = function (images) {
  const canvas = document.createElement('canvas');

  let maxWidth = 0;
  let maxHeight = 0;

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];

    if (image.width > maxWidth) maxWidth = image.width;
    if (image.height > maxHeight) maxHeight = image.height;
  }

  console.log('Max width and height: ', maxWidth, maxHeight);

  return canvas;
};

TextureAtlas.prototype._init = function (cfg) {
  const img = cfg.image;

  if (img instanceof Image) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    this.image = canvas;
  } else {
    this.image = img;
  }


  const data = this.image.getContext('2d').getImageData(0, 0, this.image.width, this.image.height).data;

  // Create occlusion images

  const oc = document.createElement('canvas');
  oc.width = this.image.width;
  oc.height = this.image.height;

  const octx = oc.getContext('2d');
  const imageData = octx.getImageData(0, 0, this.image.width, this.image.height);
  const odata = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    odata[i] = 0;
    odata[i + 1] = 0;
    odata[i + 2] = 0;
    odata[i + 3] = a;
  }

  octx.putImageData(imageData, 0, 0);

  this.oimage = oc;

  // Default behavior

  // JavaScript is garbage. If somewhere in the code,
  //
  //   x = 0;
  //
  // And later we set,
  //
  //   let a = x || 3;
  //   let a = !x ? 0 : 4;
  //
  // Where the 1 is a default value, then
  // a evaluates to 3. :(
  this.primaryDirection = util.value(cfg.primaryDirection, 'right');
  this.secondaryDirection = util.value(cfg.secondaryDirection, 'down');
  this.mode = util.value(cfg.mode, 1);
  this.tileWidth = util.value(cfg.tileWidth, 0);
  this.tileHeight = util.value(cfg.tileHeight, 0);
  this.rows = Math.ceil(this.image.height / this.tileHeight);
  this.cols = Math.ceil(this.image.width / this.tileWidth);
  this.nrOfTiles = util.value(cfg.nrOfTiles, this.rows * this.cols);

  this.ready = true;
};

TextureAtlas.prototype.ready = false;

/**
 * rowFirst
 * LR
 * TB
 */
TextureAtlas.prototype.getSequence = function (cfg) {
  const sequence = [];

  const c1 = cfg.primaryDirection === 'right';
  const c2 = cfg.secondaryDirection === 'down';
  const nrOfTiles = cfg.nrOfTiles;

  if (c1 && c2) {
    const qty = nrOfTiles || this.nrOfTiles;

    let count = 0;

    const m = this.rows;
    const n = this.cols;

    for (let i = 0; i < m; i += 1) {
      for (let j = 0; j < n; j += 1) {
        count += 1;

        sequence.push([j, i]);

        // sequence.push(this.getTile(j, i));

        // sequence.push(this.subimages[i][j]);

        if (count === qty) {
          i = m;
          j = n;
        }
      }
    }
  }

  return {
    reference: this,
    sequence,
  };
};

/**
 * Avoid using this method as much as possible.
 *
 * Returns a canvas.
 */
TextureAtlas.prototype.getTile = function (tx, ty) {
  if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return null;

  if (!this._cachedTiles) {
    this._cachedTiles = [];
  }

  if (this._cachedTiles[ty] && this._cachedTiles[ty][tx]) {
    return this._cachedTiles[ty][tx];
  }

  // TODO: cache tiles

  const x = Math.floor(tx) * this.tileWidth;
  const y = Math.floor(ty) * this.tileHeight;
  const w = this.tileWidth;
  const h = this.tileHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const image = (this.image instanceof FastImage) ? this.image.getImage() : this.image;


  ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

  // Cache image
  if (!this._cachedTiles[ty]) this._cachedTiles[ty] = [];

  this._cachedTiles[ty][tx] = canvas;

  return canvas;
};

TextureAtlas.prototype.getIndex = function (tx, ty) {
  return tx + ty * this.cols;
};

TextureAtlas.prototype.sample = function (tx, ty, x, y) {
  const ctx = this.image.getContext('2d');

  const sx = tx * this.tileWidth;
  const sy = ty * this.tileHeight;
  const sw = this.tileWidth;
  const sh = this.tileHeight;

  x = Math.floor(x);
  y = Math.floor(y);


  const index = 4 * (x + y * this.tileWidth);

  if (!this._data) {
    this._data = ctx.getImageData(sx, sy, sw, sh).data;
  }

  const data = this._data;

  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  return {
    r, g, b, a,
  };
};

TextureAtlas.prototype.renderIndexTile = function (ctx, index, x, y, w, h, cfg) {
  const tx = index % this.cols;
  const ty = Math.floor(index / this.cols);
  this.renderTile(ctx, tx, ty, x, y, w, h, cfg);
};

TextureAtlas.prototype.renderTile = function (ctx, tx, ty, x, y, w, h, cfg) {
  // From this canvas
  const sx = tx * this.tileWidth;
  const sy = ty * this.tileHeight;
  const sw = this.tileWidth;
  const sh = this.tileHeight;

  // Into that canvas
  const dx = x;
  const dy = y;
  const dw = w;
  const dh = h;

  if (cfg) {
    if (cfg.occlusion) {
      ctx.drawImage(this.oimage, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
      ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  } else {
    ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
  }
};
