const Minimap = (function () {
  let cx = 0;
  let cy = 0;

  const tilewidth = 0;
  const tileheight = 0;
  let worldwidth = 0;
  let worldheight = 0;
  let width = 0;
  let height = 0;

  // position of player
  let p_cx = 0;
  let p_cy = 0;

  function playerPosition(x, y) {
    const qx = x / worldwidth;
    const qy = y / worldheight;
    p_cx = (qx * width) + cx;
    p_cy = (qy * height) + cy;
  }

  let minimap3 = new Image();
  let minimap1 = new Image();


  function drawMinimap(ctx) {
    if (g_master.map.name === 'map3') {
      ctx.beginPath();
      ctx.drawImage(minimap3, cx, cy, width, height);
      if (p_cx <= worldwidth && p_cx >= cx && p_cy <= height && p_cy >= 0) {
        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.rect(p_cx, p_cy, 5, 5);
        ctx.fill();
      }
    }
    else if(g_master.map.name === 'Yet another test! (2)'){
      ctx.beginPath();
      ctx.drawImage(minimap1, cx, cy, width, height);
      if(p_cx <= worldwidth && p_cx >= cx && p_cy <= height && p_cy >= 0){
        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.rect(p_cx, p_cy, 5, 5);
        ctx.fill();
      }
    }
  }


  function update(du) {
    worldwidth = g_world.getWidth();

    worldheight = g_world.getHeight();
    cx = (g_viewport.getIW() / 8) * 5;
    cy = 0;
    width = (g_viewport.getIW() / 8) * 3;
    height = (g_viewport.getIH() / 8) * 3;
  }

  function render(ctx) {
      ctx.globalAlpha = 0.4;
      drawMinimap(ctx);

    // get images
    minimap3 = g_asset.raw.image.minimap3;
    minimap1 = g_asset.raw.image.minimap1;
  }


  return {
    update,
    render,
    playerPosition,
  };
}());
