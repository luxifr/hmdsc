export const defaults = { count: 12, fill: 100, volume: 1, mugMass: 1.32, density: 1.01, uncertainty: 0.1 };
export const LB_PER_KG = 2.2046226218;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeState(values = {}) {
  const state = { ...defaults, ...values };
  for (const key of Object.keys(defaults)) {
    if (!Number.isFinite(state[key])) state[key] = defaults[key];
  }
  state.count = clamp(Math.round(state.count), 1, 40);
  state.fill = clamp(state.fill, 70, 100);
  state.volume = clamp(state.volume, 0.1, 2);
  state.mugMass = clamp(state.mugMass, 0.1, 5);
  state.density = clamp(state.density, 0.8, 1.2);
  state.uncertainty = clamp(state.uncertainty, 0, 1);
  return state;
}

export function computeLoad(state, unit = 'metric') {
  const beerKg = state.count * state.volume * (state.fill / 100) * state.density;
  const glassKg = state.count * state.mugMass;
  const totalKg = beerKg + glassKg;
  const marginKg = state.count * state.uncertainty;
  const lowKg = Math.max(0, totalKg - marginKg);
  const highKg = totalKg + marginKg;
  const factor = unit === 'imperial' ? LB_PER_KG : 1;
  return { beerKg, glassKg, totalKg, lowKg, highKg, total: totalKg * factor, low: lowKg * factor, high: highKg * factor };
}

export function stateFromSearch(search) {
  const params = new URLSearchParams(search);
  if (![...params.keys()].length) return null;
  const values = {};
  for (const key of Object.keys(defaults)) {
    if (params.has(key)) {
      const value = Number(params.get(key));
      if (Number.isFinite(value)) values[key] = value;
    }
  }
  return normalizeState(values);
}
