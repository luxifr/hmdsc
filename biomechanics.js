const GRAVITY = 9.81;
const BODY_MASSES = [60, 80];
const UPPER_ARM_LENGTHS = [0.28, 0.34];
const FOREARM_LENGTHS = [0.25, 0.3];
const UPPER_ARM_FRACTIONS = [0.0255, 0.0271];
const FOREARM_FRACTIONS = [0.0138, 0.0162];
const HAND_FRACTIONS = [0.0056, 0.0061];
const SHOULDER_ANGLES = [-25, 0, 25];

export function handSplit(count) {
  return [Math.ceil(count / 2), Math.floor(count / 2)];
}

export function momentRanges(state, load) {
  const [heavierHand, lighterHand] = handSplit(state.count);
  const perSteinLowKg = load.lowKg / state.count;
  const perSteinHighKg = load.highKg / state.count;
  const hands = [heavierHand, lighterHand].map((steinCount) => {
    if (!steinCount) return { steinCount, loadLowKg: 0, loadHighKg: 0, elbow: null, shoulders: [], grip: null };
    const loads = [steinCount * perSteinLowKg, steinCount * perSteinHighKg];
    const elbow = [];
    const shoulders = SHOULDER_ANGLES.map((angle) => ({ angle, values: [] }));
    for (const bodyMass of BODY_MASSES) {
      for (const upperArmLength of UPPER_ARM_LENGTHS) {
        for (const forearmLength of FOREARM_LENGTHS) {
          for (const upperArmFraction of UPPER_ARM_FRACTIONS) {
            for (const forearmFraction of FOREARM_FRACTIONS) {
              for (const handFraction of HAND_FRACTIONS) {
                const upperArmMass = bodyMass * upperArmFraction;
                const forearmMass = bodyMass * forearmFraction;
                const handMass = bodyMass * handFraction;
                for (const loadKg of loads) {
                  const loadN = loadKg * GRAVITY;
                  elbow.push(loadN * forearmLength + forearmMass * GRAVITY * forearmLength / 2 + handMass * GRAVITY * forearmLength);
                  for (const shoulder of shoulders) {
                    const shoulderAngle = shoulder.angle * Math.PI / 180;
                    const forearmAngle = Math.PI / 2;
                    const upperArmLever = upperArmLength * Math.sin(shoulderAngle);
                    const forearmLever = upperArmLever + forearmLength * Math.sin(forearmAngle);
                    shoulder.values.push(Math.abs(
                      loadN * forearmLever
                      + upperArmMass * GRAVITY * upperArmLever / 2
                      + forearmMass * GRAVITY * (upperArmLever + forearmLength / 2 * Math.sin(forearmAngle))
                      + handMass * GRAVITY * forearmLever
                    ));
                  }
                }
              }
            }
          }
        }
      }
    }
    const bounds = (values) => ({ low: Math.min(...values), high: Math.max(...values) });
    const grip = steinCount === 1
      ? { low: loads[0] * GRAVITY * 0.06, high: loads[1] * GRAVITY * 0.08 }
      : steinCount <= 6 ? { low: 0, high: 0 } : null;
    return {
      steinCount,
      loadLowKg: loads[0],
      loadHighKg: loads[1],
      elbow: bounds(elbow),
      shoulders: shoulders.map(({ angle, values }) => ({ angle, ...bounds(values) })),
      grip,
    };
  });
  return { heavierHand: hands[0], lighterHand: hands[1] };
}
