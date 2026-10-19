# Model, assumptions, and sources

This document describes the calculator's mass estimate, its defaults, and the references behind them. The separate [biomechanics research note](BIOMECHANICS.md) describes the simplified hand-carry moment and energy estimates.

## Calculator model

The calculator estimates the contents and glassware load:

```text
beer mass  = stein count × beer volume × fill fraction × beer density
glass mass = stein count × empty-glass mass
total load = beer mass + glass mass
```

The default scenario is 12 one-litre Maßkrüge filled to 90%. Beer density and empty-glass mass can be adjusted. The displayed uncertainty is a conservative scenario range: glass-weight uncertainty is added to the beer-density uncertainty converted to mass across the steins. It is not a statistical confidence interval.

### Defaults and rationale

- **Beer density: 1.010 kg/L.** This is the midpoint of an estimated 1.008–1.012 kg/L range. BJCP final-gravity ranges for Festbier and Märzen inform the beer gravity; specific gravity is density relative to water, and water density at 20 °C is about 0.998 kg/L. The default density uncertainty is **±0.002 kg/L** (±2 g/L or about ±0.017 lb/US gal).
- **Empty glass mass: 1.32 kg.** This is the midpoint of comparable 1 L glass Maßkrüge listed at about 1.27–1.37 kg. The default uncertainty is **±0.05 kg** (±50 g or about ±0.110 lb).
- **Fill: 90%.** A practical, adjustable scenario assumption, not a claim that every served stein has this fill level.

Tray weight, motion, and grip forces are not included in the calculator's total. The page separately displays simplified elbow and shoulder joint-moment estimates for the heavier hand; these do not change the mass total. Energy estimates remain explanatory only. See [BIOMECHANICS.md](BIOMECHANICS.md).

## Calculator behavior

Metric/imperial display, adjustable assumptions, and shareable scenario URLs are provided without runtime dependencies. Scenario inputs are shared through the URL; they are not saved on the device. Unit switches and share links preserve the underlying scenario values for calculations while formatting displayed input values to at most three decimal places. Beer density is shown in g/L in metric and lb/US gal in imperial; switching units preserves the underlying density.

## Sources

- BJCP, [4B. Festbier](https://styles.bjcp.org/bjcp-2021-beer/4/4b-festbier) and [6A. Märzen](https://styles.bjcp.org/bjcp-2021-beer/6/6a-marzen): final-gravity ranges and style context for current Oktoberfest beer and Märzen.
- BYO, [Calculating Alcohol Content, Attenuation, Extract, and Calories](https://byo.com/articles/calculating-alcohol/): specific gravity as density relative to water and explanation of beer gravity readings.
- Engineering ToolBox, [Water Density, Specific Weight and Thermal Expansion](https://www.engineeringtoolbox.com/water-density-specific-weight-d_595.html): water density at 20 °C.
- Atrium Hotel, [A Maß - FAQ and interesting facts](https://www.atrium-hotel.de/en/a-mass-faq-and-interesting-facts-about-the-popular-gift-mass/): Oktoberfest beer mugs are glass and approximate empty Maß weight.
- Trinklusiv, [Paulaner Maßkrug Glas 1L](https://trinklusiv.at/products/paulaner-masskrug-glas-1l): 1.27 kg product weight.
- Privatbrauerei Schweiger, [Isar Maßkrug 1 L](https://fanshop.schweiger-bier.de/product/bier-krug-isar-1l/): 1.35 kg product weight.
- Geschirr24, [Stölzle Oberglas Isar 1 L Maßkrug](https://www.geschirr24.at/Glasware/Trinkglaeser/Stoelzle-Oberglas-Bier-Masskrug-Isar-1L::10752.html): 1.367 kg product weight, used as upper end rounded to 1.37 kg.
