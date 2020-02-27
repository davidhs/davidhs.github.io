'use strict';

const DEBUG_PLAYER = false;

/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function Player(descriptor) {
  // Common inherited setup logic from Entity
  this.setup(descriptor);

  if (!this.sprite) throw Error('NEED TO SET SPRITE TO CHARACTER');

  this._scale = this.sprite.scale;

  this._soundRunning = new Audio(g_url.running1);
  this._soundRunning.loop = true;
}


// Inherit from Entity
Player.prototype = new Entity();


Player.prototype._reset = function () {
  this.cx = this.originalX;
  this.cy = this.originalY;
  this.health = 100;
  kills = 0;
  GenericEnemyOne.prototype._reset();
  Terrorist.prototype._reset();
};

// Movements
Player.prototype.KEY_UP = keyCode('W');
Player.prototype.KEY_DOWN = keyCode('S');
Player.prototype.KEY_LEFT = keyCode('A');
Player.prototype.KEY_RIGHT = keyCode('D');

// Rendering properties
Player.prototype.rotation = 0;
Player.prototype.cx = 180;
Player.prototype.cy = 180;
Player.prototype.originalX = 180;
Player.prototype.originalY = 180;
Player.prototype.velX = 0;
Player.prototype.velY = 0;

// Misc
Player.prototype.RELOAD = keyCode('R');
Player.prototype.acceleration = 0.5;
Player.prototype.maxSpeed = 5;
Player.prototype.health = 100;

const ARMORY = [];
let weaponID = 0;
let kills = 0;

const PISTOL = {
  name: 'pistol',
  id: 1,
  auto: false,
  pickedUp: true,
  isActive: true,
  damage: 27,
  accuracy: 2,
  numBullets: 1,
  bulletSpeed: 14,
  fireRate: 5,
  reloadTime: 60,
  through: 0,
  ammo: 96,
  maxAmmo: 96,
  magazineSize: 12,
  magazineAmmo: 12,
};

const SHOTGUN = {
  name: 'shotgun',
  id: 2,
  auto: false,
  pickedUp: true,
  isActive: false,
  damage: 20,
  accuracy: 7,
  numBullets: 10,
  bulletSpeed: 15,
  fireRate: 30,
  reloadTime: 180,
  through: 0,
  ammo: 40,
  maxAmmo: 40,
  magazineSize: 8,
  magazineAmmo: 8,
};

const RIFLE = {
  name: 'rifle',
  id: 3,
  auto: true,
  pickedUp: true,
  isActive: false,
  damage: 86,
  accuracy: 2,
  numBullets: 1,
  bulletSpeed: 16,
  fireRate: 3,
  reloadTime: 120,
  through: 2,
  ammo: 90,
  maxAmmo: 90,
  magazineSize: 30,
  magazineAmmo: 30,
};

const SNIPER = {
  name: 'sniper',
  id: 4,
  auto: false,
  pickedUp: true,
  isActive: false,
  damage: 300,
  accuracy: 0,
  numBullets: 1,
  bulletSpeed: 20,
  fireRate: 15,
  reloadTime: 120,
  through: 5,
  ammo: 30,
  maxAmmo: 30,
  magazineSize: 10,
  magazineAmmo: 10,
};

const MG = {
  name: 'mg',
  id: 5,
  auto: true,
  pickedUp: true,
  isActive: false,
  damage: 70,
  accuracy: 3,
  numBullets: 1,
  bulletSpeed: 14,
  fireRate: 2,
  reloadTime: 300,
  through: 1,
  ammo: 300,
  maxAmmo: 300,
  magazineSize: 100,
  magazineAmmo: 100,
};

const RAY = {
  name: 'ray',
  type: 'beam',
  id: 6,
  auto: false,
  pickedUp: true,
  isActive: false,
  damage: 1000,
  accuracy: 0,
  numBullets: 1,
  bulletSpeed: 20,
  fireRate: 10,
  reloadTime: 1,
  through: 0,
  ammo: 30,
  maxAmmo: 30,
  magazineSize: 10,
  magazineAmmo: 10,
};

ARMORY.push(PISTOL);
ARMORY.push(SHOTGUN);
ARMORY.push(RIFLE);
ARMORY.push(SNIPER);
ARMORY.push(MG);
ARMORY.push(RAY);

// -------------- Shit Mix Begins -------------
function selectWeapons(evt) {
  const sel = (+String.fromCharCode(evt.keyCode));
  if (Number.isNaN(sel)) {
    return;
  }
  for (let i = 0; i < ARMORY.length; i += 1) {
    if (sel === ARMORY[i].id) {
      if (ARMORY[i].pickedUp) {
        weaponID = i;
        HUD.whichWeapon(i);
      }
      break;
    }
  }
}
// ------------- Shit Mix Ends -----------------

// When the player stops accelerating then this
// factor determines how quickly it halts.  A smaller
// value it'll take a while to come to a halt,
// like slowing down when ice skating, and a higher
// value will cause it to halt quicker.
Player.prototype.decay = 0.5;

Player.prototype.bulletCooldown = 0;
Player.prototype.reloadCooldown = 0;

Player.prototype.update = function (du) {
  spatialManager.unregister(this);

  this.bulletCooldown = Math.max(this.bulletCooldown - du, 0);
  this.reloadCooldown = Math.max(this.reloadCooldown - du, 0);

  HUD.getReloadTimer(this.reloadCooldown);

  // Convert Viewport/Canvas coordinates to World coordinates.
  const mx = g_viewport.getOCX() + g_mouse.x - g_canvas.width / 2;
  const my = g_viewport.getOCY() + g_mouse.y - g_canvas.height / 2;
  const dx = mx - this.cx;
  const dy = my - this.cy;

  this.rotation = Math.atan2(dy, dx);

  // TODO: unregister
  // spatialManager.unregister(this);

  // TODO: check for death
  // if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  // TODO: do movement


  let noHorAcc = true;
  let noVerAcc = true;

  const EPS = 0.1;

  if (g_keys[this.KEY_UP]) {
    this.velY = Math.max(this.velY - this.acceleration * du, -this.maxSpeed);
    noVerAcc = false;
  }

  if (g_keys[this.KEY_DOWN]) {
    this.velY = Math.min(this.velY + this.acceleration * du, this.maxSpeed);
    noVerAcc = false;
  }

  if (g_keys[this.KEY_LEFT]) {
    this.velX = Math.max(this.velX - this.acceleration * du, -this.maxSpeed);
    noHorAcc = false;
  }

  if (g_keys[this.KEY_RIGHT]) {
    this.velX = Math.min(this.velX + this.acceleration * du, this.maxSpeed);
    noHorAcc = false;
  }


  const slowDown = 1.0 / (1.0 + this.decay * du);

  if (noHorAcc) this.velX *= slowDown;
  if (noVerAcc) this.velY *= slowDown;

  // =====
  // AUDIO
  // =====

  if (Math.abs(this.velX) > EPS || Math.abs(this.velY) > EPS) {
    // In motion
    if (DEBUG_PLAYER) console.log('Player location: ', this.cx / 32, this.cy / 32);
    if (!this._soundRunning) {
      this._soundRunning = audioManager.play(g_url.audio.running1);
    }
  }

  if (Math.abs(this.velX) < EPS && Math.abs(this.velY) < EPS) {
    this._soundRunning = null;
  }

  // ======
  // FIRING
  // ======

  // TODO: Handle firitng

  if (g_mouse.isDown) {
    if (ARMORY[weaponID].magazineAmmo > 0) {
      this.fireBullet();
      if (DEBUG_PLAYER) console.log(`Left in clip: ${ARMORY[weaponID].magazineAmmo}`);
      if (!ARMORY[weaponID].auto) {
        g_mouse.isDown = false;
      }
    }
  }

  if (eatKey(this.RELOAD)) {
    this.reloadWeapon();
  }

  const oldX = this.cx;
  const oldY = this.cy;

  const newX = this.cx + du * this.velX;
  const newY = this.cy + du * this.velY;

  this.cx = newX;
  this.cy = newY;

  // redraw player position on minimap
  Minimap.playerPosition(this.cx, this.cy);


  if (!g_noClip) {
    if (!g_world.inBounds(this.cx, this.cy, 0)) {
      this.cx = oldX;
      this.cy = oldY;
    }

    let spatialID = spatialManager.register(this);


    // Wall crap
    if (spatialID !== spatialManager.NO_CONFLICT) {
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
        this.cx = oldX;
        this.cy = oldY;
        spatialManager.register(this);
      }
    }

    if (!spatialManager.isRegistered(this)) {
      // Last attempt
      spatialManager.register(this);
      if (!spatialManager.isRegistered(this)) {
        throw Error();
      }
    }
  }
};

Player.prototype.getCooldown = function () {
  return this.reloadCooldown;
};

Player.prototype.getArmory = function () {
  return ARMORY;
};

Player.prototype.getSelectedWeapon = function () {
  return ARMORY[weaponID].id;
};

Player.prototype.getAmmoStatus = function () {
  return ARMORY[weaponID].ammo;
};

Player.prototype.getMagazineStatus = function () {
  return ARMORY[weaponID].magazineAmmo;
};

Player.prototype.getMagazineSize = function () {
  return ARMORY[weaponID].magazineSize;
};

Player.prototype.getBulletDamage = function () {
  return ARMORY[weaponID].damage;
};

Player.prototype.getKillCount = function () {
  return kills;
};

Player.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

Player.prototype.updateKills = function () {
  kills = GenericEnemyOne.prototype.getKillCount() +
  Terrorist.prototype.getKillCount();
};

Player.prototype.reloadWeapon = function () {
  if (DEBUG_PLAYER) console.log(`Reload ${ARMORY[weaponID].ammo} bullets left`);
  if (DEBUG_PLAYER) console.log(`in ${ARMORY[weaponID].name}`);
  if (ARMORY[weaponID].magazineAmmo === ARMORY[weaponID].magazineSize ||
  ARMORY[weaponID].ammo === 0) {
    return;
  }
  this.bulletCooldown = ARMORY[weaponID].reloadTime;
  this.reloadCooldown = ARMORY[weaponID].reloadTime;
  //
  if (ARMORY[weaponID].magazineAmmo !== 0) {
    ARMORY[weaponID].ammo += ARMORY[weaponID].magazineAmmo;
    ARMORY[weaponID].magazineAmmo = 0;
  }
  if (ARMORY[weaponID].ammo >= ARMORY[weaponID].magazineSize) {
    ARMORY[weaponID].magazineAmmo = ARMORY[weaponID].magazineSize;
    ARMORY[weaponID].ammo -= ARMORY[weaponID].magazineSize;
  } else {
    ARMORY[weaponID].magazineAmmo = ARMORY[weaponID].ammo;
    ARMORY[weaponID].ammo -= ARMORY[weaponID].ammo;
  }
};

// TODO: maybe we wan't different bullets?
Player.prototype.fireBullet = function () {
  if (!g_mouse.isDown) return;
  if (this.bulletCooldown > 0) return;

  this.bulletCooldown = ARMORY[weaponID].fireRate;

  // TODO: bind in JSON how long each bullet lives
  // until it fades away.
  this.bulletCooldown += 0.1 * SECS_TO_NOMINALS;

  const angle = Math.PI / 2 + this.rotation;

  const dX = +Math.sin(angle);
  const dY = -Math.cos(angle);

  const launchDist = this.getRadius();

  const relVel = Math.max(this.velX, this.velY);

  const speed = ARMORY[weaponID].bulletSpeed;

  const red = 0.01;

  const cx = this.cx + dX * launchDist;
  const cy = this.cy + dY * launchDist;

  const rotation = this.rotation;

  for (let i = 0; i < ARMORY[weaponID].numBullets; i += 1) {
    const weaponAccuracy = Math.random() *
    (ARMORY[weaponID].accuracy) -
    ARMORY[weaponID].accuracy / 2;

    const velX = dX * speed + weaponAccuracy;
    const velY = dY * speed + weaponAccuracy;

    entityManager.fireBullet(
      cx,
      cy,
      velX,
      velY,
      rotation,
      ARMORY[weaponID].damage,
      ARMORY[weaponID].through,
      ARMORY[weaponID].type,
    );
  }
  ARMORY[weaponID].magazineAmmo -= 1;
  this.updateKills();
};

Player.prototype.takeDamage = function (hp) {
  this.health -= hp;
  if (this.health < 0) {
    this._reset();
  }
};

Player.prototype.pickupLife = function (hp) {
  if (this.health + hp >= 100) {
    this.health += hp;
  } else {
    this.health = 100;
  }
};

Player.prototype.pickupAmmo = function () {
  ARMORY[weaponID].ammo = ARMORY[weaponID].maxAmmo;
};

Player.prototype.render = function (ctx, cfg) {
  // TODO: maybe we wan't the player to cast shadows,
  // sometimes.
  if (cfg && cfg.occlusion) return;

  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};

document.onkeyup = selectWeapons;
