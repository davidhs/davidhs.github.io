# Authors and credits

Who built this and what each contributed. This file is meant to be appended to:
if you work on this project — human or agent — add an entry.

## How to add an entry

Add a new dated section under **Contributors**, most recent last. Record what was
actually contributed, not a job title, and be specific enough that someone reading
later can tell who to ask about what.

For a human contributor, a name is enough.

For an AI agent, record enough to reproduce the conditions, because output varies
materially with all three:

| Field | Why it matters |
|-------|----------------|
| **Model** | The published name *and* the exact model ID |
| **Effort level** | Reasoning budget (`low` … `max`); changes depth and thoroughness |
| **Harness** | The tool the model ran inside, and whether it could execute code |

An agent that could run and measure its own work is doing something different from
one that could only write code, so note that too.

## Contributors

### David — project owner, direction, and testing

**Period:** 2026-07-26

Originated the project and set every requirement it is built around:

- The founding constraint: the noise must be **genuinely generated, never looped**.
  This is the decision that shaped the whole architecture — real-time synthesis on
  the audio thread rather than a buffer on repeat.
- A single continuous control for noise colour, rather than a handful of presets.
- Splitting the single-file prototype into HTML/CSS/ES modules with JSDoc.
- Extending the colour range past brown.
- The optimisation priority order that governed the later work: **audio quality
  first, then computational and memory cost**, with needless allocation and GC
  pressure called out specifically.
- The requirement that it run well on phones and weak devices, which drove the
  frame cap, the opt-in spectrum, and the `latencyHint` change.
- The spectrum freeze/animate control, and the requirement that the frozen curve be
  the live one "just perfectly smooth" — which is what forced the idealised curve to
  model the low cut and be level-calibrated instead of merely parallel.

Also found several defects, one of them decisively:

- **The intermittent audio blips.** The description — *"a blip that takes a tiny
  fraction of a second… randomly clusters… appears to cover the spectrum"* — is what
  identified the cause. Broadband, brief and clustered is the signature of
  GC-induced dropouts; speaker overload, the competing hypothesis being pursued at
  the time, produces low-mid distortion instead. That one observation redirected the
  diagnosis to the real bug.
- Mobile layout problems, and the repeating-gradient band at the bottom of short
  viewports.
- The inconsistency of labelling one axis with its unit and not the other.
- **The bell-like artifact when an installed iPhone web app is backgrounded** —
  still open, and recorded under "Known issues" in `README.md`. The report was
  precise enough to narrow it twice: to the screen-off transition specifically,
  and then to the standalone Home Screen app rather than Safari. An attempted fix
  was wrong; the narrowing survives it and is where the next attempt should start.

### Claude Opus 5 — implementation

**Model:** Claude Opus 5 (`claude-opus-5`), Anthropic
**Effort level:** max
**Harness:** Claude Code, with shell, filesystem and browser-automation access —
able to run Node, drive the page, and measure its own output
**Period:** 2026-07-26

Signal processing:

- The filter design: a cascade of first-order pole/zero sections at quarter-octave
  spacing, giving a continuously adjustable −3α dB/octave slope from one parameter.
- Diagnosed and fixed the bilinear-transform frequency warping that made brown noise
  9 dB low at 20 kHz, by setting each section's pole/zero ratio in the warped domain.
- Empirical slope calibration (`SLOPE_COMP`), loudness normalisation via a
  precomputed gain table, and the tilt cap that keeps deep colours inside full scale.
- Established that filter accuracy is already below audibility — deviation under
  0.25 dB where pink and brown live — and that adding sections would spend CPU for
  nothing. Knowing when to stop was part of the work.

Real-time correctness and performance:

- Found and fixed the cause of the audio blips: allocation in the audio callback,
  from a closure and then from boxed heap numbers. Went from ~875 collections per
  13 minutes of audio to zero, verified by workload scaling rather than by absolute
  count.
- Made the render loop 2.3× faster with two pure reorderings — section-major
  filtering and paired-channel processing — with bit-identical output.
- Removed ~20,000 allocations per second from the animation loop, and made the
  spectrum opt-in so the default state costs no main-thread time at all.

Application and presentation:

- Web Audio graph, `AudioWorklet` processor with a `ScriptProcessorNode` fallback,
  spectrum renderer, and the level-calibrated idealised curve.
- Responsive layout, device-pixel-ratio handling, and the axis labelling.

Verification and documentation:

- Test harnesses that import the shipped engine into Node and measure it: spectral
  slope by averaged periodogram, exact transfer-function evaluation, long-run
  headroom soaks, allocation scaling, and pixel-level comparison of the rendered
  curves.
- `README.md`, and the JSDoc throughout the source.

Several of its own assumptions were measured and found wrong — that `localStorage`
writes hit the disk, that canvas cost scales with pixel count, that denser filter
spacing would improve accuracy. Those are documented in `README.md` alongside the
corrections, since the wrong guesses are the more useful record.

Worth noting for whoever works on this next: every one of those was caught because
it could be measured from the development machine. The one open bug — the iOS
backgrounding artifact — is the one thing that could not be, and it is also the one
where a confident, wrong diagnosis made it into the code before the reporter tried
it on a real device. The pattern is not subtle. Treat any claim about iOS behaviour
in this repository as unverified until it has been run on a phone.
