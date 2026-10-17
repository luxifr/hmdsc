# Improvement opportunities

## What it is

A static, dependency-free production page (`index.html`, `styles.css`, and
`app.js`) that estimates the load of beer steins carried by an Oktoberfest
waitress. Inputs are stein count, fill %, beer per stein, glass weight, beer
density, and glass-weight uncertainty. Outputs are total load, beer and glass
breakdown, a range, metric/imperial display, a visualizer, and a shareable URL.
Nothing is stored server-side. Playwright browser smoke tests run as
development-only tooling; there is no build step or CI.

## Prioritized improvements

### Quick wins

1. **README claims persistent preferences that are only partly true.** The
   README says "persistent local preferences". `localStorage` in `app.js` saves
   only the scenario. The unit choice in `let unit` is not saved or put in the
   share URL.

2. **Empty or zero count behaves inconsistently.** `readNumber` falls back to
   the default (12) when the field is empty, so clearing the field makes the
   result jump to 12. A typed `0` is clamped to 1 in the math while the input
   still shows 0. Both behaviors are in `app.js`'s `readState` path.

3. **Screen-reader noise and a no-op role.** `aria-live="polite"` is on the
   whole result card in `index.html`, so every keystroke re-announces the entire
   card. Put it on `#total` or `#range` instead. `aria-label` on the plain
   `div#visualizer` is ignored by assistive tech without a role.

4. **No favicon.** The `<head>` (lines 1-10) has no `<link rel="icon">`, so
   browsers will request `/favicon.ico` and get a 404. An inline SVG data-URI
   icon fixes it with no new files.

5. **Redundant write.** `render()` sets both `.value` and `.textContent` on
   `#fill-output` in `app.js`. Keep only one.

### Medium-effort

1. **Model inputs need sources.** The model is presented as "show your work",
   but the defaults are unsourced:
   - **Beer density 0.998 kg/L** (`app.js` defaults and `index.html` input): this
     is essentially the density of water at 20 °C. Engineering Toolbox gives
     0.99821 kg/L for water at 20 °C
     (https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html).
     Märzen original gravity is about 1.053–1.055 SG
     (https://en.wikipedia.org/wiki/M%C3%A4rzen, via search summary). Finished
     beer is slightly above 1.000 kg/L (same summary). Estimate: real beer is
     roughly 1% denser than the default, about +0.1 kg on 12 × 1 L. This is an
     estimate, not a measured value, and it is small, but the label "beer
     density" is inaccurate for this number. The pages were not opened directly;
     these are search-summary facts.
   - **Empty glass weight 1.3 kg** (`app.js` defaults and `index.html` input): no
     source in the repo or the README. It was not verified.

2. **Pure calculation function and tests.** The math is inside `render()` in
   `app.js` and tied to the DOM. Extract `computeLoad(state, unit)` and test it
   with `node:test`, with no dependency. Useful checks:
    - defaults give 27.58 kg total (matches the static equations in `index.html`);
    - unit round-trip stays stable;
    - `stateFromSearch` clamps bad URL values.

### Larger ideas

1. **Documented assumptions table.** A cited table of defaults with their ranges
   would turn item 8 into a maintained artifact.

Not prioritized: the per-keystroke `innerHTML` rebuild of up to 18 SVGs in
`app.js`. It is cheap enough that `AGENTS.md`'s "avoid premature optimization"
rule applies.

## Completed

- Added Playwright Chromium smoke tests for unit conversions, reset, share-link
  creation/reload, URL validation, saved scenarios, and stepper limits. Setup and
  run commands are documented in `README.md`.
- Split the embedded stylesheet and script out of `index.html` into
  `styles.css` and `app.js`, preserving the dependency-free, no-build setup.

## Sources

- Repository: `AGENTS.md`, `README.md`, `index.html` (line references above).
- https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html:
  water density at 20 °C (search summary, not opened).
- https://en.wikipedia.org/wiki/M%C3%A4rzen: Märzen gravity and style (search
  summary, not opened).
