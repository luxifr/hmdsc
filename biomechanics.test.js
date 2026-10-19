import assert from 'node:assert/strict';
import test from 'node:test';
import { momentRanges } from './biomechanics.js';
import { computeLoad, defaults, normalizeState } from './calculation.js';

function estimate(count) {
  const state = normalizeState({ ...defaults, count });
  return momentRanges(state, computeLoad(state));
}

test('steins split evenly with an odd extra assigned to the heavier hand', () => {
  assert.deepEqual([estimate(1).heavierHand.steinCount, estimate(1).lighterHand.steinCount], [1, 0]);
  assert.deepEqual([estimate(12).heavierHand.steinCount, estimate(12).lighterHand.steinCount], [6, 6]);
  assert.deepEqual([estimate(13).heavierHand.steinCount, estimate(13).lighterHand.steinCount], [7, 6]);
  assert.deepEqual([estimate(40).heavierHand.steinCount, estimate(40).lighterHand.steinCount], [20, 20]);
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

test('single stein grip eccentricity and unsupported larger cluster geometry are explicit', () => {
  assert.ok(estimate(1).heavierHand.grip.low > 1.2);
  assert.ok(estimate(1).heavierHand.grip.high < 1.9);
  assert.deepEqual(estimate(6).heavierHand.grip, { low: 0, high: 0 });
  assert.equal(estimate(13).heavierHand.grip, null);
  assert.ok(estimate(40).heavierHand.elbow.high > estimate(12).heavierHand.elbow.high);
});
