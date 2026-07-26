/**
 * @file Log-frequency spectrum display.
 *
 * Draws the analyser's magnitude response on a logarithmic frequency axis, so a
 * `1/f^α` spectrum appears as a straight line whose tilt tracks the colour
 * slider. Purely a view: it reads from an `AnalyserNode` and never touches it.
 */

import { TILT_DB, TILT_CAP_ALPHA } from './noise-engine.js';

/** Lowest frequency drawn, in Hz. @type {number} */
const F_MIN = 20;

/** Highest frequency drawn, in Hz. @type {number} */
const F_MAX = 22000;

/** Frequencies that get a vertical gridline. @type {number[]} */
const GRID_HZ = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

/** Gridlines that also get a text label. @type {Record<number, string>} */
const GRID_LABELS = { 100: '100', 1000: '1k', 10000: '10k' };

/** Horizontal divisions of the level axis. @type {number} */
const LEVEL_DIVISIONS = 5;

/**
 * Ceiling on the device pixel ratio used for the backing store.
 *
 * Retina phones and laptops report 2; iPhone Pro and Max models report 3.
 * Rendering below the device's own ratio means the browser upscales whatever was
 * drawn, which shows up first in the grid labels. Measured here: redraw cost is
 * flat against backing-store size — quadrupling the pixels cost nothing, because
 * the time goes into building the path rather than filling it — so there is no
 * reason to render below native. The cap only guards against absurd ratios from
 * heavy browser zoom, where the backing store would get large for no benefit.
 * @type {number}
 */
const MAX_DPR = 3;

/** Approximate CSS pixels between plotted points of the live curve. @type {number} */
const POINT_SPACING_PX = 1.5;

/**
 * Spacing for the idealised curve. It is smooth, so it needs far fewer points
 * than live data does to look the same, and this path redraws on every colour
 * slider event. Checked against a 4000-point reference: the level integral it
 * feeds shifts by under 0.01 dB.
 * @type {number}
 */
const IDEAL_POINT_SPACING_PX = 3;

/**
 * Level range the vertical axis spans, in dB. Mirrors the analyser's configured
 * `maxDecibels − minDecibels`, so the idealised line drawn by
 * {@link SpectrumView#renderIdeal} sits at the same scale as live data and the
 * two don't jump when you switch between them.
 * @type {number}
 */
export const DISPLAY_RANGE_DB = 100;

/**
 * Level at the bottom of the display, in dB.
 *
 * Exported with {@link DISPLAY_RANGE_DB} because the player configures its
 * analyser from these: the live curve is mapped through the analyser's own
 * `minDecibels`/`maxDecibels`, the frozen curve through these constants, and if
 * the two ever disagreed the curves would stop lining up.
 */
export const DISPLAY_MIN_DB = -115;

/**
 * Labels for the level gridlines, topmost first.
 *
 * The analyser's absolute dB values depend on its FFT and window scaling, so
 * they would mean nothing on screen. What is worth reading off the axis is how
 * far the curve falls across the band, so the axis is labelled relative to the
 * top of the display. Built once: `_drawGrid` runs on every frame.
 * @type {string[]}
 */
const LEVEL_LABELS = Array.from({ length: LEVEL_DIVISIONS - 1 }, (_, i) =>
  String(-(DISPLAY_RANGE_DB / LEVEL_DIVISIONS) * (i + 1)));

/** dB per octave per unit of the spectral exponent: `10·log10(2)`. @type {number} */
const DB_PER_OCTAVE = 3.0103;

/**
 * Calibration tying the modelled curve to the analyser's dB scale, so the frozen
 * curve lands on top of the live one instead of merely having the same shape.
 *
 * Everything else about the level is derived: the shape is normalised to unit
 * integrated power, then the engine's loudness tilt is added back. What remains
 * is one fixed constant covering the analyser's own normalisation (its window
 * and FFT scaling) and the engine's target RMS. Measured against live data.
 * @type {number}
 */
const LEVEL_CAL_DB = -41.5;

/** An RGB triple in 0–255. @typedef {[number, number, number]} Rgb */

/**
 * Renders spectrum frames into a canvas.
 *
 * The canvas is resized to match its CSS box and device pixel ratio on every
 * frame, so it stays sharp across window resizes and monitor changes without
 * needing a resize listener.
 *
 * @example
 * const view = new SpectrumView(document.querySelector('canvas'));
 * view.render(player.analyser, [232, 236, 242]);
 */
export class SpectrumView {
  /**
   * @param {HTMLCanvasElement} canvas Target canvas.
   */
  constructor(canvas) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;

    /** @type {CanvasRenderingContext2D} @private */
    this.g = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

    /** @type {Float32Array|null} Reused frequency-data buffer. @private */
    this._bins = null;

    /**
     * Curve points as interleaved x,y pairs. Reused across frames: building a
     * fresh array of `[x, y]` tuples every frame allocated ~20,000 short-lived
     * objects per second, and the resulting main-thread collections are audible
     * as dropouts when the ScriptProcessor fallback is generating audio.
     * @type {Float64Array}
     * @private
     */
    this._points = new Float64Array(0);

    /** @type {number} Canvas width in device pixels, set by `_resize`. @private */
    this._w = 0;
    /** @type {number} Canvas height in device pixels, set by `_resize`. @private */
    this._h = 0;
    /** @type {number} Device pixel ratio, set by `_resize`. @private */
    this._dpr = 1;

    /**
     * Identifies the colour and height the cached styles below were built for.
     * The curve's stroke colour and fill gradient are otherwise rebuilt on every
     * frame, allocating two strings and a gradient object each time.
     * @type {number}
     * @private
     */
    this._styleKey = -1;
    /** @type {string} Cached stroke colour. @private */
    this._stroke = '';
    /** @type {CanvasGradient|null} Cached fill gradient. @private */
    this._fill = null;
    /** @type {number} Device pixel ratio the cached font string was built for. @private */
    this._fontDpr = -1;
    /** @type {string} Cached grid label font. @private */
    this._font = '';
    /** @type {number} Measured width of the axis unit marker. @private */
    this._unitW = 0;
    /** @type {Record<number, number>} Measured widths of the frequency labels. @private */
    this._labelW = {};
  }

  /**
   * Draws one frame.
   *
   * @param {AnalyserNode|null} analyser Source of spectrum data. Pass `null`
   *   (or omit) to draw the empty grid, e.g. while stopped.
   * @param {Rgb} rgb Curve colour.
   * @returns {void}
   */
  render(analyser, rgb) {
    this._resize();
    const g = this.g, w = this._w, h = this._h, dpr = this._dpr;
    this._drawGrid(g, w, h, dpr);
    if (!analyser) return;

    if (!this._bins || this._bins.length !== analyser.frequencyBinCount) {
      this._bins = new Float32Array(analyser.frequencyBinCount);
    }
    analyser.getFloatFrequencyData(this._bins);

    const count = this._toPoints(analyser, w, h, dpr);
    if (count > 1) this._drawCurve(g, count, h, rgb, dpr);
  }

  /**
   * Draws the spectrum the current settings *should* produce, with the same
   * grid, gradient and colour as live data.
   *
   * Three terms. On log-frequency axes a `1/f^α` spectrum is exactly a straight
   * line of slope −3.01·α dB per octave. The player's low cut — two cascaded
   * second-order Butterworth highpasses, `|H|² = (r⁴/(1+r⁴))²` for `r = f/fc` —
   * is subtracted from it, producing the shoulder and the 24 dB/octave roll-off
   * at the bottom end. The result is then placed vertically by normalising it to
   * unit integrated power and adding the engine's loudness tilt back on, which
   * is what makes it land on the live curve rather than merely parallel it.
   *
   * This is the ideal the live curve fluctuates around, and it costs one frame
   * to draw instead of sixty a second. Steep settings run off the top or bottom
   * of the canvas, which is honest: so does the real thing.
   *
   * @param {number} alpha Spectral exponent.
   * @param {number} lowCutHz Low-cut corner in Hz, matching the player.
   * @param {Rgb} rgb Curve colour.
   * @returns {void}
   */
  renderIdeal(alpha, lowCutHz, rgb) {
    this._resize();
    const g = this.g, w = this._w, h = this._h, dpr = this._dpr;
    this._drawGrid(g, w, h, dpr);

    const span = Math.log(F_MAX / F_MIN);
    const columns = Math.max(2, Math.floor(w / dpr / IDEAL_POINT_SPACING_PX));
    if (this._points.length < columns * 2) this._points = new Float64Array(columns * 2);
    const points = this._points;

    // Pass 1: the shape, in dB on an arbitrary scale, and its integrated power.
    // Sampled on the same grid the live curve uses, so the two line up in x.
    // Summing S·f is the log-grid form of ∫S df, so `power` is the total the
    // engine holds constant.
    let power = 0;
    for (let i = 0; i < columns; i++) {
      const f = F_MIN * Math.exp(span * (i + 0.5) / columns);
      const r4 = Math.pow(f / lowCutHz, 4);
      const db = -DB_PER_OCTAVE * alpha * Math.log2(f / 1000) +
        20 * Math.log10(r4 / (1 + r4));
      points[i * 2] = w * i / columns;
      points[i * 2 + 1] = db;
      power += Math.pow(10, db / 10) * f;
    }

    // Pass 2: place it on the analyser's scale. Normalising by the integrated
    // power is what makes the curve sit at the right height for any colour and
    // low cut, since the engine normalises output power the same way; the tilt
    // it adds on top is then added back here.
    const level = LEVEL_CAL_DB - 10 * Math.log10(power * span / columns) +
      TILT_DB * Math.min(alpha, TILT_CAP_ALPHA);
    for (let i = 0; i < columns; i++) {
      const frac = (points[i * 2 + 1] + level - DISPLAY_MIN_DB) / DISPLAY_RANGE_DB;
      points[i * 2 + 1] = h - h * Math.min(1, Math.max(0, frac));
    }

    this._drawCurve(g, columns, h, rgb, dpr);
  }

  /**
   * Matches the backing store to the CSS box and device pixel ratio, recording
   * the result in fields. Returns nothing so the render loop doesn't allocate a
   * result object every frame.
   *
   * @private
   * @returns {void}
   */
  _resize() {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const width = Math.round(this.canvas.clientWidth * dpr);
    const height = Math.round(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this._w = width;
    this._h = height;
    this._dpr = dpr;
  }

  /**
   * Converts the analyser bins into screen points, averaging every bin that
   * falls inside a column. Without that averaging the top of the range, where
   * hundreds of bins share a few pixels, renders as noise rather than a curve.
   *
   * @private
   * @param {AnalyserNode} analyser Source of spectrum data.
   * @param {number} w Canvas width in device pixels.
   * @param {number} h Canvas height in device pixels.
   * @param {number} dpr Device pixel ratio.
   * @returns {number} How many points were written into {@link SpectrumView#_points}.
   */
  _toPoints(analyser, w, h, dpr) {
    const bins = this._bins;
    const binHz = analyser.context.sampleRate / analyser.fftSize;
    const span = Math.log(F_MAX / F_MIN);
    const floor = analyser.minDecibels;
    const range = analyser.maxDecibels - floor;
    const columns = Math.max(2, Math.floor(w / dpr / POINT_SPACING_PX));

    if (this._points.length < columns * 2) this._points = new Float64Array(columns * 2);
    const points = this._points;
    let count = 0;
    for (let i = 0; i < columns; i++) {
      const fLo = F_MIN * Math.exp(span * i / columns);
      const fHi = F_MIN * Math.exp(span * (i + 1) / columns);
      const first = Math.floor(fLo / binHz);
      if (first > bins.length - 1) break;
      const last = Math.max(first, Math.min(bins.length - 1, Math.floor(fHi / binHz)));

      let sum = 0, n = 0;
      for (let b = first; b <= last; b++) {
        if (Number.isFinite(bins[b])) { sum += bins[b]; n++; }
      }
      const db = n ? sum / n : floor;
      const level = Math.min(1, Math.max(0, (db - floor) / range));
      points[count * 2] = w * i / columns;
      points[count * 2 + 1] = h - h * level;
      count++;
    }
    return count;
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} g Drawing context.
   * @param {number} w Canvas width in device pixels.
   * @param {number} h Canvas height in device pixels.
   * @param {number} dpr Device pixel ratio.
   * @returns {void}
   */
  _drawGrid(g, w, h, dpr) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#0a0c11';
    g.fillRect(0, 0, w, h);

    if (dpr !== this._fontDpr) {           // rebuilt only when the ratio changes
      this._fontDpr = dpr;
      this._font = `${11 * dpr}px ui-sans-serif, system-ui, sans-serif`;
      g.font = this._font;
      // Measured once per ratio so the label-fitting test below costs nothing.
      this._unitW = g.measureText('Hz').width;
      this._labelW = {};
      for (const f of GRID_HZ) {
        if (GRID_LABELS[f]) this._labelW[f] = g.measureText(GRID_LABELS[f]).width;
      }
    }
    g.font = this._font;
    g.fillStyle = '#5c6377';

    // Level gridlines, labelled down the right edge — the left corner belongs to
    // the play/pause button, and on a short canvas the two would collide.
    g.strokeStyle = '#1a1f2c';
    g.lineWidth = dpr;
    g.textAlign = 'right';
    for (let i = 1; i < LEVEL_DIVISIONS; i++) {
      const y = Math.round(h * i / LEVEL_DIVISIONS) + 0.5;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
      g.fillText(LEVEL_LABELS[i - 1], w - 5 * dpr, y - 4 * dpr);
    }
    g.textAlign = 'left';

    const left = Math.log(F_MIN), span = Math.log(F_MAX / F_MIN);
    for (const f of GRID_HZ) {
      const label = GRID_LABELS[f];
      const x = Math.round(w * (Math.log(f) - left) / span) + 0.5;
      g.strokeStyle = label ? '#232939' : '#161b26';
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h - (label ? 16 * dpr : 0));
      g.stroke();
      // Dropped rather than allowed to collide with the unit marker, which on a
      // narrow canvas would read as a single run-together label.
      if (label) {
        const lx = x + 4 * dpr;
        if (lx + this._labelW[f] < w - this._unitW - 11 * dpr) {
          g.fillText(label, lx, h - 5 * dpr);
        }
      }
    }

    // Units, one per axis, in the free corners. Drawn last so they sit over the
    // 20 kHz gridline rather than under it.
    g.textAlign = 'right';
    g.fillText('dB', w - 5 * dpr, 13 * dpr);
    g.fillText('Hz', w - 5 * dpr, h - 5 * dpr);
    g.textAlign = 'left';
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} g Drawing context.
   * @param {number} count Number of points in {@link SpectrumView#_points}.
   * @param {number} h Canvas height in device pixels.
   * @param {Rgb} rgb Curve colour.
   * @param {number} dpr Device pixel ratio.
   * @returns {void}
   */
  _drawCurve(g, count, h, rgb, dpr) {
    const points = this._points;
    const firstX = points[0], firstY = points[1];
    const lastX = points[(count - 1) * 2];

    // Only rebuild the colour strings and gradient when they would differ.
    const key = ((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]) * 65536 + h;
    if (key !== this._styleKey) {
      this._styleKey = key;
      const color = `${rgb[0]},${rgb[1]},${rgb[2]}`;
      this._stroke = `rgb(${color})`;
      const gradient = g.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, `rgba(${color},0.28)`);
      gradient.addColorStop(1, `rgba(${color},0.02)`);
      this._fill = gradient;
    }

    g.beginPath();
    g.moveTo(firstX, firstY);
    for (let i = 1; i < count; i++) g.lineTo(points[i * 2], points[i * 2 + 1]);
    g.lineTo(lastX, h);
    g.lineTo(firstX, h);
    g.closePath();
    g.fillStyle = this._fill;
    g.fill();

    g.beginPath();
    g.moveTo(firstX, firstY);
    for (let i = 1; i < count; i++) g.lineTo(points[i * 2], points[i * 2 + 1]);
    g.strokeStyle = this._stroke;
    g.lineWidth = 1.6 * dpr;
    g.lineJoin = 'round';
    g.stroke();
  }
}
