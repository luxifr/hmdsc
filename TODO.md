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

### Larger ideas

1. **Documented assumptions table.** A cited table of defaults with their ranges
   would turn item 8 into a maintained artifact.

Not prioritized: the per-keystroke `innerHTML` rebuild of up to 18 SVGs in
`app.js`. It is cheap enough that `AGENTS.md`'s "avoid premature optimization"
rule applies.

## Completed

- Extracted DOM-independent state normalization, URL parsing, and load
  calculations into `calculation.js`; added `node:test` coverage for defaults,
  unit conversion, and URL/input clamping.
- Clarified that only the calculator scenario is saved locally; the display-unit
  selection is not persisted.
- Empty count now uses the minimum count for calculations without replacing the
  blank field; entering zero is normalized to one. Covered by Playwright tests.
- Moved the live announcement from the entire result card to the total and gave
  the stein visualizer an image role so its label is exposed to assistive tech.
- Added an inline SVG stein favicon with no extra asset file.
- Removed the redundant write to the fill-percentage output; its visible text
  remains covered by a browser test.
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
