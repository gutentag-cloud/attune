# ATTUNE MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully client-side, offline-first single-page demo of ATTUNE — the relational mental-health instrument (detect → break → parts table → bridge → signature → rehearsal) per `docs/specs/2026-07-03-attune-mvp-design.md`.

**Architecture:** Static vanilla HTML/CSS/JS (ES modules), scene-based SPA with a tiny hash router. Pure-logic core modules (`js/core/`) are unit-tested with Node's built-in `node --test`. UI scenes (`js/scenes/`) render into `#stage` and are verified via browser preview. All state in-memory; nothing leaves the page. Offline scripted agents by default; optional Claude key swaps in live LLM personas behind the same interface.

**Tech Stack:** Vanilla JS ES modules, SVG for charts, Web Speech API (live mode, optional), `node --test` for core logic. No dependencies, no build step.

---

## File Structure

```
attune/
├── index.html                  # shell: consent gate mount, #stage, scene nav
├── css/attune.css              # design tokens + all component styles
├── js/
│   ├── app.js                  # scene router, global state, safety interrupt wiring
│   ├── core/
│   │   ├── horsemen.js         # Four Horsemen turn classifier (pure)
│   │   ├── escalation.js       # flooding meter: EWMA escalation model (pure)
│   │   ├── safety.js           # crisis + abuse-marker classifiers (pure)
│   │   ├── signature.js        # weekly aggregates + repair-latency trend detect (pure)
│   │   └── llm.js              # optional Claude client; same interface as scripted agents
│   ├── data/
│   │   ├── script.js           # scripted parent–teen argument (turns + timing + speakers)
│   │   ├── parts.js            # part personas + offline table dialogue + rehearsal responses
│   │   └── weeks.js            # 8 weeks simulated signature data (labeled SIMULATED)
│   └── scenes/
│       ├── consent.js          # dual-consent gate
│       ├── listen.js           # referee view: ticker, flags, meter, break trigger, mic mode
│       ├── breakscene.js       # flooding interrupt + breathing beat
│       ├── table.js            # IFS parts table: orchestrator, avatars, supervisor filter
│       ├── bridge.js           # repair-message composer
│       ├── dashboard.js        # signature vital-sign SVG chart + early-warning callout
│       ├── rehearsal.js        # parent rehearsal vs teen's parts card
│       └── crisis.js           # global 988 overlay + abuse hard-stop overlay
├── test/
│   ├── horsemen.test.js
│   ├── escalation.test.js
│   ├── safety.test.js
│   └── signature.test.js
├── .claude/launch.json         # python3 -m http.server 4173
├── docs/specs/…                # (exists)
└── README.md
```

---

### Task 1: Scaffold + shell

**Files:** Create `index.html`, `css/attune.css` (tokens only for now), `js/app.js`, `README.md`, `.gitignore`, `.claude/launch.json`.

- [ ] **Step 1:** `index.html` — semantic shell: `<header>` with wordmark + scene nav (`Listen / Break / Table / Bridge / Signature / Rehearsal`), `<main id="stage">`, `<footer>` with the privacy line ("Everything on this page stays on this page"). Loads `js/app.js` as module.
- [ ] **Step 2:** `js/app.js` — hash router: `registerScene(name, {mount(el, state), unmount()})`, shared `state = { rupture: [], partsMap, bridgeDraft, consent: false }`. Default route → consent scene until `state.consent`.
- [ ] **Step 3:** `css/attune.css` — design tokens per web rules (`--color-*`, `--space-*`, `--duration-*`). Direction: **clinical instrument, dark observatory palette** — near-black surface, ECG-green/amber/red semantics for escalation, off-white type, one serif display face for the wordmark. Not a wellness app.
- [ ] **Step 4:** `.claude/launch.json`: `{"version":"0.0.1","configurations":[{"name":"attune","runtimeExecutable":"python3","runtimeArgs":["-m","http.server","4173"],"port":4173}]}`
- [ ] **Step 5:** Serve, verify shell renders, commit `feat: scaffold ATTUNE shell + router + tokens`.

### Task 2: Four Horsemen classifier (TDD)

**Files:** Create `test/horsemen.test.js`, `js/core/horsemen.js`.

- [ ] **Step 1: Failing tests** — API: `classifyTurn(text) → { horseman: 'criticism'|'contempt'|'defensiveness'|'stonewalling'|null, intensity: 0..1, cues: string[] }`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTurn } from '../js/core/horsemen.js';

test('criticism: global character attack', () => {
  const r = classifyTurn("You never think about anyone but yourself. What is wrong with you?");
  assert.equal(r.horseman, 'criticism');
  assert.ok(r.intensity > 0.5);
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
test('intensifiers raise intensity', () => {
  const soft = classifyTurn("you never help");
  const hard = classifyTurn("YOU NEVER help, ever!!");
  assert.ok(hard.intensity > soft.intensity);
});
```

- [ ] **Step 2:** Run `node --test test/horsemen.test.js` → FAIL (module missing).
- [ ] **Step 3: Implement** — rule table per horseman: regex cue lists with weights. Criticism: `/you (always|never)/i`, `/what('| i)s wrong with you/i`, `/you('| a)re so (lazy|selfish|useless|impossible)/i`, `/why can('|no)t you ever/i`. Contempt: `/pathetic|ridiculous|disgusting|loser|genius(?=[.!,]|$)/i` (sarcastic vocative), `/oh (great|nice|sure|brilliant)/i`, `/whatever you say/i`, `/i can('|no)t believe i have to/i`. Defensiveness: `/not my fault/i`, `/you('| a)re the one who/i`, `/why are you blaming me/i`, `/i didn('|no)t do anything/i`, `/stop attacking me/i`. Stonewalling: `/^whatever\b/i`, `/i('| a)m done/i`, `/leave me alone/i`, `/i don('|no)t care/i`, `/^fine[.!]*$/i`, `/(not|stop) talking/i`. Score = sum(weights) capped 1; intensifiers: ALL-CAPS words ×1.25, `!!+` ×1.15, swear list ×1.3. Winner = max horseman score if ≥0.25 else null. Return matched cue strings for UI flags.
- [ ] **Step 4:** Tests pass. **Step 5:** Commit `feat: four horsemen turn classifier`.

### Task 3: Escalation / flooding model (TDD)

**Files:** Create `test/escalation.test.js`, `js/core/escalation.js`.

- [ ] **Step 1: Failing tests** — API: `createMeter({threshold=0.72, alpha=0.35}) → { push(turnResult, {interruption}) → level, level, flooded }`. EWMA of intensity; interruption adds +0.12; null-horseman turns decay toward 0; `flooded` latches true once level ≥ threshold.

```js
test('meter rises with consecutive hostile turns and floods', () => {
  const m = createMeter();
  for (const t of hostileRun) m.push(t, {});      // 6 turns intensity .6–.9
  assert.ok(m.flooded);
});
test('neutral turns decay the meter', () => { /* push 2 hostile then 4 neutral, level falls */ });
test('interruptions accelerate flooding', () => { /* same turns w/ interruption floods earlier */ });
```

- [ ] **Steps 2–4:** RED → implement (`level = alpha*signal + (1-alpha)*level`; signal = intensity or 0) → GREEN.
- [ ] **Step 5:** Commit `feat: EWMA flooding meter`.

### Task 4: Safety classifiers (TDD)

**Files:** Create `test/safety.test.js`, `js/core/safety.js`.

- [ ] **Step 1: Failing tests** — API: `screen(text) → { crisis: bool, abuse: bool, cues: [] }`. Crisis cues: `/kill (myself|me)/i, /want to die/i, /end it all/i, /hurt(ing)? myself/i, /no reason to live/i, /better off without me/i, /cutting( myself)?/i, /suicid/i`. Abuse cues: `/you('|wi)ll regret/i, /i('|wi)ll make you/i, /no one will believe you/i, /if you (tell|leave)/i, /(hit|slap|beat) you/i`. Tests: each class detected; hostile-but-safe turn ("you never listen") → both false; agent-output screening uses same function.
- [ ] **Steps 2–5:** RED → implement → GREEN → commit `feat: crisis + abuse hard-stop classifiers`.

### Task 5: Signature engine (TDD)

**Files:** Create `test/signature.test.js`, `js/core/signature.js`.

- [ ] **Step 1: Failing tests** — API: `computeTrend(weeks) → { repairLatencyRising: bool, runLength: int }` (rising = 3+ consecutive weekly increases in `repairLatencyHrs`); `ratioStatus(week) → 'ok'|'strained'|'critical'` from criticism:warmth vs Gottman 5:1 (warmth:criticism ≥5 ok, ≥2 strained, else critical).
- [ ] **Steps 2–5:** RED → implement → GREEN → commit `feat: signature trend + ratio engine`.

### Task 6: Demo data

**Files:** Create `js/data/script.js`, `js/data/parts.js`, `js/data/weeks.js`.

- [ ] **Step 1:** `script.js` — 14-turn parent–teen argument about grades/phone, realistic and uncomfortable, each turn `{speaker:'parent'|'teen', text, delayMs, interruption?}`. Escalates: criticism (parent) → defensiveness (teen) → contempt (parent) → stonewalling (teen); classifier output on these exact lines must produce that sequence (add a `node --test` fixture test `test/script.test.js` asserting the expected horsemen sequence — the demo script doubles as an end-to-end classifier fixture).
- [ ] **Step 2:** `parts.js` — teen's three parts with persona cards: **The Guard** (manager/defensive protector; trigger: "grades", burden: "if I admit fault I'm worthless"), **The Kid Who's Never Enough** (exile; burden: shame), **The Slammed Door** (firefighter; behavior: shutdown). Offline table dialogue: 3-round negotiation keyed to rupture events, each line tagged with `partId` + `activation` 0–1. Rehearsal responses: attempt-1 (guard fires — protective, not attacking), coaching hint, attempt-2 (lands). Teen's shared `partsCard` (2 curated entries).
- [ ] **Step 3:** `weeks.js` — 8 weeks `{week, escalationVelocity, repairLatencyHrs, warmthToCriticism, stonewallCount}`; weeks 6–8 show repair-latency climb so `computeTrend` fires. Constant `SIMULATED = true` used by dashboard label.
- [ ] **Step 4:** Commit `feat: demo script, part personas, simulated signature weeks`.

### Task 7: Scenes — consent, listen, break

**Files:** Create `js/scenes/consent.js`, `js/scenes/listen.js`, `js/scenes/breakscene.js`; extend `css/attune.css`.

- [ ] **Step 1:** `consent.js` — two consent toggles (Maya 15 / Dana parent), teen-privacy stance line ("Maya's table is never visible to Dana. Ever."), revocable note; both toggled → unlock nav, route to listen.
- [ ] **Step 2:** `listen.js` — split "two phones" framing; transcript ticker replays `script.js` with real timing; each turn → `classifyTurn` → flag chip (horseman + cue) animates in; escalation meter (vertical ECG-style bar) driven by `createMeter`; `flooded` → auto-route to break. **Live mode toggle:** textarea+mic (Web Speech API if available) feeding the same pipeline — proves classifier runs on unseen input.
- [ ] **Step 3:** `breakscene.js` — full-bleed interrupt: "You're flooded." / "Heart rate over 100 means nothing lands. 20 minutes. Separately." Slow breathing pulse (CSS transform animation, compositor-only), two buttons: "Maya: open your table" → table scene, "Dana: rehearse the check-in" → rehearsal.
- [ ] **Step 4:** Preview-verify full flow consent→listen→flood→break; commit `feat: consent gate, referee view, flooding break`.

### Task 8: Scene — parts table

**Files:** Create `js/scenes/table.js`; extend css.

- [ ] **Step 1:** Round-table layout: 3 part avatars (SVG sigils, not emoji) around a center "Self" seat; opening line seeded from real rupture events ("At 0:42 you went defensive right after 'grades' — which part was that?").
- [ ] **Step 2:** Orchestrator: steps through `parts.js` dialogue rounds on user click/keypress ("continue as Self"); speaking part scales up + leans in (transform), others dim; every line passes `safety.screen()` before render (crisis in agent output → crisis overlay — demonstrable via a hidden test hook).
- [ ] **Step 3:** Session end → "name what The Guard was protecting" → produces `partsMap` update + unlocks bridge scene. Commit `feat: IFS parts table with supervisor-screened offline agents`.

### Task 9: Scenes — bridge, dashboard, rehearsal

**Files:** Create `js/scenes/bridge.js`, `js/scenes/dashboard.js`, `js/scenes/rehearsal.js`.

- [ ] **Step 1:** `bridge.js` — repair composer pre-filled from table outcome ("A part of me slams shut when grades come up. That part isn't about you…"), editable textarea, explicit **Approve & send** (nothing auto-sends); sent message renders on the parent phone.
- [ ] **Step 2:** `dashboard.js` — SVG vital-sign chart, 8 weeks, two series (repair latency line, warmth:criticism bars vs 5:1 guide line); prominent `SIMULATED DATA — 8 weeks, demo household` label; `computeTrend` fires → amber early-warning callout: "Repair latency rising 3 weeks. Consider a check-in with your care team." Never diagnostic language.
- [ ] **Step 3:** `rehearsal.js` — parent side: shows teen's shared parts card (2 entries, "shared by Maya — revocable"); attempt 1 typed/chosen → simulated Guard response fires; coaching hint (from IFIO framing: "speak to the kid, not the guard"); attempt 2 → lands. Bounded-simulation notice.
- [ ] **Step 4:** Preview-verify; commit `feat: bridge composer, signature dashboard, rehearsal mode`.

### Task 10: Global safety overlay + wiring

**Files:** Create `js/scenes/crisis.js`; modify `js/app.js`, `js/scenes/listen.js`, `js/scenes/table.js`, `js/scenes/rehearsal.js`.

- [ ] **Step 1:** `crisis.js` — full-screen overlay: crisis variant (988 Suicide & Crisis Lifeline, text HOME to 741741, "pausing the table" framing, age-appropriate copy) and abuse variant (hard stop, resources shown only on the targeted party's phone, climate data withheld note).
- [ ] **Step 2:** `app.js` exposes `guard(text, source)` — every user input and agent line routes through it; match → overlay, scene paused. Wire into listen live-mode, table, rehearsal, bridge.
- [ ] **Step 3:** Type a crisis phrase in live mode → overlay same turn (verify in preview). Commit `feat: global crisis/abuse interrupt`.

### Task 11: Optional Claude live-agent mode

**Files:** Create `js/core/llm.js`; modify `js/scenes/table.js`, `js/scenes/rehearsal.js`, `index.html` (settings drawer).

- [ ] **Step 1:** Settings drawer: API-key field (memory only, never persisted — state var, not localStorage), model `claude-sonnet-5`. `llm.js`: `createLiveAgent(persona) → { speak(context) }` calling the Messages API (`anthropic-dangerous-direct-browser-access` header) with persona system prompt; same interface as scripted agents; every response still passes `safety.screen()`.
- [ ] **Step 2:** Table + rehearsal check `state.liveMode` and swap agent source. Offline remains default; failures fall back to scripted with a visible notice. Commit `feat: optional live Claude part-agents behind same interface`.

### Task 12: Polish + verification pass

- [ ] **Step 1:** Run all `node --test test/` → green.
- [ ] **Step 2:** Full demo arc in preview: consent → listen (scripted) → flood → break → table → bridge → dashboard → rehearsal; screenshot each scene; check console for errors; check network tab empty in offline mode.
- [ ] **Step 3:** Responsive check 768/1280; reduced-motion media query on all animations.
- [ ] **Step 4:** README: what it is, demo arc, how to run (`python3 -m http.server`), safety + privacy stance, clinical citations. Final commit `docs: README + demo guide`.

---

## Self-review

- **Spec coverage:** consent gate (T7), LISTEN both modes (T7), BREAK (T7), TABLE + supervisor (T8), BRIDGE (T9), SIGNATURE + early warning (T9, T5), REHEARSAL bounded (T9), global safety (T4, T10), dual-mode agents (T11), data model (T6), success criteria (T12). Non-goals respected: no prosody, no diarization, no backend.
- **Placeholder scan:** classifier cue tables, thresholds, personas, and copy lines are specified concretely; scene tasks carry acceptance behavior. OK.
- **Type consistency:** `classifyTurn` result feeds `meter.push` and flag chips; `screen()` shared by all inputs/outputs; `computeTrend(weeks)` matches `weeks.js` shape. OK.
