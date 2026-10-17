import { clamp, computeLoad, defaults, LB_PER_KG, normalizeState, stateFromSearch } from './calculation.js';

(() => {
  const $ = (selector) => document.querySelector(selector);
  const fields = {
    count: $('#stein-count'), fill: $('#fill'), volume: $('#beer-volume'),
    mugMass: $('#mug-mass'), density: $('#density'), uncertainty: $('#uncertainty'),
    densityUncertainty: $('#density-uncertainty'),
  };
  const OZ_PER_L = 33.8140227;
  const DENSITY_LB_PER_US_GAL_PER_KG_PER_L = LB_PER_KG * 3.785411784;
  const rememberPreferenceKey = 'carry-calc-remember';
  let unit = 'metric';
  let scenario;
  let toastTimer;
  let rememberInputs = false;

  function readNumber(field, fallback) {
    const value = field.valueAsNumber;
    return Number.isFinite(value) ? value : fallback;
  }
  function readState() {
    const volume = readNumber(fields.volume, defaults.volume * (unit === 'imperial' ? OZ_PER_L : 1)) / (unit === 'imperial' ? OZ_PER_L : 1);
    const mugMass = readNumber(fields.mugMass, defaults.mugMass * (unit === 'imperial' ? LB_PER_KG : 1)) / (unit === 'imperial' ? LB_PER_KG : 1);
    const massFactor = unit === 'imperial' ? LB_PER_KG : 1000;
    const densityFactor = unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1000;
    const uncertainty = readNumber(fields.uncertainty, defaults.uncertainty * massFactor) / massFactor;
    const densityUncertainty = readNumber(fields.densityUncertainty, defaults.densityUncertainty * densityFactor) / densityFactor;
    return normalizeState({
      count: readNumber(fields.count, 1),
      fill: readNumber(fields.fill, defaults.fill),
      volume,
      mugMass,
      density: readNumber(fields.density, defaults.density * densityFactor) / densityFactor,
      uncertainty,
      densityUncertainty,
    });
  }
  function pretty(value, digits = 2) { return Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
  function displayMass(kg, digits = 2) { return `${pretty(unit === 'imperial' ? kg * LB_PER_KG : kg, digits)} ${unit === 'imperial' ? 'lb' : 'kg'}`; }
  function setInputValues(state) {
    const inputValue = (value) => String(Number(value.toFixed(3)));
    const massFactor = unit === 'imperial' ? LB_PER_KG : 1000;
    const densityFactor = unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1000;
    fields.count.value = state.count;
    fields.fill.value = state.fill;
    fields.volume.value = inputValue(state.volume * (unit === 'imperial' ? OZ_PER_L : 1));
    fields.mugMass.value = inputValue(state.mugMass * (unit === 'imperial' ? LB_PER_KG : 1));
    fields.density.value = inputValue(state.density * densityFactor);
    fields.uncertainty.value = inputValue(state.uncertainty * massFactor);
    fields.densityUncertainty.value = inputValue(state.densityUncertainty * densityFactor);
  }
  function updateInputConstraints() {
    const volumeFactor = unit === 'imperial' ? OZ_PER_L : 1;
    const massFactor = unit === 'imperial' ? LB_PER_KG : 1000;
    const mugFactor = unit === 'imperial' ? LB_PER_KG : 1;
    const densityFactor = unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1000;
    fields.volume.min = 0.1 * volumeFactor;
    fields.volume.max = 2 * volumeFactor;
    fields.volume.step = 'any';
    fields.volume.dataset.stepSize = String(0.05 * volumeFactor);
    fields.mugMass.min = 0.1 * mugFactor;
    fields.mugMass.max = 5 * mugFactor;
    fields.mugMass.step = 'any';
    fields.mugMass.dataset.stepSize = String(0.01 * mugFactor);
    fields.uncertainty.min = 0;
    fields.uncertainty.max = 1 * massFactor;
    fields.uncertainty.step = 'any';
    fields.uncertainty.dataset.stepSize = unit === 'imperial' ? '0.001' : '1';
    fields.density.min = 0.8 * densityFactor;
    fields.density.max = 1.2 * densityFactor;
    fields.density.step = 'any';
    fields.density.dataset.stepSize = unit === 'imperial' ? '0.001' : '1';
    fields.densityUncertainty.min = 0;
    fields.densityUncertainty.max = 0.1 * densityFactor;
    fields.densityUncertainty.step = 'any';
    fields.densityUncertainty.dataset.stepSize = unit === 'imperial' ? '0.001' : '0.1';
  }
  function steinSvg() {
    return '<svg class="mini-stein" viewBox="0 0 30 36" role="img" aria-label="One beer stein"><path d="M21 9h3a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-3" fill="none" stroke="#c8b78e" stroke-width="2"/><path d="M5 9h17l-2 23H7L5 9Z" fill="#b77932" stroke="#e1bd6b" stroke-width="1.3"/><path d="M6 14h15l-1 16H7L6 14Z" fill="#e2a744"/><path d="M4 9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2H4V9Z" fill="#efe7d7"/></svg>';
  }
  function render(state = readState()) {
    const s = state;
    scenario = s;
    if (Number.isFinite(fields.count.valueAsNumber)) fields.count.value = String(s.count);
    const load = computeLoad(s, unit);
    const { beerKg: beer, glassKg: glass, totalKg: total } = load;
    $('#fill-output').textContent = `${s.fill}%`;
    const beerTop = 94 - 66 * s.fill / 100;
    $('#fill-beer').setAttribute('y', String(beerTop));
    $('#fill-beer').setAttribute('height', String(94 - beerTop));
    $('#fill-foam').setAttribute('height', String(beerTop - 28));
    $('#fill-foam-area').setAttribute('height', String(beerTop - 28));
    $('#total').textContent = pretty(load.total, 1);
    $('#total-unit').textContent = unit === 'imperial' ? 'lb' : 'kg';
    const uncertainty = load.high - load.total;
    $('#total-uncertainty').textContent = `±${pretty(uncertainty, 1)}`;
    $('#total-uncertainty').setAttribute('aria-label', `Total-load uncertainty: ±${pretty(uncertainty, 1)} ${unit === 'imperial' ? 'lb' : 'kg'}`);
    $('#secondary-total').textContent = `That's ${pretty(unit === 'imperial' ? total : total * LB_PER_KG, 1)} ±${pretty(unit === 'imperial' ? uncertainty / LB_PER_KG : uncertainty * LB_PER_KG, 1)} ${unit === 'imperial' ? 'kg' : 'lb'} on the other side of the pond`;
    $('#beer-total').textContent = displayMass(beer);
    $('#glass-total').textContent = displayMass(glass);
    $('#per-stein').textContent = displayMass(total / s.count);
    $('#per-stein-icon').innerHTML = steinSvg();
    const perSteinUncertainty = s.uncertainty + s.volume * (s.fill / 100) * s.densityUncertainty;
    $('#per-stein-uncertainty').textContent = `±${displayMass(perSteinUncertainty)}`;
    $('#per-stein-uncertainty').setAttribute('aria-label', `Per-stein uncertainty: ±${displayMass(perSteinUncertainty)}`);
    $('#beer-equation').textContent = `${s.count} × ${pretty(s.volume)} L × ${s.fill}% × ${pretty(s.density, 3)} kg/L = ${pretty(beer)} kg`;
    $('#glass-equation').textContent = `${s.count} × ${pretty(s.mugMass)} kg = ${pretty(glass)} kg`;
    $('#total-equation').textContent = `${pretty(beer)} kg + ${pretty(glass)} kg = ${pretty(total)} kg`;
    const visible = Math.min(s.count, 18);
    $('#visualizer').innerHTML = `${steinSvg().repeat(visible)}${s.count > visible ? `<span class="extra-count">+${s.count - visible}</span>` : ''}`;
    $('#visualizer').setAttribute('aria-label', `${s.count} beer steins`);
    $('#volume-unit').textContent = unit === 'imperial' ? 'fl oz' : 'L';
    $('#mass-unit').textContent = unit === 'imperial' ? 'lb' : 'kg';
    $('#uncertainty-unit').textContent = unit === 'imperial' ? '± lb' : '± g';
    $('#density-unit').textContent = unit === 'imperial' ? 'lb/gal' : 'g/L';
    $('#density-uncertainty-unit').textContent = unit === 'imperial' ? '± lb/gal' : '± g/L';
    if (rememberInputs) {
      try { localStorage.setItem('carry-calc', JSON.stringify(s)); } catch { /* The calculator still works when storage is unavailable. */ }
    }
  }
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2300);
  }

  const rememberCheckbox = $('#remember-inputs');
  try {
    rememberInputs = localStorage.getItem(rememberPreferenceKey) === 'true';
    rememberCheckbox.checked = rememberInputs;
    if (!rememberInputs) localStorage.removeItem('carry-calc');
  } catch { /* The calculator still works when storage is unavailable. */ }
  const fromUrl = stateFromSearch(location.search);
  let initialState = fromUrl;
  if (!initialState && rememberInputs) {
    try { initialState = JSON.parse(localStorage.getItem('carry-calc')); } catch { /* Use defaults for unavailable or invalid local storage. */ }
  }
  const initialScenario = normalizeState({ ...defaults, ...(initialState || {}) });
  updateInputConstraints();
  setInputValues(initialScenario);
  render(initialScenario);

  rememberCheckbox.addEventListener('change', () => {
    rememberInputs = rememberCheckbox.checked;
    try {
      if (rememberInputs) {
        localStorage.setItem(rememberPreferenceKey, 'true');
        localStorage.setItem('carry-calc', JSON.stringify(scenario));
      } else {
        localStorage.removeItem(rememberPreferenceKey);
        localStorage.removeItem('carry-calc');
      }
    } catch { /* The calculator still works when storage is unavailable. */ }
  });
  Object.entries(fields).forEach(([key, field]) => field.addEventListener('input', () => {
    const edited = readState();
    render({ ...scenario, [key]: edited[key] });
  }));
  ['volume', 'mugMass', 'density', 'uncertainty', 'densityUncertainty'].forEach((key) => fields[key].addEventListener('blur', () => setInputValues(scenario)));
  document.querySelectorAll('.step-button').forEach((button) => button.addEventListener('click', () => {
    const field = button.dataset.stepInput ? $(`#${button.dataset.stepInput}`) : fields.count;
    const key = Object.keys(fields).find((name) => fields[name] === field);
    const factor = key === 'volume' ? (unit === 'imperial' ? OZ_PER_L : 1)
      : key === 'mugMass' ? (unit === 'imperial' ? LB_PER_KG : 1)
        : key === 'uncertainty' ? (unit === 'imperial' ? LB_PER_KG : 1000)
          : key === 'density' || key === 'densityUncertainty' ? (unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1000) : 1;
    const min = Number(field.min) / factor;
    const max = Number(field.max) / factor;
    const step = Number(field.dataset.stepSize || field.step) / factor;
    const nextState = { ...scenario, [key]: clamp(scenario[key] + Number(button.dataset.step) * step, min, max) };
    setInputValues(nextState);
    render(nextState);
  }));
  document.querySelectorAll('[data-unit]').forEach((button) => button.addEventListener('click', () => {
    if (unit === button.dataset.unit) return;
    const state = scenario;
    unit = button.dataset.unit;
    document.querySelectorAll('[data-unit]').forEach((toggle) => toggle.setAttribute('aria-pressed', String(toggle === button)));
    updateInputConstraints();
    setInputValues(state);
    render(state);
  }));
  $('#reset').addEventListener('click', () => {
    setInputValues(defaults);
    history.replaceState(null, '', location.pathname);
    render(defaults);
    toast('Back to the standard scenario. Prost!');
  });
  $('#share').addEventListener('click', async () => {
    const state = scenario;
    const params = new URLSearchParams(Object.entries(state).map(([key, value]) => [key, String(value)]));
    const url = `${location.origin}${location.pathname}?${params}`;
    try {
      await navigator.clipboard.writeText(url);
      history.replaceState(null, '', `?${params}`);
      toast('Scenario link copied to clipboard.');
    } catch {
      history.replaceState(null, '', `?${params}`);
      toast('Scenario link ready in your address bar.');
    }
  });
})();

