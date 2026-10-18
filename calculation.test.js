import assert from 'node:assert/strict';
import test from 'node:test';
import { computeLoad, defaults, LB_PER_KG, normalizeState, stateFromSearch } from './calculation.js';

test('default scenario computes the expected metric load', () => {
  const load = computeLoad(defaults);
  assert.equal(Number(load.totalKg.toFixed(2)), 26.75);
  assert.equal(Number(load.beerKg.toFixed(2)), 10.91);
  assert.equal(Number(load.glassKg.toFixed(2)), 15.84);
});

test('default uncertainty combines glass and beer-density ranges', () => {
  const load = computeLoad(defaults);
  assert.ok(Math.abs(load.high - load.totalKg - 12 * (0.05 + defaults.fill / 100 * defaults.densityUncertainty)) < 1e-12);
  assert.ok(Math.abs(load.totalKg - load.low - 12 * (0.05 + defaults.fill / 100 * defaults.densityUncertainty)) < 1e-12);
});

test('imperial display converts the total and converts back without loss', () => {
  const metric = computeLoad(defaults);
  const imperial = computeLoad(defaults, 'imperial');
  assert.equal(imperial.total, metric.totalKg * LB_PER_KG);
  assert.ok(Math.abs(imperial.total / LB_PER_KG - metric.totalKg) < 1e-12);
  assert.ok(Math.abs(imperial.low / LB_PER_KG - metric.lowKg) < 1e-12);
  assert.ok(Math.abs(imperial.high / LB_PER_KG - metric.highKg) < 1e-12);
});

test('state normalization applies defaults and clamps each input', () => {
  assert.deepEqual(normalizeState({ count: 0, fill: 110, volume: 99, mugMass: -2, density: 2, uncertainty: -1, beerUncertainty: 2, densityUncertainty: -1 }), {
    ...defaults,
    count: 1,
    fill: 100,
    volume: 2,
    mugMass: 0.1,
    density: 1.2,
    uncertainty: 0,
    densityUncertainty: 0,
  });
  assert.deepEqual(normalizeState({ count: NaN }), defaults);
});

test('state normalization handles every lower and upper boundary', () => {
  assert.deepEqual(normalizeState({
    count: -100, fill: -100, volume: -100, mugMass: -100, density: -100,
    uncertainty: -100, densityUncertainty: -100,
  }), {
    ...defaults,
    count: 1,
    fill: 70,
    volume: 0.1,
    mugMass: 0.1,
    density: 0.8,
    uncertainty: 0,
    densityUncertainty: 0,
  });
  assert.deepEqual(normalizeState({
    count: 100, fill: 200, volume: 100, mugMass: 100, density: 100,
    uncertainty: 100, densityUncertainty: 100,
  }), {
    ...defaults,
    count: 40,
    fill: 100,
    volume: 2,
    mugMass: 5,
    density: 1.2,
    uncertainty: 1,
    densityUncertainty: 0.1,
  });
});

test('state normalization defaults non-finite values but accepts zero where in range', () => {
  assert.deepEqual(normalizeState({
    count: Infinity, fill: NaN, volume: -Infinity, mugMass: Infinity,
    density: NaN, uncertainty: 0, densityUncertainty: 0,
  }), {
    ...defaults,
    uncertainty: 0,
    densityUncertainty: 0,
  });
});

test('zero uncertainty produces an exact range and lower bounds prevent negative loads', () => {
  const exact = computeLoad(normalizeState({ count: 1, uncertainty: 0, densityUncertainty: 0 }));
  assert.equal(exact.lowKg, exact.totalKg);
  assert.equal(exact.highKg, exact.totalKg);

  const lowerBound = computeLoad(normalizeState({
    count: 1, fill: 70, volume: 0.1, mugMass: 0.1, density: 0.8,
    uncertainty: 1, densityUncertainty: 0.1,
  }));
  assert.equal(lowerBound.lowKg, 0);
  assert.ok(lowerBound.highKg >= lowerBound.totalKg);
});

test('URL state returns null without parameters and clamps invalid values', () => {
  assert.equal(stateFromSearch(''), null);
  assert.deepEqual(stateFromSearch('?count=0&fill=110&volume=99&mugMass=-2&density=bad&uncertainty=-1&beerUncertainty=2&densityUncertainty=-1'), {
    ...defaults,
    count: 1,
    fill: 100,
    volume: 2,
    mugMass: 0.1,
    uncertainty: 0,
    densityUncertainty: 0,
  });
});

test('URL state uses the first duplicate value and ignores unknown or non-finite values', () => {
  assert.deepEqual(stateFromSearch('?unknown=7&count=4&count=9&fill=Infinity&density=1.02'), {
    ...defaults,
    count: 4,
    density: 1.02,
  });
});

test('URL values clamp at supported limits and round fractional stein counts', () => {
  assert.deepEqual(stateFromSearch('?count=2.5&fill=70&volume=0.1&mugMass=5&density=0.8&uncertainty=1&densityUncertainty=0.1'), {
    ...defaults,
    count: 3,
    fill: 70,
    volume: 0.1,
    mugMass: 5,
    density: 0.8,
    uncertainty: 1,
    densityUncertainty: 0.1,
  });
});
