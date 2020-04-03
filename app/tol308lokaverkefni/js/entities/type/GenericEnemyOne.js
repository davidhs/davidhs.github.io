'use strict';


/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function GenericEnemyOne(cfg) {
  // Common inherited setup logic from Entity
  this.setup(cfg);

  if (!this.sprite) throw Error('NEED TO SET SPRITE TO CHARACTER');

  this._scale = this.sprite.scale;

  this._stuck = false;
}

// Inherit from Entity
GenericEnemyOne.prototype = new Entity();

GenericEnemyOne.prototype.rotation = 0;
GenericEnemyOne.prototype.cx = 200;
GenericEnemyOne.prototype.cy = 200;
GenericEnemyOne.prototype.velX = 0;
GenericEnemyOne.prototype.velY = 0;
GenericEnemyOne.prototype.acceleration = 0.3;
GenericEnemyOne.prototype.maxSpeed = 4;
GenericEnemyOne.prototype.hp = 100;
GenericEnemyOne.prototype.maxHP = 100;


// When the player stops accelerating then this
// factor determines how quickly it halts.  A smaller
// value it'll take a while to come to a halt,
// like slowing down when ice skating, and a higher
// value will cause it to halt quicker.
GenericEnemyOne.prototype.decay = 0.5;
GenericEnemyOne.prototype.attackCooldown = 50;
GenericEnemyOne.prototype._distSqPlayer = Number.POSITIVE_INFINITY;

let killedGeneric = 0;

GenericEnemyOne.prototype._reset = function () {
  killedGeneric = 0;
};

GenericEnemyOne.prototype.update = function (du) {
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

  this.rotation = Math.atan2(_dy, _dx);

  this._distSqPlayer = 0;

  if (_distSq > _thresh) {
    dx = 0;
    dy = 0;
  }


  // const dx = player.cx - this.cx;
  // const dy = player.cy - this.cy;

  const len = Math.sqrt(dx * dx + dy * dy);

  if (_distSq < 2 * this.getRadius() ** 2) {
    this.attack(du);
  }


  const udx = dx / len;
  const udy = dy / len;

  this.velX = udx * this.maxSpeed * this.hp / this.maxHP;
  this.velY = udy * this.maxSpeed * this.hp / this.maxHP;

  // COLLISION CHECKING

  if (this.velX > this.maxSpeed) this.velX = this.maxSpeed;
  if (this.velX < -this.maxSpeed) this.velX = -this.maxSpeed;
  if (this.velY > this.maxSpeed) this.velY = this.maxSpeed;
  if (this.velY < -this.maxSpeed) this.velY = -this.maxSpeed;


  // AUDIO

  const EPS = 0.1;


  if (Math.abs(this.velX) > EPS || Math.abs(this.velY) > EPS) {
    // In motion
    if (DEBUG_PLAYER) console.log('Player location: ', this.cx / 32, this.cy / 32);
    if (!this._soundRunning && len < 2 * g_viewport.getIW()) {
      this._soundRunning = audioManager.play(g_url.audio.running1, true);
      if (this._soundRunning) this._soundRunning.volume = 0.1;
    }
  }

  if (Math.abs(this.velX) < EPS && Math.abs(this.velY) < EPS) {
    this._soundRunning = null;
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

GenericEnemyOne.prototype.attack = function (du) {
  this.attackCooldown -= 1.0 * du;

  if (this.attackCooldown > 0) return;

  this.attackCooldown += 50;

  const handle = audioManager.play(g_url.audio.clawing);
  if (handle) handle.volume = 0.1;

  const player = entityManager.getPlayer();
  player.takeDamage(5);
};

GenericEnemyOne.prototype.takeBulletHit = function () {
  this.hp -= Player.prototype.getBulletDamage();
  audioManager.play(g_url.audio.impact1);

  if (this.hp <= 0) {
    audioManager.play(g_url.audio.dying);
    this.kill();
    killedGeneric += 1;
  }
};

GenericEnemyOne.prototype.getKillCount = function () {
  return killedGeneric;
};

GenericEnemyOne.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

GenericEnemyOne.prototype.render = function (ctx, cfg) {
  // TODO: maybe we wan't the player to cast shadows,
  // sometimes.


  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};
