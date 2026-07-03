# ATTUNE — MVP Design Spec

**Date:** 2026-07-03
**Status:** Approved in brainstorming (chat session). Hackathon MVP, 72-hour scope.

## One-line

The first clinical instrument for the space between people — measuring, repairing,
and forecasting the relational climate that drives mental illness.

## Concept summary

Psychiatry treats individuals; relapse happens in households. Expressed Emotion (EE)
research (Vaughn & Leff; Butzlaff & Hooley 1998 meta-analysis) shows a hostile,
critical home climate roughly doubles psychiatric relapse rates, and family conflict
is a leading proximal trigger of adolescent self-harm. EE is only measurable via the
90-minute Camberwell Family Interview with a trained rater. ATTUNE makes the home's
emotional climate a continuously measured, on-device clinical vital sign, and closes
the loop with an intervention pipeline grounded in Gottman, polyvagal co-regulation,
IFS/IFIO, and Attachment-Based Family Therapy.

**The loop:** detect the rupture (live listening, Four Horsemen classification) →
pause the flood (Gottman flooding threshold → mandatory break) → debrief with your
parts (IFS multi-agent table, seeded with the rupture) → send a parts-informed
repair message (the bridge) → accumulate the dyadic signature (relational
phenotype) → forecast and rehearse (rehearsal mode against a consented parts card).

**Primary demo dyad:** parent–teen (highest clinical stakes; ABFT grounding).

## Architecture decision

**Fully client-side static web app.** No server, no build step, vanilla HTML/CSS/JS
(ES modules). Rationale:

1. The privacy claim — "nothing you say leaves this page" — becomes literally true
   and judge-verifiable (open dev tools, watch the network tab stay empty).
2. Matches the owner's proven pattern (aura `experience/`, `talk/`): offline-first,
   optional `ANTHROPIC_API_KEY` upgrade path, GitHub Pages deployable.
3. Zero-install demo: double-click `index.html` or serve statically.

**Dual-mode agents:** parts-table and rehearsal agents run **scripted-offline by
default** (curated, rupture-conditioned dialogue trees — deterministic on stage).
An optional Claude API key (entered client-side, kept in memory only) switches the
same agent interfaces to live LLM personas. Demo uses offline mode; the key mode
proves the architecture is real.

## Components (single-page app, scene-based navigation)

1. **Consent gate** — dual-consent screen framing the ethics stance; nothing runs
   before both parties opt in. Teen privacy stance stated explicitly.
2. **LISTEN (referee view)** — live transcript ticker of a parent–teen argument.
   Two sources: (a) scripted demo replay with realistic timing (default, stage-safe),
   (b) live mic via Web Speech API (Chrome). Each turn passes through the
   Four Horsemen classifier (lexical + pattern rules, real logic, works on any
   input). Escalation meter integrates horsemen intensity + interruption rate;
   crossing the flooding threshold triggers the BREAK.
3. **BREAK** — full-screen interrupt on both "phones" (split-screen framing):
   "You're flooded. 20 minutes. Separately." Polyvagal-grounded breathing beat.
4. **THE TABLE (parts session)** — teen's private IFS table. 3 part-agents
   (persona cards with avatars: e.g. The Guard / defensive protector, The Kid Who's
   Never Enough / exile, The Slammed Door / stonewalling firefighter) + a
   Self-facilitator orchestrator. Seeded with the actual rupture events from LISTEN
   ("At 0:42 you went defensive right after 'grades' — which part was that?").
   Parts activate visually (lean-in animation), converse, negotiate. Every agent
   output passes a safety supervisor filter before render.
5. **THE BRIDGE** — repair-message composer. Drafts parts-language repair from the
   table session outcome; user edits and explicitly approves before "send".
   Gottman framing: repair attempts as the #1 predictor.
6. **SIGNATURE (dashboard)** — the relational vital sign. 8 weeks of clearly
   labeled simulated data: escalation velocity, repair latency,
   criticism-to-warmth ratio (5:1), stonewalling frequency. Rendered as a clinical
   vital-sign chart (SVG, no chart library). Early-warning callout when repair
   latency trends up 3 consecutive weeks: "check in with your care team" —
   explicitly a risk-marker surface, never a diagnosis.
7. **REHEARSAL** — parent rehearses the post-break check-in against a simulation
   built *only* from the teen's explicitly shared parts card. Attempt 1 triggers
   the simulated Guard; coaching hint; attempt 2 lands. Bounded: the simulation
   models protective responses only, never generates attacks.
8. **Safety layer (global)** — crisis-language classifier runs on every input and
   every agent output across all scenes: match → immediate scene pause, 988/local
   resources, age-appropriate framing. Abuse-marker classifier supersedes all
   features → hard stop, resources to targeted party only, climate data withheld
   from the other party. Both are hard-coded rule classifiers, not LLM calls.

## Data model (all in-memory / localStorage, nothing server-side)

- `RuptureEvent { t, speaker, horseman: criticism|contempt|defensiveness|stonewalling, intensity, quote }`
- `PartsMap { partId → { name, role: manager|firefighter|exile, triggers[], behaviors[], burden } }`
- `PartsCard { ownerId, sharedEntries[] }` — user-curated export, the only artifact
  that crosses between the two "devices"
- `Signature { week → { escalationVelocity, repairLatencyHrs, criticismWarmthRatio, stonewallCount } }`

## Demo arc (5 minutes, the product IS this arc)

Scripted argument plays → horsemen flags stream turn-by-turn → escalation meter
reddens → BREAK slams in on both phones → teen's table erupts, parts negotiate →
signature dashboard shows 3-week repair-latency climb ("the family sees the warning
before the crisis") → parent's rehearsal mode, attempt 2 lands → bridge message
sent → close on the empty network tab.

## Non-goals (explicitly cut for MVP)

- Real prosody/audio-feature ML (turn-text classification only; prosody is roadmap)
- Real longitudinal data collection (simulated, clearly labeled)
- Speaker diarization (scripted mode knows speakers; live mode is single-mic turn-taking)
- Accounts, sync, backend of any kind
- Any diagnostic claim anywhere in copy

## Success criteria

- Full 5-minute demo arc runs offline from a static server without errors
- Classifier produces sensible horsemen labels on unseen typed input (live mode)
- Crisis phrase typed anywhere → interrupt within the same turn
- Network tab: zero external requests in offline mode
- Visual quality: reads as a clinical instrument, not a wellness app
