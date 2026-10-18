# How Much Did She Carry?

A static, single-page calculator for estimating the load in an Oktoberfest waitress's beer steins. Adjust the fill level, stein count, and assumptions; compare metric and imperial units; or share a scenario.

## Run locally

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Build for deployment

Install dependencies and create a minified, self-contained HTML file at `dist/index.html`:

```sh
npm ci
npm run build
```

The generated file includes the page's HTML, CSS, and JavaScript. The `dist/` directory is ignored by git and can be regenerated at any time.

## Tests

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` runs calculation unit tests and Playwright browser tests. To run only the unit tests, use `npm run test:unit`.

## Documentation

- [Calculator model, assumptions, and sources](MODEL.md)
- [Hand-carried biomechanics and energy estimates](BIOMECHANICS.md)
- [Privacy-first analytics MVP concept](ANALYTICS-MVP.md)
