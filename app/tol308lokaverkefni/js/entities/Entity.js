'use strict';

/* global spatialManager util g_world :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ======
// ENTITY
// ======

/*

Provides a set of common functions which can be "inherited" by all other
game Entities.

JavaScript's prototype-based inheritance system is unusual, and requires
some care in use. In particular, this "base" should only provide shared
functions... shared data properties are potentially quite confusing.

*/

function Entity() {}

Entity.prototype.setup = function (cfg) {
  // Apply all setup properies from the (optional) descriptor

  util.extendObject(this, cfg);

  // Get my (unique) spatial ID
  this._spatialID = spatialManager.getNewSpatialID();

  // I am not dead yet!
  this._isDeadNow = false;
};

Entity.prototype.hp = 100;
Entity.prototype.maxHP = 100;

Entity.prototype.setPos = function (cx, cy) {
  this.cx = cx;
  this.cy = cy;
};

Entity.prototype.getPos = function () {
  return { posX: this.cx, posY: this.cy };
};

Entity.prototype.getRadius = function () {
  return 0;
};

Entity.prototype.getSpatialID = function () {
  return this._spatialID;
};

Entity.prototype.kill = function () {
  this._isDeadNow = true;
};

/*
// TODO: maybe not applicable anymore.
Entity.prototype.findHitEntity = function () {
  const pos = this.getPos();

  const hitEntry = spatialManager.findEntityInRange(pos.posX, pos.posY, this.getRadius());

  return hitEntry;
};

// This is just little "convenience wrapper"
// TODO: maybe not applicable anymore.
Entity.prototype.isColliding = function () {
  return this.findHitEntity();
};
*/

/*

// TODO: remove
Entity.prototype.wrapPosition = function () {
  this.cx = util.wrapRange(this.cx, 0, g_world.getWidth());
  this.cy = util.wrapRange(this.cy, 0, g_world.getHeight());
};

*/
