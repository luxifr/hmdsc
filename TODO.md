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
3. Research the biomechanics and energy cost of carrying steins by hand, with no
   tray or other load-bearing aid. Treat 12 steins split evenly (six per arm)
   as a reference scenario, not a presumed feasible technique. Establish from
   credible observational or ergonomic sources how multiple handled steins can
   plausibly be gripped and distributed across each hand and arm; do not infer a
   real serving technique from an illustration alone. Compare plausible grip
   and arm-posture scenarios, including the number and arrangement of steins per
   hand, wrist deviation and flexion/extension, elbow flexion, and the distance
   of the load from each joint. Source defensible ranges for those postures and
   for the relevant anthropometry rather than choosing convenient angles.

   Build a transparent, simplified static/mechanical estimate of external
   forces and joint moments at the wrist, elbow, and shoulder, accounting for
   gravity, load sharing, lever arms, and arm-segment weights. Identify the
   principal muscles, tendons, and joints involved, and estimate muscle/tendon
   forces only where published biomechanical models or defensible assumptions
   support them. Separate measured or modeled values from qualitative
   descriptions; report ranges and sensitivity to grip, posture, load split,
   and stein count. Do not present simplified estimates as clinical injury
   thresholds, individual injury predictions, or precise internal tissue
   stresses.

   Separately estimate metabolic energy expenditure in kcal/min. Define the
   activity being modeled (lifting into position, holding/carrying, and/or
   repeated pickup and set-down cycles), cycle rate and duration; distinguish
   gross from net energy expenditure and static exertion from dynamic work.
   Use a validated occupational-physiology method or published task data, and
   show the inputs and limits of applying it to this unusual task. Give a
   plausible range and per-person assumptions rather than a single falsely
   precise number. Cite primary research or authoritative ergonomics/biomechanics
   and occupational-metabolism sources for every consequential parameter.
   Deliver a short methods-and-limitations summary, linked sources, and only
   then decide whether a conservative, clearly labeled estimate belongs in the
   calculator or should remain an informational explanation.

## Deferred

- Replacing the per-keystroke `innerHTML` rebuild of up to 18 SVGs in `app.js`
  is not prioritized; it is currently inexpensive, so avoid premature
  optimization.
