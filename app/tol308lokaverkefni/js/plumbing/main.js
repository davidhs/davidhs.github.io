'use strict';

/* global eatKey g_ctx update render window g_keys gatherInputs g_prevUpdateDu :true */

// ========
// MAINLOOP
// ========

// The mainloop is one big object with a fairly small public interface
// (e.g. init, iter, gameOver), and a bunch of private internal helper methods.
//
// The "private" members are identified as such purely by the naming convention
// of having them begin with a leading underscore. A more robust form of privacy,
// with genuine name-hiding *is* possible in JavaScript (via closures), but I
// haven't adopted it here.
//
const g_main = {
  // "Frame Time" is a (potentially high-precision) frame-clock for animations
  _frameTime_ms: null,
  _frameTimeDelta_ms: null,
};

// Step mode
const KEY_STEP_MODE = 'O'.charCodeAt(0);
const KEY_NEXT_FRAME = 'N'.charCodeAt(0);

g_main.stepMode = false;

// Perform one iteration of the mainloop
g_main.iter = function (frameTime) {
  // Enable/disable step mode
  if (eatKey(KEY_STEP_MODE)) this.stepMode = !this.stepMode;

  // Use the given frameTime to update all of our game-clocks
  this._updateClocks(frameTime);


  if (!this.stepMode || (this.stepMode && eatKey(KEY_NEXT_FRAME))) {
    // Perform the iteration core to do all the "real" work
    this._iterCore(this._frameTimeDelta_ms);

    // Diagnostics, such as showing current timer values etc.
    this._debugRender(g_ctx);
  }


  // Request the next iteration if needed
  if (!this._isGameOver) this._requestNextIteration();
};

g_main._updateClocks = function (frameTime) {
  // First-time initialisation
  if (this._frameTime_ms === null) this._frameTime_ms = frameTime;

  // Track frameTime and its delta
  this._frameTimeDelta_ms = frameTime - this._frameTime_ms;
  this._frameTime_ms = frameTime;
};

// Simple voluntary quit mechanism
//
const KEY_QUIT = 'Q'.charCodeAt(0);
function requestedQuit() {
  return g_keys[KEY_QUIT];
}

g_main._iterCore = function (dt) {
  // Handle QUIT
  if (requestedQuit()) {
    this.gameOver();
    return;
  }

  gatherInputs();
  update(dt);
  render(g_ctx);
};

g_main._isGameOver = false;

g_main.gameOver = function () {
  this._isGameOver = true;
  console.log('gameOver: quitting...');
};


// Annoying shim for cross-browser compat
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;


// This needs to be a "global" function, for the "window" APIs to callback to
function mainIterFrame(frameTime) {
  g_main.iter(frameTime);
}

g_main._requestNextIteration = function () {
  window.requestAnimationFrame(mainIterFrame);
};

// Mainloop-level debug-rendering

const TOGGLE_TIMER_SHOW = 'T'.charCodeAt(0);

g_main._doTimerShow = false;

g_main._debugRender = function (ctx) {
  if (eatKey(TOGGLE_TIMER_SHOW)) this._doTimerShow = !this._doTimerShow;

  if (!this._doTimerShow) return;

  const x = 50;
  const y = 350;
  const fps = 1000 / this._frameTimeDelta_ms;
  const oldFillStyle = ctx.fillStyle;
  ctx.fillStyle = '#0f0';
  ctx.fillText(`FT ${this._frameTime_ms}`, x, y + 10);
  ctx.fillText(`FD ${this._frameTimeDelta_ms}`, x, y + 20);
  ctx.fillText(`UU ${g_prevUpdateDu}`, x, y + 30);
  ctx.fillText('FrameSync ON', x, y + 40);
  ctx.fillText(`FPS: ${fps}`, x, y + 50);
  ctx.fillStyle = oldFillStyle;
};

g_main.init = function () {
  // Grabbing focus is good, but it sometimes screws up jsfiddle,
  // so it's a risky option during "development"
  //
  // window.focus(true);

  this._requestNextIteration();
};

g_main.mainInit = function () {
  g_main.init();
};
