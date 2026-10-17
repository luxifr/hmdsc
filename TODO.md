# Improvement opportunities

## What it is

A static, dependency-free production page (`index.html`, `styles.css`, and
`app.js`) that estimates the load of beer steins carried by an Oktoberfest
waitress. Inputs are stein count, fill %, beer per stein, glass weight, beer
density, and glass-weight uncertainty. Outputs are total load, beer and glass
breakdown, total-load uncertainty, metric/imperial display, a visualizer, and a
shareable URL.
Nothing is stored server-side. Playwright browser smoke tests run as
development-only tooling; there is no build step or CI.

## Prioritized improvements

1. [x] Show the total-load uncertainty as a concise ± value beside the total, and
   remove the small total-load range text below it.
2. Redesign the stein illustration to represent a plausible way the steins are
   actually carried.
3. [x] Eliminate visible rounding drift when switching between metric and imperial
   units.
4. [x] Keep the inputs' internal layout and dimensions stable when switching units.
5. [x] Align input widths, labels, and buttons consistently, independent of the
   selected unit system.
6. [x] Revise the implicit save/restore experience so users understand and control
   whether modified inputs are stored.
7. Research tray-carrying as an optional load component. Source a credible range
   and representative tray weight with the same rigor as the beer and glass
   assumptions, then incorporate the option into the estimate.

Beer-density and one-litre glass-weight defaults use the midpoints of researched
ranges, with linked sources on the page.

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
- Researched beer-density and comparable glass-weight ranges, set defaults to
  their midpoints, and added linked source notes to the page.
- Split the embedded stylesheet and script out of `index.html` into
  `styles.css` and `app.js`, preserving the dependency-free, no-build setup.

## Sources

- BJCP, [4B. Festbier](https://styles.bjcp.org/bjcp-2021-beer/4/4b-festbier)
  and [6A. Märzen](https://styles.bjcp.org/bjcp-2021-beer/6/6a-marzen): final
  gravity ranges and style context for current Oktoberfest beer and Märzen.
- BYO, [Calculating Alcohol Content, Attenuation, Extract, and Calories]
  (https://byo.com/articles/calculating-alcohol/): specific gravity is density
  relative to water; explains beer gravity readings.
- Engineering ToolBox, [Water Density, Specific Weight and Thermal Expansion]
  (https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html):
  water density at 20 °C.
- Atrium Hotel, [A Maß - FAQ and interesting facts]
  (https://www.atrium-hotel.de/en/a-mass-faq-and-interesting-facts-about-the-popular-gift-mass/):
  Oktoberfest beer mugs are glass and approximate empty Maß weight.
- Trinklusiv, [Paulaner Maßkrug Glas 1L]
  (https://trinklusiv.at/products/paulaner-masskrug-glas-1l): 1.27 kg product
  weight.
- Privatbrauerei Schweiger, [Isar Maßkrug 1 L]
  (https://fanshop.schweiger-bier.de/product/bier-krug-isar-1l/): 1.35 kg
  product weight.
- Geschirr24, [Stölzle Oberglas Isar 1 L Maßkrug]
  (https://www.geschirr24.at/Glasware/Trinkglaeser/Stoelzle-Oberglas-Bier-Masskrug-Isar-1L::10752.html):
  1.367 kg product weight; used as upper end rounded to 1.37 kg.
