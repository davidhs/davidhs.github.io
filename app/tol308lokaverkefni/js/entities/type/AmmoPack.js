'use strict';


/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function AmmoPack(cfg) {
  // Common inherited setup logic from Entity
  this.setup(cfg);

  if (!this.sprite) throw Error('NEED TO SET SPRITE TO CHARACTER');

  this._scale = this.sprite.scale;

  this._stuck = false;
}

// Inherit from Entity
AmmoPack.prototype = new Entity();

AmmoPack.prototype.rotation = 0;
AmmoPack.prototype.cx = 200;
AmmoPack.prototype.cy = 200;
AmmoPack.prototype.hp = 1;
AmmoPack.prototype.maxHP = 1;

AmmoPack.prototype._distSqPlayer = Number.POSITIVE_INFINITY;

AmmoPack.prototype.update = function (du) {
  // Unregister from spatial manager.
  spatialManager.unregister(this);

  if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  // Find target
  const player = entityManager.getPlayer();

  const _gx = this.cx - this.getRadius();
  const _gy = this.cy - this.getRadius();


  const directions = spatialManager.getDirection(_gx, _gy);

  const cx = player.cx;
  const cy = player.cy;

  let dx = 0;
  let dy = 0;

  if (directions) {
    dx = directions.x;
    dy = directions.y;
  }

  const pdx = Math.sign(player.cx - this.cx);
  const pdy = Math.sign(player.cy - this.cy);


  if (this._stuck || dx === 0 && dy === 0) {
    // dx = pdx;
    // dy = pdy;
    dx = 0.75 * pdx + 2 * Math.random() - 1;
    dy = 0.75 * pdy + 2 * Math.random() - 1;
  }

  const _dx = player.cx - this.cx;
  const _dy = player.cy - this.cy;
  const _distSq = _dx ** 2 + _dy ** 2;
  const _thresh = (g_viewport.getIW() * 1.5) ** 2;

  this._distSqPlayer = 0;

  if (_distSq > _thresh) {
    dx = 0;
    dy = 0;
  }
  const len = Math.sqrt(dx * dx + dy * dy);

  if (_distSq < 2 * this.getRadius() ** 2) {
    this.attack(du);
  }

  const oldX = this.cx;
  const oldY = this.cy;


  const newX = this.cx + du * this.velX;
  const newY = this.cy + du * this.velY;

  this.cx = newX;
  this.cy = newY;


  if (!g_world.inBounds(this.cx, this.cy, 0)) {
    this.cx = oldX;
    this.cy = oldY;
  }


  let spatialID = spatialManager.register(this);


  // Wall crap
  if (spatialID !== spatialManager.NO_CONFLICT) {
    this.velX += (2 * Math.random() - 1) * 0.5;
    this.velY += (2 * Math.random() - 1) * 0.5;


    const newX = oldX + du * this.velX;
    const newY = oldY + du * this.velY;

    if (spatialID !== spatialManager.NO_CONFLICT) {
      this.cx = newX;
      this.cy = newY;
      spatialID = spatialManager.register(this);
    }

    if (spatialID !== spatialManager.NO_CONFLICT) {
      this.cx = newX;
      this.cy = oldY;
      spatialID = spatialManager.register(this);
    }

    if (spatialID !== spatialManager.NO_CONFLICT) {
      this.cx = oldX;
      this.cy = newY;
      spatialID = spatialManager.register(this);
    }

    if (spatialID !== spatialManager.NO_CONFLICT) {
      this._stuck = true;
      this.cx = oldX;
      this.cy = oldY;
      spatialManager.register(this);
    }
  } else {
    this._stuck = false;
  }
  // Return sett til ad stoppa Lint villu (ma taka ut ef tetta gerir bug)
  return 0;
};

AmmoPack.prototype.attack = function (du) {
  entityManager.generateMedpackExpl({
    cx: this.cx,
    cy: this.cy,
  });
  const player = entityManager.getPlayer();
  player.pickupAmmo();
  this.kill();
};

AmmoPack.prototype.takeBulletHit = function () {
  this.kill();
};

AmmoPack.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

AmmoPack.prototype.render = function (ctx, cfg) {
  const origScale = this.sprite.scale;
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};
