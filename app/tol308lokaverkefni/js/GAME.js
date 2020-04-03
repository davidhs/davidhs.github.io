'use strict';

/* global document util entityManager g_viewport g_canvas g_mouse lighting
shadows TextureAtlas Sprite g_main spatialManager FastImage assetManager
g_world Texture  :true */

// ====
// GAME
// ====

// Global URLs
let g_url = {}; // URLs are eventually placed here.

// Global Assets
let g_asset = {}; // Assets are loaded here.

// Which map to open.
let g_manifest;

let audioBuffer;
const menuAudio = new Audio('audio/menu.ogg');

const screenManager = new UIFrame();

let g_lights = [];

let g_map;


// BACKWARDS COMPATIBILITY, DON'T USE.
let g_master;


// Canvases (except g_canvas).
const g_background = document.createElement('canvas'); // Background
const g_midground = document.createElement('canvas'); // Midground
const g_foreground = document.createElement('canvas'); // Foreground
const g_top = document.createElement('canvas');
const g_hud = document.createElement('canvas'); // HUD

const g_occlusion = document.createElement('canvas'); // Occlusion map
const g_shadows = document.createElement('canvas'); // Shadows

const g_pre = document.createElement('canvas');


// Alexander
const g_radar = document.createElement('canvas'); // radar
const g_hudbar = document.createElement('canvas');

// document.getElementById('canvi').appendChild(g_occlusion);
// document.getElementById('canvi').appendChild(g_shadows);


// TEMPORARY GLOBALS

// Temporary stuff occlude walls.  TODO: remove me later


let g_tm;

// =============
// GATHER INPUTS
// =============

function gatherInputs() {}

// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`

// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

  if (!audioBuffer) {
    if (!g_muted) {
      audioBuffer = audioManager.play(g_url.audio.ambiance);
      audioBuffer.loop = true;
    }
  }

  if (g_muted) {
    if (audioBuffer) {
      audioBuffer.stop();
      audioBuffer = null;
    }
  }

  spatialManager.update(du);

  // Update entities.
  entityManager.update(du);

  // Alexander
  Minimap.update(du);

  HUD.update(du);
  // Set viewport to follow player.
  g_viewport.setOCX(entityManager.getPos().cx);
  g_viewport.setOCY(entityManager.getPos().cy);


  const player = entityManager.getPlayer();

  g_lights[0].x = player.cx;
  g_lights[0].y = player.cy;
}

// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`

// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
  // === SETUP & CLEARING ===

  // Get 2D contexts for canvases.
  const ctxb = g_background.getContext('2d');
  const ctxm = g_midground.getContext('2d');
  const ctxf = g_foreground.getContext('2d');
  const ctxo = g_occlusion.getContext('2d'); // Occlusion map context
  const ctxs = g_shadows.getContext('2d'); // Shadows context
  const ctxh = g_hud.getContext('2d'); // HUD
  const ctxp = g_pre.getContext('2d');
  const ctxt = g_top.getContext('2d');

  // Alexander
  const ctxr = g_radar.getContext('2d'); // radar
  const ctxhb = g_hudbar.getContext('2d'); // HUDBAR


  ctxb.imageSmoothingEnabled = false;
  ctxm.imageSmoothingEnabled = false;
  ctxf.imageSmoothingEnabled = false;
  ctxo.imageSmoothingEnabled = false;
  ctxs.imageSmoothingEnabled = false;
  ctxh.imageSmoothingEnabled = false;
  ctxp.imageSmoothingEnabled = false;
  ctxt.imageSmoothingEnabled = false;
  ctxr.imageSmoothingEnabled = false;
  ctxhb.imageSmoothingEnabled = false;


  // Width and height of rendering canvases.
  const w = g_canvas.width;
  const h = g_canvas.height;


  // Clear canvases.
  ctx.clearRect(0, 0, w, h);
  ctxb.clearRect(0, 0, w, h);
  ctxm.clearRect(0, 0, w, h);
  ctxf.clearRect(0, 0, w, h);
  ctxo.clearRect(0, 0, w, h);
  ctxs.clearRect(0, 0, w, h);
  ctxh.clearRect(0, 0, w, h);
  ctxp.clearRect(0, 0, w, h);
  ctxt.clearRect(0, 0, w, h);

  // Alexander
  ctxr.clearRect(0, 0, w, h);
  ctxhb.clearRect(0, 0, w, h);


  // === DRAWING TO VARIOUS CANVASES ===

  // --- BACKGROUND ---

  // Draw background.  TODO: remove later
  // g_asset.texture.background.render(ctxb);

  // Render better background.
  g_tm.renderBottom(ctxb);
  g_tm.renderMiddle(ctxb);
  // Draw alpha 0 background.  TODO: remove later
  // ctxb.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // --- MIDGROUND ----

  // Draw entities to midground.
  entityManager.render(ctxm, {
    categoryBlacklist: new Set(['explosions']),
  });

  g_tm.renderTop(ctxt);

  // --- FOREGROUND ---


  // === OCCLUSION ===

  // Add entities to occlusion map.
  if (false) {
    entityManager.render(ctxo, {
      occlusion: true,
    });
  }

  g_tm.renderMiddle(ctxo, {
    occlusion: true,
  });

  // Add "walls" to occlusion map.  TODO: remove later.
  // ctxo.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // Alexander

  // === RADAR ===
  Minimap.render(ctxr);

  // === HUDBAR ===

  HUD.render(ctxhb);


  // === SHADOWS ===


  // Lights!

  // TODO g_tm has light info

  const lights = g_lights;

  for (let i = 0; i < lights.length; i += 1) {
    const light = lights[i];
    const x = g_viewport.mapO2IX(light.x);
    const y = g_viewport.mapO2IY(light.y);
    const color = light.color;
    if (g_viewport.inInnerBoundsPoint(x, y, g_viewport.getIW() / 2, g_viewport.getIH() / 2)) {
      lighting.radialLight(ctxs, color, {
        occluder: g_occlusion,
        x,
        y,
      });
    }
  }


  // ctxs.filter = "blur(16px)";
  // ctxs.filter = 'drop-shadow(0 0 100 20)';


  // Subtract occluders from shadow

  ctxs.drawImage(g_occlusion, 0, 0);

  // === HUD ===

  // Draw Cursor
  if (g_mouse.getImage()) {
    g_mouse.render(ctxh);
  }


  // === DRAW TO BACK-RENDERING CANVAS ===

  // --- DRAW BACKGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_background, 0, 0);
  ctxp.globalAlpha = 1.0;
  // --- DRAW FOREGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_foreground, 0, 0);
  ctxp.globalAlpha = 1.0;

  // TEMPORARY
  // --- DRAW MIDGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_midground, 0, 0);
  ctxp.globalAlpha = 1.0;

  // --- DRAW LIGHTS/SHADOWS ---

  ctxp.globalAlpha = 1.0;
  ctxp.globalCompositeOperation = 'destination-in';
  ctxp.drawImage(g_shadows, 0, 0, w, h);


  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_top, 0, 0);
  ctxp.globalAlpha = 1.0;


  // Draw explosions
  entityManager.render(ctxp, {
    categoryWhitelist: new Set(['explosions']),
  });

  // --- DRAW HUD ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_hud, 0, 0);
  ctxp.globalAlpha = 1.0;

  // --- DRAW RADAR ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_radar, 0, 0);
  ctxp.globalAlpha = 1.0;

  // --- DRAW HUDBAR ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_hudbar, 0, 0);
  ctxp.globalAlpha = 1.0;

  // === DRAW TO RENDERING CANVAS ===

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(g_pre, 0, 0);


  /*
  ctx.fillstyle = "#000";
  ctx.fillRect(0,0,100,100);
  ctx.drawImage(g_radar); */

  // HUD
/*  ctx.fillstyle = "#ffffff";
  ctx.fillRect(0, g_viewport.getIH() -100, g_viewport.getIW(), 200);
  ctx.drawImage(g_hud, 0, g_viewport.getIH()-100); */


  // util.fillCircle(ctx, pcx, pcy, 10);
}


function setup(_map) {
  console.log('Loading..');

  g_map = _map;

  // Backwards compatibility.
  g_master = {
    map: g_map,
  };

  // --- Tiled Map ---

  g_tm = assetLoader.getItem(g_asset, g_map.cfg.tiledMap);

  const width = g_tm.tileWidth * g_tm.widthInTiles;
  const height = g_tm.tileHeight * g_tm.heightInTiles;


  g_viewport.stickToWorld(true);


  g_muted = g_manifest.cfg.activeManifest ? g_map.cfg.muted : false;

  // Setting world
  g_world.setWidth(width, 'px');
  g_world.setHeight(height, 'px');
  g_world.setTileWidth(g_tm.tileWidth);
  g_world.setTileHeight(g_tm.tileHeight);


  const viewportWidth = g_manifest.cfg.screen.width;
  const viewportHeight = g_manifest.cfg.screen.height;

  // Set "rendering" canvas.
  g_canvas.width = viewportWidth;
  g_canvas.height = viewportHeight;


  // Setting viewport
  g_viewport.setIW(viewportWidth);
  g_viewport.setIH(viewportHeight);

  g_viewport.setOW(viewportWidth);
  g_viewport.setOH(viewportHeight);


  // Set canvas width and heights.
  g_background.width = g_canvas.width;
  g_background.height = g_canvas.height;

  g_midground.width = g_canvas.width;
  g_midground.height = g_canvas.height;

  g_foreground.width = g_canvas.width;
  g_foreground.height = g_canvas.height;

  g_occlusion.width = g_canvas.width;
  g_occlusion.height = g_canvas.height;

  g_shadows.width = g_canvas.width;
  g_shadows.height = g_canvas.height;

  g_hud.width = g_canvas.width;
  g_hud.height = g_canvas.height;

  g_pre.width = g_canvas.width;
  g_pre.height = g_canvas.height;

  g_top.width = g_canvas.width;
  g_top.height = g_canvas.height;

  g_radar.width = g_canvas.width;
  g_radar.height = g_canvas.height;

  g_hudbar.width = g_canvas.width;
  g_hudbar.height = g_canvas.height;


  // --- Mouse ---

  // Set mouse cursor image.
  if (g_map.mouse.image) {
    g_mouse.setImage(assetLoader.getItem(g_asset, g_map.mouse.image));
  }

  // Enable cursor lock, if applicable.
  if (g_map.mouse.cursorLock) {
    g_mouse.enableCursorLock();
  }


  // --- Shadows ---

  // Initialize shadows: load in shader source code and
  // resolution of shadow.
  shadows.init(
    g_asset.raw.text.lights,
    g_asset.raw.text.shadowMap,
    g_asset.raw.text.shadowMask,
    g_manifest.cfg.shadowSize ? g_map.cfg.shadowSize : 64,
  );

  // --- Entity Manager ---

  const gpo = {
    sprite: assetLoader.getItem(g_asset, g_map.init.entities.player.sprite.path),
  };

  if (g_tm.objects && g_tm.objects.playerStart) {
    gpo.cx = g_tm.objects.playerStart[0].x + g_tm.objects.playerStart[0].width / 2;
    gpo.cy = g_tm.objects.playerStart[0].y + g_tm.objects.playerStart[0].height / 2;
    gpo.originalX = gpo.cx;
    gpo.originalY = gpo.cy;
  }

  // Assign a player a sprite image.
  entityManager.generatePlayer(gpo);

  // Initialize entity manager.
  entityManager.init();


  // --- Spatial Manager ---

  // Initialize spatial manager.
  spatialManager.init(g_world.getWidth(), g_world.getHeight());


  spatialManager.onready(() => {
    g_tm.addObstructions();
  });


  g_lights = [];

  // index 0 = player light
  g_lights.push({
    x: -1,
    y: -1,
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
  });

  const tmLights = g_tm.objects.light;

  if (tmLights) {
    for (let i = 0; i < tmLights.length; i += 1) {
      const light = tmLights[i];

      const po = {
        x: light.x + light.width / 2,
        y: light.y + light.height / 2,
        color: {
          r: 255,
          g: 255,
          b: 255,
        },
      };

      g_lights.push(po);
    }
  }

  console.log(g_url);


  // --- Start Game ---

  // Start game!
  g_main.mainInit();
}


// ==========
// START GAME
// ==========

function startGame() {
  // Adding asset loader processors.
  assetLoader.addProcessor('texture', Texture);
  assetLoader.addProcessor('textureAtlas', TextureAtlas);
  assetLoader.addProcessor('sequence', Sequence);
  assetLoader.addProcessor('sprite', Sprite);
  // assetLoader.addProcessor('fastImage', FastImage);
  assetLoader.addProcessor('tiledMap', TiledMap);
  assetLoader.addProcessor('tiledTileset', TiledTileset);


  loader.load({
    json: {
      assets: 'json/assets.json',
    },
  }, (response) => {
    const assets = response.json.assets;
    assetLoader.load(assets, (response) => {
      g_asset = response.assets;
      g_url = response.urls;
    });
  });


  // Event handling

  // TODO this should be loaded first
  mapHandler.getManifest((manifest) => {
    const canvas = g_canvas;

    // NNEEDS NOT BE HARDCODED!
    // screenManager.setDimensions(640, 480);

    screenManager.setDimensions(manifest.cfg.screen.width, manifest.cfg.screen.height);

    g_canvas.width = screenManager.getWidth();
    g_canvas.height = screenManager.getHeight();

    const mel = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      screenManager.press(x, y);
    };


    canvas.addEventListener('mousedown', mel);

    const ctx = canvas.getContext('2d');

    const startScreen = new UIContainer();

    const list1 = new UIList();

    const button1 = new UIButton(' Select Map ');
    const button2 = new UIButton(' About ');
    const button3 = new UIButton(' Exit ');

    button1.setWidth(300);

    button1.addEventListener('press', (evt) => {
      menuAudio.play();
      screenManager.selectCard(1);
      screenManager.render(ctx);
    });

    list1.addChild(button1);
    list1.addChild(new UIBlank());
    list1.addChild(new UIBlank());
    list1.addChild(button3);
    button3.addEventListener('press', (evt) => {
      window.location = 'http://deaz.dk/';
    });

    startScreen.addChild(list1);

    const mapSelectionScreen = new UIContainer();
    const list2 = new UIList();

    mapSelectionScreen.addChild(list2);

    screenManager.setLayout('card');
    screenManager.addChild(startScreen, 0);
    screenManager.addChild(mapSelectionScreen, 1);

    screenManager.setBackgroundColor('#f0f0f0');
    screenManager.selectCard(0);


    const maps = manifest.maps;

    g_manifest = manifest;

    const w = manifest.cfg.screen.width;
    const h = manifest.cfg.screen.height;

    g_canvas.width = w;
    g_canvas.height = h;

    screenManager.setDimensions(w, h);

    for (let i = 0, keys = Object.keys(maps); i < keys.length; i += 1) {
      const mapKey = keys[i];

      const mapThing = maps[mapKey];

      const mapName = mapThing.name;

      const btn = new UIButton(mapName || mapKey);

      // Except that I do want to create a bunch of functions!
      btn.addEventListener('press', (evt) => {
        menuAudio.play();
        console.log(`Loading: ${mapKey}`);
        canvas.removeEventListener('mousedown', mel);
        mapHandler.openMap(mapKey, setup);
      });
      list2.addChild(btn);
    }

    const button7 = new UIButton(' Back ');
    list2.addChild(new UIBlank());
    list2.addChild(button7);
    button7.addEventListener('press', (evt) => {
      menuAudio.play();
      screenManager.selectCard(0);
      screenManager.render(ctx);
    });


    loader.load({
      image: {
        background1: 'img/scifi_main_menu.jpg',
        background2: 'img/background2.jpg',
      },
    }, (assets) => {
      startScreen.setBackground(assets.image.background1);
      mapSelectionScreen.setBackground(assets.image.background2);
      screenManager.render(ctx);
    });
  });
}

startGame();


// =========================
// DEBUG STUFF, REMOVE LATER
// =========================
