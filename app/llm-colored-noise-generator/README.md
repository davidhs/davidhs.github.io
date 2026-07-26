# Colored Noise Generator

A web page that synthesises **colored noise** — white, pink, brown and everything in
between — in real time, with a slider that sweeps continuously through the colors.

The noise is genuinely generated, sample by sample, as you listen. There is no
audio file, no pre-rendered buffer, and no loop point.

This README explains how the whole thing works, from the physics of "what is pink
noise" down to why the audio callback is forbidden from allocating memory. It
assumes you can read JavaScript but not that you know any signal processing.

---

## Contents

1. [Running it](#1-running-it)
2. [What "colored noise" actually means](#2-what-colored-noise-actually-means)
3. [Why not just loop a recording?](#3-why-not-just-loop-a-recording)
4. [Architecture](#4-architecture)
5. [Step one: making white noise](#5-step-one-making-white-noise)
6. [Step two: coloring it](#6-step-two-coloring-it) ← the interesting part
7. [Step three: keeping the loudness sane](#7-step-three-keeping-the-loudness-sane)
8. [Step four: the low cut](#8-step-four-the-low-cut)
9. [The rules of the audio thread](#9-the-rules-of-the-audio-thread)
10. [The fallback path](#10-the-fallback-path)
11. [How any of this was verified](#11-how-any-of-this-was-verified)
12. [Things to try](#12-things-to-try)

---

## 1. Running it

The page uses ES modules, and browsers refuse to load those from a `file://` URL
(it violates the same-origin policy). So it needs to be served over HTTP:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>. VS Code's Live Server extension
works too. If you open the file directly, a banner will tell you this.

---

## 2. What "colored noise" actually means

Noise is a signal with no periodic structure — every sample is random. But "random"
doesn't say anything about *which frequencies* carry the energy. That's what the
color names describe.

The measure is **power spectral density** (PSD): how much power the signal carries
per unit of bandwidth, as a function of frequency. Every noise color in this family
follows the same rule:

```
PSD(f)  ∝  1 / f^α
```

One number, `α` (alpha), picks the color:

| α | Name | Character |
|---|------|-----------|
| −2 | Violet | Harsh, all treble |
| −1 | Blue | Bright hiss |
| 0 | White | Flat — equal power at every frequency |
| +1 | Pink | Balanced, "natural"; equal power per octave |
| +2 | Brown | Deep rumble, like heavy rain or surf |
| +3, +4 | (no standard name; "black") | Very deep, almost all bass |

Because `α` is just a number, it doesn't have to be an integer. `α = 0.5` is a real,
meaningful noise color halfway between white and pink. **This is the whole idea
behind the slider**: rather than offering five presets, the app treats `α` as a
continuous knob.

### Converting to decibels per octave

Audio people don't usually think in terms of `1/f^α`; they think in **dB per
octave** (an octave is a doubling of frequency). The conversion:

```
PSD in dB      = 10·log₁₀(f^−α)  =  −10·α·log₁₀(f) + C

double f:      Δ = −10·α·log₁₀(2)  =  −3.0103·α  dB per octave
```

So:

- Pink (`α=1`) falls at **−3.01 dB/octave**
- Brown (`α=2`) falls at **−6.02 dB/octave**
- Violet (`α=−2`) *rises* at **+6.02 dB/octave**

That number in the app's readout is computed with exactly this formula.

### Why pink sounds "balanced"

An octave from 100–200 Hz is 100 Hz wide. The octave from 1000–2000 Hz is 1000 Hz
wide — ten times as much bandwidth. With white noise, that high octave therefore
carries ten times the power, which is why white noise sounds hissy and top-heavy.

Pink noise's `1/f` falloff exactly cancels the widening, so **every octave carries
the same total power**. Since human hearing is roughly logarithmic in frequency,
pink noise sounds even across the spectrum. This is why it's the standard test
signal for tuning sound systems.

---

## 3. Why not just loop a recording?

The obvious way to make a noise page is to fill an `AudioBuffer` with random
numbers and play it on repeat:

```js
// The approach this project deliberately does NOT take
const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
source.buffer = buffer;
source.loop = true;
```

This is easy and it's what many noise sites do. The problem is that a repeating
signal **is no longer noise**. A 5-second loop has a periodicity of 5 seconds, which
puts a comb of spectral spikes at multiples of 0.2 Hz. You may not consciously
identify it, but the ear is very good at picking up repetition, and after a while a
loop starts to sound like a texture with a "seam" in it.

Instead, this project computes every sample on demand. The generator has a period
of 2¹²⁸−1 samples — at 48 kHz that's about **10²⁶ years** before it repeats — and
it's seeded from the clock on every page load, so you never hear the same stream
twice.

---

## 4. Architecture

```
index.html            markup only
css/noise.css         all presentation
js/main.js            entry point: DOM wiring, color palette, persistence
js/noise-player.js    Web Audio graph and transport (play/stop/volume)
js/spectrum-view.js   the canvas spectrum display
js/noise-engine.js    ★ the DSP — where the noise is actually made
js/noise-processor.js AudioWorklet wrapper around the engine
```

### The signal chain

```
 NoiseEngine  →  highpass  →  highpass  →  master gain  →  speakers
 (worklet)       (low cut, 2 stages = 24 dB/oct)    │
                                                    └──→ analyser → canvas
```

### The two-thread problem

Browsers run audio on a **separate, high-priority thread** from the one your page's
JavaScript normally uses. That thread wakes up every 128 samples (2.67 ms at 48 kHz)
and must produce the next block *before* the deadline. Miss it, and the sound card
plays whatever is left in the buffer — an audible click.

`AudioWorklet` is the API that lets you run your own JavaScript on that thread.
`js/noise-processor.js` is the tiny wrapper that does it:

```js
class NoiseProcessor extends AudioWorkletProcessor {
  process(_inputs, outputs) {
    const out = outputs[0];
    this.engine.process(out, out[0].length);
    return true;                 // keep me alive
  }
}
registerProcessor('noise-processor', NoiseProcessor);
```

`NoiseEngine` itself lives in its own module and imports cleanly into both the
worklet and the main thread, so both code paths run byte-identical DSP. It contains
no DOM or Web Audio references at all — it's pure numbers in, numbers out, which is
also what makes it testable outside a browser (see [§11](#11-how-any-of-this-was-verified)).

---

## 5. Step one: making white noise

White noise is the raw material. Color it later; first we need a flat-spectrum
random signal.

### The random number generator

`Math.random()` would work, but the engine uses its own **xorshift128** generator:

```js
let t = s3, p = s0;
s3 = s2; s2 = s1; s1 = p;
t = (t ^ (t << 11)) >>> 0;
t = t ^ (t >>> 8);
s0 = (t ^ p ^ (p >>> 19)) >>> 0;
const u = s0 * 4.656612873077393e-10 - 1;    // → [−1, 1)
```

Four 32-bit words of state, a few shifts and XORs, and it produces a sequence of
length 2¹²⁸−1. Reasons to hand-roll it rather than call `Math.random()`:

- **Explicit seeding.** Each channel gets its own independent stream, which is what
  makes the stereo image wide (see below). `Math.random()` gives you no control.
- **Known period.** We can state the non-repetition guarantee precisely.
- **No allocation.** Covered in [§9](#9-the-rules-of-the-audio-thread) — this matters more than you'd think.

The magic constant `4.656612873077393e-10` is `2 / 2³²`, which maps the unsigned
32-bit integer onto `[0, 2)`; subtracting 1 gives `[−1, 1)`.

### From uniform to Gaussian

Truly "white" noise in the physical sense has a **Gaussian** amplitude distribution,
not a uniform one. The engine converts using the **Marsaglia polar method**:

```js
let u, v, q;
do {
  u = <uniform in [−1,1)>;
  v = <uniform in [−1,1)>;
  q = u * u + v * v;
} while (q >= 1 || q === 0);      // reject points outside the unit circle
const m = Math.sqrt(-2 * Math.log(q) / q);
// u*m and v*m are now two independent Gaussian samples
```

Throw darts at a square; keep the ones landing inside the inscribed circle; apply
that transform, and out come two normally-distributed numbers. Since it produces a
*pair*, the engine caches the second one (`spare`) for the next sample.

The result is then clamped to ±4 standard deviations. A Gaussian has unbounded
tails, and while a 6σ sample is astronomically rare, "astronomically rare" happens
regularly at 48,000 samples per second. Clamping bounds the peak deterministically;
it affects roughly 0.006% of samples and its spectral contribution is far below
anything audible.

### Stereo

Each channel has a completely independent generator with its own seed. Two
uncorrelated noise streams sound wide and enveloping, whereas the same stream in
both ears collapses to a point in the middle of your head. Measured correlation
between the channels is about 0.005 — i.e. zero.

---

## 6. Step two: coloring it

Here's the core problem: **we need a filter whose response falls at an arbitrary,
continuously adjustable slope** of −3α dB/octave.

That's unusual. Textbook filters have slopes that are integer multiples of
6 dB/octave (one per filter order) — you cannot build a −3 dB/octave filter by
cascading standard sections. A slope of −3 dB/octave is, in a real sense, a
"half-order" filter.

### The building block

Take a first-order section with one pole and one zero:

```
          1 + s/ω_z
H(s)  =  ───────────        with the zero above the pole (ω_z > ω_p)
          1 + s/ω_p
```

Its magnitude response has three regions:

```
gain
 1  ────────╮
            ╲              ← falls at 6 dB/octave between ω_p and ω_z
             ╲
 ω_p/ω_z      ╰────────
            ω_p    ω_z              frequency (log scale)
```

Flat, then a 6 dB/octave ramp, then flat again. It's a **shelf**. The total drop
across the shelf is `20·log₁₀(ω_z/ω_p)` dB.

### The trick: stack shelves

Now place a whole row of these shelves at geometrically spaced frequencies —
`f₀`, `f₀·R`, `f₀·R²`, … — each one dropping by the same amount. Individually they
are staircase steps. Stacked, the steps blur into what is, on average, a straight
line of any slope you like:

```
      ╲╌╌╮
         ╲╌╌╮            each section contributes one small step;
            ╲╌╌╮         together they approximate a constant slope
               ╲╌╌╮
```

Here's the satisfying part. Over one frequency ratio `R`, exactly one section
completes its drop, so the cascade falls by `20·log₁₀(ratio)` dB per factor of `R`.
Converting to dB per octave, where a factor `R` spans `log₂(R)` octaves:

```
dB/octave = 20·log₁₀(ratio) / log₂(R)
```

Choose the ratio to be `R^γ` and watch what happens:

```
dB/octave = 20·γ·log₁₀(R) / log₂(R)
          = 20·γ·log₁₀(R) / (log₁₀(R)/log₁₀(2))
          = 20·γ·log₁₀(2)
          = 6.02·γ
```

**The `R` cancels out completely.** The slope depends only on `γ`, not on how
densely you space the sections. Set `γ = α/2` and you get exactly −3.01·α dB/octave
— any slope, continuously adjustable, from one parameter.

(Why `α/2`? Because PSD is *power*, which is amplitude squared. A filter with
amplitude response `f^−γ` produces a PSD of `f^−2γ`, so `γ = α/2`.)

The spacing `R` doesn't affect the slope, but it does affect the **ripple** — how
much the staircase wobbles around the ideal line. Denser spacing, smaller steps,
smoother result. This project uses a quarter octave (`R = 2^0.25`), giving 42
sections from 18 Hz up to just under Nyquist.

### Going digital, and the bug that lurks there

The above is analog design. To get a digital filter we use the **bilinear
transform**, which maps the analog frequency axis onto the digital one:

```
Ω  =  (2/T)·tan(ω·T/2)
```

That `tan` is the catch. It's near-linear at low frequencies but blows up
approaching Nyquist, **compressing the entire infinite analog axis into the finite
digital one**. If you naively place your zero at `f_p · R^γ` Hz and transform, the
warping stretches the pole-to-zero ratio near the top of the band. Each
high-frequency section then drops *more* than it should, and the slope steepens.

This was a real bug in this project, and it was not subtle. Measured against the
ideal line, brown noise came out **9 dB low at 20 kHz**.

The fix is to stop thinking in Hz and set the ratio *in the warped domain*. Define

```js
K = 1 / Math.tan(Math.PI * f / sampleRate)
```

and place the zero by scaling `K` directly:

```js
const rg = Math.pow(POLE_SPACING, -alpha * 0.5 * SLOPE_COMP);   // hoisted: same for every section
for (let k = 0; k < fp.length; k++) {
  const Kp = 1 / Math.tan(Math.PI * Math.min(fp[k], fMax) / sampleRate);
  const Kz = Kp * rg;
  const d  = 1 + Kp;
  b0[k] = (1 + Kz) / d;
  b1[k] = (1 - Kz) / d;
  a1[k] = (1 - Kp) / d;
}
```

Note that the ratio `rg` is identical for every section — the whole cascade is
retuned by recomputing one `Math.pow` and then a handful of divisions per section.
That's what makes the color slider cheap enough to update on every audio block.

Why this works — evaluate the resulting digital section at DC (`z=1`) and at
Nyquist (`z=−1`):

```
H(1)  = (b0 + b1)/(1 + a1) = 1              gain 1 at DC, always
H(−1) = (b0 − b1)/(1 − a1) = Kz/Kp = R^−γ   exactly the intended drop
```

So **every section drops by exactly the right amount**, no matter where it sits in
the band, while the poles remain geometrically spaced in real frequency. The slope
now holds all the way to Nyquist: the error at 20 kHz went from −9.03 dB to
−0.48 dB.

Each section is then just a two-tap difference equation:

```js
const y = B0 * x + B1 * px - A1 * py;      // px, py = this section's previous in/out
```

42 sections × 2 channels × 48,000 samples ≈ 4 million of these per second.

### Loop order matters more than the arithmetic

There are two ways to organise that work, and they are not equally fast.

The obvious one is **sample-major**: take a sample, push it through all 42 sections,
write it out, repeat. But then every section, for every sample, re-reads three
coefficients and two state values from arrays — about seven memory accesses per
section per sample.

The alternative is **section-major**: generate the whole block of white noise into a
scratch buffer, then run section 0 across the entire block, then section 1, and so
on.

```js
for (let k = 0; k < N; k++) {
  const B0 = b0[k], B1 = b1[k], A1 = a1[k];   // loaded once per block, not per sample
  let px = x1[k], py = y1[k];                 // state lives in registers
  for (let i = 0; i < frameCount; i++) {
    const x = buf[i];
    const y = B0 * x + B1 * px - A1 * py;
    px = x; py = y;
    buf[i] = y;
  }
  x1[k] = px; y1[k] = py;                     // written back once per block
}
```

The coefficients and state are now hoisted into locals for the whole block, leaving
one read and one write per sample. Identical arithmetic in an identical order — the
output is bit-for-bit the same — but **1.6× faster through the cascade**.

### And a second helping, from filling the pipeline

There's a further problem hiding in that inner loop. Look at what `y` depends on:

```js
const y = B0 * x + B1 * px - A1 * py;    // py is the PREVIOUS y
```

Every iteration needs the result of the previous one. That's a **serial dependency
chain**: the CPU can start a new multiply every cycle in principle, but here it must
wait out the full latency of the last multiply-add before it can begin the next.
The arithmetic units sit mostly idle.

The fix is to give the CPU something else to chew on — and there's an obvious
candidate, because stereo means two completely independent chains. Filtering both
channels inside the same section loop lets the hardware overlap them, and the
coefficient loads are shared between the two:

```js
for (let i = 0; i < n; i++) {
  const xa = bufA[i], ya = B0 * xa + B1 * pxA - A1 * pyA;
  pxA = xa; pyA = ya; bufA[i] = ya;
  const xb = bufB[i], yb = B0 * xb + B1 * pxB - A1 * pyB;   // independent of ya
  pxB = xb; pyB = yb; bufB[i] = yb;
}
```

Another **1.8×**, again with bit-identical output. Channels are therefore rendered
in pairs, with a single-channel path for mono and for the odd one out.

Together the two reorderings took the engine from 1.07% to **0.46% of one CPU core**
— 2.3× faster, 217× realtime — without changing a single output sample.

The lesson generalises well beyond audio: the cost of numerical code is usually
dominated by how it moves data and whether it can keep the pipeline full, not by how
many multiplies it contains. Same FLOPs, same results, less than half the time.

### `SLOPE_COMP`

One residual: because each shelf spreads its transition over several octaves rather
than confining it between its own pole and zero, the realised slope comes out about
1.4% shallow. `SLOPE_COMP = 1.0211` corrects it. It was *measured*, not derived —
build the filter, fit a line to its response, take the ratio. It is specific to the
quarter-octave spacing and would need recalibrating if `POLE_SPACING` changed, which
is why the code says so in a comment.

The result across the whole range (α from −2 to +4): slope error ≤ **0.054
dB/octave**, ripple within **±0.6 dB**.

---

## 7. Step three: keeping the loudness sane

If you just apply the filter, the output level swings wildly. Violet noise is
almost all treble and quiet; brown noise concentrates enormous energy at the bottom.
Across the slider the raw RMS varies by **more than 60 dB**. Dragging the slider
would be an unpleasant experience.

So the engine precomputes a compensating gain. For each of 81 values of α it
numerically integrates the filter's power response over the audible band:

```js
let p = 1;
for (let k = 0; k < N; k++) {
  p *= (B0*B0 + B1*B1 + 2*B0*B1*c) / (1 + A1*A1 + 2*A1*c);   // |H_k(f)|²
}
acc += p * wgt[j];
```

(That expression is the squared magnitude of a first-order section evaluated at
`c = cos(2πf/fs)` — the standard closed form, which avoids any complex arithmetic.)

Two details worth understanding:

**The frequency grid is logarithmic, but the integral is linear.** Power is
`∫ p(f) df`, yet a linear grid would waste nearly all its points above 1 kHz and
badly under-resolve the bass, which is precisely where brown noise lives. Using the
substitution `df = f · d(ln f)`, a log-spaced grid weighted by `f` computes the same
integral with points where they're actually needed.

**The low cut is part of the model.** With deep colors most of the raw energy sits
below the cutoff and gets thrown away. Normalising without accounting for it would
leave the audible part far too quiet, so the weighting includes the highpass
response. This is why moving the Low cut slider triggers a table rebuild.

The stored value is a gain in dB, interpolated between grid points at runtime:

```js
tbl[m] = 20 * Math.log10(TARGET_RMS / Math.sqrt(acc / den))
       + TILT_DB * Math.min(a, TILT_CAP_ALPHA);
```

### The tilt, and why it's capped

Equal RMS does not mean equal loudness. Human hearing is far less sensitive at
30 Hz than at 3 kHz, so brown noise at the same RMS as white sounds much quieter.
`TILT_DB = 2.5` adds 2.5 dB per unit α to compensate.

But an uncapped tilt is dangerous. At α=4 it boosts by 10 dB and pushes peaks to
**1.72** — hard clipping. `TILT_CAP_ALPHA = 2` holds the tilt flat past brown. Level
is then constant from α=2 to α=4, and the worst peak measured anywhere in the entire
(color × low-cut) space is **0.747**, leaving 2.5 dB of headroom.

### Smoothing

Changing filter coefficients instantly, while the filter's internal state holds
large values, produces a click. Two smoothers prevent it:

- **α** glides toward its target with a ~50 ms time constant, updated once per
  block. Coefficients are constant *within* a block, which is both cheaper and
  perfectly adequate at 2.67 ms per block.
- **Gain** is ramped **per sample** (~30 ms), because gain discontinuities are far
  more audible than filter-shape discontinuities.

---

## 8. Step four: the low cut

Brown noise has a genuine physical problem. Measured on the raw output, **47% of its
power sits below 40 Hz**.

Most speakers cannot reproduce 30 Hz. Feeding them a lot of it doesn't produce a
deep sound; it drives the cone to its excursion limit, where it distorts — an
intermittent, growly noise that has nothing to do with the signal you asked for.
Deeper colors make it worse, which is exactly why the extended α range needs this
control.

The fix is a **highpass filter**: two cascaded `BiquadFilterNode`s giving
24 dB/octave. One 12 dB/octave stage leaves too much through.

```js
this._lowCutFilters = [0, 1].map(() => {
  const filter = this.context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = this._lowCutHz;
  filter.Q.value = 0.707;
  return filter;
});
```

Effect on brown's sub-40 Hz share:

| Low cut | Share of power below 40 Hz |
|---------|---------------------------|
| 18 Hz, 12 dB/oct (the original) | 47% |
| 30 Hz, 24 dB/oct (default) | 16% |
| 60 Hz, 24 dB/oct | 0.7% |

It's a user control rather than a fixed value because the right setting depends
entirely on your speakers — headphones handle 30 Hz fine, laptop speakers want
80 Hz or more.

Because the gain table models the low cut, moving the slider requires rebuilding it.
That takes a few milliseconds, far too long for the audio thread, so it's built on
the **main** thread and shipped over:

```js
const table = buildGainTable(this.context.sampleRate, this._lowCutHz);
this._worklet.port.postMessage({ gainTable: table });   // structured clone takes the typed array as-is
```

and debounced by 150 ms so a slider drag doesn't trigger dozens of rebuilds. The
filter frequency itself updates immediately — only the loudness compensation lags
slightly, which nobody can perceive.

---

## 9. The rules of the audio thread

This section is the most transferable lesson in the project.

The audio callback has 2.67 ms to produce 128 samples. Everything on that thread is
subject to that deadline — **including garbage collection**. If the JavaScript
engine decides to collect while your callback is running, the pause can blow the
deadline, and the sound card emits whatever was in the buffer. A dropped buffer is a
step discontinuity in the waveform, which spectrally is a **broadband click**.

The original version of this engine did this, roughly once per second. The symptom
reported was:

> a blip that takes a tiny fraction of a second. Sometimes there is nothing,
> sometimes it appears, randomly clusters. It appears to cover the spectrum.

Broadband, brief, clustered — that's a textbook description of GC-induced dropouts,
and it's diagnostic. (Speaker overload, the other suspect, produces low-mid harmonic
distortion, not a full-spectrum click.) It was most audible on brown noise not
because brown triggered it, but because a broadband click is masked by white noise's
hiss and glaringly obvious against brown's dark background.

Two separate causes, both worth knowing about:

### Cause 1: closures allocate

The RNG was originally a neat little arrow function inside the render loop:

```js
const uni = () => { /* ...mutates s0..s3... */ };   // ← allocates!
```

A closure that captures mutable local variables forces the engine to heap-allocate a
**context object** to hold them, plus the function object itself — every block,
forever. The fix is to write the RNG out inline. It's less elegant, and the code says
why:

> The xorshift128 step is written out twice instead of called through a closure:
> closing over the state words would allocate a context object every block, and GC
> on the audio thread is audible as a dropout.

### Cause 2: object properties holding doubles allocate

This one is much less obvious. In V8, a plain object property holding a
double-precision number is stored as a pointer to a boxed **heap number**. So this,
executed every block:

```js
this.alpha += (this.alphaTarget - this.alpha) * this.aSmooth;
```

allocates. So does every write-back of the RNG state. The fix is to keep that state
in **typed arrays**, whose elements are unboxed:

```js
this.live = new Float64Array(4);       // [alpha, alphaSet, gain, gainTarget]
st.rng    = Uint32Array.of(...);       // the four xorshift words
```

Readability is preserved with named index constants and accessors, so the rest of
the code still says `this.alpha`:

```js
get alpha() { return this.live[LIVE_ALPHA]; }
set alpha(value) { this.live[LIVE_ALPHA] = value; }
```

### The measurement

Guessing about allocation is a waste of time; count it. Write a script that imports
the engine and renders ~13 minutes of audio in a loop, then let Node report every
collection with `--trace-gc` and count them:

```bash
node --trace-gc your-render-loop.mjs 2>&1 | grep -c "Scavenge\|Mark-Compact"
```

One trap: allocate the array of channel buffers *outside* the loop. Writing
`engine.process([left, right], 128)` allocates a fresh array on every call, and
you'll spend a while blaming the engine for your test harness's garbage.

| Version | GC events per 13 min of audio |
|---------|------------------------------|
| Original (closure) | 875 |
| After inlining the RNG | 23 |
| After typed-array state | ~0 |

The last row needs care to interpret. The raw count didn't reach literally zero —
it sat at about 21, the same as Node's own module-loading baseline. The way to tell
those apart is to **vary the workload**: render 30k blocks, then 150k, then 300k.

```
process() × 30000   ->  21
process() × 150000  ->  20
process() × 300000  ->  21
```

Flat. If the callback still allocated, ten times the work would mean ten times the
collections. It doesn't, so the remaining events aren't ours. **A flat scaling curve
is much stronger evidence than a small absolute number.**

The general rule for any real-time audio callback, in any language: **no allocation,
no locks, no I/O, no unbounded loops.** Everything is preallocated in the
constructor — which is why the engine takes a `maxBlock` option: the player passes
the block size it will actually ask for (128 for the worklet, 4096 for the
fallback), so the scratch buffers are sized exactly once and never grow.

### The main thread matters too

The animation loop had the same disease in a milder form. Building the spectrum
curve as an array of `[x, y]` pairs allocated **337 arrays per frame — about 20,000
objects a second** — and the drawing code rebuilt its colour strings and fill
gradient every frame on top of that.

None of that can stall the audio thread when the worklet is in use. But it does
drive main-thread collections, which cost animation frames, and on the
ScriptProcessor fallback the audio *is* generated on the main thread — so there it
causes exactly the dropouts of the previous section. The curve now lives in a
preallocated `Float64Array` of interleaved coordinates, the styles are cached until
the colour actually changes, and the accent colour is recomputed on slider input
rather than 60 times a second.

### Doing nothing is the best optimisation

Drawing turned out to be the most expensive thing the page does on the main thread —
measured at 0.193 ms per frame on a desktop, and a phone has several times the
pixels on a much slower CPU. Four changes, in increasing order of how much they
save:

- **Cap the redraw at 30 fps.** The analyser is heavily smoothed, so the curve
  crawls; 30 fps is indistinguishable from 60.
- **Stop when the canvas scrolls off screen** (`IntersectionObserver`).
  `requestAnimationFrame` already stops for a hidden tab, but not for a canvas
  merely scrolled past — easy to do on a phone, where the page runs well past one
  screen.
- **Only redraw for changes that alter the picture.** The idealised line depends on
  the colour alone, so moving the volume or low-cut slider no longer touches the
  canvas.
- **Don't animate at all unless asked.** The spectrum has a play/pause button and
  starts frozen, showing the curve the current settings *should* produce. Measured
  in the default state: **zero animation frames and zero main-thread milliseconds**,
  while the audio plays normally.

The frozen curve is meant to be the live one with the noise taken out, so it has to
agree in shape *and* in level. Three terms get it there:

1. The power law itself, which on log axes is a straight line of slope −3.01α.
2. The low cut, `|H|² = (r⁴/(1+r⁴))²` for `r = f/fc` — two cascaded second-order
   Butterworth highpasses, which is what produces the shoulder and the 24 dB/octave
   roll-off at the bottom.
3. The vertical placement: normalise the curve to unit integrated power, then add
   back the engine's loudness tilt. Normalising by total power is what makes this
   track automatically, because holding total power constant is exactly what the
   engine's gain table does.

That leaves one constant, covering the analyser's own FFT and window scaling
together with the engine's target RMS. It was measured against live data rather than
derived, and it holds to about 2 dB across every colour and low-cut setting — under
0.3 dB for pink and brown. Checked by tracing both curves out of the rendered pixels
and comparing: they agree to **within 1.5 px on a 210 px canvas**.

Both curves also have to be mapped onto the display through the *same* level
bounds — the live one through the analyser's `minDecibels`/`maxDecibels`, the frozen
one through constants. So the view owns those bounds and the player configures its
analyser from them; if the two ever drifted apart, the curves would stop lining up
again. The span is exactly 100 dB so the five divisions land on round 20 dB steps,
and the axis is labelled relative to the top of the display, because the analyser's
absolute dB values are an artefact of its FFT and window scaling and would mean
nothing on screen.

The audio context is also created with `{ latencyHint: 'playback' }`. Continuous
noise has nothing to be responsive to, so trading latency for a larger output buffer
is free — the audio thread wakes far less often and has much more slack before it
misses a deadline, which is what matters on weak hardware.

### Three things the measurements contradicted

Every optimisation above was guessed first and measured second. Three of the guesses
were wrong, and the wrong ones are more instructive than the right ones.

**`localStorage` is not a disk write.** Settings were saved on every slider `input`
event, and that looked like the obvious villain: a synchronous storage API on the
end of a firehose. The firehose is real but bounded — browsers coalesce pointer
movement to the display refresh rate, so a range input emits at most one event per
animation frame, measured here at 62 per second on a 60 Hz display. It is a ceiling
while a slider is actually being dragged, though, not a rate: at rest nothing calls
it at all. Measured: **0.007 ms per call**, and the cost scales with payload
size at 550–900 MB/s. That is the signature of a `memcpy`, not of storage — a real
synchronous disk write is latency-bound and would cost roughly the same for 50 bytes
as for 5 KB. The spec requires synchronous *semantics* (after `setItem`, `getItem`
must see it), not durability; Chrome updates an in-memory map and batches commits to
disk in the background. It is still debounced to one write per gesture — but for the
IPC and storage churn each call causes, not for any cost to the page's frame time.

**Rendering below native resolution bought nothing.** The canvas clamped device
pixel ratio to 2, on the reasonable-sounding theory that more pixels cost more time.
Measured across backing stores of 0.14, 0.57 and 1.29 megapixels: **0.506, 0.505 and
0.451 ms**. Flat. The time goes into building the path, not filling it, and
rasterisation is the GPU's problem. The clamp is now 3, so iPhone Pro screens render
natively for free. Same lesson as the loop-order section: on modern hardware, guess
about memory and parallelism, not about arithmetic — and then check.

**A canvas with a stale backing store is silently rescaled.** The resize handler only
redrew while playback was stopped, so a frozen-but-playing spectrum kept whatever
dimensions it had at load: 682×210 inside a 297×210 box, squashed 1.15× horizontally
and drawn at half vertical resolution. A `ResizeObserver` on the canvas now refits on
any box change — rotation, window resize, a mobile URL bar collapsing. Worth knowing
the symptom, because nothing throws and nothing logs: the drawing simply looks
subtly wrong, and text is where you notice it first.

---

## 10. The fallback path

`AudioWorklet` is loaded asynchronously and can fail — old browsers, unusual
security configurations. If `addModule()` throws, the player falls back to the
deprecated `ScriptProcessorNode`:

```js
this._script = this.context.createScriptProcessor(SCRIPT_BLOCK, 1, 2);
this._script.onaudioprocess = (event) => {
  const buffer = event.outputBuffer;
  this._engine.process([buffer.getChannelData(0), buffer.getChannelData(1)],
                       buffer.length);
};
```

Same engine, same DSP — but it runs on the **main** thread, so it competes with
layout, rendering and everything else, and glitches far more readily. It uses a
4096-sample block (85 ms) to buy tolerance. It's a safety net, not a peer.

The status line at the bottom of the page tells you which one is active, which is
useful when diagnosing audio problems.

---

## 11. How any of this was verified

Because `noise-engine.js` is a pure module with no browser dependencies, it can be
imported straight into Node and measured. Every claim in this document was checked
that way rather than assumed.

The harnesses below aren't shipped in this repo — they're throwaway scripts. But
they're short, and rewriting them is itself a good exercise, so here's what each one
does and why.

**Spectral slope** — render 20 blocks of 32,768 samples, apply a Hann window, take
the FFT, average the periodograms (this is Welch's method; averaging is essential
because a single periodogram of noise is itself extremely noisy). Then fit a
straight line to the result in log-frequency/dB space and compare the slope with
−3.01·α.

**Exact filter response** — evaluate the transfer function analytically over a
frequency grid. This has no measurement noise at all, so it isolates *design* error
from *estimation* error. Both bugs in [§6](#6-step-two-coloring-it) were found this way; the periodogram alone
was too noisy to see them clearly.

**Headroom** — render 10 minutes of audio at the most extreme settings and record
the peak. Brown noise is a random walk, so its peak keeps creeping up with
observation time; a one-second test tells you nothing about what happens after an
hour.

**Allocation** — the `--trace-gc` scaling test described above.

**In the browser** — read pixels back out of the spectrum canvas to confirm the
rendered curve has the right slope. That verifies the *entire* chain end to end:
worklet, filters, analyser and drawing code.

Representative results at the defaults:

```
alpha   slope dB/oct   expected    error    peak
 -2.0         5.967      6.021     0.054    0.292
  1.0        -2.983     -3.010     0.027    0.498
  2.0        -5.999     -6.021     0.021    0.625
  4.0       -12.072    -12.041     0.031    0.542
```

---

## 12. Things to try

Good ways to build intuition by breaking things:

1. **Delete `SLOPE_COMP`** (set it to `1.0`) and measure the slope. You should find
   it about 1.4% shallow. This is the difference between "looks right" and "is
   right".

2. **Undo the warping fix.** Place the zero at `fp * R^γ` Hz and transform, instead
   of scaling `K`. Watch the top octave of brown noise collapse — and note that it's
   nearly invisible in the midband, which is why it's a good example of a bug that
   only careful measurement finds.

3. **Change `POLE_SPACING` to a full octave.** Far fewer sections, much cheaper, and
   the ripple becomes clearly visible on the spectrum display as a wobble along the
   slope. Then recalibrate `SLOPE_COMP` for it.

4. **Put the closure back** in the render loop and run the `--trace-gc` test. Seeing
   875 collections appear from one arrow function is memorable.

5. **Remove the Gaussian conversion** and use the raw uniform values. Measure the
   spectrum: it's still perfectly flat, because whiteness is about *independence
   between samples*, not about the distribution of any one sample. Whether you can
   *hear* a difference is a genuinely interesting question to test on yourself.

6. **Extend `ALPHA_MAX` past 4** and find where it breaks. (Hints: ripple grows as
   each section has to drop further, and the headroom analysis in
   [§7](#7-step-three-keeping-the-loudness-sane) no longer holds.)

7. **Swap the cascade back to sample-major order** — one sample through all 42
   sections at a time — and time it. Verify the output is bit-identical while being
   substantially slower, then think about why.

8. **Un-pair the channels**, filtering each one separately, and time that too. The
   slowdown is pure pipeline stall: same instructions, but each one waiting on the
   last. Then try pairing *four* chains and see whether it keeps helping. (It
   shouldn't scale forever — at some point you run out of registers, and the loop
   starts spilling to memory.)

9. **Try to make the filter more accurate.** Add sections, extend the pole range,
   correct the slope per colour. Measure each attempt against the ideal line. This
   is an exercise in *not* optimising: the deviation is already below 0.25 dB where
   pink and brown live, and the residual is concentrated above 10 kHz where the deep
   colours have no energy left to be wrong about. Finding the point where more
   effort stops buying anything is a skill.

---

## Known issues

### A bell-like artifact when an installed iPhone web app is backgrounded

**Open. Diagnosed incorrectly at least once — read the whole entry before
retrying.**

*Symptom.* On iPhone, with the page added to the Home Screen so it launches
standalone, noise playing, screen turned off: the volume drops away, and then a
short higher-pitched bell-like tone rings and decays.

*Where it does not happen.* Desktop browsers. Also not in iOS Safari — only the
installed standalone app, which gets its own audio session.

*What was tried.* The hypothesis was that iOS cuts the render mid-waveform, and
that the resulting step discontinuity — broadband, like any step — excites the
phone speaker's mechanical resonance and rings it down. The mitigation was to ramp
the master gain to zero over 60 ms on `visibilitychange → hidden`, so the waveform
would already be at silence when the cut landed.

**It did not work.** The ramp mechanics were verified (60 ms reaches exactly zero,
and hiding a desktop tab correctly leaves the gain untouched), so the fade itself
behaves — the hypothesis or its timing is what is wrong.

*What that leaves.* Either the fade does not complete before the interruption
arrives, or the artifact is not a discontinuity in this page's output at all — it
could equally be iOS draining or resampling its own buffered audio as the session
tears down, which nothing here can influence.

*Next steps, cheapest first.* The first one is the important one, because it
decides whether this is even our bug:

1. **Reproduce with a trivial graph.** A bare `OscillatorNode` into the
   destination, nothing else, installed to the Home Screen. If the artifact is
   still there, it is iOS, not this code, and the rest of the list is moot.
2. **Log the state transitions.** iOS has a non-standard `interrupted`
   `AudioContext.state`. Watching `statechange` around a screen-off would show the
   actual sequence and whether `visibilitychange` even arrives first.
3. **Shorten or move the fade earlier.** If `visibilitychange` fires too late,
   there may be nothing to hook that fires early enough.
4. **Try `latencyHint: 'interactive'`.** The context currently asks for
   `'playback'`, which buys a large output buffer — good for dropout headroom, but
   it also means more buffered audio still to drain when the session is torn down.

The mitigation is left in place. It is correct behaviour on its own terms, and it
is paired with the restore-on-return path, which fixes a genuine separate bug:
without it the context stays suspended after unlock and playback never resumes.

---

## Who built this

See [`AUTHORS.md`](AUTHORS.md) for contributors and what each contributed. If you
work on this project, add an entry — the file records the model and effort level for
agent contributions, since output varies materially with both.

---

## Further reading

- **Bilinear transform and its frequency warping** — any DSP textbook; Julius O.
  Smith's online books are free and excellent.
- **Marsaglia polar method** — Marsaglia & Bray (1964).
- **xorshift generators** — Marsaglia, *Xorshift RNGs* (2003).
- **Welch's method** for spectral estimation — the reason the verification averages
  periodograms instead of taking one.
- **The AudioWorklet real-time constraint** — Ross Bencina's "Real-time audio
  programming 101: time waits for nothing" is the canonical explanation of why
  allocation on the audio thread is forbidden.
