// Hard-coded safety classifiers. These are rule tables, not LLM calls, by design:
// the crisis path must be deterministic, auditable, and impossible to prompt-inject.
// screen() runs on every user input AND every agent output before render.

const CRISIS = [
  [/\bkill (myself|me)\b/i, 'suicidal ideation'],
  [/\bwant(s)? to die\b/i, 'suicidal ideation'],
  [/\bend it all\b/i, 'suicidal ideation'],
  [/\bhurt(ing)? myself\b/i, 'self-harm'],
  [/\bno reason to live\b/i, 'suicidal ideation'],
  [/\bbetter off without me\b/i, 'suicidal ideation'],
  [/\bcutting( myself| again)\b/i, 'self-harm'],
  [/\bself[- ]?harm\b/i, 'self-harm'],
  [/\bsuicid/i, 'suicidal ideation'],
  [/\bdon('|no)?t want to (be here|exist|wake up)\b/i, 'suicidal ideation'],
];

const ABUSE = [
  [/\byou('| wi)?ll regret\b/i, 'threat'],
  [/\bi('| wi)?ll make you\b/i, 'threat'],
  [/\bno one will believe you\b/i, 'coercive control'],
  [/\bif you (tell|leave)\b/i, 'coercive control'],
  [/\b(hit|slap|beat|hurt) you\b/i, 'violence'],
  [/\byou (made|make) me (hit|hurt|do)\b/i, 'blame reversal'],
];

export function screen(text) {
  const cues = [];
  let crisis = false;
  let abuse = false;
  for (const [pattern, label] of CRISIS) {
    if (pattern.test(text)) { crisis = true; cues.push(label); }
  }
  for (const [pattern, label] of ABUSE) {
    if (pattern.test(text)) { abuse = true; cues.push(label); }
  }
  return { crisis, abuse, cues };
}
