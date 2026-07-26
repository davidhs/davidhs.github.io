/**
 * @file Web Audio graph and transport for the noise generator.
 *
 * Builds the signal chain, prefers an `AudioWorklet` (noise generated on the
 * audio render thread) and falls back to a `ScriptProcessorNode` when worklets
 * or their module imports are unavailable. Both paths drive the same
 * {@link NoiseEngine}, so they are numerically identical.
 */

import { NoiseEngine, buildGainTable, sectionCountFor } from './noise-engine.js';
// The analyser exists only to feed the spectrum display, so it takes its level
// scale from there: the view maps live data through these same bounds.
import { DISPLAY_MIN_DB, DISPLAY_RANGE_DB } from './spectrum-view.js';

/** URL of the worklet module, resolved relative to this file. @type {string} */
const PROCESSOR_URL = new URL('./noise-processor.js', import.meta.url).href;

/** Name the processor registers itself under. @type {string} */
const PROCESSOR_NAME = 'noise-processor';

/** Fade applied when starting, in seconds. @type {number} */
const FADE_IN_S = 0.35;

/** Fade applied when stopping, in seconds. @type {number} */
const FADE_OUT_S = 0.25;

/**
 * Fade used when the platform is about to interrupt playback anyway — short
 * enough to finish before the interruption lands, long enough not to be a click
 * in its own right.
 * @type {number}
 */
const BACKGROUND_FADE_S = 0.06;

/** Block size for the fallback path. Large enough to survive main-thread jitter. */
const SCRIPT_BLOCK = 4096;

/** Time constant for volume changes while playing, in seconds. @type {number} */
const VOLUME_GLIDE_S = 0.02;

/** Default low-cut corner, in Hz. @type {number} */
export const DEFAULT_LOW_CUT_HZ = 30;

/**
 * How long to wait after the last low-cut change before rebuilding the gain
 * table. The rebuild costs some milliseconds, so it must not run per input
 * event; the filter corner itself moves immediately, only the level
 * compensation lags.
 * @type {number}
 */
const TABLE_REBUILD_DELAY_MS = 150;

/**
 * Which generation strategy the player ended up using.
 * @typedef {'AudioWorklet' | 'ScriptProcessor (fallback)'} Backend
 */

/**
 * Owns the audio context and transport for one noise stream.
 *
 * The graph is built lazily on the first {@link NoisePlayer#start} call, which
 * must happen inside a user gesture for the context to be allowed to run.
 * Colour and volume can be set at any time, before or during playback.
 *
 * @example
 * const player = new NoisePlayer();
 * player.setColor(1);          // pink
 * await player.start();        // from a click handler
 */
export class NoisePlayer {
  constructor() {
    /** @type {AudioContext|null} Created on first start. */
    this.context = null;

    /** @type {AnalyserNode|null} Tap for visualisation; null until started. */
    this.analyser = null;

    /** @type {Backend|''} */
    this._backend = '';

    /** @type {AudioWorkletNode|null} @private */
    this._worklet = null;

    /** @type {ScriptProcessorNode|null} @private */
    this._script = null;

    /** @type {NoiseEngine|null} Only used by the fallback path. @private */
    this._engine = null;

    /** @type {GainNode|null} @private */
    this._master = null;

    /** @type {BiquadFilterNode[]} Cascaded highpasses forming the low cut. @private */
    this._lowCutFilters = [];

    /** @type {number} @private */
    this._lowCutHz = DEFAULT_LOW_CUT_HZ;

    /** @type {number} Pending gain-table rebuild. @private */
    this._tableTimer = 0;

    /** @type {number} @private */
    this._alpha = 0;

    /** @type {number} @private */
    this._volume = 0.36;

    /** @type {boolean} @private */
    this._playing = false;

    /** @type {number} Timer that suspends the context after a fade-out. @private */
    this._suspendTimer = 0;
  }

  /** @returns {boolean} Whether noise is currently playing. */
  get playing() {
    return this._playing;
  }

  /**
   * One-line summary of what is actually running: which of the two generation
   * paths, at what sample rate, with how many filter sections. Shown at the
   * bottom of the page, and the first thing worth checking when diagnosing an
   * audio problem. Empty until the graph has been built.
   *
   * @returns {string}
   */
  get description() {
    if (!this.context) return '';
    const sections = sectionCountFor(this.context.sampleRate);
    return `${this._backend} · ${this.context.sampleRate / 1000} kHz · ${sections} filter sections`;
  }

  /**
   * Sets the noise colour. Takes effect immediately if playing, and is
   * remembered for the next start otherwise.
   *
   * @param {number} alpha Spectral exponent: −2 violet, 0 white, +2 brown.
   * @returns {void}
   */
  setColor(alpha) {
    this._alpha = alpha;
    if (this._worklet) this._worklet.port.postMessage({ alpha });
    if (this._engine) this._engine.setColor(alpha);
  }

  /**
   * Sets the low-cut corner.
   *
   * Deep colours put most of their power below 40 Hz, which speakers reproduce
   * as excursion distortion rather than sound, so this trims it off. The filter
   * moves immediately; the level compensation that keeps loudness steady across
   * colours is rebuilt shortly afterwards, off the audio thread.
   *
   * @param {number} hz Corner frequency in Hz.
   * @returns {void}
   */
  setLowCut(hz) {
    this._lowCutHz = hz;
    if (!this.context) return;               // applied when the graph is built

    for (const filter of this._lowCutFilters) {
      filter.frequency.setTargetAtTime(hz, this.context.currentTime, VOLUME_GLIDE_S);
    }

    clearTimeout(this._tableTimer);
    this._tableTimer = setTimeout(() => {
      if (!this.context) return;
      const table = buildGainTable(this.context.sampleRate, this._lowCutHz);
      // Structured clone handles the typed array directly; no need to convert.
      if (this._worklet) this._worklet.port.postMessage({ gainTable: table });
      if (this._engine) this._engine.setGainTable(table);
    }, TABLE_REBUILD_DELAY_MS);
  }

  /** @returns {number} Current low-cut corner in Hz. */
  get lowCut() {
    return this._lowCutHz;
  }

  /**
   * Sets output volume as a linear gain.
   *
   * @param {number} gain Linear gain, normally in [0, 1].
   * @returns {void}
   */
  setVolume(gain) {
    this._volume = gain;
    if (this._master && this._playing && this.context) {
      this._master.gain.setTargetAtTime(gain, this.context.currentTime, VOLUME_GLIDE_S);
    }
  }

  /**
   * Starts playback, building the audio graph on first call and fading in.
   * Must be called from a user gesture.
   *
   * @returns {Promise<void>} Resolves once the fade-in has been scheduled.
   */
  async start() {
    if (!this.context) await this._build();
    if (this.context.state === 'suspended') await this.context.resume();

    clearTimeout(this._suspendTimer);
    this.setColor(this._alpha);

    const now = this.context.currentTime;
    const gain = this._master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(this._volume, now + FADE_IN_S);

    this._playing = true;
  }

  /**
   * Fades out and suspends the context, keeping the graph intact so the next
   * {@link NoisePlayer#start} is instant.
   *
   * @returns {void}
   */
  stop() {
    this._playing = false;
    if (!this.context || !this._master) return;

    const now = this.context.currentTime;
    const gain = this._master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + FADE_OUT_S);

    clearTimeout(this._suspendTimer);
    this._suspendTimer = setTimeout(() => {
      if (!this._playing && this.context.state === 'running') this.context.suspend();
    }, (FADE_OUT_S + 0.15) * 1000);
  }

  /**
   * Fades to silence because the platform is about to interrupt playback.
   *
   * iOS suspends the audio session when the screen locks or the app is
   * backgrounded, and it cuts the render mid-waveform. Ramping to zero first
   * means the waveform is already at silence when the cut lands.
   *
   * This was written to fix the artifact described under "Known issues" in
   * `README.md`, and **it did not fix it** — so do not read this as a solved
   * problem. It is kept because fading out before a known interruption is
   * correct regardless, and because it pairs with
   * {@link NoisePlayer#restoreFromBackground}, which does fix a separate real
   * problem: without it the context stays suspended after unlock and playback
   * never comes back.
   *
   * Playback state is deliberately left alone: the transport still reads as
   * playing.
   *
   * @returns {void}
   */
  duckForBackground() {
    if (!this._playing || !this.context || !this._master) return;
    const now = this.context.currentTime;
    const gain = this._master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + BACKGROUND_FADE_S);
  }

  /**
   * Comes back from a background interruption: resumes the context if the
   * platform suspended it, then fades back up to the set volume.
   *
   * @returns {Promise<void>}
   */
  async restoreFromBackground() {
    if (!this._playing || !this.context || !this._master) return;
    if (this.context.state !== 'running') {
      try {
        await this.context.resume();
      } catch {
        return;                     // the platform will not let us resume yet
      }
    }
    const now = this.context.currentTime;
    const gain = this._master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(this._volume, now + FADE_IN_S);
  }

  /**
   * Builds the audio graph: noise source → highpass → master gain → output,
   * with an analyser tapped off the master gain.
   *
   * @private
   * @returns {Promise<void>}
   */
  async _build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    // 'playback' lets the browser use a larger output buffer, so the audio
    // thread wakes far less often and has much more slack before it misses a
    // deadline. Continuous noise has nothing to be responsive to, so the extra
    // output latency costs nothing and the headroom matters on weak hardware.
    this.context = new Ctx({ latencyHint: 'playback' });

    // Seed from the clock and Math.random so every page load is a new stream.
    const seed = (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0;
    const source = await this._createSource(seed);

    // Two cascaded 2nd-order highpasses (24 dB/octave). A single 12 dB/octave
    // stage leaves too much of deep brown's subsonic energy for small speakers.
    this._lowCutFilters = [0, 1].map(() => {
      const filter = this.context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = this._lowCutHz;
      filter.Q.value = 0.707;
      return filter;
    });

    this._master = this.context.createGain();
    this._master.gain.value = 0;

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.82;
    this.analyser.minDecibels = DISPLAY_MIN_DB;
    this.analyser.maxDecibels = DISPLAY_MIN_DB + DISPLAY_RANGE_DB;

    source
      .connect(this._lowCutFilters[0])
      .connect(this._lowCutFilters[1])
      .connect(this._master);
    this._master.connect(this.analyser);
    this._master.connect(this.context.destination);
  }

  /**
   * Creates the noise source node, preferring the worklet and falling back to a
   * `ScriptProcessorNode` if the worklet module cannot be loaded.
   *
   * @private
   * @param {number} seed PRNG seed.
   * @returns {Promise<AudioNode>} The source node.
   */
  async _createSource(seed) {
    try {
      if (!this.context.audioWorklet) throw new Error('audioWorklet unavailable');

      await this.context.audioWorklet.addModule(PROCESSOR_URL);
      this._worklet = new AudioWorkletNode(this.context, PROCESSOR_NAME, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: { seed, alpha: this._alpha, lowCutHz: this._lowCutHz }
      });
      this._backend = 'AudioWorklet';
      return this._worklet;
    } catch (error) {
      console.warn('AudioWorklet unavailable, using ScriptProcessor:', error);
    }

    // Deprecated, but it is the only generator that works without module
    // loading, so it stays as the safety net.
    this._engine = new NoiseEngine(this.context.sampleRate, {
      channels: 2, seed, lowCutHz: this._lowCutHz, maxBlock: SCRIPT_BLOCK
    });
    this._engine.resetColor(this._alpha);

    this._script = this.context.createScriptProcessor(SCRIPT_BLOCK, 1, 2);
    this._script.onaudioprocess = (event) => {
      const buffer = event.outputBuffer;
      this._engine.process(
        [buffer.getChannelData(0), buffer.getChannelData(1)],
        buffer.length
      );
    };
    this._backend = 'ScriptProcessor (fallback)';
    return this._script;
  }
}
