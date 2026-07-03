// Maya's trigger and de-escalation data + rehearsal responses for offline mode.
// Free of cringy parts metaphors.

// Default fallback repair seed
export const BRIDGE_SEED =
  "I felt accused during the grades argument and immediately went defensive to protect myself from feeling like a disappointment. " +
  "I already talked to Mr. Reyes, and I am trying. I'd like us to talk about school without it turning into a fight.";

// The de-escalation profile shared with Dana's phone.
export const PARTS_CARD = {
  owner: 'Maya', sharedWith: 'Dana', revocable: true,
  entries: [
    { part: 'Defensive Trigger',
      note: "When Maya feels criticized or checked on, she responds defensively by deflecting or counter-blaming." },
    { part: 'Shutdown Trigger',
      note: "When the emotional volume gets too loud, she withdraws and shuts down. Pushing past this makes her shut down harder." },
  ],
};

// Rehearsal mode simulation configuration for Dana
export const REHEARSAL = {
  scenario: "Dana rehearses the post-break check-in before knocking on Maya's door.",
  attempts: [
    {
      id: 'a1',
      label: "“We still need to deal with those assignments. Can we talk without the drama this time?”",
      lands: false,
      simResponse: "[Defensive Response Triggered] “The drama? Wow. I already handled it — I talked to Mr. Reyes. Can you leave?”",
      note: "'Without the drama' is perceived as an accusation, triggering immediate deflection.",
    },
    {
      id: 'a2',
      label: "“I came on too hard in the kitchen. I'm not here about the assignments — I want to hear what I kept talking over.”",
      lands: true,
      simResponse: "[Defenses Stand Down] “...Okay. It's not that I don't care about the grades. It's the voice you get. Can I just explain the Reyes thing from the start?”",
      note: "Leading with repair and acknowledging her triggers avoids activating defenses.",
    },
  ],
  coachHint:
    "Acknowledge the triggers. Lead with repair, not her failure — and don't ask for calm, offer it.",
};
