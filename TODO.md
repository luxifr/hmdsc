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

1. **Model input research.** The calculator defaults are approximate rather
   than precise measurements:
   - **Beer density 0.998 kg/L** (`app.js` defaults and `index.html` input) is
     close to water's density at 20 °C (0.9982067 kg/L; Engineering ToolBox).
     It is therefore a water-density proxy, not a verified beer-density value.
     The BJCP gives Oktoberfest/Märzen a final-gravity range of 1.012–1.016,
     but final gravity is an apparent brewing measurement and should not be
     presented as a direct density measurement of finished beer. A secondary
     material-property table lists lager at about 1.005 kg/L, derived from
     specific gravity 1.005; it is not identified as a measured Oktoberfest
     sample or accompanied by a temperature in the entry. Treat that as a
     representative estimate, not a precise style-specific value. The
     difference between 0.998 and 1.005 kg/L is about 84 g for 12 × 1 L.
     Recommendation: label the current default as an approximation, or adopt
     1.005 kg/L only if the UI makes clear it is a generic lager estimate.
   - **Empty glass weight 1.3 kg** (`app.js` defaults and `index.html` input)
     is supported as an approximate empty one-litre Maß weight by the Atrium
     Hotel FAQ. This is a general estimate, not a manufacturer specification.
     Libbey's 1 L Oktoberfest mug product page lists case weight for six mugs,
     but not the individual mug's weight; it does not independently confirm
     1.3 kg per mug.

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
- Engineering ToolBox, [Water - Density and Specific Weight]
  (https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html):
  water density at 20 °C.
- BJCP, [3B. Oktoberfest/Märzen]
  (https://www.bjcp.org/beer-styles/3b-oktoberfestmarzen/): style gravity
  ranges.
- American Society of Brewing Chemists, [Beer Methods]
  (https://www.asbcnet.org/Methods/BeerMethods/pages/default.aspx): apparent
  extract methods; apparent gravity readings are not a direct physical-density
  specification for finished beer because alcohol affects the reading.
- kg-m3.com, [Beer, lager]
  (https://kg-m3.com/material/beer-lager): secondary approximate lager value,
  listed as 1.005 kg/L based on SG 1.005.
- Atrium Hotel, [A Maß - FAQ and interesting facts]
  (https://www.atrium-hotel.de/en/a-mass-faq-and-interesting-facts-about-the-popular-gift-mass/):
  approximate 1.3 kg empty one-litre Maß weight.
- Libbey Foodservice, [Oktoberfest Mug 1L]
  (https://libbeyfoodservice.com/product/libbey/oktoberfest-mug-1l/1009290):
  case weight is provided, but individual mug weight is not.
