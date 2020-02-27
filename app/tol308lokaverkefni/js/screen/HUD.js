'use strict';

/* global  document :true */

const HUD = (function () {
  // globals for the HUDBAR itself
  let H_cx = 0;
  let H_cy = 0;
  let H_width = 0;
  let H_height = 0;

  // globals for health bar
  let xHP = 0;
  let yHP = 0;
  let widthHP = 0;
  let heightHP = 0;
  let hpLost = 0;

  // globals for WEAPONS
  let W_cx = 0;
  let W_cy = 0;
  const WEAPONS = Player.prototype.getArmory();
  let ammo = 0;
  let magazineSize = 0;
  let magazineAmmo = 0;
  let reloading = 0;

  let g_sx = 0;
  let g_sy = 0;
  let g_sw = 0;
  let g_sh = 0;

  // globals for Numbers
  let n_sx = 0;
  let n_sy = 0;
  let n_sw = 0;
  let n_sh = 0;
  let n_dy = 0;
  let n_dx = 0;
  let n_dw = 0;
  let n_dh = 0;

  // create images
  let background = new Image();
  let heart = new Image();
  let exists = new Image();
  let notexists = new Image();
  let selected = new Image();
  let line = new Image();
  let guns = new Image();


  // =================
  // Weapon_handler
  // =================

  // id from Player.js
  function whichWeapon(id) {
    for (let i = 0; i < WEAPONS.length; i += 1) {
      WEAPONS[i].isActive = false;
    }
    WEAPONS[id].isActive = true;
  }

  function getReloadTimer(time) {
    reloading = time;
  }

  // =================
  // Hp handler
  // =================

  function damage(Damage) {
    if (hpLost < 0) {
      hpLost += Damage;
    }
  }

  // =================
  // draw functions
  // =================


  // draw function for healtbar

  function draw_healthbar(ctx, x, y, perclost, width, thickness) {
    if (perclost <= 0.5) {
      ctx.beginPath();
      ctx.fillStyle = '#00cc00';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else if (perclost <= 0.70) {
      ctx.beginPath();
      ctx.fillStyle = '#ff9933';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else if (perclost <= 0.9) {
      ctx.beginPath();
      ctx.fillStyle = '#ff3300';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.fillStyle = '#ff0000';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    }
  }

  // draw tiny heart next to lifebar
  function draw_heart(ctx, x, y, width, size) {
    ctx.beginPath();
    ctx.drawImage(heart, x, y, width, size);
  }

  // draw gun
  function drawWeapon(ctx, x, y) {
    for (let i = 0; i < WEAPONS.length; i += 1) {
      if (WEAPONS[i].isActive) {
        ctx.drawImage(guns, g_sx, g_sy, g_sw, g_sh, x - 20, y, 100, 40);
      }
      g_sx += g_sw;
    }
  }

  function drawAmmo(ctx, ammo, magsize, magstatus) {
    ctx.beginPath();
    ctx.font = '12px Georgia';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(magstatus, W_cx + 100, W_cy + 20);


    ctx.beginPath();
    ctx.drawImage(line, W_cx + 105, W_cy + 10, 20, 25);

    ctx.beginPath();
    ctx.font = '10px Georgia';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(ammo, W_cx + 117, W_cy + 30);
  }

  function drawKillCount(ctx, counter) {
    ctx.beginPath();
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`Kills: ${counter}`, 50, W_cy + 30);
  }

  function reloadNotify(ctx) {
    ctx.beginPath();
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`RELOAD! (press 'R')`, W_cx - 50, W_cy - 50);
  }

  function reloadingNotify(ctx) {
    ctx.beginPath();
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`- RELOADING -`, W_cx - 50, W_cy - 50);
  }

  function drawNumber(ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
    for (let i = 0; i < WEAPONS.length; i += 1) {
      if (WEAPONS[i].isActive) {
        ctx.drawImage(selected, sx, sy, sw, sh, dx, dy, dw, dh);
      } else if (WEAPONS[i].pickedUp) {
        ctx.drawImage(exists, sx, sy, sw, sh, dx, dy, dw, dh);
      } else {
        ctx.drawImage(notexists, sx, sy, sw, sh, dx, dy, dw, dh);
      }
      sx += sw;
      dx += dw;
    }
  }

  // draw the hud bar
  function draw(ctx) {
    ctx.clearRect(H_cx, H_cy, H_width, H_height);
    ctx.beginPath();
    ctx.drawImage(
      background,
      0, 0, background.width, background.height,
      H_cx, H_cy, H_width, H_height,
    );
    // draw healthbar
    /*
    if (hpLost < 1) {
      draw_healthbar(ctx, xHP, yHP, hpLost, widthHP, heightHP);
    }
    */
    const player = entityManager.getPlayer();
    const hpPercLost = 1.0 - player.health / 100;
    if (hpPercLost < 1) {
      draw_healthbar(ctx, xHP, yHP, hpPercLost, widthHP, heightHP);
    }
    if (magazineAmmo === 0) {
      reloadNotify(ctx);
    }

    if (reloading > 0) {
      reloadingNotify(ctx);
    }
    draw_heart(ctx, xHP - 22, yHP + 1, 20, 15);
    drawKillCount(ctx, kills);
    drawWeapon(ctx, W_cx, W_cy);
    drawAmmo(ctx, ammo, magazineSize, magazineAmmo);
    drawNumber(ctx, n_sx, n_sy, n_sw, n_sh, n_dx, n_dy, n_dw, n_dh);
  }

  function update(du) {
    // update HUDBAR
    H_cx = 0;
    H_cy = g_viewport.getIH() - 80;
    H_width = g_viewport.getIW();
    H_height = 80;

    // update health
    xHP = (g_viewport.getIW() / 12);
    yHP = H_cy + 20;
    widthHP = (H_width / 8);
    heightHP = 15;

    // update WEAPONS
    W_cx = ((g_viewport.getIW() / 10) * 5);
    W_cy = H_cy + 35;
    g_sx = 0;
    g_sy = 0;
    g_sw = guns.width / 6;
    g_sh = guns.height;

    // update Numbers
    n_sx = 0;
    n_sy = 0;
    n_sw = exists.width / 8;
    n_sh = exists.height;
    n_dx = (g_viewport.getIW() / 10) * 4;
    n_dy = H_cy;
    n_dw = 30;
    n_dh = 30;

    // update ammo
    ammo = Player.prototype.getAmmoStatus();
    magazineAmmo = Player.prototype.getMagazineStatus();
    magazineSize = Player.prototype.getMagazineSize();
    kills = Player.prototype.getKillCount();
  }

  function render(ctx) {
    draw(ctx);

    // get images
    background = g_asset.raw.image.Hbackground;
    heart = g_asset.raw.image.heart;
    exists = g_asset.raw.image.exists;
    notexists = g_asset.raw.image.notexists;
    selected = g_asset.raw.image.selected;
    line = g_asset.raw.image.Line;
    guns = g_asset.raw.image.guns;
  }


  return {
    whichWeapon,
    getReloadTimer,
    update,
    render,
    damage,
  };
}());
