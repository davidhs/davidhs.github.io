'use strict';

/* global audioManager g_url Entity NOMINAL_UPDATE_INTERVAL spatialManager
 g_world entityManager g_asset :true */

// A generic contructor which accepts an arbitrary descriptor object
function Powerups(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  // TODO self assignment is pointless.
  // this.sprite = this.sprite;

  audioManager.play(g_url.audio.powerup);
}

Powerups.prototype = new Entity();


Powerups.prototype.update = function (du) {
  spatialManager.unregister(this);

  if (this.pickUpPower) return entityManager.KILL_ME_NOW;

  if (!g_world.inBounds(this.cx, this.cy)) return entityManager.KILL_ME_NOW;

  const potentialCollision = spatialManager.register(this);

  if (potentialCollision) {
    const hitEntity = this.findHitEntity();

    if (hitEntity) {
      spatialManager.unregister(this);
      const canTakeHit = hitEntity.takePowerupsHit;
      if (canTakeHit) canTakeHit.call(hitEntity);

      audioManager.play(g_url.audio.explosion1);

      entityManager.generateExplosion({
        cx: this.cx,
        cy: this.cy,
      });

      return entityManager.KILL_ME_NOW;
    } else if (potentialCollision < spatialManager.MIN_ENTITY) {
      audioManager.play(g_url.audio.explosion1);
      spatialManager.unregister(this);
      entityManager.generateExplosion({
        cx: this.cx,
        cy: this.cy,
      });
      return entityManager.KILL_ME_NOW;
    }

    spatialManager.register(this);
  }


  return entityManager.OK;
};

Powerups.prototype.render = function (ctx, cfg) {
  if (cfg && cfg.occlusion) return;

  // TODO: bind in JSON, or just throw away.
  const fadeThresh = Powerups.prototype.lifeSpan / 3;

  if (this.lifeSpan < fadeThresh) {
    ctx.globalAlpha = this.lifeSpan / fadeThresh;
  }

  // TODO: bind in JSON.
  g_asset.sprite.Powerups.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);

  ctx.globalAlpha = 1;
};
