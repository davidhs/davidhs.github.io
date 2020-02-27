'use strict';

/* global util entityManager g_viewport :true */

// Animation

function AnimatedImage(cfg) {
  this.cx = util.value(cfg.cx, 0);
  this.cy = util.value(cfg.cy, 0);
  this.sequence = cfg.sequence ? cfg.sequence.sequence : [];
}

AnimatedImage.prototype.cx = 50;
AnimatedImage.prototype.cy = 50;
AnimatedImage.prototype.done = false;
AnimatedImage.prototype.dt = 0;
AnimatedImage.prototype.rate = 1.5;
AnimatedImage.prototype.sequence = [];

// TODO: bind in JSON a more sensible rate.

AnimatedImage.prototype.update = function (du) {
  if (this.done) return entityManager.KILL_ME_NOW;

  this.dt += du;

  return entityManager.OK;
};

AnimatedImage.prototype.render = function (ctx, cfg) {
  if (this.done) return;

  cfg = cfg || {};

  // TODO: bind in JSON, maybe we wan't
  // explosion to cast shadows.
  if (cfg.occlusion) return;


  const idx = Math.floor(this.dt * this.rate);

  if (!this.sequence.sequence) {
    console.log(this);
    throw Error();
  }

  if (idx >= this.sequence.sequence.length) {
    this.done = true;
    return;
  }

  const ref = this.sequence.reference;
  const seq = this.sequence.sequence;

  const term = seq[idx];

  const tx = term[0];
  const ty = term[1];
  const w = ref.tileWidth;
  const h = ref.tileHeight;

  let x = this.cx - w / 2;
  let y = this.cy - h / 2;

  x -= g_viewport.getOX();
  y -= g_viewport.getOY();

  // TODO: I don't like the FastImage thing.
  // ctx.drawImage(img, x, y, w, h);
  ref.renderTile(ctx, tx, ty, x, y, w, h);
};
