import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screen } from '../js/core/safety.js';

test('detects suicidal ideation phrasing', () => {
  for (const phrase of [
    "sometimes I just want to die",
    "maybe everyone would be better off without me",
    "I've been cutting again",
    "I want to kill myself",
  ]) {
    const r = screen(phrase);
    assert.equal(r.crisis, true, `should flag crisis: "${phrase}"`);
  }
});

test('detects abuse / coercion markers', () => {
  for (const phrase of [
    "if you tell anyone, you'll regret it",
    "no one will believe you anyway",
    "I'll make you sorry you said that",
  ]) {
    const r = screen(phrase);
    assert.equal(r.abuse, true, `should flag abuse: "${phrase}"`);
  }
});

test('hostile but safe conflict language passes', () => {
  for (const phrase of [
    "you never listen to me",
    "I'm done talking about this",
    "that is honestly pathetic",
  ]) {
    const r = screen(phrase);
    assert.equal(r.crisis, false, `should NOT flag crisis: "${phrase}"`);
    assert.equal(r.abuse, false, `should NOT flag abuse: "${phrase}"`);
  }
});

test('returns matched cues', () => {
  const r = screen("I want to kill myself");
  assert.ok(r.cues.length > 0);
});
