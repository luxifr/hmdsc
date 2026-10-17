import { clamp, computeLoad, defaults, LB_PER_KG, normalizeState, stateFromSearch } from './calculation.js';

(() => {
  const $ = (selector) => document.querySelector(selector);
  const fields = {
    count: $('#stein-count'), fill: $('#fill'), volume: $('#beer-volume'),
    mugMass: $('#mug-mass'), density: $('#density'), uncertainty: $('#uncertainty'),
  };
  const OZ_PER_L = 33.8140227;
  const DENSITY_LB_PER_US_GAL_PER_KG_PER_L = LB_PER_KG * 3.785411784;
  let unit = 'metric';
  let toastTimer;

  function readNumber(field, fallback) {
    const value = field.valueAsNumber;
    return Number.isFinite(value) ? value : fallback;
  }
  function readState() {
    const volume = readNumber(fields.volume, defaults.volume * (unit === 'imperial' ? OZ_PER_L : 1)) / (unit === 'imperial' ? OZ_PER_L : 1);
    const mugMass = readNumber(fields.mugMass, defaults.mugMass * (unit === 'imperial' ? LB_PER_KG : 1)) / (unit === 'imperial' ? LB_PER_KG : 1);
    const densityFactor = unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1;
    const uncertainty = readNumber(fields.uncertainty, defaults.uncertainty * (unit === 'imperial' ? LB_PER_KG : 1)) / (unit === 'imperial' ? LB_PER_KG : 1);
    return normalizeState({
      count: readNumber(fields.count, 1),
      fill: readNumber(fields.fill, defaults.fill),
      volume,
      mugMass,
      density: readNumber(fields.density, defaults.density * densityFactor) / densityFactor,
      uncertainty,
    });
  }
  function pretty(value, digits = 2) { return Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
  function displayMass(kg, digits = 2) { return `${pretty(unit === 'imperial' ? kg * LB_PER_KG : kg, digits)} ${unit === 'imperial' ? 'lb' : 'kg'}`; }
  function setInputValues(state) {
    fields.count.value = state.count;
    fields.fill.value = state.fill;
    fields.volume.value = String(state.volume * (unit === 'imperial' ? OZ_PER_L : 1));
    fields.mugMass.value = String(state.mugMass * (unit === 'imperial' ? LB_PER_KG : 1));
    fields.density.value = String(state.density * (unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1));
    fields.uncertainty.value = String(state.uncertainty * (unit === 'imperial' ? LB_PER_KG : 1));
  }
  function updateInputConstraints() {
    const volumeFactor = unit === 'imperial' ? OZ_PER_L : 1;
    const massFactor = unit === 'imperial' ? LB_PER_KG : 1;
    fields.volume.min = unit === 'imperial' ? (0.1 * volumeFactor).toFixed(9) : 0.1;
    fields.volume.max = unit === 'imperial' ? (2 * volumeFactor).toFixed(9) : 2;
    fields.volume.step = unit === 'imperial' ? (0.05 * volumeFactor).toFixed(9) : 0.05;
    fields.mugMass.min = 0.1 * massFactor;
    fields.mugMass.max = 5 * massFactor;
    fields.mugMass.step = 0.05 * massFactor;
    fields.uncertainty.min = 0;
    fields.uncertainty.max = 1 * massFactor;
    fields.uncertainty.step = 0.05 * massFactor;
    const densityFactor = unit === 'imperial' ? DENSITY_LB_PER_US_GAL_PER_KG_PER_L : 1;
    fields.density.min = 0.8 * densityFactor;
    fields.density.max = 1.2 * densityFactor;
    fields.density.step = 0.001 * densityFactor;
  }
  function steinSvg() {
    return '<svg class="mini-stein" viewBox="0 0 30 36" role="img" aria-label="One beer stein"><path d="M21 9h3a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-3" fill="none" stroke="#c8b78e" stroke-width="2"/><path d="M5 9h17l-2 23H7L5 9Z" fill="#b77932" stroke="#e1bd6b" stroke-width="1.3"/><path d="M6 14h15l-1 16H7L6 14Z" fill="#e2a744"/><path d="M4 9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2H4V9Z" fill="#efe7d7"/></svg>';
  }
  function render() {
    const s = readState();
    if (Number.isFinite(fields.count.valueAsNumber)) fields.count.value = String(s.count);
    const load = computeLoad(s, unit);
    const { beerKg: beer, glassKg: glass, totalKg: total } = load;
    $('#fill-output').textContent = `${s.fill}%`;
    $('#total').textContent = pretty(load.total, 1);
    $('#total-unit').textContent = unit === 'imperial' ? 'lb' : 'kg';
    $('#secondary-total').textContent = `That’s ${pretty(unit === 'imperial' ? total : total * LB_PER_KG, 1)} ${unit === 'imperial' ? 'kg' : 'lb'} on the other side of the pond`;
    $('#beer-total').textContent = displayMass(beer);
    $('#glass-total').textContent = displayMass(glass);
    $('#per-stein').textContent = `${displayMass(total / s.count)} per stein`;
    $('#range').textContent = `Total load range: ${pretty(load.low, 1)}–${pretty(load.high, 1)} ${unit === 'imperial' ? 'lb' : 'kg'}`;
    $('#beer-equation').textContent = `${s.count} × ${pretty(s.volume)} L × ${s.fill}% × ${pretty(s.density, 3)} kg/L = ${pretty(beer)} kg`;
    $('#glass-equation').textContent = `${s.count} × ${pretty(s.mugMass)} kg = ${pretty(glass)} kg`;
    $('#total-equation').textContent = `${pretty(beer)} kg + ${pretty(glass)} kg = ${pretty(total)} kg`;
    const visible = Math.min(s.count, 18);
    $('#visualizer').innerHTML = `${steinSvg().repeat(visible)}${s.count > visible ? `<span class="extra-count">+${s.count - visible}</span>` : ''}`;
    $('#visualizer').setAttribute('aria-label', `${s.count} beer steins`);
    $('#volume-unit').textContent = unit === 'imperial' ? 'fl oz' : 'L';
    $('#mass-unit').textContent = unit === 'imperial' ? 'lb' : 'kg';
    $('#uncertainty-unit').textContent = unit === 'imperial' ? '± lb' : '± kg';
    $('#density-unit').textContent = unit === 'imperial' ? 'lb/US gal' : 'kg/L';
    try { localStorage.setItem('carry-calc', JSON.stringify(s)); } catch { /* The calculator still works when storage is unavailable. */ }
  }
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2300);
  }

  const fromUrl = stateFromSearch(location.search);
  let initialState = fromUrl;
  if (!initialState) {
    try { initialState = JSON.parse(localStorage.getItem('carry-calc')); } catch { /* Use defaults for unavailable or invalid local storage. */ }
  }
  setInputValues({ ...defaults, ...(initialState || {}) });
  render();

  Object.values(fields).forEach((field) => field.addEventListener('input', render));
  document.querySelectorAll('.step-button').forEach((button) => button.addEventListener('click', () => {
    fields.count.value = clamp(readState().count + Number(button.dataset.step), 1, 40);
    render();
  }));
  document.querySelectorAll('[data-unit]').forEach((button) => button.addEventListener('click', () => {
    if (unit === button.dataset.unit) return;
    const state = readState();
    unit = button.dataset.unit;
    document.querySelectorAll('[data-unit]').forEach((toggle) => toggle.setAttribute('aria-pressed', String(toggle === button)));
    updateInputConstraints();
    setInputValues(state);
    render();
  }));
  $('#reset').addEventListener('click', () => {
    setInputValues(defaults);
    history.replaceState(null, '', location.pathname);
    render();
    toast('Back to the standard scenario. Prost!');
  });
  $('#share').addEventListener('click', async () => {
    const state = readState();
    const params = new URLSearchParams(Object.entries(state).map(([key, value]) => [key, String(Number(value.toFixed(3)))]));
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

