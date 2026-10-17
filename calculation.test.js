import assert from 'node:assert/strict';
import test from 'node:test';
import { computeLoad, defaults, LB_PER_KG, normalizeState, stateFromSearch } from './calculation.js';

test('default scenario computes the expected metric load', () => {
  const load = computeLoad(defaults);
  assert.equal(Number(load.totalKg.toFixed(2)), 27.96);
  assert.equal(Number(load.beerKg.toFixed(2)), 12.12);
  assert.equal(Number(load.glassKg.toFixed(2)), 15.84);
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
  assert.deepEqual(normalizeState({ count: 0, fill: 110, volume: 99, mugMass: -2, density: 2, uncertainty: -1 }), {
    ...defaults,
    count: 1,
    fill: 100,
    volume: 2,
    mugMass: 0.1,
    density: 1.2,
    uncertainty: 0,
  });
  assert.deepEqual(normalizeState({ count: NaN }), defaults);
});

test('URL state returns null without parameters and clamps invalid values', () => {
  assert.equal(stateFromSearch(''), null);
  assert.deepEqual(stateFromSearch('?count=0&fill=110&volume=99&mugMass=-2&density=bad&uncertainty=-1'), {
    ...defaults,
    count: 1,
    fill: 100,
    volume: 2,
    mugMass: 0.1,
    uncertainty: 0,
  });
});
