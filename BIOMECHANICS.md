# Hand-carried steins: simplified biomechanics and energy estimate

## Evidence limits and modeling choices

There is no published measurement here of servers carrying six steins in one hand, their joint angles, or their hand forces. So this is a **simplified, conditional lever model**, not a measured technique or clinical assessment. It uses the carrying arrangement you described—six steins in a circle with handles facing inward, optionally a seventh supported on the handles—and explicitly assumed shoulder/elbow positions. Dimensions below come from retail listings for 1 L Maßkrüge; the inferred cluster geometry is an approximation.

For the default 12-steins / two-arm example, the model assumes six steins per hand, 90% fill, both arms sharing the load evenly, and steady transport. Angles and lever lengths are varied as stated below. The glasses are kept level; hand orientation therefore depends on shoulder and elbow orientation, rather than assuming a fixed wrist angle. Results are external gravitational moments from the stein load. They are useful for scale and comparison, not precise internal muscle or tendon forces.

## Reference load

Using the calculator defaults (one 1 L stein, 90% fill, beer density 1.010 kg/L, empty-glass mass 1.32 kg):

- Beer per stein: `1 L × 0.90 × 1.010 kg/L = 0.909 kg`.
- Filled stein: `0.909 + 1.32 = 2.229 kg`, or about **21.9 N** under gravity (`mass × 9.81 m/s²`).
- Six steins per hand: `6 × 2.229 = 13.374 kg`, or about **131 N per arm**.
- Twelve steins total: **26.748 kg (59.0 lb)**, or about **262 N** total gravitational load.

A seventh stein on top adds about **21.9 N** to that hand's load (about 153 N for seven full-default steins). These numbers scale directly with fill, beer density, glass mass, and stein count.

## Cluster geometry and keeping the steins level

A 1 L Paulaner Maßkrug listing gives approximately **20 cm height and 10.5 cm body diameter**; another Isar Maßkrug listing gives **20.2 cm height and 10.9 cm diameter**. A Schweiger listing gives overall dimensions of **15.5 × 20 cm**. Treating the 15.5 cm overall width as body diameter plus handle projection suggests the handle reaches about 2–3 cm beyond the body's 5.25 cm radius, with a grasp point roughly **6–8 cm from the mug's center**. This is an estimate from product dimensions, not a measured grip location.

For six mugs packed in a ring with their bodies approximately tangent, the mug centers sit about one body diameter (**10.5–10.9 cm**) from the bundle center. Their handles point inward, putting the grasp regions in the central opening. Each mug's weight therefore acts at a substantial radial offset from the central grasp, but in an evenly filled six-mug ring the six offsets cancel in the combined load: the **bundle center of mass remains near the central grip**. The group does not create six additive wrist moments in the same direction. Uneven fill or an off-center seventh mug can shift the resultant center of mass and add a moment.

For a planar arm model, define:

- `θs`: upper-arm angle forward from vertical at the shoulder,
- `β`: elbow flexion angle, modeled as folding the forearm back toward the torso,
- `θf = θs − β`: forearm angle from vertical,
- `ω`: hand/wrist angle relative to the forearm.

If the handles keep the stein axes upright, the orientation constraint is `θf + ω ≈ 0°`, or `ω ≈ β − θs`. The wrist therefore compensates for the *combined* shoulder and elbow posture; it does not simply copy the elbow angle. The example range below keeps the wrist compensation at about 0–30° in magnitude for the selected poses, while allowing the shoulder to move forward and the elbow to flex.

## Joint moment estimates

Assume the centered handle bundle places the combined load's vertical line of action over the wrist in the first-pass projection; the wrist-to-grip offset is taken as vertical, so it adds no horizontal lever arm at the elbow or shoulder. Use upper-arm length `L1 = 0.28–0.34 m` and forearm length `L2 = 0.25–0.30 m` as broad adult modeling inputs, broadly consistent with standard segment-proportion datasets [6]. With `W = 131 N` per arm, the stein-load moments are:

- **Elbow:** `M_e,load = W × L2 × |sin(θf)|`.
- **Shoulder:** `M_s,load = W × |L1 sin(θs) + L2 sin(θf)|`.

To include the arm itself, use standard adult segment mass fractions from de Leva—upper arm 2.55–2.71%, forearm 1.38–1.62%, hand 0.56–0.61% of body mass—and assume a 60–80 kg adult. Place each segment's center of mass at its midpoint for this simple calculation. Its gravitational moment can reinforce or partly offset the stein-load moment depending on posture; across the sweep it contributes up to about **2.8 N·m at the elbow** and **10.5 N·m at the shoulder**. Hand weight acts at the wrist line in this level-hand model. The totals below are stein-load plus arm-segment gravitational moments; movement acceleration is not included.

For a sensitivity sweep using shoulder angle `θs = 45–70°` forward from vertical, elbow flexion `β = 45–100°`, `L1 = 0.28–0.34 m`, and `L2 = 0.25–0.30 m`, let forearm orientation be `θf = θs − β`:

| Example posture | Shoulder / elbow / forearm / wrist angle | Elbow total moment | Shoulder total moment |
| --- | --- | ---: | ---: |
| Shoulder forward, forearm vertical | 45° / 45° / 0° / 0° | approximately 0 N·m | 30–38 N·m |
| Shoulder forward, modest wrist compensation | 60° / 75° / −15° / 15° | 9–11 N·m | 26–38 N·m |
| Shoulder forward, elbow more flexed | 60° / 90° / −30° / 30° | 17–21 N·m | 16–29 N·m |
| Arm farther forward, elbow bent | 70° / 100° / −30° / 30° | 17–21 N·m | 19–33 N·m |
| Arm farther forward, forearm angled ahead | 70° / 45° / 25° / −25° | 15–18 N·m | 54–69 N·m |

The entries are linked example poses, not every angle combination. Across the full sweep, the model spans about **0–35 N·m at the elbow** and **0–69 N·m at the shoulder**; the examples show how shifting shoulder position can redistribute the moment between joints while wrist motion keeps the steins upright. A seventh stein increases the stein-load portion by about **17%** on that side if its weight acts through the same line.

The symmetric six-steins-in-a-circle assumption puts the combined load near the bundle center. For comparison, a **5 cm horizontal shift** of the combined load's line of action would add `131 N × 0.05 m = 6.6 N·m` at any joint proximal to that shift. A seventh stein directly on top of the handles can add load without much horizontal offset; if its center is displaced, include the extra eccentric moment separately. The 5 cm example is a sensitivity value, not the nominal symmetric case.

At the wrist, take the center grip to sit **about 8 cm distal to the wrist**, along an upright hand/stein axis. In that idealized level-hand posture, the vertical load line runs through the wrist, so the bundle's load-only wrist moment is **approximately 0 N·m**; the hand still has to grip and stabilize the handles. If the grip/load line is offset from the wrist by 2–5 cm horizontally, the wrist moment is about **2.6–6.6 N·m** (`131 N × offset`). The roughly 10.5 cm radius from the bundle center to each mug's center is not itself the net wrist moment arm because the six radial offsets cancel around the symmetric bundle.

## Main tissues involved

The hand/finger flexors and thumb muscles grip the inward-facing handles; wrist flexors/extensors stabilize the hand; elbow flexors/extensors and shoulder muscles support the link posture. The hand, wrist, elbow, and shoulder joints transmit the forces. Their required activity changes with hand placement, wrist compensation, arm angles, and how load is shared across fingers.

The external moments above are not tendon forces. Converting a joint moment into an individual muscle/tendon force requires that muscle's moment arm and its share of the joint moment; several muscles can co-contract and share the same net moment. A wrist-posture experiment found that changing wrist position changed extrinsic finger-muscle EMG by up to 70% in some muscles [1], which supports including posture as a sensitivity factor. This note therefore quantifies the net external moments, and identifies the involved tissues, without pretending the net moment uniquely determines an individual tendon force.

## Energy per active minute

The 2024 Adult Compendium lists **5.5 MET** for “walking or walk downstairs or standing, carrying objects about 50 to 74 lbs” (activity code 11830) [4]. The two-arm default load is about 59 lb, so this provides a category-level proxy for an active carrying minute. It is not specific to static holding or the repeated pickup/set-down sequence.

Using the Compendium's approximate conversion of `1 MET ≈ 1 kcal/kg/hour` [5], for an assumed 60–80 kg adult:

- **Gross:** `5.5 × body mass ÷ 60` = about **5.5–7.3 kcal/min** while actively carrying.
- **Net above a 1-MET resting baseline:** about **4.5–6.0 kcal/min** during that active period.

This is a per-person activity estimate, not calories per lift. If carrying occupies only fraction `f` of each work minute, a simple average is `f × active rate + (1 − f) × resting rate`; pickup frequency, walking time, holding time, and recovery determine `f`. The useful conclusion is the scale: moving with this load is a substantial activity, while the energy cost of one pickup or a static hold cannot be isolated from the Compendium category alone.

## Summary and next step

For the symmetric six-per-hand scenario, each arm supports about 131 N. Across the assumed shoulder/elbow sweep, the stein load plus modeled arm weight creates about **25–43 N·m elbow** and **25–70 N·m shoulder**, with near-zero external wrist moment in the centered, level-grip case. Level steins impose a coupled orientation constraint across shoulder, elbow, and wrist; the six-steins radial geometry keeps the idealized combined center of mass near the central grip. A seventh stein adds about 17% load to that hand. The broad estimate is suitable as an explanatory model, not a personalized injury or safe-load threshold.

A useful next iteration would add an explicit per-hand stein count (including the optional seventh), a selectable posture scenario, and the simple moment equations above. The interface should label them as estimated external moments, not muscle/tendon forces.

## Sources

1. Beringer C.R., Mansouri M., Fisher L.E., et al. (2020). [The effect of wrist posture on extrinsic finger muscle activity during single joint movements](https://doi.org/10.1038/s41598-020-65167-x). *Scientific Reports* 10, 8377.
2. [Paulaner Maßkrug Glas 1 L](https://trinklusiv.at/products/paulaner-masskrug-glas-1l): approximately 20 cm high, 10.5 cm diameter, 1.27 kg.
3. [Isar Maßkrug 1 L](https://www.geschirr24.at/Glasware/Trinkglaeser/Stoelzle-Oberglas-Bier-Masskrug-Isar-1L::10752.html): 202 mm high, 109 mm diameter, 1.367 kg. Schweiger Bräu, [Isar Maßkrug](https://fanshop.schweiger-bier.de/product/bier-krug-isar-1l/): overall dimensions 15.5 × 20 cm, 1.35 kg. These retail dimensions inform the approximate radial cluster geometry.
4. Herrmann S.D., et al. (2024). [2024 Adult Compendium of Physical Activities: A third update of the energy costs of human activities](https://doi.org/10.1016/j.jshs.2023.10.010), with the [official activity table (PDF)](https://pacompendium.com/wp-content/uploads/2025/02/1_2024-adult-compendium_1_2024.pdf), activity code 11830, p. 15.
5. [Compendium of Physical Activities](https://pacompendium.com/), “Using the Compendium”: MET definition and approximate kcal/kg/hour conversion.
6. de Leva P. (1996). [Adjustments to Zatsiorsky-Seluyanov's segment inertia parameters](https://doi.org/10.1016/0021-9290(95)00178-6). *Journal of Biomechanics* 29(9), 1223–1230. Reference for adult body-segment proportions; the lengths used here are broad modeling inputs.
