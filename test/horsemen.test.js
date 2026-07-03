import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTurn } from '../js/core/horsemen.js';

test('criticism: global character attack', () => {
  const r = classifyTurn("You never think about anyone but yourself. What is wrong with you?");
  assert.equal(r.horseman, 'criticism');
  assert.ok(r.intensity > 0.5, `intensity ${r.intensity} should be > 0.5`);
  assert.ok(r.cues.length > 0);
});

test('contempt: mockery and superiority', () => {
  const r = classifyTurn("Oh great job, genius. That is honestly pathetic.");
  assert.equal(r.horseman, 'contempt');
});

test('defensiveness: counter-blame + innocent victim', () => {
  const r = classifyTurn("It's not my fault! You're the one who never listens to me.");
  assert.equal(r.horseman, 'defensiveness');
});

test('stonewalling: dismissive shutdown', () => {
  const r = classifyTurn("Whatever. I'm done talking about this.");
  assert.equal(r.horseman, 'stonewalling');
});

test('neutral turn classifies null', () => {
  const r = classifyTurn("Can we talk about the schedule for tomorrow?");
  assert.equal(r.horseman, null);
  assert.equal(r.intensity, 0);
});

test('warm turn classifies null', () => {
  const r = classifyTurn("Thanks for making dinner, it was really good.");
  assert.equal(r.horseman, null);
});

test('intensifiers raise intensity', () => {
  const soft = classifyTurn("you never help");
  const hard = classifyTurn("YOU NEVER help, ever!!");
  assert.ok(hard.intensity > soft.intensity,
    `hard ${hard.intensity} should exceed soft ${soft.intensity}`);
});
