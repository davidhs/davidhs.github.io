/**
 * @file Entry point. Wires the DOM controls to the audio player and the
 * spectrum view, and persists the user's settings.
 */

import { NoisePlayer, DEFAULT_LOW_CUT_HZ } from './noise-player.js';
import { SpectrumView } from './spectrum-view.js';
import { ALPHA_MIN, ALPHA_MAX } from './noise-engine.js';

/** @typedef {import('./spectrum-view.js').Rgb} Rgb */

/** localStorage key holding the persisted settings. @type {string} */
const STORAGE_KEY = 'noise';

/** Slider units per unit of α, so the range input can stay integer-stepped. */
const SLIDER_SCALE = 100;

/** Distance in α within which the readout uses a plain colour name. */
const NAME_SNAP = 0.15;

/** Low-cut range, in Hz. The slider is logarithmic between these. */
const LOW_CUT_MIN_HZ = 20;
const LOW_CUT_MAX_HZ = 200;

/** How long after the last slider movement to persist settings. @type {number} */
const SAVE_DELAY_MS = 400;

/**
 * Minimum gap between spectrum redraws, i.e. a 30 fps cap.
 *
 * The analyser is heavily smoothed, so the curve crawls and 30 fps is
 * indistinguishable from 60. Drawing is the most expensive thing this page does
 * on the main thread — and far more so on a phone, where the canvas has several
 * times the pixels and the CPU is much slower — so halving it is free quality-wise
 * and meaningful for battery.
 * @type {number}
 */
const FRAME_INTERVAL_MS = 1000 / 30;

/**
 * Accent colours anchored to the canonical noise colours. Interpolated between
 * stops so the accent tracks the slider continuously.
 * @type {Array<{alpha: number, rgb: Rgb}>}
 */
const PALETTE = [
  { alpha: -2, rgb: [160, 107, 255] },
  { alpha: -1, rgb: [74, 168, 255] },
  { alpha: 0, rgb: [232, 236, 242] },
  { alpha: 1, rgb: [255, 143, 176] },
  { alpha: 2, rgb: [201, 116, 58] },
  { alpha: 4, rgb: [138, 78, 40] }
];

/**
 * Canonical colour names by exponent. "Black" is the informal name for
 * exponents past brown; there is no standard term.
 * @type {Array<{alpha: number, name: string}>}
 */
const COLOR_NAMES = [
  { alpha: -2, name: 'Violet' },
  { alpha: -1, name: 'Blue' },
  { alpha: 0, name: 'White' },
  { alpha: 1, name: 'Pink' },
  { alpha: 2, name: 'Brown' },
  { alpha: 4, name: 'Black' }
];

const dom = {
  power: /** @type {HTMLButtonElement} */ (document.getElementById('power')),
  color: /** @type {HTMLInputElement} */ (document.getElementById('color')),
  volume: /** @type {HTMLInputElement} */ (document.getElementById('volume')),
  lowCut: /** @type {HTMLInputElement} */ (document.getElementById('lowCut')),
  lowCutValue: /** @type {HTMLElement} */ (document.getElementById('lowCutValue')),
  name: /** @type {HTMLElement} */ (document.getElementById('colorName')),
  meta: /** @type {HTMLElement} */ (document.getElementById('colorMeta')),
  status: /** @type {HTMLElement} */ (document.getElementById('status')),
  canvas: /** @type {HTMLCanvasElement} */ (document.getElementById('scope')),
  scopeToggle: /** @type {HTMLButtonElement} */ (document.getElementById('scopeToggle'))
};

const player = new NoisePlayer();
const spectrum = new SpectrumView(dom.canvas);

/** Handle of the pending animation frame, or 0 when idle. @type {number} */
let frameHandle = 0;

/** Timestamp of the last spectrum redraw, for the frame cap. @type {number} */
let lastFrameAt = 0;

/**
 * Whether the spectrum canvas is actually on screen. Scrolling it out of view —
 * easy to do on a phone, where the controls and explanation run well past one
 * screen — stops the redraw loop entirely rather than animating something nobody
 * can see.
 * @type {boolean}
 */
let scopeVisible = true;

/**
 * Whether the spectrum animates. Off by default: the idealised line already
 * shows what the colour slider does, and animating is the most expensive thing
 * this page does on the main thread.
 * @type {boolean}
 */
let scopeLive = false;

/**
 * Current colour exponent from the slider.
 * @returns {number} α in [−2, 2].
 */
function currentAlpha() {
  return Number(dom.color.value) / SLIDER_SCALE;
}

/**
 * Current volume as a linear gain. The slider is squared so the lower half of
 * its travel gets more resolution, which matches how loudness is perceived.
 *
 * @returns {number} Linear gain in [0, 1].
 */
function currentVolume() {
  return (Number(dom.volume.value) / 100) ** 2;
}

/**
 * Current low-cut corner. The slider is logarithmic so the useful 20–60 Hz
 * region, where speaker behaviour changes fastest, gets most of the travel.
 *
 * @returns {number} Corner frequency in Hz.
 */
function currentLowCut() {
  const t = Number(dom.lowCut.value) / 100;
  return LOW_CUT_MIN_HZ * (LOW_CUT_MAX_HZ / LOW_CUT_MIN_HZ) ** t;
}

/**
 * Inverse of {@link currentLowCut}, for restoring the slider position.
 *
 * @param {number} hz Corner frequency in Hz.
 * @returns {number} Slider position in [0, 100].
 */
function lowCutToSlider(hz) {
  const t = Math.log(hz / LOW_CUT_MIN_HZ) / Math.log(LOW_CUT_MAX_HZ / LOW_CUT_MIN_HZ);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
}

/**
 * The accent colour in effect, rewritten in place by {@link updateAccent}.
 *
 * Held as module state rather than recomputed per frame: the render loop needs
 * it 60 times a second but it only changes when the colour slider moves, and
 * returning a fresh array each time would allocate for no reason.
 *
 * @type {{rgb: Rgb, css: string}}
 */
const accent = { rgb: [255, 143, 176], css: 'rgb(255,143,176)' };

/**
 * Recomputes {@link accent} by interpolating the palette at a given exponent.
 *
 * @param {number} alpha Spectral exponent.
 * @returns {void}
 */
function updateAccent(alpha) {
  let i = 0;
  while (i < PALETTE.length - 2 && alpha > PALETTE[i + 1].alpha) i++;
  const lo = PALETTE[i], hi = PALETTE[i + 1];
  const t = Math.min(1, Math.max(0, (alpha - lo.alpha) / (hi.alpha - lo.alpha)));
  for (let k = 0; k < 3; k++) {
    accent.rgb[k] = Math.round(lo.rgb[k] + (hi.rgb[k] - lo.rgb[k]) * t);
  }
  accent.css = `rgb(${accent.rgb[0]},${accent.rgb[1]},${accent.rgb[2]})`;
}

/**
 * Names a colour: the canonical name when close enough to one, otherwise the
 * two names it sits between.
 *
 * @param {number} alpha Spectral exponent.
 * @returns {string} Display name, e.g. `"Pink"` or `"White → Pink"`.
 */
function labelFor(alpha) {
  let nearest = COLOR_NAMES[0], best = Infinity;
  for (const entry of COLOR_NAMES) {
    const d = Math.abs(alpha - entry.alpha);
    if (d < best) { best = d; nearest = entry; }
  }
  if (best <= NAME_SNAP) return nearest.name;

  // Plain scan rather than filter/find: this runs on every slider event, and
  // those allocate an intermediate array each time for no reason.
  let below = COLOR_NAMES[0], above = COLOR_NAMES[COLOR_NAMES.length - 1];
  for (const entry of COLOR_NAMES) {
    if (entry.alpha < alpha) below = entry;
    else { above = entry; break; }
  }
  return `${below.name} → ${above.name}`;
}

/**
 * Reads persisted settings, ignoring anything malformed.
 *
 * @returns {{alpha?: number, volume?: number, lowCutHz?: number, scopeLive?: boolean}}
 *   Saved settings.
 */
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/** Handle of the pending settings write, or 0 when none. @type {number} */
let saveTimer = 0;

/**
 * Writes the current slider positions through to storage.
 *
 * Quota or privacy-mode failures are ignored: losing the setting is not worth
 * breaking playback over.
 *
 * @returns {void}
 */
function writeSettings() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      alpha: currentAlpha(),
      volume: Number(dom.volume.value),
      lowCutHz: currentLowCut(),
      scopeLive
    }));
  } catch {
    /* not fatal */
  }
}

/**
 * Queues a settings write, coalescing a whole gesture into one.
 *
 * A slider drag fires roughly 60 input events a second. Each `setItem` is cheap
 * for this page — it lands in an in-memory map, about 7 µs — but it still sends
 * a mutation to the browser process and dirties the storage area for eventual
 * commit to disk. These values only need to survive a reload, so one write per
 * gesture is enough. {@link writeSettings} is also called when the page is
 * hidden, so a setting is never lost by closing the tab mid-drag.
 *
 * @returns {void}
 */
function saveSettings() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeSettings, SAVE_DELAY_MS);
}

/**
 * Syncs the readout, accent colour and stored settings to the sliders.
 *
 * @returns {void}
 */
function refresh() {
  const alpha = currentAlpha();
  updateAccent(alpha);
  document.documentElement.style.setProperty('--accent', accent.css);
  dom.name.textContent = labelFor(alpha);
  dom.meta.textContent = `α = ${alpha.toFixed(2)} · ${(-3.01 * alpha).toFixed(1)} dB/octave`;
  dom.lowCutValue.textContent = `${Math.round(currentLowCut())} Hz`;
  saveSettings();
}

/**
 * Applies a colour change: readout, accent, engine, and — when the spectrum is
 * frozen — a redraw so the static line follows the slider.
 *
 * Kept separate from {@link refresh} because the idealised line depends only on
 * the colour; redrawing the canvas for volume or low-cut changes would be work
 * with nothing to show for it.
 *
 * @returns {void}
 */
function applyColor() {
  refresh();
  player.setColor(currentAlpha());
  if (!frameHandle) renderFrame();
}

/**
 * Draws one spectrum frame, scheduling the next while playback continues and the
 * canvas is on screen. Redraws are capped at {@link FRAME_INTERVAL_MS}.
 *
 * @param {number} [now] Timestamp supplied by `requestAnimationFrame`.
 * @returns {void}
 */
function renderFrame(now = 0) {
  frameHandle = 0;

  if (!scopeLive || !player.playing) {
    // One static frame, then stop.
    spectrum.renderIdeal(currentAlpha(), currentLowCut(), accent.rgb);
    return;
  }
  if (!scopeVisible) return;                // nothing to see; don't reschedule

  frameHandle = requestAnimationFrame(renderFrame);
  if (now - lastFrameAt < FRAME_INTERVAL_MS) return;
  lastFrameAt = now;
  spectrum.render(player.analyser, accent.rgb);
}

/**
 * Starts or stops playback and updates the transport button.
 *
 * @returns {Promise<void>}
 */
async function toggle() {
  if (player.playing) {
    player.stop();
    dom.power.textContent = 'Play';
    dom.power.classList.remove('on');
    renderFrame();
    return;
  }

  dom.power.disabled = true;
  try {
    await player.start();
  } finally {
    dom.power.disabled = false;
  }
  dom.power.textContent = 'Stop';
  dom.power.classList.add('on');
  dom.status.textContent = player.description;
  if (!frameHandle) renderFrame();
}

const saved = loadSettings();
if (typeof saved.alpha === 'number') {
  dom.color.value = String(Math.round(saved.alpha * SLIDER_SCALE));
}
if (typeof saved.volume === 'number') {
  dom.volume.value = String(saved.volume);
}
dom.lowCut.value = String(lowCutToSlider(
  typeof saved.lowCutHz === 'number' ? saved.lowCutHz : DEFAULT_LOW_CUT_HZ
));
scopeLive = saved.scopeLive === true;
dom.scopeToggle.setAttribute('aria-pressed', String(scopeLive));

dom.color.min = String(ALPHA_MIN * SLIDER_SCALE);
dom.color.max = String(ALPHA_MAX * SLIDER_SCALE);

// Position the colour ticks at their true α, since the range is asymmetric.
for (const button of document.querySelectorAll('.ticks button')) {
  const alpha = Number(button.dataset.alpha);
  const pct = (alpha - ALPHA_MIN) / (ALPHA_MAX - ALPHA_MIN) * 100;
  /** @type {HTMLElement} */ (button).style.left = `${pct}%`;
}

dom.power.addEventListener('click', toggle);

dom.scopeToggle.addEventListener('click', () => {
  scopeLive = !scopeLive;
  dom.scopeToggle.setAttribute('aria-pressed', String(scopeLive));
  dom.scopeToggle.title = scopeLive ? 'Freeze spectrum' : 'Animate spectrum';
  saveSettings();
  if (!frameHandle) renderFrame();
});

dom.color.addEventListener('input', applyColor);

dom.volume.addEventListener('input', () => {
  refresh();
  player.setVolume(currentVolume());
});

dom.lowCut.addEventListener('input', () => {
  refresh();
  player.setLowCut(currentLowCut());
  if (!frameHandle) renderFrame();      // the frozen curve shows the low cut too
});

for (const button of document.querySelectorAll('.ticks button')) {
  button.addEventListener('click', () => {
    dom.color.value = String(Math.round(Number(button.dataset.alpha) * SLIDER_SCALE));
    applyColor();
  });
}

document.addEventListener('keydown', (event) => {
  const tag = /** @type {HTMLElement} */ (event.target).tagName;
  if (event.code === 'Space' && !/^(BUTTON|INPUT|SUMMARY)$/.test(tag)) {
    event.preventDefault();
    toggle();
  }
});

// Redraw whenever the canvas box changes — window resize, rotation, the mobile
// URL bar collapsing. Without this the backing store keeps its old dimensions
// and the browser rescales whatever was last drawn, which squashes the grid
// labels. Only needed while the loop is idle; when it is animating, every frame
// re-fits the canvas anyway.
const refit = () => { if (!frameHandle) renderFrame(); };
if (typeof ResizeObserver === 'function') {
  new ResizeObserver(refit).observe(dom.canvas);
} else {
  window.addEventListener('resize', refit);
}

// Stop drawing when the spectrum scrolls off screen, and pick up again when it
// comes back. requestAnimationFrame already stops for a hidden tab; this covers
// the canvas being merely scrolled past, which is the common case on a phone.
if (typeof IntersectionObserver === 'function') {
  new IntersectionObserver((entries) => {
    scopeVisible = entries[entries.length - 1].isIntersecting;
    if (scopeVisible && player.playing && !frameHandle) renderFrame();
  }).observe(dom.canvas);
}

// Block pinch-zoom. iOS Safari deliberately ignores `user-scalable=no` in the
// viewport tag, so these WebKit-only gesture events are the only lever; double-tap
// zoom is handled by `touch-action: manipulation` in the CSS. This does override an
// accessibility affordance, which is only defensible here because the interface is
// large controls and a graph with no fine print to magnify.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}

/**
 * Whether hiding this page will interrupt audio.
 *
 * Only iOS and iPadOS suspend the audio session when the page is backgrounded or
 * the screen locks; there we need to fade out first, or the render is cut
 * mid-waveform and the click rings the speaker. Everywhere else, hidden tabs keep
 * playing — which is the normal way to use this — so fading would be a
 * regression. Platform detection is the wrong tool most of the time; this is a
 * platform-specific behaviour, so it is the right tool here.
 *
 * The `maxTouchPoints` clause catches iPadOS, which reports itself as a Mac.
 * @type {boolean}
 */
const AUDIO_STOPS_WHEN_HIDDEN =
  /iP(hone|od|ad)/.test(navigator.platform) ||
  (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);

// Flush a queued write before the page can go away. `pagehide` covers navigation
// and the back/forward cache; `visibilitychange` covers being backgrounded on
// mobile, where `pagehide` may never fire.
const flushSettings = () => { if (saveTimer) writeSettings(); };
window.addEventListener('pagehide', flushSettings);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushSettings();
    if (AUDIO_STOPS_WHEN_HIDDEN) player.duckForBackground();
  } else if (AUDIO_STOPS_WHEN_HIDDEN) {
    player.restoreFromBackground();
  }
});

player.setColor(currentAlpha());
player.setVolume(currentVolume());
player.setLowCut(currentLowCut());
refresh();
renderFrame();
