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
- Tray weight, motion, grip forces, and balance are not included.

Metric/imperial display, adjustable assumptions, optional scenario saving, and shareable scenario links are provided without a framework or runtime dependency. Scenario saving is off by default and can be enabled with “Remember my inputs on this device”; saved scenarios remain only in this browser and are deleted when the option is turned off. URL values take precedence over remembered inputs. The selected display unit is not saved. Unit switches and share links keep exact scenario values for calculation while formatting input values to at most three decimal places, avoiding cumulative conversion drift. The beer-density input follows the selected system: g/L in metric and lb/gal in imperial; switching units preserves the underlying density.
