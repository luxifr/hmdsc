# Hand-carried steins: biomechanics and energy estimate

## Bottom line

The default 12-stein scenario contains about **26.75 kg (59.0 lb)** of beer and glass. If divided evenly, that is **13.37 kg (131 N) supported at each hand**. This is an external load calculation, not a claim that six full steins can be held securely in each hand or that each arm actually receives exactly half.

A defensible, task-specific estimate of wrist, elbow, shoulder, muscle, or tendon forces cannot be obtained from stein count alone. The result depends strongly on the actual grip, how the handles and steins contact one another, wrist posture, arm posture, and the position of the load relative to each joint. No reliable study establishing a standard six-steins-per-hand grip or measured serving posture was identified for this note. Therefore, this document gives conditional mechanics and an energy proxy, not personal injury risk or a validated serving-technique model.

**Decision:** keep biomechanics and energy out of the calculator. The calculator can report the glass-and-beer load that is directly computable from its inputs. It should not imply unsupported internal tissue forces, injury thresholds, or a precise calorie cost. This note is the appropriate place for the present, explicitly limited estimates; replace them with measured task-specific data before adding a numeric biomechanical estimate to the interface.

## Reference load

Using the calculator defaults (one 1 L stein, 90% fill, beer density 1.010 kg/L, empty-glass mass 1.32 kg):

- Beer per stein: `1 L × 0.90 × 1.010 kg/L = 0.909 kg`.
- Filled stein: `0.909 + 1.32 = 2.229 kg`, or about **21.9 N** under gravity (`mass × 9.81 m/s²`).
- Six steins per hand: `6 × 2.229 = 13.374 kg`, or about **131 N per hand/arm**.
- Twelve steins total: **26.748 kg**, or about **262 N** total gravitational load.

These calculations assume equal distribution. The app's default uncertainty inputs (±0.05 kg glass mass and ±0.002 kg/L beer density) contribute about ±0.052 kg per stein; six steins give roughly ±0.31 kg per side if those are treated as the same-direction scenario bounds. This is not a statistical interval and says nothing about unequal hand loading or dynamic forces.

## What the mechanics can and cannot say

### External joint moments are posture-dependent

For a quasi-static hold, an external moment about a joint is `force × perpendicular distance` from that joint to the force's line of action. In a simplified planar elbow model, with the upper arm vertical and the forearm angle measured from vertical, the stein-load contribution is:

`elbow moment ≈ 131 N × forearm length × sin(elbow flexion angle)`

For sensitivity only—not as measured waitress posture—using a **selected** forearm-length bracket of 0.25–0.30 m gives:

| Illustrative elbow flexion | Load-only external elbow moment per arm |
| --- | ---: |
| 0° (forearm vertical) | approximately 0 N·m in this idealized geometry |
| 45° | approximately 23–28 N·m |
| 90° (forearm horizontal) | approximately 33–39 N·m |

The length bracket is a transparent modeling input, not a task-specific anthropometric measurement or a source-backed range for Oktoberfest servers. The 0° result is not a prediction of zero elbow demand: it omits arm-segment weight, muscle co-contraction, hand offsets, acceleration, balance corrections, and any departure from the idealized alignment. The large change between 0° and 90° demonstrates why an observed posture is essential.

The same method applies at the shoulder: calculate the load force times its perpendicular distance from the shoulder. At the wrist, the relevant moment depends on the force line at the grip and the hand/handle geometry; for scale, a 5 cm perpendicular offset under 131 N would produce **6.6 N·m**. Neither that offset nor any other wrist or shoulder lever arm has been measured here. A wrist angle by itself does not specify the load's moment arm.

A neutral wrist and a near-extended elbow can be useful *reference poses* for future measurement; the 45° and 90° elbow cases above are explicit sensitivity points, not observed service postures. There is not enough task-specific evidence to give defensible degree ranges for how servers actually hold the wrist or elbow, or to label any posture as safe. The cited wrist experiment compared neutral with flexed, extended, pronated, and supinated positions at each participant's range limit, but does not establish the angles used when carrying steins. It found that wrist posture changed recorded extrinsic finger-muscle EMG, by up to 70% in some muscles; this supports posture sensitivity, not a conversion from stein load to muscle force [1].

### Internal muscle, tendon, and joint forces are not determined

The hand and finger flexors (including flexor digitorum superficialis/profundus and thumb flexors) would contribute to gripping and resisting the steins slipping or rotating. Wrist flexors/extensors stabilize the wrist; elbow flexors/extensors (including brachialis, biceps, and triceps) and shoulder muscles (including deltoid and rotator-cuff muscles) contribute according to posture and movement. The finger joints, wrist, elbow, and shoulder transmit the resulting reactions. Which tissues dominate, and by how much, depends on the actual grip and coordination.

An external moment does **not** uniquely determine a muscle or tendon force. Even a one-muscle simplification requires that muscle's posture-dependent moment arm (`muscle force ≈ net joint moment / muscle moment arm`); real joints have multiple muscles, co-contraction, passive tissues, and load sharing. No grip-force distribution among six handles, muscle moment arms for the actual task, EMG, or subject-specific anatomy is available here. Reporting numeric tendon or muscle forces would therefore manufacture precision. The wrist-posture experiment [1] and wrist-tendon moment-arm research [2] reinforce that hand posture and anatomy change these relationships; they do not validate a six-stein force estimate.

## Energy per active minute: a broad occupational proxy

The 2024 Adult Compendium lists **5.5 MET** for “walking or walk downstairs or standing, carrying objects about 50 to 74 lbs” (activity code 11830) [3]. The reference load here is about 59 lb, so this is a relevant *category-level proxy* for an active minute in which one person is carrying the whole scenario load. It is not a direct measurement of serving, static holding, or picking up six steins per hand. The Compendium is a population-level activity reference, not a task-specific individual measurement.

Using the Compendium site's approximate conversion of `1 MET ≈ 1 kcal/kg/hour` [4], the 5.5-MET proxy gives:

- At an assumed body mass of 60–80 kg: **5.5–7.3 gross kcal/min** while actively carrying.
- Subtracting the 1-MET resting baseline: **4.5–6.0 net kcal/min** above rest during that active period.

The 60–80 kg body-mass span is an explicit illustrative assumption, not a measured server population. These values do not mean each lift costs that many calories: they include the whole active minute and cannot separate pickup, walking, stabilization, or standing while supporting the load. For a service minute with only fraction `f` spent actively carrying, a simple time-weighted estimate would be `f × active rate + (1 − f) × rest rate`; the needed `f`, carrying pace, carry duration, and recovery pattern are unknown. A defensible task-specific value would require a defined work cycle and preferably indirect calorimetry (oxygen consumption), not extrapolation from load mass alone.

## Limitations and next evidence needed

This is a static, symmetric, one-person model. It excludes acceleration, stein collision and sloshing, unequal left/right shares, changing grips, fatigue, posture changes, and effects of repeated cycles. It does not estimate injury probability, tissue stress, or a safe carrying limit.

To improve it, first establish the real no-tool grip and sequence from credible direct observation or video, then measure hand loading, wrist/elbow/shoulder angles, and load-to-joint distances across representative carries. For internal tissue estimates, use a validated musculoskeletal model with the measured geometry and clearly stated anthropometry; for energy, define the duty cycle and measure or validate metabolic rate. Until then, keep the estimate as explanatory context, not calculator output.

## Sources

1. Beringer C.R., Mansouri M., Fisher L.E., et al. (2020). [The effect of wrist posture on extrinsic finger muscle activity during single joint movements](https://doi.org/10.1038/s41598-020-65167-x). *Scientific Reports* 10, 8377. Experimental EMG evidence that wrist posture changes extrinsic finger-muscle activity.
2. Lee J., et al. (2018). [Wrist tendon moment arms: Quantification by imaging and experimental techniques](https://doi.org/10.1016/j.jbiomech.2017.12.024). *Journal of Biomechanics* 71, 177–183. Supports the need for posture- and anatomy-specific tendon moment arms; it does not provide this task's forces.
3. Herrmann S.D., et al. (2024). [2024 Adult Compendium of Physical Activities: A third update of the energy costs of human activities](https://doi.org/10.1016/j.jshs.2023.10.010), with the [official activity table (PDF)](https://pacompendium.com/wp-content/uploads/2025/02/1_2024-adult-compendium_1_2024.pdf), activity code 11830, p. 15. Source for the 5.5-MET carrying category.
4. [Compendium of Physical Activities](https://pacompendium.com/), “Using the Compendium”: describes MET as a ratio of work to resting metabolic rate and gives the approximate kcal/kg/hour convention used for the conversion above.
5. de Leva P. (1996). [Adjustments to Zatsiorsky-Seluyanov's segment inertia parameters](https://doi.org/10.1016/0021-9290(95)00178-6). *Journal of Biomechanics* 29(9), 1223–1230. A reference for population segment parameters and why anthropometry matters; no subject-specific segment data were available for this calculation.
