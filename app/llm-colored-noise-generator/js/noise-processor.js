/**
 * @file AudioWorklet wrapper around {@link NoiseEngine}.
 *
 * Loaded with `audioWorklet.addModule()`, which evaluates this file as a module
 * script inside `AudioWorkletGlobalScope` — so the static import below resolves
 * there, and the audio thread runs exactly the same DSP code as the fallback
 * path on the main thread.
 */

/* global AudioWorkletProcessor, registerProcessor, sampleRate */

import { NoiseEngine } from './noise-engine.js';

/**
 * Options accepted through `AudioWorkletNodeOptions.processorOptions`.
 *
 * @typedef {Object} NoiseProcessorOptions
 * @property {number} [seed=1] PRNG seed for this instance.
 * @property {number} [alpha=0] Colour to start at, without a glide.
 * @property {number} [lowCutHz=40] Low cut the player applies, for level calibration.
 */

/**
 * Message the main thread posts to update the engine. Both fields are optional,
 * so colour and level calibration can be updated independently.
 *
 * @typedef {Object} UpdateMessage
 * @property {number} [alpha] Spectral exponent in [−2, 4].
 * @property {number[]} [gainTable] Table from `buildGainTable`, rebuilt off-thread
 *   whenever the low cut moves.
 */

/**
 * Renders continuous colored noise on the audio render thread.
 */
class NoiseProcessor extends AudioWorkletProcessor {
  /**
   * @param {{processorOptions?: NoiseProcessorOptions}} options Node options.
   */
  constructor(options) {
    super();

    const { seed = 1, alpha = 0, lowCutHz = 40 } = options.processorOptions ?? {};

    /** @type {NoiseEngine} */
    this.engine = new NoiseEngine(sampleRate, { channels: 2, seed: seed >>> 0, lowCutHz });
    this.engine.resetColor(alpha);

    this.port.onmessage = (/** @type {MessageEvent<UpdateMessage>} */ event) => {
      const { alpha: color, gainTable } = event.data;
      if (typeof color === 'number') this.engine.setColor(color);
      if (gainTable) this.engine.setGainTable(gainTable);
    };
  }

  /**
   * @param {Float32Array[][]} _inputs Unused; this node has no inputs.
   * @param {Float32Array[][]} outputs Output buses; only the first is written.
   * @returns {boolean} Always `true` — the node generates sound indefinitely,
   *   so it must never let itself be garbage collected.
   */
  process(_inputs, outputs) {
    const out = outputs[0];
    this.engine.process(out, out[0].length);
    return true;
  }
}

registerProcessor('noise-processor', NoiseProcessor);
