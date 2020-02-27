
'use strict';

/* global document shadows  :true */

// This code isn't very good. :/
const lighting = (function () {
  const lightCanvas = document.createElement('canvas');
  const lightCtx = lightCanvas.getContext('2d');

  const shadowCanvas = document.createElement('canvas');
  const shadowCtx = shadowCanvas.getContext('2d');

  // document.getElementById('canvi').appendChild(lightCanvas);
  // document.getElementById('canvi').appendChild(shadowCanvas);

  function radialLight(ctx, color, cfg) {
    const r = color.r || 0;
    const g = color.g || 0;
    const b = color.b || 0;
    const a = color.a || 255;

    // /


    const x = cfg.x || 0;
    const y = cfg.y || 0;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const shadowMask = shadows.getShadowMask(cfg);
    shadowCtx.fillStyle = '#f0';
    shadowCtx.fillRect(0, 0, w, h);
    shadowCtx.fill();
    lightCtx.drawImage(shadowMask, 0, 0);


    shadowCanvas.width = w;
    shadowCanvas.height = h;

    lightCanvas.width = w;
    lightCanvas.height = h;

    // Yeah... this doesn't work.
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
    lightCtx.fillRect(0, 0, w, h);
    lightCtx.fill();

    const s = Math.max(w, h);

    const sx = 0;
    const sy = 0;
    const sw = shadowMask.width;
    const sh = shadowMask.width;

    const dx = x - s / 2;
    const dy = y - s / 2;
    const dw = s;
    const dh = s;

    // Nobody told me how to blend the images.

    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = '#f0';
    lightCtx.fillRect(0, 0, w, h);
    lightCtx.fill();
    lightCtx.globalCompositeOperation = 'destination-in';
    lightCtx.drawImage(
      shadowMask,
      sx, sy, sw, sh,
      dx, dy, dw, dh,
    );

    const oldGCO = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.globalCompositeOperation = oldGCO;
  }

  return {
    radialLight,
  };
}());
