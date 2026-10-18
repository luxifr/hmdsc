# How Much Did She Carry?

A dependency-free, static single-page calculator for estimating the load in an Oktoberfest waitress's beer steins. Its fill percentage is adjusted with an interactive stein-shaped slider that shows beer, foam, and overflow at the brim. The page structure is in `index.html`, styles are in `styles.css`, and browser behavior is in `app.js`. All calculations happen in the browser; it has no backend and needs no build step.

## Run locally

Open `index.html` directly, or serve this folder with any static file server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Browser smoke tests

Install the development dependencies and Chromium once, then run the browser
tests:

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` runs dependency-free calculation tests with Node's built-in test
runner, including normalization and URL boundary cases, then Playwright browser
smoke tests for unit conversion, reset, share links, URL validation, saved
scenario precedence and recovery, stein stepper limits, and the draggable stein
fill control. Run only the calculation tests with `npm run test:unit`. These
test dependencies are development-only; the published calculator remains static
and dependency-free.

## Model and assumptions

- Default scenario: 12 one-litre Maßkrüge, filled to 90%.
- Beer mass = count × volume × fill fraction × beer density.
- Glass mass = count × empty glass mass.
- Total load = beer mass + glass mass.
- Beer density defaults to 1.010 kg/L (1,010 g/L), the midpoint of an estimated 1.008–1.012 kg/L range derived from BJCP Festbier/Märzen final-gravity ranges and water density at 20 °C. Its default uncertainty is ±0.002 kg/L (±2 g/L or ±0.017 lb/gal). Empty glass weight defaults to 1.32 kg, the midpoint of comparable 1 L glass Maßkrüge weighing 1.27–1.37 kg; its default uncertainty is ±0.05 kg (±50 g or ±0.110 lb). The page footnote links to these source ranges and product examples. Total-load uncertainty adds the glass-weight uncertainty and beer-density uncertainty converted to mass across all steins. This conservative scenario range is not a statistical confidence interval.
- Tray weight, motion, grip forces, and balance are not included. Simplified hand-carry joint-moment and energy estimates are documented separately, not included in the calculator; see [BIOMECHANICS.md](BIOMECHANICS.md) for assumptions and ranges.

Metric/imperial display, adjustable assumptions, optional scenario saving, and shareable scenario links are provided without a framework or runtime dependency. Scenario saving is off by default and can be enabled with “Remember my inputs on this device”; saved scenarios remain only in this browser and are deleted when the option is turned off. URL values take precedence over remembered inputs. The selected display unit is not saved. Unit switches and share links keep exact scenario values for calculation while formatting input values to at most three decimal places, avoiding cumulative conversion drift. The beer-density input follows the selected system: g/L in metric and lb/gal in imperial; switching units preserves the underlying density.

## Sources

- BJCP, [4B. Festbier](https://styles.bjcp.org/bjcp-2021-beer/4/4b-festbier) and
  [6A. Märzen](https://styles.bjcp.org/bjcp-2021-beer/6/6a-marzen): final
  gravity ranges and style context for current Oktoberfest beer and Märzen.
- BYO, [Calculating Alcohol Content, Attenuation, Extract, and Calories](https://byo.com/articles/calculating-alcohol/): specific gravity is density
  relative to water; explains beer gravity readings.
- Engineering ToolBox, [Water Density, Specific Weight and Thermal Expansion](https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html):
  water density at 20 °C.
- Atrium Hotel, [A Maß - FAQ and interesting facts](https://www.atrium-hotel.de/en/a-mass-faq-and-interesting-facts-about-the-popular-gift-mass/):
  Oktoberfest beer mugs are glass and approximate empty Maß weight.
- Trinklusiv, [Paulaner Maßkrug Glas 1L](https://trinklusiv.at/products/paulaner-masskrug-glas-1l): 1.27 kg product
  weight.
- Privatbrauerei Schweiger, [Isar Maßkrug 1 L](https://fanshop.schweiger-bier.de/product/bier-krug-isar-1l/): 1.35 kg
  product weight.
- Geschirr24, [Stölzle Oberglas Isar 1 L Maßkrug](https://www.geschirr24.at/Glasware/Trinkglaeser/Stoelzle-Oberglas-Bier-Masskrug-Isar-1L::10752.html):
  1.367 kg product weight; used as upper end rounded to 1.37 kg.
