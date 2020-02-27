'use strict';

/* global Rock Bullet Player g_asset AnimatedImage :true */

// ==============
// Entity Manager
// ==============

// A "module" that handles arbitrary entity-management.

const entityManager = (function () {
  // "PRIVATE" DATA

  const DEBUG = false;

  const OK = 1;
  // A special return value, used by other objects,
  // to request the blessed release of death!
  const KILL_ME_NOW = -1;


  const categories = {
    muzzle: [],
    medicpack: [],
    ammopack: [],
    bullets: [],
    players: [],
    genericEnemiesOne: [],
    terrorist: [],
    explosions: [],
    medicExplosion: [],
    terrexplotions: [],
    blood: [],
  };

  const categoryNames = Object.keys(categories);


  let _spawnRegions = [];


  // PUBLIC METHODS

  // TODO: maybe we want to fire different types of bullets.
  // figure out how to do that.
  function fireBullet(cx, cy, velX, velY, rotation, damage, through, type) {
    const bullet = new Bullet({
      cx,
      cy,
      velX,
      velY,
      rotation,
      damage,
      through,
      type,
    });
    if (DEBUG) console.log(bullet);
    categories.bullets.push(bullet);
  }

  function generateMuzzle(cx, cy, rotation) {
    const muzzle = new Muzzle({
      cx,
      cy,
      rotation,
    });
    if (DEBUG) console.log(muzzle);
    categories.muzzle.push(muzzle);
  }

  function generatePlayer(descr) {
    categories.players.push(new Player(descr));
  }

  function generateItems(descr) {
    categories.items.push(new Items(descr));
  }

  // function generateWeapon(descr) {
  //   _weapon.push(new Weapon(descr));
  //   console.log(_weapon);
  // }

  // TODO: bind in JSON which type explosion,
  // and explosion rate.

  function generateExplosion(descr) {
    descr.sequence = g_asset.sequence.explosion3;
    categories.explosions.push(new AnimatedImage(descr));
  }

  function generateMedpackExpl(descr) {
    descr.sequence = g_asset.sequence.explosionMedic;
    categories.medicExplosion.push(new AnimatedImage(descr));
  }

  function generateTerrexplosion(descr) {
    descr.sequence = g_asset.sequence.terrorExplosion;
    categories.terrexplotions.push(new AnimatedImage(descr));
  }

  function generateBlood(descr) {
    descr.sequence = g_asset.sequence.blood3;
    categories.blood.push(new AnimatedImage(descr));
  }

  function generateGenericEnemyOne(cfg) {
    categories.genericEnemiesOne.push(new GenericEnemyOne(cfg));
  }

  function generateTerrorist(cfg) {
    categories.terrorist.push(new Terrorist(cfg));
  }

  function generateMedicPack(cfg) {
    categories.medicpack.push(new MedicPack(cfg));
  }

  function generateAmmoPack(cfg) {
    categories.ammopack.push(new AmmoPack(cfg));
  }


  function update(du) {
    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      const items = categories[categoryName];

      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];

        const status = item.update(du);

        if (status === KILL_ME_NOW) {
          delete items[j];
          items.splice(j, 1);
        }
      }
    }



    for (let i = 0; i < _spawnRegions.length; i += 1) {
      const spawnRegion = _spawnRegions[i];

      spawnRegion.duration += du;

      if (spawnRegion.duration >= spawnRegion.rate || !spawnRegion.init) {
        spawnRegion.init = true;
        spawnRegion.duration = 0;

        for (let j = 0; j < spawnRegion.quantity; j += 1) {
          const cx = spawnRegion.x + Math.random() * spawnRegion.w;
          const cy = spawnRegion.y + Math.random() * spawnRegion.h;


          generateGenericEnemyOne({
            cx,
            cy,
            sprite: g_asset.sprite.donkey,
          });
        }

        for (let j = 0; j < spawnRegion.quantity; j += 1) {
          const cx = spawnRegion.x + Math.random() * spawnRegion.w;
          const cy = spawnRegion.y + Math.random() * spawnRegion.h;


          generateTerrorist({
            cx,
            cy,
            sprite: g_asset.sprite.terrorist,
          });
        }

        for (let j = 0; j < spawnRegion.quantity; j += 1) {
          const cx = spawnRegion.x + Math.random() * spawnRegion.w;
          const cy = spawnRegion.y + Math.random() * spawnRegion.h;


          generateMedicPack({
            cx,
            cy,
            sprite: g_asset.sprite.medicpack,
          });
        }

        for (let j = 0; j < spawnRegion.quantity; j += 1) {
          const cx = spawnRegion.x + Math.random() * spawnRegion.w;
          const cy = spawnRegion.y + Math.random() * spawnRegion.h;


          generateAmmoPack({
            cx,
            cy,
            sprite: g_asset.sprite.ammopack,
          });
        }
      }
    }
  }

  function render(ctx, cfg) {
    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      // If the configuration has a blacklist for the categories
      // and this category name is in it, then do not render.
      if (cfg.categoryBlacklist && cfg.categoryBlacklist.has(categoryName)) {
        continue;
      }

      // If the configuration has a whitelist for the categories
      // and this category is not found in the whitelist, then do not render.
      if (cfg.categoryWhitelist && !cfg.categoryWhitelist.has(categoryName)) {
        continue;
      }
      const items = categories[categoryName];

      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];

        item.render(ctx, cfg);
      }
    }
  }

  function init() {
    console.log(g_tm);

    // spawn regions

    if (g_tm && g_tm.objects && g_tm.objects.spawnRegion) {
      const spawnRegions = g_tm.objects.spawnRegion;
      // console.log("LOOK AT ME:", spawnRegions);

      for (let i = 0; i < spawnRegions.length; i += 1) {
        const spawnRegion = spawnRegions[i];
        // console.log(spawnRegion);

        const type = spawnRegion.props.type;
        const respawn = spawnRegion.props.respawn;
        const quantity = spawnRegion.props.quantity;
        const x = spawnRegion.x;
        const y = spawnRegion.y;
        const w = spawnRegion.width;
        const h = spawnRegion.height;
        const rate = 1000;
        const init = false;
        const duration = 0;

        _spawnRegions.push({
          type, respawn, quantity, x, y, w, h, rate, init, duration,
        });
      }
    }

    // spawn entities

    if (g_tm && g_tm.objects && g_tm.objects.spawnEntity) {
      const spawnEntities = g_tm.objects.spawnEntity;
    }


    for (let i = 0; i < 0; i += 1) {
      const cx = g_world.getWidth() * Math.random();
      const cy = g_world.getHeight() * Math.random();

      generateGenericEnemyOne({
        cx,
        cy,
        sprite: g_asset.sprite.donkey,
      });
    }

    for (let i = 0; i < 0; i += 1) {
      const cx = g_world.getWidth() * Math.random();
      const cy = g_world.getHeight() * Math.random();

      generateMedicPack({
        cx,
        cy,
        sprite: g_asset.sprite.medicpack,
      });
    }

    for (let i = 0; i < 0; i += 1) {
      const cx = g_world.getWidth() * Math.random();
      const cy = g_world.getHeight() * Math.random();

      generateAmmoPack({
        cx,
        cy,
        sprite: g_asset.sprite.ammopack,
      });
    }
  }

  function getPlayer() {
    if (categories.players.length > 0) {
      return categories.players[0];
    }
    return null;
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateMedpackExpl,
    generateMedicPack,
    generateAmmoPack,
    generateExplosion,
    generateTerrexplosion,
    generateBlood,
    generatePlayer,
    generateGenericEnemyOne,
    generateTerrorist,
    generateMuzzle,
    OK,
    KILL_ME_NOW,


    getPos: getPlayer,
    getPlayer,
  };
}());
