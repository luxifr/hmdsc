# How Much Did She Carry?

A dependency-free, static single-page calculator for estimating the load in an Oktoberfest waitress's beer steins. The page structure is in `index.html`, styles are in `styles.css`, and browser behavior is in `app.js`. All calculations happen in the browser; it has no backend and needs no build step.

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
runner, then Playwright browser smoke tests for unit conversion, reset, share
links, URL validation, saved scenarios, and stein stepper limits. Run only the
calculation tests with `npm run test:unit`. These test dependencies are
development-only; the published calculator remains static and dependency-free.

## Model and assumptions

- Default scenario: 12 one-litre Maßkrüge, filled to 100%.
- Beer mass = count × volume × fill fraction × beer density.
- Glass mass = count × empty glass mass.
- Total load = beer mass + glass mass.
- Beer density defaults to 1.010 kg/L, the midpoint of an estimated 1.008–1.012 kg/L range derived from BJCP Festbier/Märzen final-gravity ranges and water density at 20 °C. Empty glass weight defaults to 1.32 kg, the midpoint of comparable 1 L glass Maßkrüge weighing 1.27–1.37 kg. The page footnote links to the source ranges and product examples. The displayed total-load ± value adds the configurable per-glass uncertainty (±0.1 kg by default) across all steins; it is a scenario range, not a statistical confidence interval.
- Tray weight, motion, grip forces, and balance are not included.

Metric/imperial display, adjustable assumptions, the calculator scenario saved locally, and shareable scenario links are provided without a framework or runtime dependency. The selected display unit is not saved. Unit switches keep the exact scenario values for calculation while formatting converted imperial inputs to at most nine decimal places, avoiding cumulative conversion drift. The beer-density input follows the selected system: kg/L in metric and lb/US gal in imperial; switching units preserves the underlying density.
