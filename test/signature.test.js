import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTrend, ratioStatus } from '../js/core/signature.js';

const wk = (repairLatencyHrs, warmthToCriticism = 5) =>
  ({ repairLatencyHrs, warmthToCriticism, escalationVelocity: 0.4, stonewallCount: 2 });

test('flags 3+ consecutive weekly rises in repair latency', () => {
  const weeks = [wk(4), wk(3.5), wk(4), wk(3.8), wk(5), wk(7), wk(11), wk(16)];
  const t = computeTrend(weeks);
  assert.equal(t.repairLatencyRising, true);
  assert.ok(t.runLength >= 3);
});

test('does not flag stable repair latency', () => {
  const weeks = [wk(4), wk(4.5), wk(3.9), wk(4.2), wk(4), wk(4.4), wk(3.8), wk(4.1)];
  const t = computeTrend(weeks);
  assert.equal(t.repairLatencyRising, false);
});

test('ratio status maps to Gottman 5:1 bands', () => {
  assert.equal(ratioStatus(wk(4, 6)), 'ok');
  assert.equal(ratioStatus(wk(4, 5)), 'ok');
  assert.equal(ratioStatus(wk(4, 3)), 'strained');
  assert.equal(ratioStatus(wk(4, 1.2)), 'critical');
});
