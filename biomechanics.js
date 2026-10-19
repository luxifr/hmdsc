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
  const [steinCount] = handSplit(state.count);
  const perSteinLowKg = load.lowKg / state.count;
  const perSteinHighKg = load.highKg / state.count;
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
                  const upperArmLever = upperArmLength * Math.sin(shoulderAngle);
                  const forearmLever = upperArmLever + forearmLength;
                  shoulder.values.push(Math.abs(
                    loadN * forearmLever
                    + upperArmMass * GRAVITY * upperArmLever / 2
                    + forearmMass * GRAVITY * (upperArmLever + forearmLength / 2)
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
  return {
    heavierHand: {
      steinCount,
      loadLowKg: loads[0],
      loadHighKg: loads[1],
      elbow: bounds(elbow),
      shoulders: shoulders.map(({ angle, values }) => ({ angle, ...bounds(values) })),
    },
  };
}
