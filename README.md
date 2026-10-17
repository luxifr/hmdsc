# How Much Did She Carry?

A dependency-free, static single-page calculator for estimating the load in an Oktoberfest waitress's beer steins. All calculations happen in the browser; it has no backend and needs no build step.

## Run locally

Open `index.html` directly, or serve this folder with any static file server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Model and assumptions

- Default scenario: 12 one-litre Maßkrüge, filled to 100%.
- Beer mass = count × volume × fill fraction × beer density.
- Glass mass = count × empty glass mass.
- Total load = beer mass + glass mass.
- Defaults use 0.998 kg/L beer density and 1.3 kg per empty glass. The displayed range varies the empty glass weight by the configurable per-glass uncertainty (±0.1 kg by default); it is a scenario range, not a statistical confidence interval.
- Tray weight, motion, grip forces, and balance are not included.

Metric/imperial display, adjustable assumptions, persistent local preferences, and shareable scenario links are provided without a framework or runtime dependency.
