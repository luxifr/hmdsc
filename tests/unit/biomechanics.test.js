import assert from 'node:assert/strict';
import test from 'node:test';
import { handSplit, momentRanges } from '../../src/biomechanics.js';
import { computeLoad, defaults, normalizeState } from '../../src/calculation.js';

function estimate(count) {
  const state = normalizeState({ ...defaults, count });
  return momentRanges(state, computeLoad(state));
}

test('steins split evenly with an odd extra assigned to the heavier hand', () => {
  assert.deepEqual(handSplit(1), [1, 0]);
  assert.deepEqual(handSplit(12), [6, 6]);
  assert.deepEqual(handSplit(13), [7, 6]);
  assert.deepEqual(handSplit(40), [20, 20]);
  assert.equal(estimate(13).heavierHand.steinCount, 7);
});

test('default joint moment ranges include the calculator load uncertainty', () => {
  const { heavierHand } = estimate(12);
  assert.ok(heavierHand.elbow.low < 35 && heavierHand.elbow.high > 43);
  assert.equal(heavierHand.shoulders.length, 3);
  assert.ok(heavierHand.shoulders[0].low < 13 && heavierHand.shoulders[0].high > 24);
  assert.equal(heavierHand.shoulders[1].low, heavierHand.elbow.low);
  assert.equal(heavierHand.shoulders[1].high, heavierHand.elbow.high);
  assert.ok(heavierHand.shoulders[2].low > 50 && heavierHand.shoulders[2].high > 65);
});

test('elbow moment stays constant as the shoulder swings, while load scales the moment', () => {
  const sixSteins = estimate(12).heavierHand;
  const twentySteins = estimate(40).heavierHand;
  assert.deepEqual(Object.keys(sixSteins), ['steinCount', 'loadLowKg', 'loadHighKg', 'elbow', 'shoulders']);
  assert.deepEqual(sixSteins.shoulders.map(({ angle }) => angle), [-25, 0, 25]);
  assert.ok(twentySteins.elbow.high > sixSteins.elbow.high);
  assert.ok(sixSteins.shoulders[0].low < sixSteins.shoulders[2].low);
});
