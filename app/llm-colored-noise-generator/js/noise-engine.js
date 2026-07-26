/**
 * @file Colored-noise DSP engine.
 *
 * Synthesises noise whose power spectral density is proportional to `1 / f^α`,
 * where α sweeps continuously from −2 (violet) through 0 (white) and +2 (brown)
 * to +4 (very deep brown). Every sample is computed from a pseudo-random
 * stream — nothing is looped.
 *
 * This module runs on two different threads: inside an `AudioWorkletProcessor`
 * on the audio render thread, and on the main thread as a ScriptProcessor
 * fallback. It must therefore stay free of any DOM or Web Audio API reference.
 *
 * Nothing in {@link NoiseEngine#process} may allocate. It runs on the audio
 * render thread, where a garbage collection pause is audible as a dropout.
 *
 * @see {@link ./noise-processor.js} for the worklet wrapper.
 */

/**
 * Lowest filter pole, in Hz. Below this the spectrum flattens instead of
 * following the power law, which keeps deep brown's DC energy finite.
 * @type {number}
 */
export const LOW_POLE_HZ = 18;

/** Lowest colour exponent the engine accepts (violet). @type {number} */
export const ALPHA_MIN = -2;

/** Highest colour exponent the engine accepts (deepest brown). @type {number} */
export const ALPHA_MAX = 4;

/**
 * Pole spacing across the band: a quarter octave. Half-octave spacing is
 * adequate to α = 2 but its ripple grows to ±1.8 dB by α = 4; quarter-octave
 * holds ±0.6 dB across the whole extended range for twice the (trivial) cost.
 * @type {number}
 */
const POLE_SPACING = Math.pow(2, 0.25);

/**
 * Corrects the slope shortfall left by each section spreading its shelf across
 * the whole band rather than only between its own pole and zero. Measured for
 * {@link POLE_SPACING}; it must be recalibrated if that changes.
 * @type {number}
 */
const SLOPE_COMP = 1.0211;

/** Target output RMS at α = 0, in linear full-scale units. @type {number} */
const TARGET_RMS = 0.09;

/**
 * Loudness tilt across the colour range, in dB per unit α. Equal-RMS output
 * makes brown feel much quieter than white, so low colours are trimmed down and
 * high colours up.
 * @type {number}
 */
export const TILT_DB = 2.5;

/**
 * α beyond which the tilt stops growing. Without this cap the deepest colours
 * would be boosted past full scale; holding the tilt flat above brown keeps
 * peaks bounded while leaving pink and brown at their established levels.
 * @type {number}
 */
export const TILT_CAP_ALPHA = 2;

/**
 * Block size assumed when the caller doesn't say. AudioWorklet always renders
 * 128 frames; the ScriptProcessor fallback uses 4096 and passes that in. Scratch
 * space is sized from this once, so {@link NoiseEngine#process} never allocates.
 * @type {number}
 */
const DEFAULT_MAX_BLOCK = 128;

/** Entries in the gain-compensation lookup table. @type {number} */
const GAIN_TABLE_SIZE = 81;

/** Frequency points used to integrate |H(f)|² when building that table. @type {number} */
const GAIN_TABLE_BANDS = 256;

/**
 * Filter and generator state for one output channel. Each channel has its own
 * PRNG stream, which is what makes the stereo image fully decorrelated.
 *
 * State that survives between blocks is held in typed arrays rather than plain
 * number properties: in V8, storing a double into an object property allocates a
 * heap number, and this is written on every block.
 *
 * @typedef {Object} ChannelState
 * @property {Float64Array} x1 Previous input of each filter section.
 * @property {Float64Array} y1 Previous output of each filter section.
 * @property {Uint32Array} rng The four xorshift128 state words.
 * @property {Float64Array} spare Unconsumed value of the last Gaussian pair, at index 0.
 * @property {boolean} hasSpare Whether `spare` is still unconsumed.
 */

/** Index of the live colour within {@link NoiseEngine#live}. @type {number} */
const LIVE_ALPHA = 0;
/** Index of the colour the coefficients were built for. @type {number} */
const LIVE_ALPHA_SET = 1;
/** Index of the current output gain. @type {number} */
const LIVE_GAIN = 2;
/** Index of the output gain being approached. @type {number} */
const LIVE_GAIN_TARGET = 3;

/**
 * Number of filter sections the engine will use at a given sample rate.
 * Exposed so callers can report it without instantiating an engine.
 *
 * @param {number} sampleRate Sample rate in Hz.
 * @returns {number} Section count.
 */
export function sectionCountFor(sampleRate) {
  const fMax = 0.49 * sampleRate;
  return Math.max(4, Math.ceil(Math.log(fMax / LOW_POLE_HZ) / Math.log(POLE_SPACING)));
}

/**
 * Pole frequencies of the cascade, geometrically spaced from
 * {@link LOW_POLE_HZ} upward.
 *
 * @param {number} sampleRate Sample rate in Hz.
 * @returns {Float64Array} Pole frequency of each section, in Hz.
 */
function polesFor(sampleRate) {
  const poles = new Float64Array(sectionCountFor(sampleRate));
  for (let k = 0; k < poles.length; k++) poles[k] = LOW_POLE_HZ * Math.pow(POLE_SPACING, k);
  return poles;
}

/**
 * Fills the cascade coefficients for one colour.
 *
 * Each section is the bilinear transform of `(1 + s/wz) / (1 + s/wp)`. Setting
 * the zero by ratio in the *warped* domain (`Kz = Kp · R^−γ`) makes every
 * section drop exactly `20γ·log10(R)` dB between DC and Nyquist. Since the poles
 * stay geometric in real frequency, the cascade slope holds right up to Nyquist
 * — a naive `fz = fp · R^γ` placement steepens badly near the top of the band,
 * costing about 9 dB at 20 kHz for brown noise.
 *
 * @param {number} alpha Spectral exponent.
 * @param {number} sampleRate Sample rate in Hz.
 * @param {Float64Array} fp Pole frequencies.
 * @param {number} fMax Highest frequency a pole may sit at, in Hz.
 * @param {Float64Array} b0 Receives the b0 coefficients.
 * @param {Float64Array} b1 Receives the b1 coefficients.
 * @param {Float64Array} a1 Receives the a1 coefficients.
 * @returns {void}
 */
function computeCoefficients(alpha, sampleRate, fp, fMax, b0, b1, a1) {
  const rg = Math.pow(POLE_SPACING, -alpha * 0.5 * SLOPE_COMP);
  for (let k = 0; k < fp.length; k++) {
    const Kp = 1 / Math.tan(Math.PI * Math.min(fp[k], fMax) / sampleRate);
    const Kz = Kp * rg;
    const d = 1 + Kp;
    b0[k] = (1 + Kz) / d;
    b1[k] = (1 - Kz) / d;
    a1[k] = (1 - Kp) / d;
  }
}

/**
 * Precomputes the gain needed to hold output level roughly constant across the
 * colour range.
 *
 * Output RMS varies by more than 60 dB from violet to deep brown, so for each
 * colour on a grid this integrates |H(f)|² over the audible band and stores the
 * compensating gain in dB. The player's low cut is modelled here as well: with
 * deep colours most of the raw energy sits below it, so normalising without
 * accounting for it would leave the audible part far too quiet.
 *
 * Cheap enough (a few milliseconds) to rebuild whenever the low cut moves, but
 * do that on the main thread — never on the audio thread.
 *
 * @param {number} sampleRate Sample rate in Hz.
 * @param {number} lowCutHz Corner of the player's low cut, in Hz.
 * @returns {Float64Array} Gain in dB at each of {@link GAIN_TABLE_SIZE} colours.
 */
export function buildGainTable(sampleRate, lowCutHz) {
  const fp = polesFor(sampleRate);
  const fMax = 0.49 * sampleRate;
  const b0 = new Float64Array(fp.length);
  const b1 = new Float64Array(fp.length);
  const a1 = new Float64Array(fp.length);

  const fA = 5, fB = Math.min(20000, fMax);
  const cw = new Float64Array(GAIN_TABLE_BANDS), wgt = new Float64Array(GAIN_TABLE_BANDS);
  let den = 0;
  for (let j = 0; j < GAIN_TABLE_BANDS; j++) {
    const f = fA * Math.pow(fB / fA, j / (GAIN_TABLE_BANDS - 1));
    cw[j] = Math.cos(2 * Math.PI * f / sampleRate);
    // Two cascaded 2nd-order Butterworth highpasses, matching the player.
    const r = f / lowCutHz, r4 = r * r * r * r, hp = r4 / (1 + r4);
    wgt[j] = f * hp * hp;                  // log-grid Jacobian × |low cut|²
    den += f;
  }

  const tbl = new Float64Array(GAIN_TABLE_SIZE);
  for (let m = 0; m < GAIN_TABLE_SIZE; m++) {
    const a = ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * m / (GAIN_TABLE_SIZE - 1);
    computeCoefficients(a, sampleRate, fp, fMax, b0, b1, a1);
    let acc = 0;
    for (let j = 0; j < GAIN_TABLE_BANDS; j++) {
      const c = cw[j];
      let p = 1;
      for (let k = 0; k < fp.length; k++) {
        const B0 = b0[k], B1 = b1[k], A1 = a1[k];
        p *= (B0 * B0 + B1 * B1 + 2 * B0 * B1 * c) / (1 + A1 * A1 + 2 * A1 * c);
      }
      acc += p * wgt[j];
    }
    tbl[m] = 20 * Math.log10(TARGET_RMS / Math.sqrt(acc / den)) +
      TILT_DB * Math.min(a, TILT_CAP_ALPHA);
  }
  return tbl;
}

/**
 * Streaming colored-noise generator.
 *
 * White Gaussian noise is passed through a cascade of first-order pole/zero
 * sections whose poles are spaced a quarter octave apart. Placing each section's
 * zero a fixed ratio from its pole tilts the spectrum by a controllable
 * −3α dB/octave, so a single parameter sweeps the whole colour range.
 *
 * @example
 * const engine = new NoiseEngine(48000, { channels: 2, seed: 12345 });
 * engine.setColor(1);                       // pink
 * engine.process([left, right], left.length);
 */
export class NoiseEngine {
  /**
   * @param {number} sampleRate Sample rate in Hz.
   * @param {Object} [options] Construction options.
   * @param {number} [options.channels=2] Independent channels to generate.
   * @param {number} [options.seed=1] PRNG seed; vary it for a different stream.
   * @param {number} [options.lowCutHz=30] Low cut the player will apply, used to
   *   calibrate output level. Update later with {@link NoiseEngine#setGainTable}.
   * @param {number} [options.maxBlock=128] Largest block {@link NoiseEngine#process}
   *   will be asked for. Scratch space is sized from this once, so passing the real
   *   value keeps the working set small and avoids any allocation while rendering.
   */
  constructor(sampleRate, {
    channels = 2, seed = 1, lowCutHz = 30, maxBlock = DEFAULT_MAX_BLOCK
  } = {}) {
    /** @type {number} Sample rate in Hz. */
    this.sr = sampleRate;

    /** @type {number} Highest frequency any pole may sit at, in Hz. */
    this.fMax = 0.49 * sampleRate;

    /** @type {Float64Array} Pole frequency of each section, in Hz. */
    this.fp = polesFor(sampleRate);

    /** @type {number} Number of first-order sections in the cascade. */
    this.N = this.fp.length;

    /** @type {Float64Array} Feed-forward coefficient b0 per section. */
    this.b0 = new Float64Array(this.N);
    /** @type {Float64Array} Feed-forward coefficient b1 per section. */
    this.b1 = new Float64Array(this.N);
    /** @type {Float64Array} Feedback coefficient a1 per section. */
    this.a1 = new Float64Array(this.N);

    /** @type {ChannelState[]} */
    this.ch = [];
    for (let c = 0; c < channels; c++) {
      let z = (seed + c * 0x9e3779b9) >>> 0;
      // splitmix32, used only to spread one seed into four decorrelated words.
      const mix = () => {
        z = (z + 0x6d2b79f5) >>> 0;
        let t = z;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) || 0x9e3779b9;
      };
      this.ch.push({
        x1: new Float64Array(this.N), y1: new Float64Array(this.N),
        rng: Uint32Array.of(mix(), mix(), mix(), mix()),
        spare: new Float64Array(1), hasSpare: false
      });
    }

    /** @type {Float64Array} Output gain in dB, sampled across the α range. */
    this.tbl = buildGainTable(sampleRate, lowCutHz);

    /** @type {number} Colour the engine is gliding toward. */
    this.alphaTarget = 0;

    /**
     * Scalar state updated on every block, kept off the JS heap. See
     * {@link ChannelState} for why.
     * @type {Float64Array}
     */
    this.live = new Float64Array(4);
    this.live[LIVE_ALPHA_SET] = NaN;

    /** @type {number} Per-block smoothing coefficient for α (~50 ms). */
    this.aSmooth = 1 - Math.exp(-128 / (sampleRate * 0.05));
    /** @type {number} Per-sample smoothing coefficient for gain (~30 ms). */
    this.gSmooth = 1 - Math.exp(-1 / (sampleRate * 0.03));

    /** @type {Float64Array} Scratch buffer holding the per-sample gain ramp. */
    this.ramp = new Float64Array(maxBlock);

    /** @type {Float64Array} Scratch buffer the cascade filters in place. */
    this.scratchA = new Float64Array(maxBlock);

    /** @type {Float64Array} Second scratch buffer, for the paired channel. */
    this.scratchB = new Float64Array(maxBlock);
  }

  /** @returns {number} Colour currently in effect. */
  get alpha() { return this.live[LIVE_ALPHA]; }

  set alpha(value) { this.live[LIVE_ALPHA] = value; }

  /** @returns {number} Colour the live coefficients were built for. */
  get alphaSet() { return this.live[LIVE_ALPHA_SET]; }

  set alphaSet(value) { this.live[LIVE_ALPHA_SET] = value; }

  /** @returns {number} Current output gain. */
  get g() { return this.live[LIVE_GAIN]; }

  set g(value) { this.live[LIVE_GAIN] = value; }

  /** @returns {number} Output gain being approached. */
  get gTarget() { return this.live[LIVE_GAIN_TARGET]; }

  set gTarget(value) { this.live[LIVE_GAIN_TARGET] = value; }

  /**
   * Sets the colour the engine glides toward, reaching it in about 50 ms.
   * Cheap enough to call on every slider event.
   *
   * @param {number} alpha Spectral exponent, clamped to [−2, 4].
   * @returns {void}
   */
  setColor(alpha) {
    this.alphaTarget = Math.min(ALPHA_MAX, Math.max(ALPHA_MIN, alpha));
  }

  /**
   * Jumps straight to a colour with no glide. Use before the first
   * {@link NoiseEngine#process} call so playback opens at the right colour.
   *
   * @param {number} alpha Spectral exponent, clamped to [−2, 4].
   * @returns {void}
   */
  resetColor(alpha) {
    this.setColor(alpha);
    this.alpha = this.alphaTarget;
  }

  /**
   * Installs a gain table built for a new low-cut frequency. Build it with
   * {@link buildGainTable} off the audio thread and hand it over here.
   *
   * @param {Float64Array|number[]} table Table from {@link buildGainTable}.
   * @returns {void}
   */
  setGainTable(table) {
    this.tbl = table instanceof Float64Array ? table : Float64Array.from(table);
    this.alphaSet = NaN;                   // force the gain to be re-derived
  }

  /**
   * Looks up the compensating output gain for a colour, interpolating between
   * table entries.
   *
   * @private
   * @param {number} a Spectral exponent.
   * @returns {number} Linear gain.
   */
  _gainFor(a) {
    const M = this.tbl.length;
    const t = (Math.min(ALPHA_MAX, Math.max(ALPHA_MIN, a)) - ALPHA_MIN) /
      (ALPHA_MAX - ALPHA_MIN) * (M - 1);
    const i = Math.min(M - 2, Math.floor(t)), f = t - i;
    return Math.pow(10, (this.tbl[i] * (1 - f) + this.tbl[i + 1] * f) / 20);
  }

  /**
   * Rebuilds the cascade coefficients for one colour.
   *
   * @private
   * @param {number} alpha Spectral exponent.
   * @returns {void}
   */
  _coeffs(alpha) {
    computeCoefficients(alpha, this.sr, this.fp, this.fMax, this.b0, this.b1, this.a1);
  }

  /**
   * Fills each supplied channel buffer with the next block of noise.
   *
   * Colour is smoothed once per block, so coefficients stay fixed within a
   * block; the output gain is ramped per sample so colour changes never click.
   * If fewer channel states exist than buffers, states are reused cyclically.
   *
   * Channels are rendered in three passes over scratch buffers — generate,
   * filter, scale — and two at a time. Running the cascade section-by-section
   * over a whole block, rather than pushing each sample through all 42 sections,
   * lets a section's coefficients and state live in registers for the duration
   * of the block instead of being reloaded for every sample; pairing the
   * channels then fills the arithmetic pipeline (see {@link NoiseEngine#_renderPair}).
   * Both are pure reorderings, so the output is bit-identical.
   *
   * Allocates nothing — see the file header.
   *
   * @param {Float32Array[]} channels One output buffer per channel, written in place.
   * @param {number} frameCount Samples to write into each buffer.
   * @returns {void}
   */
  process(channels, frameCount) {
    const live = this.live;
    live[LIVE_ALPHA] += (this.alphaTarget - live[LIVE_ALPHA]) * this.aSmooth;
    if (!(Math.abs(live[LIVE_ALPHA] - live[LIVE_ALPHA_SET]) < 1e-4)) {
      this._coeffs(live[LIVE_ALPHA]);
      live[LIVE_ALPHA_SET] = live[LIVE_ALPHA];
      live[LIVE_GAIN_TARGET] = this._gainFor(live[LIVE_ALPHA]);
    }

    if (this.ramp.length < frameCount) {           // only if maxBlock was understated
      this.ramp = new Float64Array(frameCount);
      this.scratchA = new Float64Array(frameCount);
      this.scratchB = new Float64Array(frameCount);
    }
    const ramp = this.ramp, gs = this.gSmooth, gt = live[LIVE_GAIN_TARGET];
    let g = live[LIVE_GAIN];
    for (let i = 0; i < frameCount; i++) { g += (gt - g) * gs; ramp[i] = g; }
    live[LIVE_GAIN] = g;

    // Channels are rendered two at a time; see _renderPair for why.
    const states = this.ch, nStates = states.length;
    let c = 0;
    for (; c + 1 < channels.length; c += 2) {
      this._renderPair(channels[c], channels[c + 1],
        states[c % nStates], states[(c + 1) % nStates], frameCount);
    }
    for (; c < channels.length; c++) {
      this._renderOne(channels[c], states[c % nStates], frameCount);
    }
  }

  /**
   * Fills a scratch buffer with white Gaussian noise for one channel.
   *
   * @private
   * @param {Float64Array} buf Destination scratch buffer.
   * @param {ChannelState} st Channel state; its PRNG is advanced.
   * @param {number} n Samples to generate.
   * @returns {void}
   */
  _fillNoise(buf, st, n) {
    const rng = st.rng;
    let s0 = rng[0], s1 = rng[1], s2 = rng[2], s3 = rng[3];
    let spare = st.spare[0], hasSpare = st.hasSpare;

    for (let i = 0; i < n; i++) {
      let x;
      if (hasSpare) { x = spare; hasSpare = false; }
      else {
        // Marsaglia polar method, drawing two uniforms per attempt. The
        // xorshift128 step (period 2^128 − 1) is written out twice instead of
        // called through a closure: closing over the state words would allocate
        // a context object every block, and GC on the audio thread is audible
        // as a dropout.
        let u, v, q;
        do {
          let t = s3, p = s0;
          s3 = s2; s2 = s1; s1 = p;
          t = (t ^ (t << 11)) >>> 0;
          t = t ^ (t >>> 8);
          s0 = (t ^ p ^ (p >>> 19)) >>> 0;
          u = s0 * 4.656612873077393e-10 - 1;     // → [−1, 1)

          t = s3; p = s0;
          s3 = s2; s2 = s1; s1 = p;
          t = (t ^ (t << 11)) >>> 0;
          t = t ^ (t >>> 8);
          s0 = (t ^ p ^ (p >>> 19)) >>> 0;
          v = s0 * 4.656612873077393e-10 - 1;

          q = u * u + v * v;
        } while (q >= 1 || q === 0);
        const m = Math.sqrt(-2 * Math.log(q) / q);
        spare = v * m; hasSpare = true; x = u * m;
      }
      if (x > 4) x = 4; else if (x < -4) x = -4;   // bound the Gaussian tail
      buf[i] = x;
    }

    rng[0] = s0; rng[1] = s1; rng[2] = s2; rng[3] = s3;
    st.spare[0] = spare; st.hasSpare = hasSpare;
  }

  /**
   * Renders two channels, running both through each filter section inside one
   * loop.
   *
   * The recurrence `y[n] = B0·x[n] + B1·x[n−1] − A1·y[n−1]` depends on its own
   * previous output, so a single channel cannot keep the CPU's arithmetic
   * pipeline busy — each multiply-add waits on the last. Two channels are
   * independent chains, so interleaving them lets the hardware overlap the two,
   * and the coefficient loads are shared. Measured 1.8× faster than filtering
   * the channels one after the other, with bit-identical output.
   *
   * @private
   * @param {Float32Array} outA First output buffer.
   * @param {Float32Array} outB Second output buffer.
   * @param {ChannelState} stA State for the first channel.
   * @param {ChannelState} stB State for the second channel.
   * @param {number} n Samples to render.
   * @returns {void}
   */
  _renderPair(outA, outB, stA, stB, n) {
    const bufA = this.scratchA, bufB = this.scratchB;
    this._fillNoise(bufA, stA, n);
    this._fillNoise(bufB, stB, n);

    const N = this.N, b0 = this.b0, b1 = this.b1, a1 = this.a1;
    const x1A = stA.x1, y1A = stA.y1, x1B = stB.x1, y1B = stB.y1;
    for (let k = 0; k < N; k++) {
      const B0 = b0[k], B1 = b1[k], A1 = a1[k];
      let pxA = x1A[k], pyA = y1A[k], pxB = x1B[k], pyB = y1B[k];
      for (let i = 0; i < n; i++) {
        const xa = bufA[i], ya = B0 * xa + B1 * pxA - A1 * pyA;
        pxA = xa; pyA = ya; bufA[i] = ya;
        const xb = bufB[i], yb = B0 * xb + B1 * pxB - A1 * pyB;
        pxB = xb; pyB = yb; bufB[i] = yb;
      }
      x1A[k] = pxA; y1A[k] = pyA; x1B[k] = pxB; y1B[k] = pyB;
    }

    const ramp = this.ramp;
    for (let i = 0; i < n; i++) {
      outA[i] = bufA[i] * ramp[i];
      outB[i] = bufB[i] * ramp[i];
    }
  }

  /**
   * Renders a single channel. Used for mono, and for the odd channel out when
   * the count is not even.
   *
   * @private
   * @param {Float32Array} out Output buffer.
   * @param {ChannelState} st Channel state.
   * @param {number} n Samples to render.
   * @returns {void}
   */
  _renderOne(out, st, n) {
    const buf = this.scratchA;
    this._fillNoise(buf, st, n);

    const N = this.N, b0 = this.b0, b1 = this.b1, a1 = this.a1;
    const x1 = st.x1, y1 = st.y1;
    for (let k = 0; k < N; k++) {
      const B0 = b0[k], B1 = b1[k], A1 = a1[k];
      let px = x1[k], py = y1[k];
      for (let i = 0; i < n; i++) {
        const x = buf[i];
        const y = B0 * x + B1 * px - A1 * py;
        px = x; py = y;
        buf[i] = y;
      }
      x1[k] = px; y1[k] = py;
    }

    const ramp = this.ramp;
    for (let i = 0; i < n; i++) out[i] = buf[i] * ramp[i];
  }
}
