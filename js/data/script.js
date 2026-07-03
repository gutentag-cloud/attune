// The scripted parent–teen argument (Dana, parent; Maya, 15). Grades/portal fight.
// This is demo data AND the end-to-end classifier fixture (test/script.test.js):
// the lines are written so the real classifier produces the intended sequence —
// criticism → defensiveness → contempt → flood. Nothing in the UI is hard-coded
// to these labels; change a line and the flags change.

export const DYAD = {
  parent: { id: 'parent', name: 'Dana', label: 'Dana · parent' },
  teen: { id: 'teen', name: 'Maya', label: 'Maya · 15' },
};

export const SCRIPT = [
  { speaker: 'parent', delayMs: 1400,
    text: "Maya, we need to talk about the email from your math teacher." },
  { speaker: 'teen', delayMs: 2100,
    text: "Can this wait? I'm in the middle of something." },
  { speaker: 'parent', delayMs: 2400,
    text: "It can't wait. Two missing assignments. Every single time I check the portal it's something new." },
  { speaker: 'teen', delayMs: 2200,
    text: "That's not fair — I already talked to Mr. Reyes about the retake." },
  { speaker: 'parent', delayMs: 2600,
    text: "You ALWAYS have an answer, don't you? Why can't you ever just do the work?" },
  { speaker: 'teen', delayMs: 2000, interruption: true,
    text: "Why are you blaming me? You never let me explain anything!" },
  { speaker: 'parent', delayMs: 2400, interruption: true,
    text: "Oh great, here we go. I can't believe I have to stand over a fifteen-year-old like she's five." },
  // ---- flooding threshold crosses here in the default meter; turns below are
  // the counterfactual tail (used only if thresholds are tuned upward) ----
  { speaker: 'teen', delayMs: 2000,
    text: "It's not my fault the portal is broken half the time!" },
  { speaker: 'parent', delayMs: 2400,
    text: "The portal. Right. That is honestly pathetic, Maya." },
  { speaker: 'teen', delayMs: 1800,
    text: "Whatever. You've already decided I'm a screwup." },
];
