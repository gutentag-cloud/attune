# Clinical Positioning: From Wellness to Relapse Prevention

## The Reframe
The primary weakness of the TANDEM concept is positioning: judges and evaluators will file it under "relationship wellness" (the shallow end of mental health). 

The fix is a fact that the original pitch wasn't using: **the emotional climate of the home is one of the oldest, strongest, most under-exploited predictors of psychiatric relapse we have, and nobody has ever built an instrument for it.**

By reframing the "referee-plus-parts-table" into a **clinical measurement device**, we unlock two genuine innovation jumps:
1. **Continuous Passive Expressed Emotion (EE) Proxy:** Surfacing early-warning signs of psychiatric relapse before a crisis.
2. **Consented Perspective-Taking Rehearsal Mode:** A behavioral simulation that helps family members practice interactions against another person's protective system.

---

## ATTUNE: Upgraded Concept

### 1. Concept & Vision
* **Tagline:** The first clinical instrument for the space between people — measuring, repairing, and forecasting the relational climate that drives mental illness.
* **The Paradigm:** Psychiatry treats individuals; relapse happens in households. Since the 1970s, Expressed Emotion (EE) research has shown that a hostile, critical home environment roughly doubles relapse rates in schizophrenia and depression (~65% vs ~35%). Yet EE has never left research because measuring it requires the 90-minute Camberwell Family Interview with a trained human rater in a lab.
* **Relational Phenotyping:** ATTUNE is continuous, passive, on-device measurement of a household's emotional climate plus the intervention loop (break ➔ parts table ➔ repair). This applies to parent-teen dyads and families supporting a member with serious mental illness — populations where the stakes are relapse and suicide risk.

### 2. Innovation & Creativity
* **The Relational Vital Sign (ECG for the Home):** Computes a longitudinal dyadic signature (escalation velocity, repair latency, criticism-to-warmth ratio, stonewalling frequency). A degradation in this signature is a validated early-warning pattern for depressive or psychotic relapse.
* **Persistent Parts Maps:** The IFS table learns each person's computational model of their internal system over time. The parts map becomes a living clinical artifact for the user and therapist to inspect.
* **Rehearsal Mode:** A simulated, perspective-taking environment where a parent rehearses conversations against a simulation of the teen's protective system (built from a curated "parts card" shared by the teen).

### 3. Technical Feasibility & Architecture
* **On-Device Pipeline:** ASR + 2-speaker diarization + turn-level LLM classification emitting ephemeral rupture events.
* **Signature Engine:** Rolling aggregates over the rupture-event stream — client-side statistics with simulated data for demonstration.
* **Rehearsal Agent:** A persona-conditioned LLM instance, conditioned on the shared parts card.
* **Privacy Stance:** Audio never leaves the device; the teen's parts table is cryptographically private from the parent. Clinician sharing is opt-in, summary-level, and revocable.

### 4. Social Impact & Clinical Relevance
* **Grounding Stack:** Expressed Emotion literature (Vaughn & Leff; Butzlaff & Hooley 1998), digital phenotyping (Onnela & Torous), Gottman ratios, IFS/IFIO, polyvagal co-regulation, and Attachment-Based Family Therapy (ABFT) for adolescents.
* **Safety Guardrails:**
  * **Abuse/Coercion Classifier:** Hard stop, resources to the targeted party only, climate data withheld.
  * **Crisis Language:** Immediate scene pause, 988/local resources, age-appropriate escalation path.
  * **Supervisor Pass:** Relapse warning framed as "check in with your care team," never a diagnosis. Positioned as an adjunct to care.

### 5. Presentation & Team Blueprint
* **Killer Hook:** *"Since 1972 we've been able to predict psychiatric relapse from 90 minutes of family conversation — better than most biomarkers. We just never left the lab. The most powerful predictor in psychiatry has been sitting in your kitchen this whole time. ATTUNE is the instrument."*
* **Demo Arc (5 min):** Live scripted argument ➔ horsemen flags stream ➔ flood detected, break called ➔ teen's parts table erupts live ➔ signature dashboard showing 3-week repair latency climb ➔ parent's rehearsal mode ➔ close on the privacy slide.
* **Q&A Position:** Do not claim ATTUNE predicts relapse; claim it *surfaces a validated risk marker continuously for the first time*. This clinical positioning is bulletproof.
