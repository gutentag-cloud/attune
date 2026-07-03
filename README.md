# ATTUNE × AURA

> **Relational Phenotyping:** The first clinical instrument for the space between people — measuring, repairing, and forecasting the relational climate that drives mental illness. ATTUNE detects the rupture and calls the break; [AURA](https://github.com/TuffHell/aura) brings the nervous system back down (0.1 Hz breath co-regulation, deep-pressure embrace, ACT coaching) so the repair can land.

---

## 1. Concept & Vision

### The Unaddressed Paradigm
Psychiatry treats individuals, but relapse happens in households. Since the 1970s, **Expressed Emotion (EE)** research has repeatedly demonstrated that a hostile, critical home environment roughly doubles relapse rates in schizophrenia and depression (Butzlaff & Hooley's meta-analysis: ~65% vs ~35%). Family conflict is also one of the most common proximal triggers of adolescent self-harm and suicide risk.

Yet, EE is currently measured exactly one way: the **Camberwell Family Interview** — a 90-minute interview requiring a trained human rater in a laboratory setting. Because of this high friction, it has never left research. 

Meanwhile, "digital phenotyping" tracks individuals via smartphone logs and wearable data but remains blind to the space *between* people.

**ATTUNE** introduces **Relational Phenotyping**: continuous, passive, on-device measurement of a household's emotional climate, paired with an intervention loop (rupture detection → break → AURA co-regulation → repair). It is built for couples, parent-teen dyads, and families supporting a member with serious mental illness — environments where the stakes are psychiatric relapse and suicide risk, not "date-night quality."

Mental health crises in families rarely start as diagnoses — they start as unresolved conflict. ATTUNE treats conflict resolution itself as the clinical intervention: measure the conflict, interrupt the flood, regulate the body, repair the relationship, and watch the household's risk curve respond.

---

## 2. The Innovation Jumps

ATTUNE implements three novel, integrated layers:

1. **The Relational Vital Sign**
   From turn-level rupture events, ATTUNE computes a longitudinal dyadic signature: escalation velocity, repair latency, criticism-to-warmth ratio (Gottman's 5:1), and stonewalling frequency. Framed as a continuous, passive EE proxy, the dashboard displays the relationship's chart — an "ECG for the home." When the signature degrades (e.g., repair attempts vanish and withdrawal climbs), ATTUNE surfaces a validated early-warning pattern for depressive or psychotic relapse weeks before a crisis, alerting the family and (opt-in) their clinician. 
   *Individual apps detect the fire; ATTUNE smells the smoke in the walls.*

2. **Persistent Parts Maps**
   Unlike standard conversational utilities, the Internal Family Systems (IFS) table does not reset each session. Over time, ATTUNE learns each person's computational model of their internal system, tracing which triggers activate which protectors in what sequence (e.g., `"money ➔ your Provider-Under-Siege ➔ contempt, 90 seconds, every time"`). Your parts map becomes a living clinical artifact that you and your therapist can inspect and work with.

3. **Rehearsal Mode (The Demo-Stopper)**
   Before initiating a difficult conversation, users can rehearse it against a consented simulation of the other person's protective system. This simulation is built exclusively from a "parts card" the other user curated and shared (e.g., `"when criticized, a part of me shuts down"`). You practice telling your mom you are struggling, watch her simulated Panic-Manager fire, and find the phrasing that reaches her core Self instead of her protectors. Grounded in behavioral rehearsal and Gestalt empty-chair work, this is the first consented perspective-taking simulation tool.

---

## 3. Technical Architecture

ATTUNE is designed as a **fully client-side static web application** (vanilla HTML/CSS/JS ES modules) to enforce absolute privacy.
* **On-Device Analysis:** Turn-level LLM classification emitting ephemeral rupture events occurs entirely locally.
* **Vector Memories:** Client-side, per-part vector memories.
* **Signature Engine:** Rolling aggregates over the rupture-event stream use client-side statistics (no ML risk, fully testable on simulated data).
* **Parts Map:** A graph (triggers ➔ parts ➔ behaviors) accumulated from table sessions, stored client-side, and rendered as an interactive visualization.
* **Rehearsal Agent:** A persona-conditioned LLM instance, conditioned solely on the shared parts card.
* **Privacy by Design:** Audio never leaves the device; only event labels and locally-held signatures persist. The teen's parts table is cryptographically private from the parent. Clinician sharing is opt-in, summary-level, and revocable.

---

## 4. Social Impact & Clinical Relevance

ATTUNE is grounded in five established therapeutic and clinical theories:
* **Expressed Emotion (EE) Literature:** Vaughn & Leff; Butzlaff & Hooley (1998) meta-analysis.
* **Digital Phenotyping:** Onnela & Torous (Harvard).
* **Gottman Ratios & Flooding:** The 5:1 stability band and physiological flooding thresholds.
* **IFS/IFIO:** Internal Family Systems and Intimacy from the Inside Out.
* **Attachment-Based Family Therapy (ABFT):** Guy Diamond's evidence-based treatment for suicidal adolescents, which relies on repairing parent-teen relational ruptures.

### Safety Guardrails
* **Abuse/Coercion Classifier:** Supersedes all features. If triggered, it initiates a hard stop, redirects resources to the targeted party only, and blocks climate data from the other party (ensuring the signature dashboard never becomes an abuser's scorecard).
* **Crisis Language:** Any crisis language (live audio or parts table) triggers an immediate scene pause and displays 988/local resources.
* **Supervisor Pass:** Every agent output passes through a safety supervisor filter before rendering.
* **Adjunct to Care:** Explicitly positioned as an adjunct to professional treatment, not a replacement (providing a clear regulatory path).

---

## 5. Live vs. Offline Modes

ATTUNE operates in two modes:
1. **Offline Mode (Default):** Scripted demo paths using structured conversation trees. Fully functional without an internet connection.
2. **Live Mode:** By pasting an Anthropic API key in the settings drawer (⚙︎), the parts table and rehearsal agents are initialized as live Claude instances using direct browser requests. The key is held in memory and never persisted.

---

## 6. How to Run

Since the application is static, you can serve it using any simple local server:

```bash
# Using Python 3 (use `python3` on macOS/Linux)
python -m http.server 4173
```

Then open `http://localhost:4173` in your browser. Everything runs offline by default — open the network tab and watch it stay empty.
