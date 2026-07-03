// End-to-end fixture: the demo script run through the REAL classifier + meter
// must produce the intended dramatic arc, or the stage demo breaks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTurn } from '../js/core/horsemen.js';
import { createMeter } from '../js/core/escalation.js';
import { SCRIPT } from '../js/data/script.js';

test('script produces the intended horsemen sequence up to the flood', () => {
  const expected = [null, null, 'criticism', 'defensiveness', 'criticism', 'defensiveness', 'contempt'];
  const actual = SCRIPT.slice(0, 7).map(t => classifyTurn(t.text).horseman);
  assert.deepEqual(actual, expected);
});

test('meter floods exactly on the contempt turn (index 6)', () => {
  const m = createMeter();
  let floodedAt = -1;
  SCRIPT.forEach((turn, i) => {
    if (m.flooded) return;
    m.push(classifyTurn(turn.text), { interruption: !!turn.interruption });
    if (m.flooded && floodedAt === -1) floodedAt = i;
  });
  assert.equal(floodedAt, 6, `flood should land on the contempt beat, got turn ${floodedAt}`);
});

test('no script line trips the crisis or abuse classifier', async () => {
  const { screen } = await import('../js/core/safety.js');
  for (const turn of SCRIPT) {
    const r = screen(turn.text);
    assert.equal(r.crisis || r.abuse, false, `script line should be safe: "${turn.text}"`);
  }
});
