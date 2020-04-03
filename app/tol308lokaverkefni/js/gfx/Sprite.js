'use strict';

/* global document fOcclusionMap g_viewport:true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ============
// SPRITE STUFF
// ============

// Old assumption
//
// obj.image
// obj.scale
//
//

// Construct a "sprite" from the given `image`,
//
function Sprite(cfg) {
  // Default values.
  this.state = 'unknown';
  this.states = {
    unknown: null,
  };

  this.scale = 1.0;
  this.width = 0;
  this.height = 0;

  // Legacy
  if (cfg.image) {
    this.states.unknown = util.getCanvas(cfg.image);
    this.width = cfg.image.width;
    this.height = cfg.image.height;
    this.occlusion = fOcclusionMap(this.states.unknown);
  }
  if (cfg.scale) this.scale = cfg.scale;


  if (cfg.states) this.states = cfg.states;
  if (cfg.state) this.state = cfg.state;
}

Sprite.prototype.state = 'unknown';
Sprite.prototype.biasX = 0;
Sprite.prototype.biasY = 0;

Sprite.prototype.setState = function (stateName) {
  // TODO maybe throw error or something if state doesn't exist.

  // If old state had animation, reset it

  this.state = stateName;
};


Sprite.prototype.update = function (du) {
  // Check if current state has a update function.
  if (this.states[this.state].update) {
    this.states[this.state].update(du);
  }
};

Sprite.prototype.drawAt = function (ctx, x, y) {
  const image = this._getImage();
  ctx.drawImage(image, x, y);
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation, cfg) {
  if (rotation === undefined) rotation = 0;

  cfg = cfg || {};

  const w = this.width;
  const h = this.height;

  cx = g_viewport.mapO2IX(cx);
  cy = g_viewport.mapO2IY(cy);


  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(this.scale, this.scale);

  

  // drawImage expects "top-left" coords, so we offset our destination
  // coords accordingly, to draw our sprite centred at the origin
  if (cfg.occlusion) {
    const occlusion = this._getOcclusion();
    ctx.drawImage(occlusion, -w / 2, -h / 2);
  } else if (this.states[this.state].update) {
    const state = this.states[this.state];
    state.cx = this.cx;
    state.cy = this.cy;
    if (cfg.flip) ctx.scale(-1, 1);
    state.render(ctx);
  } else {
    const image = this.states[this.state];
    if (cfg.flip) ctx.scale(-1, 1);
    ctx.drawImage(image, -w / 2, -h / 2);
  }


  ctx.restore();
};

// Eughh...
const fOcclusionMap = function (canvas) {
  function occluder(rgba1, rgba2) {
    const rgbaInit = [rgba1.r, rgba1.g, rgba1.b, rgba1.a];
    const [r, g, b, a] = rgbaInit;

    const threshold = 1;

    let brightness = 255;

    if (r <= threshold || g <= threshold || b <= threshold) {
      brightness = 0;
    }

    const tRgba = [0, 0, 0, brightness];
    const [tr, tg, tb, ta] = tRgba;

    rgba2.r = tr;
    rgba2.g = tg;
    rgba2.b = tb;
    rgba2.a = ta;
  }

  return util.forAllPixels(canvas, occluder);
};
