
'use strict';

function Items(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  // Default sprite and scale, if not otherwise specified
  this.sprite = this.sprite || g_asset.sprite.Items;
  this.scale = this.scale || 1;

  this.randomisePosition();
  const cond = spatialManager.register(this);
}

Items.prototype = new Entity();

Items.prototype.randomisePosition = function () {
  this.cx = this.cx || Math.random() * g_world.getWidth();
  this.cy = this.cy || Math.random() * g_world.getHeight();
  this.rotation = this.rotation || 0;
};

Items.prototype.update = function (du) {
  spatialManager.unregister(this);

  if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  const oldX = this.cx;
  const oldY = this.cy;

  this.cx += this.velX * du;
  this.cy += this.velY * du;

  if (!g_world.inBounds(this.cx, this.cy, 0)) {
    this.cx = oldX;
    this.cy = oldY;
    this.velX = -this.velX;
    this.velY = -this.velY;
  }


  this.rotation += 1 * this.velRot;
  this.rotation = util.wrapRange(
    this.rotation,
    0, consts.FULL_CIRCLE,
  );

  const status = spatialManager.register(this);

  if (status) {
    this.cx = oldX;
    this.cy = oldY;
    this.velX = -this.velX;
    this.velY = -this.velY;
    spatialManager.register(this);
  }

  return entityManager.OK;
};

Items.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

Items.prototype.render = function (ctx, cfg) {
  if (!g_viewport.inOuterSquareCircle(this.cx, this.cy, this.getRadius())) return;


  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
};
