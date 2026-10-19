# Improvement opportunities

## What it is

A static calculator (`index.html`, `styles.css`, and `app.js`) that estimates
the load of beer steins carried by an Oktoberfest waitress. It supports stein
count, fill level, beer volume, glass weight, beer density and glass-weight
uncertainty; metric and imperial displays; a stein visualizer; and shareable
scenario URLs. Playwright browser smoke tests and a minified single-file
deployment build are development-only.

## Afterburner Tasks

1. Redesign the stein illustration to represent a plausible way the steins are
   actually carried.
2. Research tray-carrying as an optional load component. Source a credible range
   and representative tray weight with the same rigor as the beer and glass
   assumptions, then incorporate the option into the estimate.
3. [x] Add a live summary of hand-carried stein biomechanics between the
   calculator and maths sections. It applies the specified two-hand count
   split, assigning an odd extra stein to one hand, and updates per-hand load
   and simplified elbow/shoulder moments from calculator inputs. It explains
   the posture and model limits, distinguishes external joint moments from
   muscle/tendon force,
   and links to the full methods. The existing weight total remains authoritative;
   biomechanical values are estimates, not a safety assessment.
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
