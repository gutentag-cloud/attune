// Signature engine: turns the rupture-event stream's weekly aggregates into the
// relational vital sign. Pure statistics, client-side only — no ML, no server.
//
// Week shape: { repairLatencyHrs, warmthToCriticism, escalationVelocity, stonewallCount }

// Rising = a trailing run of 3+ consecutive weekly increases in repair latency.
// Repair-attempt decay is the validated early-warning pattern (Gottman): the
// fights aren't necessarily worse — the recoveries are slower.
export function computeTrend(weeks) {
  let runLength = 0;
  for (let i = weeks.length - 1; i > 0; i--) {
    if (weeks[i].repairLatencyHrs > weeks[i - 1].repairLatencyHrs) runLength++;
    else break;
  }
  return { repairLatencyRising: runLength >= 3, runLength };
}

// Gottman's 5:1 positive-to-negative ratio, banded.
export function ratioStatus(week) {
  const r = week.warmthToCriticism;
  if (r >= 5) return 'ok';
  if (r >= 2) return 'strained';
  return 'critical';
}
