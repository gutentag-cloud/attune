// SIGNATURE — the relational vital sign. Eight weeks of clearly-labeled
// simulated data rendered like a clinical chart: repair latency trace +
// warmth:criticism bars against the Gottman 5:1 guide, with the early-warning
// window shaded. computeTrend fires the callout. Never diagnostic language.
import { WEEKS, SIMULATED } from '../data/weeks.js';
import { computeTrend, ratioStatus } from '../core/signature.js';

export function mountDashboard(el, state) {
  const trend = computeTrend(WEEKS);
  // tonight's session, if the repair was sent, joins the series live —
  // the whole point of the instrument is watching the curve respond
  const tonight = state?.bridgeSent
    ? { week: 'now', repairLatencyHrs: 0.4, warmthToCriticism: 2.4, escalationVelocity: 0.58, stonewallCount: 4 }
    : null;
  const weeks = tonight ? [...WEEKS, tonight] : WEEKS;
  const last = WEEKS.at(-1);
  const cur = tonight ?? last;
  const status = ratioStatus(cur);

  el.innerHTML = `
    <p class="scene-kicker">Scene 5 · The household’s chart — both consented</p>
    <h1>Signature</h1>
    <p class="lede">Every conflict and repair from LISTEN feeds this chart — a continuous,
    passive proxy for Expressed Emotion, the home-climate measure that predicts psychiatric
    relapse. The signal isn't how often this family fights; it's how long repair takes.
    Catch the slope, not the threshold.</p>
    <span class="sim-label">Simulated data · 8 weeks${tonight ? ' + tonight, live from this session' : ''} · demo household</span>

    ${trend.repairLatencyRising ? `
    <div class="warning-callout" role="status">
      <span class="dot" aria-hidden="true"></span>
      <div>
        <strong>Repair latency has risen ${trend.runLength} weeks in a row</strong> — from
        ${WEEKS.at(-1 - trend.runLength).repairLatencyHrs} hrs to ${last.repairLatencyHrs} hrs.
        This is a validated early-warning pattern, not a diagnosis. Worth a check-in with
        each other — and, if someone in this house has a care team, with them.
      </div>
    </div>` : ''}

    ${tonight ? `
    <div class="success-callout" role="status">
      <span class="dot" aria-hidden="true"></span>
      <div>
        <strong>Tonight is on the chart.</strong> Flood at the kitchen argument → break →
        AURA reset → repair sent 0.4 hrs later. That's the fastest repair in five weeks —
        the curve just bent, and this family watched it happen.
      </div>
    </div>` : ''}

    <div class="metric-row">
      <div class="metric" data-status="${tonight ? 'ok' : trend.repairLatencyRising ? 'crit' : 'ok'}">
        <div class="k">Repair latency</div><div class="v">${cur.repairLatencyHrs} hrs</div>
        <div class="fine">${tonight ? 'tonight — down from 16 hrs' : 'time to first repair attempt'}</div>
        <span class="spark">${spark(weeks.map(w => w.repairLatencyHrs), tonight ? 'ok' : trend.repairLatencyRising ? 'crit' : 'ok')}</span>
      </div>
      <div class="metric" data-status="${status === 'ok' ? 'ok' : status === 'strained' ? 'warn' : 'crit'}">
        <div class="k">Warmth : criticism</div><div class="v">${cur.warmthToCriticism} : 1</div>
        <div class="fine">Gottman stable band ≥ 5:1</div>
        <span class="spark">${spark(weeks.map(w => w.warmthToCriticism), status === 'ok' ? 'ok' : 'warn')}</span>
      </div>
      <div class="metric" data-status="${cur.escalationVelocity > 0.5 ? 'warn' : 'ok'}">
        <div class="k">Escalation velocity</div><div class="v">${cur.escalationVelocity.toFixed(2)}</div>
        <div class="fine">mean meter slope per conflict</div>
        <span class="spark">${spark(weeks.map(w => w.escalationVelocity), cur.escalationVelocity > 0.5 ? 'warn' : 'ok')}</span>
      </div>
      <div class="metric" data-status="${cur.stonewallCount >= 5 ? 'warn' : 'ok'}">
        <div class="k">Stonewalls / wk</div><div class="v">${cur.stonewallCount}</div>
        <div class="fine">withdrawal events</div>
        <span class="spark">${spark(weeks.map(w => w.stonewallCount), cur.stonewallCount >= 5 ? 'warn' : 'ok')}</span>
      </div>
    </div>

    <div class="chart-card">
      <h3>Repair latency · warmth:criticism, by week</h3>
      ${renderChart(weeks, trend)}
      <div class="chart-legend">
        <span><i style="background:oklch(66% 0.2 25)"></i> repair latency (hrs)</span>
        <span><i style="background:oklch(79% 0.16 158 / 0.5)"></i> warmth:criticism in band</span>
        <span><i style="background:oklch(80% 0.14 85 / 0.6)"></i> below 5:1</span>
        <span><i style="background:oklch(66% 0.2 25 / 0.18)"></i> early-warning window</span>
      </div>
      <p class="fine">The trace is the early-warning series: recoveries slowing while the
      household still “functions”. ${SIMULATED ? 'All values simulated for the demo.' : ''}</p>
    </div>
  `;
}

// tiny inline sparkline for metric cards
function spark(values, tone) {
  const W = 100, H = 26, P = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const x = i => P + (i * (W - P * 2)) / (values.length - 1);
  const y = v => H - P - ((v - min) / range) * (H - P * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v).toFixed(1)}`).join(' ');
  const color = tone === 'crit' ? 'oklch(66% 0.2 25)'
    : tone === 'warn' ? 'oklch(80% 0.14 85)' : 'oklch(79% 0.16 158)';
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="${x(values.length - 1)}" cy="${y(values.at(-1)).toFixed(1)}" r="2.2" fill="${color}"/>
  </svg>`;
}

function renderChart(weeks, trend) {
  const W = 720, H = 300, L = 48, R = 48, T = 20, B = 40;
  const hasNow = typeof weeks.at(-1).week !== 'number';
  const baseEnd = weeks.length - 1 - (hasNow ? 1 : 0); // last simulated week's index
  const maxLat = Math.ceil((Math.max(...weeks.map(w => w.repairLatencyHrs)) * 1.15) / 4) * 4;
  const maxRatio = 6.5;
  const x = i => L + (i * (W - L - R)) / (weeks.length - 1);
  const yLat = v => H - B - (v / maxLat) * (H - T - B);
  const yRatio = v => H - B - (v / maxRatio) * (H - T - B);

  // ECG-paper grid: a vertical line per week + horizontal lines per latency tick
  const latTicks = [];
  for (let v = 0; v <= maxLat; v += 4) latTicks.push(v);
  const grid =
    weeks.map((_, i) =>
      `<line x1="${x(i)}" y1="${T}" x2="${x(i)}" y2="${H - B}" stroke="oklch(60% 0.03 200 / 0.1)"/>`).join('') +
    latTicks.map(v =>
      `<line x1="${L}" y1="${yLat(v)}" x2="${W - R}" y2="${yLat(v)}" stroke="oklch(60% 0.03 200 / 0.1)"/>`).join('');

  const yAxisLabels = latTicks.map(v =>
    `<text x="${L - 8}" y="${yLat(v) + 4}" text-anchor="end" font-size="10"
      fill="oklch(50% 0.012 255)" font-family="monospace">${v}</text>`).join('');
  const yAxisRight = [0, 2, 4, 6].map(v =>
    `<text x="${W - R + 8}" y="${yRatio(v) + 4}" text-anchor="start" font-size="10"
      fill="oklch(50% 0.012 255)" font-family="monospace">${v}:1</text>`).join('');

  // early-warning window: the trailing run of rising repair latency
  // (only over the simulated weeks — tonight's point sits outside it)
  const warnBand = trend.repairLatencyRising ? `
    <rect x="${x(baseEnd - trend.runLength)}" y="${T}"
      width="${x(baseEnd) - x(baseEnd - trend.runLength)}" height="${H - T - B}"
      fill="oklch(66% 0.2 25 / 0.07)"/>
    <line x1="${x(baseEnd - trend.runLength)}" y1="${T}"
      x2="${x(baseEnd - trend.runLength)}" y2="${H - B}"
      stroke="oklch(66% 0.2 25 / 0.4)" stroke-dasharray="3 4"/>
    <text x="${x(baseEnd - trend.runLength) + 6}" y="${T + 12}" font-size="10"
      fill="oklch(74% 0.17 25)" font-family="monospace">early-warning window</text>` : '';

  const barW = 22;
  const bars = weeks.map((w, i) => {
    const strained = w.warmthToCriticism < 5;
    return `<rect x="${x(i) - barW / 2}" y="${yRatio(w.warmthToCriticism)}"
      width="${barW}" height="${H - B - yRatio(w.warmthToCriticism)}" rx="3"
      fill="${strained ? 'oklch(80% 0.14 85 / 0.4)' : 'oklch(79% 0.16 158 / 0.32)'}"/>`;
  }).join('');

  const linePts = weeks.map((w, i) => `${i ? 'L' : 'M'}${x(i)},${yLat(w.repairLatencyHrs)}`).join(' ');
  const area = `${linePts} L${x(weeks.length - 1)},${H - B} L${x(0)},${H - B} Z`;
  const dots = weeks.map((w, i) => {
    const isNow = hasNow && i === weeks.length - 1;
    return `<circle cx="${x(i)}" cy="${yLat(w.repairLatencyHrs)}" r="${isNow ? 5 : 4}"
      fill="${isNow ? 'oklch(79% 0.16 158)' : 'oklch(66% 0.2 25)'}"
      stroke="oklch(13% 0.014 255)" stroke-width="1.5"/>`;
  }).join('');
  const weekLabels = weeks.map((w, i) => {
    const isNow = typeof w.week !== 'number';
    return `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" font-size="11"
      fill="${isNow ? 'oklch(79% 0.16 158)' : 'oklch(50% 0.012 255)'}"
      font-family="monospace">${isNow ? 'now' : `w${w.week}`}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Repair latency rising from 3.5 to 16 hours over 8 weeks while the warmth ratio falls below 5 to 1">
    ${grid}
    ${warnBand}
    <line x1="${L}" y1="${yRatio(5)}" x2="${W - R}" y2="${yRatio(5)}"
      stroke="oklch(79% 0.16 158 / 0.5)" stroke-dasharray="4 5"/>
    <text x="${W - R}" y="${yRatio(5) - 6}" text-anchor="end" font-size="10"
      fill="oklch(79% 0.16 158)" font-family="monospace">5:1 stability band</text>
    ${bars}
    <path d="${area}" fill="oklch(66% 0.2 25 / 0.06)"/>
    <path class="trace-draw" d="${linePts}" fill="none" stroke="oklch(66% 0.2 25)"
      stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${weekLabels}
    ${yAxisLabels}${yAxisRight}
    <text x="${L - 34}" y="${T + 8}" font-size="10" fill="oklch(50% 0.012 255)" font-family="monospace">hrs</text>
  </svg>`;
}
