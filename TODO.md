# Improvement opportunities

## What it is

A static, dependency-free calculator (`index.html`, `styles.css`, and `app.js`)
that estimates the load of beer steins carried by an Oktoberfest waitress. It
supports stein count, fill level, beer volume, glass weight, beer density and
glass-weight uncertainty; metric and imperial displays; a stein visualizer; and
shareable scenario URLs. Saving scenarios locally is opt-in. Playwright browser
smoke tests are development-only; there is no build step or CI.

## Afterburner Tasks

1. Redesign the stein illustration to represent a plausible way the steins are
   actually carried.
2. Research tray-carrying as an optional load component. Source a credible range
   and representative tray weight with the same rigor as the beer and glass
   assumptions, then incorporate the option into the estimate.

## Deferred

- Replacing the per-keystroke `innerHTML` rebuild of up to 18 SVGs in `app.js`
  is not prioritized; it is currently inexpensive, so avoid premature
  optimization.
