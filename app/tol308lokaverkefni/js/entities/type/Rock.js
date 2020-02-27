'use strict';

/* global g_asset Entity util consts g_world SECS_TO_NOMINALS
spatialManager entityManager g_url audioManager :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====
// ROCK
// ====

// A generic contructor which accepts an arbitrary descriptor object
function Rock(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);


  // Default sprite and scale, if not otherwise specified
  this.sprite = this.sprite || g_asset.sprite.rock;
  this.scale = this.scale || 1;

  /*
    // Diagnostics to check inheritance stuff
    this._rockProperty = true;
    console.dir(this);
*/
  this.randomisePosition();
  const cond = spatialManager.register(this);

  let ITER = 0;
  const MAX_ITER = 100;

  // TODO scary
  while (cond && ITER < MAX_ITER) {
    ITER += 1;
    spatialManager.unregister(this);
    this.randomisePosition();
    spatialManager.register(this);
  }

  if (false) {
    this.cx = 100;
    this.cy = 100;
  }

  this.randomiseVelocity();
}

Rock.prototype = new Entity();

Rock.prototype.randomisePosition = function () {
  // Rock randomisation defaults (if nothing otherwise specified)
  this.cx = this.cx || Math.random() * g_world.getWidth();
  this.cy = this.cy || Math.random() * g_world.getHeight();
  this.rotation = this.rotation || 0;
};

Rock.prototype.randomiseVelocity = function () {
  const MIN_SPEED = 20;
  const MAX_SPEED = 70;

  const speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;
  const dirn = Math.random() * consts.FULL_CIRCLE;

  this.velX = this.velX || speed * Math.cos(dirn);
  this.velY = this.velY || speed * Math.sin(dirn);

  const MIN_ROT_SPEED = 0.5;
  const MAX_ROT_SPEED = 2.5;

  this.velRot = this.velRot ||
        util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Rock.prototype.update = function (du) {
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

Rock.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

Rock.prototype.takeBulletHit = function () {
  this.kill();

  if (this.scale > 0.25) {
    this._spawnFragment();
    this._spawnFragment();
    audioManager.play(g_url.audio.rockSplit);
  } else {
    audioManager.play(g_url.audio.rockEvaporate);
  }
};

Rock.prototype._spawnFragment = function () {
  entityManager.generateRock({
    cx: this.cx,
    cy: this.cy,
    scale: this.scale / 2,
  });
};

Rock.prototype.render = function (ctx, cfg) {
  if (!g_viewport.inOuterSquareCircle(this.cx, this.cy, this.getRadius())) return;


  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
};
