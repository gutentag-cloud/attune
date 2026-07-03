// Four Horsemen turn classifier (Gottman): criticism, contempt, defensiveness,
// stonewalling. Lexical/pattern rules — runs entirely on-device, no model call.
// Returns { horseman, intensity: 0..1, cues: [matched cue labels] }.

const RULES = {
  criticism: [
    [/you (always|never)\b/i, 0.45, 'global "always/never"'],
    [/what('| i)?s wrong with you/i, 0.5, 'character attack'],
    [/you('| a)?re so (lazy|selfish|useless|impossible|irresponsible)/i, 0.5, 'trait attack'],
    [/why can('|no)?t you ever/i, 0.45, 'global complaint'],
    [/you don('|no)?t (even )?care\b/i, 0.4, 'motive attack'],
    [/every (single )?time\b/i, 0.3, 'globalizing'],
  ],
  contempt: [
    [/\b(pathetic|ridiculous|disgusting|worthless|loser)\b/i, 0.5, 'insult'],
    [/\boh,? (great|nice|sure|brilliant|perfect)\b/i, 0.4, 'sarcasm'],
    [/\bgenius\b/i, 0.4, 'mock vocative'],
    [/whatever you say\b/i, 0.4, 'dismissive superiority'],
    [/i can('|no)?t believe i have to/i, 0.4, 'superiority'],
    [/grow up\b/i, 0.45, 'belittling'],
    [/\bact your age\b/i, 0.4, 'belittling'],
  ],
  defensiveness: [
    [/not my fault/i, 0.5, 'fault rejection'],
    [/you('| a)?re the one who/i, 0.45, 'counter-blame'],
    [/why are you blaming me/i, 0.5, 'victim stance'],
    [/i didn('|no)?t do anything/i, 0.45, 'innocence claim'],
    [/stop attacking me/i, 0.45, 'attack framing'],
    [/that('| i)?s not (true|fair)/i, 0.35, 'rebuttal'],
    [/you never let me explain/i, 0.4, 'counter-complaint'],
  ],
  stonewalling: [
    [/^\s*whatever\b/i, 0.5, 'dismissal'],
    [/i('| a)?m done\b/i, 0.45, 'withdrawal'],
    [/leave me alone/i, 0.45, 'shutout'],
    [/i don('|no)?t care\b/i, 0.4, 'disengagement'],
    [/^\s*fine[.!]*\s*$/i, 0.45, 'flat shutdown'],
    [/(not|stop|done) talking\b/i, 0.3, 'talk refusal'],
    [/forget it\b/i, 0.4, 'abandon topic'],
  ],
};

const SWEARS = /\b(damn|hell|screw|stupid|shut up|crap)\b/i;

function intensifierMultiplier(text) {
  let m = 1;
  const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
  if (capsWords > 0) m *= 1.25;
  if (/!{2,}/.test(text)) m *= 1.15;
  if (SWEARS.test(text)) m *= 1.3;
  return m;
}

export function classifyTurn(text) {
  const scores = {};
  const cuesByHorseman = {};
  for (const [horseman, rules] of Object.entries(RULES)) {
    let score = 0;
    const cues = [];
    for (const [pattern, weight, label] of rules) {
      if (pattern.test(text)) { score += weight; cues.push(label); }
    }
    scores[horseman] = score;
    cuesByHorseman[horseman] = cues;
  }

  let winner = null;
  let best = 0;
  for (const [horseman, score] of Object.entries(scores)) {
    if (score > best) { best = score; winner = horseman; }
  }

  if (best < 0.25) return { horseman: null, intensity: 0, cues: [] };

  const intensity = Math.min(1, best * intensifierMultiplier(text));
  return { horseman: winner, intensity, cues: cuesByHorseman[winner] };
}
