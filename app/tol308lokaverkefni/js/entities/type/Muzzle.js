'use strict';

/* global audioManager g_url Entity NOMINAL_UPDATE_INTERVAL spatialManager
 g_world entityManager g_asset :true */

// A generic contructor which accepts an arbitrary descriptor object
function Muzzle(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  // TODO: bind in JSON.
  // audioManager.play(g_url.muzzleFire);
}

Muzzle.prototype = new Entity();

// Initial, inheritable, default values
Muzzle.prototype.rotation = 0;
Muzzle.prototype.cx = 200;
Muzzle.prototype.cy = 200;

// Convert times from milliseconds to "nominal" time units.

// TODO: bind in JSON
Muzzle.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Muzzle.prototype.update = function (du) {
  return entityManager.OK;
};

Muzzle.prototype.render = function (ctx, cfg) {
  if (cfg && cfg.occlusion) return;


  // TODO: bind in JSON.
  g_asset.sprite.muzzle.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);


  ctx.globalAlpha = 1;
};
