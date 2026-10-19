# Hand-carried steins: simplified biomechanics and energy estimate

## Evidence limits and modeling choices

There are no published measurements here of servers carrying six steins in one hand, their joint angles, or hand forces. This is therefore a **simplified lever model**, based on the carrying arrangement you described—six steins in a circle, handles inward, optionally a seventh supported on the handles. Product dimensions inform the bundle geometry; joint angles and segment lengths are explicit modeling assumptions.

The neutral posture is the upper arm hanging vertically down, with the shoulder at 0° and the elbow bent about 90°. During transport, the model allows the upper arm to swing at most 25° forward or backward. The elbow does most of the adjustment so the forearm and grip stay near their carrying orientation and the steins remain level. The primary comparison holds the forearm about horizontal; a ±10° deviation is used as a small sensitivity case. Results are external gravitational moments, not clinical estimates of individual muscle or tendon force.

## Reference load

Using the calculator defaults (one 1 L stein, 90% fill, beer density 1.010 kg/L, empty-glass mass 1.32 kg):

- Beer per stein: `1 L × 0.90 × 1.010 kg/L = 0.909 kg`.
- Filled stein: `0.909 + 1.32 = 2.229 kg`, or about **21.9 N** under gravity (`mass × 9.81 m/s²`).
- Six steins per hand: `6 × 2.229 = 13.374 kg`, or about **131 N per arm**.
- Twelve steins total: **26.748 kg (59.0 lb)**, or about **262 N** total gravitational load.

A seventh stein on top adds about **21.9 N** to that hand's load (about 153 N for seven full-default steins). These numbers scale directly with fill, beer density, glass mass, and stein count.

## Cluster geometry and keeping the steins level

A 1 L Paulaner Maßkrug listing gives approximately **20 cm height and 10.5 cm body diameter**; another Isar Maßkrug listing gives **20.2 cm height and 10.9 cm diameter**. A Schweiger listing gives overall dimensions of **15.5 × 20 cm**. Treating 15.5 cm as body diameter plus handle projection suggests a grasp point roughly **6–8 cm from the mug's center**. This is estimated from product dimensions, not a measured grip location.

For six mugs packed in a ring with their bodies approximately tangent, mug centers sit about one body diameter (**10.5–10.9 cm**) from the bundle center. With handles facing inward, the grasp regions meet around the central opening. The six individual weight offsets cancel in a symmetric, evenly filled ring, leaving the combined center of mass at the bundle center.

Fewer steins do **not automatically mean worse cancellation**. If the steins are regrouped symmetrically with their handles meeting at the grip, their centers still balance: two opposite steins balance; three can form a triangle, four a square, and so on. For tangent 10.7 cm-diameter mugs, the mug-center radius is `r = d / (2 sin(π/n))`, giving 5.4 cm (2), 6.2 cm (3), 7.6 cm (4), 9.1 cm (5), and 10.7 cm (6); the radial offsets still sum to zero. The one-stein case is different: holding it by its handle places its center of mass about 6–8 cm from the grip, giving roughly **1.3–1.8 N·m** of eccentric moment for one filled default stein.

If the server simply removes some steins from a six-steins-in-a-ring cluster and keeps the same grip point, rather than rearranging the remainder, the remaining centers will not balance. For example, five remaining steins in their original positions shift the combined center about 2.1 cm and add about **2.3 N·m**; three consecutive steins left in place shift it about 7.1 cm and add about **4.7 N·m**. Those added moments apply at the wrist and also affect elbow/shoulder moments to the extent that the offset points in the arm's plane. This is a geometry sensitivity case, not a claim that servers carry those exact incomplete clusters.

Use these planar angles:

- `θs`: upper-arm swing from vertical down; forward is positive, backward is negative.
- `β`: elbow flexion from a straight arm; bending the elbow brings the forearm forward.
- `θf = θs + β`: forearm direction from vertical down.

At the neutral posture, `θs = 0°` and `β ≈ 90°`, so the forearm is horizontal (`θf ≈ 90°`). To keep that forearm orientation as the shoulder swings, the elbow compensates: `β ≈ 90° − θs`. Thus at `θs = −25°`, elbow flexion is about 115°; at `θs = +25°`, it is about 65°. The hand/grip can remain near its baseline orientation, with the wrist making small corrections for any residual forearm tilt. In general, keeping the steins upright requires hand/grip orientation to counter the forearm's tilt, but that correction is not simply equal to elbow flexion.

## Joint moment model

Assume the bundle's combined vertical load line passes through the central grip and the wrist-to-grip offset is vertical. For segment lengths use upper arm `L1 = 0.28–0.34 m` and forearm `L2 = 0.25–0.30 m`, broad adult inputs consistent with standard segment data [6]. With six default steins per hand, `W ≈ 131 N`:

- **Elbow moment from steins:** `M_e,load = W × L2 × |sin(θf)|`.
- **Shoulder moment from steins:** `M_s,load = W × |L1 sin(θs) + L2 sin(θf)|`.

These are weight times the horizontal distance to the vertical load line. The shoulder formula includes both upper-arm and forearm projections; this is why shoulder moment changes with shoulder swing even when elbow compensation holds the forearm nearly fixed.

The arm's own weight also contributes. Using de Leva's adult segment mass fractions—upper arm 2.55–2.71%, forearm 1.38–1.62%, hand 0.56–0.61% of body mass—and an illustrative 60–80 kg body mass, with each segment center of mass at its midpoint, gives the following total external gravitational moments. The hand is treated as acting at the wrist/grip point; acceleration is excluded.

| Shoulder / elbow / forearm | Wrist/grip correction from baseline | Elbow total moment | Shoulder total moment |
| --- | --- | ---: | ---: |
| −25° / 115° / 90° | about 0° | 35–43 N·m | 13–24 N·m |
| 0° / 90° / 90° | about 0° | 35–43 N·m | 35–43 N·m |
| +25° / 65° / 90° | about 0° | 35–43 N·m | 52–66 N·m |
| 0° / 80° / 80° | about +10° | 34–42 N·m | 34–42 N·m |
| 0° / 100° / 100° | about −10° | 34–42 N·m | 34–42 N·m |

The wrist correction column is a relative adjustment to keep the hand/stein bundle level when the forearm departs from its baseline orientation; signs depend on the side and angle convention. It is not a clinical wrist-flexion measurement. With the elbow compensating for ±25° of shoulder swing, elbow moment stays broadly similar while shoulder moment changes substantially—roughly **13–66 N·m** across the three primary positions. A seventh stein increases the stein-load part of the moments on that side by about **17%** if it acts through the same line.

### Effect of carrying fewer steins

At the neutral shoulder position (`θs = 0°`, forearm horizontal), moments scale almost linearly with the number carried. The following ranges use the same arm-segment assumptions above and assume the **combined load is centered over the grip** (a plausible symmetric arrangement for 2–6 steins):

| Steins in one hand | Load per arm | Elbow moment | Shoulder moment at neutral |
| ---: | ---: | ---: | ---: |
| 1† | 2.23 kg | 7–10 N·m | 7–10 N·m |
| 2 | 4.46 kg | 13–17 N·m | 13–17 N·m |
| 3 | 6.69 kg | 18–23 N·m | 18–23 N·m |
| 4 | 8.92 kg | 24–30 N·m | 24–30 N·m |
| 5 | 11.14 kg | 29–37 N·m | 29–37 N·m |
| 6 | 13.37 kg | 35–43 N·m | 35–43 N·m |

† For one stein, the center of mass is not centered over the handle grip; add the **1.3–1.8 N·m wrist eccentricity** estimated above. The table's elbow/shoulder projection leaves that sideways handle offset out of the sagittal-plane lever arm because its direction relative to the arm is unknown.

The shoulder moment also depends strongly on the shoulder swing at every count. At `−25° / 0° / +25°`, respectively, the shoulder ranges are: 1 stein **1–4 / 7–10 / 12–17 N·m**; 3 steins **6–12 / 18–23 / 28–37 N·m**; and 6 steins **13–24 / 35–43 / 52–66 N·m**. The elbow ranges in the table stay much more stable in the primary model because the elbow angle compensates to keep the forearm horizontal.

### How these moments compare with measured tasks

A scoping review of 28 elbow-loading studies (256 participants) reported a mean flexion–extension joint moment of **17 N·m across ADL tasks**; the highest reported task moments were **39 N·m for work** and **76 N·m while pushing a 37 kg trolley** [7]. Against that reference, the model gives:

- **2 steins per hand:** 13–17 N·m, around the review's mean ADL value.
- **3 steins per hand:** 18–23 N·m, already above that mean.
- **6 steins per hand:** 35–43 N·m, around or above the review's cited work-task value.

A separate experimental elbow-assistance study estimated that holding 5, 10, and 15 kg at a 0.34 m forearm lever requires **16.7, 33.4, and 50 N·m**, respectively; six steins per hand weigh 13.4 kg, corresponding to about **45 N·m** at that same lever [8]. In that study, participants' mean maximum elbow-flexion moment was **80 ± 24 N·m**, so the six-stein estimate is roughly half that sample mean. The surprising takeaway is that three steins per hand is already in the range of ordinary measured elbow task moments, while six steins approaches a large fraction of the maximum voluntary moment in a small experimental sample.

These are comparisons of similar net moments, not identical experiments: the cited tasks use different postures, movement, populations, and methods, while our values are static gravity-model estimates. In a study of six daily shoulder tasks, peak task torque averaged about **22% of maximal shoulder torque in young adults versus 52% in older adults**; overhead tasks exceeded 40%, and some reaching/abduction tasks exceeded 60% [9]. This is a relative-effort comparison, not a directly comparable absolute torque, but it shows how the same external moment can demand very different effort depending on strength and posture.

At the wrist, take the bundle's combined load line to pass near the central grip. In the symmetric arrangement, the load-only wrist moment is therefore near **0 N·m**. If the resultant line is offset horizontally by 2–5 cm, the wrist moment is about **2.6–6.6 N·m** (`131 N × offset`). The roughly 10.5 cm radius from bundle center to each mug center is not itself the net wrist moment arm: those six radial offsets largely cancel.

## Live calculator estimate

The page splits the stein count as evenly as possible between two hands and assigns an odd extra stein to the heavier hand. It shows that hand's stein count and load range. The joint-moment bounds combine the load range with the body-mass, segment-length, and segment-mass ranges above.

The arm-load summary shows one elbow-moment range and the shoulder-moment range across the modeled ±25° swing. The forearm stays horizontal as the shoulder swings, so elbow moment remains constant while shoulder moment changes. The model includes the arm's segment weights and treats the combined stein load as centered over the grip; it does not display a separate wrist moment.

The calculator allows up to 40 steins, so the displayed load and joint-moment equations continue to 20 steins on the heavier hand, without an additional cap. The model's shoulder angles and arm-segment dimensions remain the same throughout that range.

## Main tissues involved

The hand/finger flexors and thumb muscles grip the inward-facing handles; wrist flexors/extensors stabilize the hand; elbow flexors/extensors and shoulder muscles support the arm posture. The hand, wrist, elbow, and shoulder joints transmit the forces. Wrist posture can alter extrinsic finger-muscle activity; one experiment found changes in EMG of up to 70% in some muscles across tested wrist positions [1].

Joint moments are not individual tendon forces. Estimating a specific muscle or tendon force requires its posture-dependent moment arm and its share of the net joint moment. This note therefore reports the net external moments and identifies involved tissues without assigning unsupported individual tendon loads.

## Energy per active minute

The 2024 Adult Compendium lists **5.5 MET** for “walking or walk downstairs or standing, carrying objects about 50 to 74 lbs” (activity code 11830) [4]. The two-arm default load is about 59 lb, so this is a reasonable category-level proxy for an active carrying minute, though not specific to static holding or the repeated pickup/set-down sequence.

Using the Compendium's approximate conversion of `1 MET ≈ 1 kcal/kg/hour` [5], for an illustrative 60–80 kg adult:

- **Gross:** `5.5 × body mass ÷ 60` = about **5.5–7.3 kcal/min** while actively carrying.
- **Net above a 1-MET resting baseline:** about **4.5–6.0 kcal/min** during that active period.

This is a per-person activity estimate, not calories per lift. If carrying occupies fraction `f` of each work minute, average expenditure can be approximated as `f × active rate + (1 − f) × resting rate`; pickup frequency, walking time, holding time, and recovery determine `f`.

## Summary

For six default steins per hand, each arm supports about **131 N**. With the upper arm near vertical and allowed to swing ±25°, the elbow shifts around its neutral 90° bend to keep the forearm/grip near its carrying orientation. At neutral, the elbow moment rises from about **13–17 N·m for two steins** to **35–43 N·m for six**; three steins already exceed the review's 17 N·m mean ADL elbow moment. Symmetric regrouping preserves center-of-mass cancellation for two through six steins, but a single stein or an incomplete/asymmetric cluster adds wrist eccentricity. For six steins, the model gives **13–66 N·m at the shoulder** across the shoulder-swing range. For active carrying of the full 59 lb load, the broad energy proxy is **5.5–7.3 gross kcal/min** for an assumed 60–80 kg adult.

## Sources

1. Beringer C.R., Mansouri M., Fisher L.E., et al. (2020). [The effect of wrist posture on extrinsic finger muscle activity during single joint movements](https://doi.org/10.1038/s41598-020-65167-x). *Scientific Reports* 10, 8377.
2. [Paulaner Maßkrug Glas 1 L](https://trinklusiv.at/products/paulaner-masskrug-glas-1l): approximately 20 cm high, 10.5 cm diameter, 1.27 kg.
3. [Isar Maßkrug 1 L](https://www.geschirr24.at/Glasware/Trinkglaeser/Stoelzle-Oberglas-Bier-Masskrug-Isar-1L::10752.html): 202 mm high, 109 mm diameter, 1.367 kg. Schweiger Bräu, [Isar Maßkrug](https://fanshop.schweiger-bier.de/product/bier-krug-isar-1l/): overall dimensions 15.5 × 20 cm, 1.35 kg. These retail dimensions inform the approximate radial cluster geometry.
4. Herrmann S.D., et al. (2024). [2024 Adult Compendium of Physical Activities: A third update of the energy costs of human activities](https://doi.org/10.1016/j.jshs.2023.10.010), with the [official activity table (PDF)](https://pacompendium.com/wp-content/uploads/2025/02/1_2024-adult-compendium_1_2024.pdf), activity code 11830, p. 15.
5. [Compendium of Physical Activities](https://pacompendium.com/), “Using the Compendium”: MET definition and approximate kcal/kg/hour conversion.
6. de Leva P. (1996). [Adjustments to Zatsiorsky-Seluyanov's segment inertia parameters](https://doi.org/10.1016/0021-9290(95)00178-6). *Journal of Biomechanics* 29(9), 1223–1230. Reference for adult body-segment proportions; the lengths used here are broad modeling inputs.
7. Meijering D., Duijn R.G.A., Murgia A., et al. (2023). [Elbow joint biomechanics during ADL focusing on total elbow arthroplasty: a scoping review](https://doi.org/10.1186/s12891-023-06149-8). *BMC Musculoskeletal Disorders* 24, 42. Review reports mean ADL flexion–extension moment 17 N·m, work-task peak 39 N·m, and 76 N·m while pushing a 37 kg trolley.
8. Nassour J., Zhao G., Grimmer M. (2021). [Soft pneumatic elbow exoskeleton reduces the muscle activity, metabolic cost and fatigue during holding and carrying of loads](https://doi.org/10.1038/s41598-021-91702-5). *Scientific Reports* 11, 12556. Reports elbow holding moments at a 0.34 m forearm lever and mean maximal elbow-flexion moment of 80 ± 24 N·m in the study sample.
9. Murgia A., Hortobágyi T., Wijnen A., et al. (2018). [Effects of age and sex on shoulder biomechanics and relative effort during functional tasks](https://doi.org/10.1016/j.jbiomech.2018.10.001). *Journal of Biomechanics* 81, 132–139. Six ADLs used about 22% of maximum shoulder torque in young adults and 52% in older adults.
