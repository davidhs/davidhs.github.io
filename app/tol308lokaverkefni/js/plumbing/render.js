'use strict';

/* global eatKey util renderSimulation g_isUpdateOdd spatialManager :true */

// GENERIC RENDERING

// TODO: maybe place these global constants in globals.js?

let g_doClear = true;
let g_doBox = false;
let g_undoBox = false;
let g_doFlipFlop = false;
let g_doRender = true;

let g_showCollisionVolumes = false;

let g_frameCounter = 1;

const TOGGLE_CLEAR = 'C'.charCodeAt(0);
const TOGGLE_BOX = 'B'.charCodeAt(0);
const TOGGLE_UNDO_BOX = 'U'.charCodeAt(0);
const TOGGLE_FLIPFLOP = 'F'.charCodeAt(0);
const TOGGLE_RENDER = '0'.charCodeAt(0);

const TOGGLE_SHOW_COLLISION_VOLUME = 'H'.charCodeAt(0);

function render(ctx) {
  // Process various option toggles
  //
  if (eatKey(TOGGLE_CLEAR)) g_doClear = !g_doClear;
  if (eatKey(TOGGLE_BOX)) g_doBox = !g_doBox;
  if (eatKey(TOGGLE_UNDO_BOX)) g_undoBox = !g_undoBox;
  if (eatKey(TOGGLE_FLIPFLOP)) g_doFlipFlop = !g_doFlipFlop;
  if (eatKey(TOGGLE_RENDER)) g_doRender = !g_doRender;
  if (eatKey(TOGGLE_SHOW_COLLISION_VOLUME)) g_showCollisionVolumes = !g_showCollisionVolumes;

  // I've pulled the clear out of `renderSimulation()` and into
  // here, so that it becomes part of our "diagnostic" wrappers
  //
  if (g_doClear) util.clearCanvas(ctx);

  // The main purpose of the box is to demonstrate that it is
  // always deleted by the subsequent "undo" before you get to
  // see it...
  //
  // i.e. double-buffering prevents flicker!
  //
  if (g_doBox) util.fillBox(ctx, 200, 200, 50, 50, 'red');


  // The core rendering of the actual game / simulation
  //
  if (g_doRender) renderSimulation(ctx);


  // This flip-flip mechanism illustrates the pattern of alternation
  // between frames, which provides a crude illustration of whether
  // we are running "in sync" with the display refresh rate.
  //
  // e.g. in pathological cases, we might only see the "even" frames.
  //
  if (g_doFlipFlop) {
    const boxX = 250;
    const boxY = g_isUpdateOdd ? 100 : 200;

    // Draw flip-flop box
    util.fillBox(ctx, boxX, boxY, 50, 50, 'green');

    // Display the current frame-counter in the box...
    ctx.fillText(g_frameCounter % 1000, boxX + 10, boxY + 20);
    // ..and its odd/even status too
    const text = g_frameCounter % 2 ? 'odd' : 'even';
    ctx.fillText(text, boxX + 10, boxY + 40);
  }

  // Optional erasure of diagnostic "box",
  // to illustrate flicker-proof double-buffering
  //
  if (g_undoBox) ctx.clearRect(200, 200, 50, 50);

  if (g_showCollisionVolumes) spatialManager.render(ctx);

  g_frameCounter += 1;
}
