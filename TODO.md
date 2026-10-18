# Improvement opportunities

## What it is

A static calculator (`index.html`, `styles.css`, and `app.js`) that estimates
the load of beer steins carried by an Oktoberfest waitress. It supports stein
count, fill level, beer volume, glass weight, beer density and glass-weight
uncertainty; metric and imperial displays; a stein visualizer; and shareable
scenario URLs. Saving scenarios locally is opt-in. Playwright browser smoke
tests and a minified single-file deployment build are development-only.

## Afterburner Tasks

1. Redesign the stein illustration to represent a plausible way the steins are
   actually carried.
2. Research tray-carrying as an optional load component. Source a credible range
   and representative tray weight with the same rigor as the beer and glass
   assumptions, then incorporate the option into the estimate.
3. Extend the on-page maths explanation with a dynamic summary of the
   hand-carried stein biomechanics, positioned between current sections 2
   (calculator) and 3 (maths). Base it on the calculator's resulting per-hand
   stein load/count, and present the simplified elbow/shoulder moment ranges and
   grip-geometry effect for the relevant scenario. Explain the key posture and
   load-sharing assumptions in plain language, distinguish external joint
   moments from muscle/tendon force, and ensure values update correctly when
   calculator inputs or units change. Keep the existing weight calculation
   authoritative; treat the biomechanical values as estimates, and link to the
   full methods/limitations rather than implying a safety assessment.
4. [x] Add a dedicated sources and model-rationale section to the page. Explain
   why the calculator and biomechanics model use their chosen assumptions, how
   the simplified mechanics and energy estimates are derived, which sources
   support each consequential input, and what evidence does and does not
   establish. Connect each cited source to the related assumption or result,
   keep citations readable and accessible, and link to the fuller research
   notes in `BIOMECHANICS.md` where appropriate. Update the page's section
   navigation and numbering consistently if needed.

## Deferred

- Replacing the per-keystroke `innerHTML` rebuild of up to 18 SVGs in `app.js`
  is not prioritized; it is currently inexpensive, so avoid premature
  optimization.
