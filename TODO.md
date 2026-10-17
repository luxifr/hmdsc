# Improvement opportunities

## What it is

A static, dependency-free single page (`index.html`, about 28 KB) that estimates
the load of beer steins carried by an Oktoberfest waitress. Inputs are stein
count, fill %, beer per stein, glass weight, beer density, and glass-weight
uncertainty. Outputs are total load, beer and glass breakdown, a range,
metric/imperial display, a visualizer, and a shareable URL. Nothing is stored
server-side. The repo is three files: `AGENTS.md`, `README.md`, `index.html`.
There is no `package.json`, no tests, no CI, no LICENSE, and no git remote.

## Prioritized improvements

### Quick wins

1. **README claims persistent preferences that are only partly true.** The
   README says "persistent local preferences". `localStorage` saves only the
   scenario (`index.html:199`). The unit choice in `let unit` (~line 119) is not
   saved or put in the share URL.

2. **Empty or zero count behaves inconsistently.** `readNumber` falls back to
   the default (12) when the field is empty (~`:128-135`), so clearing the field
   makes the result jump to 12. A typed `0` is clamped to 1 in the math (`:129`)
   while the input still shows 0.

3. **Screen-reader noise and a no-op role.** `aria-live="polite"` is on the
   whole result card (`index.html:84`), so every keystroke re-announces the
   entire card. Put it on `#total` or `#range` instead. `aria-label` on the
   plain `div#visualizer` (`:93`) is ignored by assistive tech without a role.

4. **No favicon.** The `<head>` (lines 1-10) has no `<link rel="icon">`, so
   browsers will request `/favicon.ico` and get a 404. An inline SVG data-URI
   icon fixes it with no new files.

5. **Redundant write.** `render()` sets both `.value` and `.textContent` on
   `#fill-output` (~`:180-181`). Keep only one.

### Medium-effort

1. **Model inputs need sources.** The model is presented as "show your work",
   but the defaults are unsourced:
   - **Beer density 0.998 kg/L** (`index.html:118`, `:77`): this is essentially
     the density of water at 20 °C. Engineering Toolbox gives 0.99821 kg/L for
     water at 20 °C
     (https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html).
     Märzen original gravity is about 1.053–1.055 SG
     (https://en.wikipedia.org/wiki/M%C3%A4rzen, via search summary). Finished
     beer is slightly above 1.000 kg/L (same summary). Estimate: real beer is
     roughly 1% denser than the default, about +0.1 kg on 12 × 1 L. This is an
     estimate, not a measured value, and it is small, but the label "beer
     density" is inaccurate for this number. The pages were not opened directly;
     these are search-summary facts.
   - **Empty glass weight 1.3 kg** (`:118`, `:76`): no source in the repo or the
     README. It was not verified.

2. **Single 253-line file.** The CSS is minified onto about eight very long
   lines (`index.html:11-17`), and all JS sits in one IIFE (~`:113-253`).
   Splitting into `styles.css` and `app.js` keeps the no-build property and
   makes review and diffs practical.

3. **Pure calculation function and tests.** The math is inside `render()`
   (`:173-200`) and tied to the DOM. Extract `computeLoad(state, unit)` and test
   it with `node:test`, with no dependency. Useful checks:
    - defaults give 27.58 kg total (matches the static equations at `:102-104`);
    - unit round-trip stays stable;
    - `stateFromSearch` (`:152-168`) clamps bad URL values.

### Larger ideas

1. **Browser smoke test.** With no build, a small Playwright test covering the
   unit toggle, share link, and reset would catch the regressions in items 1-4.

2. **Documented assumptions table.** A cited table of defaults with their ranges
   would turn item 8 into a maintained artifact.

Not prioritized: the per-keystroke `innerHTML` rebuild of up to 18 SVGs
(`:197-198`). It is cheap enough that `AGENTS.md`'s "avoid premature
optimization" rule applies.

## Sources

- Repository: `AGENTS.md`, `README.md`, `index.html` (line references above).
- https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html:
  water density at 20 °C (search summary, not opened).
- https://en.wikipedia.org/wiki/M%C3%A4rzen: Märzen gravity and style (search
  summary, not opened).
