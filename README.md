# How Much Did She Carry?

A static, single-page calculator for estimating the load in an Oktoberfest waitress's beer steins. Adjust the fill level, stein count, and assumptions; compare metric and imperial units; or share a scenario. The page includes a sources and model-rationale section; the full calculator and biomechanics methods remain documented in [MODEL.md](MODEL.md) and [BIOMECHANICS.md](BIOMECHANICS.md).

## License

Copyright © 2026 Camina Keil. This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and redistribute it for permitted noncommercial purposes under those terms. Commercial use requires a separate license from the copyright holder. See `LICENSE` for the full terms.

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

`npm test` runs calculation unit tests and Playwright browser tests against the source page. To run only the unit tests, use `npm run test:unit`. To run the browser tests against the generated deployment file, build first and run `PLAYWRIGHT_BUILD=1 npx playwright test`.

## Documentation

- [Calculator model, assumptions, and sources](MODEL.md)
- [Hand-carried biomechanics and energy estimates](BIOMECHANICS.md)
- [Privacy-first analytics MVP concept](ANALYTICS-MVP.md)
- [Reddit discovery bot roadmap](REDDIT-BOT-TODO.md)
