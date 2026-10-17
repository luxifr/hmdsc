# Improvement opportunities

## What it is

A static, dependency-free calculator (`index.html`, `styles.css`, and `app.js`)
that estimates the load of beer steins carried by an Oktoberfest waitress. It
supports stein count, fill level, beer volume, glass weight, beer density and
glass-weight uncertainty; metric and imperial displays; a stein visualizer; and
shareable scenario URLs. Saving scenarios locally is opt-in. Playwright browser
smoke tests are development-only; there is no build step or CI.

## Prioritized improvements

1. Redesign the stein illustration to represent a plausible way the steins are
   actually carried.
2. Research tray-carrying as an optional load component. Source a credible range
   and representative tray weight with the same rigor as the beer and glass
   assumptions, then incorporate the option into the estimate.

## Deferred

- Replacing the per-keystroke `innerHTML` rebuild of up to 18 SVGs in `app.js` is
  not prioritized; it is currently inexpensive, so avoid premature optimization.

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
