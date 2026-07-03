import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMeter } from '../js/core/escalation.js';

const hostile = (intensity) => ({ horseman: 'criticism', intensity, cues: [] });
const neutral = () => ({ horseman: null, intensity: 0, cues: [] });

test('meter rises with consecutive hostile turns and floods', () => {
  const m = createMeter();
  [0.6, 0.7, 0.8, 0.9, 0.85, 0.9].forEach(i => m.push(hostile(i), {}));
  assert.ok(m.flooded, `level ${m.level} should have crossed threshold`);
});

test('neutral turns decay the meter', () => {
  const m = createMeter();
  m.push(hostile(0.7), {});
  m.push(hostile(0.7), {});
  const after = m.level;
  [1, 2, 3, 4].forEach(() => m.push(neutral(), {}));
  assert.ok(m.level < after, `level should decay: ${m.level} < ${after}`);
  assert.equal(m.flooded, false);
});

test('interruptions accelerate flooding', () => {
  const calm = createMeter();
  const rushed = createMeter();
  const turns = [0.55, 0.6, 0.65, 0.7];
  turns.forEach(i => calm.push(hostile(i), {}));
  turns.forEach(i => rushed.push(hostile(i), { interruption: true }));
  assert.ok(rushed.level > calm.level);
});

test('flooded latches even if later turns are neutral', () => {
  const m = createMeter();
  [0.9, 0.9, 0.9, 0.9, 0.9, 0.9].forEach(i => m.push(hostile(i), {}));
  assert.ok(m.flooded);
  m.push(neutral(), {});
  assert.ok(m.flooded, 'flooded must latch');
});
