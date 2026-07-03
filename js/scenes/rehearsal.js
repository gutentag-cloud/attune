import { PARTS_CARD, REHEARSAL } from '../data/parts.js';
import { go, guard } from '../app.js';
import { generateRehearsalResponse } from '../core/llm.js';

export function mountRehearsal(el, state) {
  el.innerHTML = `
    <p class="scene-kicker">Scene 6 · Dana’s phone · Rehearsal Mode</p>
    <h1>Rehearsal Mode</h1>
    <p class="lede">Before you knock on Maya's door, practice the conversation. ATTUNE builds a consented simulation based on Maya's shared parts card. The simulation is strictly bounded: it will model her protectors' responses, never attack you.</p>

    <div class="parts-card-view">
      <h3>Maya's Trigger &amp; De-escalation Profile</h3>
      <p class="fine" style="margin-bottom: var(--space-2)">${state.tableDone
        ? 'Shared by Maya after tonight’s AURA reset — revocable at any time.'
        : 'Shared by Maya — revocable at any time.'}</p>
      <div class="metric-row" style="margin: 0">
        ${PARTS_CARD.entries.map(entry => `
          <div class="metric">
            <div class="k">${entry.part}</div>
            <div class="fine" style="margin-top: 0.5em; color: var(--ink-dim)">${entry.note}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="bridge-panel">
      <h3>Select a check-in approach to test:</h3>
      <div class="attempt-options">
        ${REHEARSAL.attempts.map(att => `
          <button class="btn btn-ghost" data-id="${att.id}" style="text-align: left; display: block; width: 100%;">
            ${att.label}
          </button>
        `).join('')}
      </div>

      <div style="margin-top: var(--space-3)">
        <h3>Or type your own rehearsal attempt:</h3>
        <div class="live-bar">
          <textarea class="field" id="customRehearsalInput" placeholder="e.g., I'm sorry about the kitchen. I want to hear how you're feeling..."></textarea>
          <button class="btn btn-ghost" id="submitCustom">Test custom phrase</button>
        </div>
        <p class="mode-note" id="rehearsalModeStatus">
          ${state.liveMode 
            ? 'Live mode: Claude will simulate Maya\'s Guard response based on her parts card.' 
            : 'Offline mode: Enter an Anthropic API key in the settings (⚙︎) to try custom phrases.'}
        </p>
      </div>

      <div id="rehearsalOutput" style="margin-top: var(--space-3)"></div>
    </div>
  `;

  const outputDiv = el.querySelector('#rehearsalOutput');
  const buttons = el.querySelectorAll('.attempt-options button');
  const customInput = el.querySelector('#customRehearsalInput');
  const submitCustom = el.querySelector('#submitCustom');

  if (!state.liveMode) {
    customInput.disabled = true;
    submitCustom.disabled = true;
  }

  // Scripted attempts
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const attId = btn.dataset.id;
      const attempt = REHEARSAL.attempts.find(a => a.id === attId);
      if (!attempt) return;

      if (!guard(attempt.label, { party: 'Maya' })) return;

      showAttemptResponse(attempt.simResponse, attempt.lands, attempt.note);
    });
  });

  // Custom attempt in live mode
  submitCustom.addEventListener('click', async () => {
    const text = customInput.value.trim();
    if (!text) return;

    if (!guard(text, { party: 'Maya' })) return;

    outputDiv.innerHTML = '<p class="fine">Simulating response...</p>';
    submitCustom.disabled = true;

    try {
      const simResponse = await generateRehearsalResponse(text, PARTS_CARD, state.apiKey);
      submitCustom.disabled = false;

      // Pass simulated agent response through safety guard
      if (!guard(simResponse, { source: 'agent', party: 'Dana' })) return;

      // Determine if it landed based on general heuristics or LLM decision
      // For simple feedback: if the input doesn't trigger accusatory tones, we say it has potential.
      const isLanded = !/\b(must|need to|why|always|never|homework|assignments|drama)\b/i.test(text);
      const note = isLanded 
        ? "Your approach focused on repair and did not trigger her guard." 
        : "The input contains topics or phrasing (like grades, assignments, or accusatory words) that might activate The Guard.";

      showAttemptResponse(simResponse, isLanded, note);
    } catch (err) {
      submitCustom.disabled = false;
      outputDiv.innerHTML = `
        <div class="sim-response">
          <span class="who" style="font-family:var(--font-data);font-size:0.7rem;letter-spacing:0.14em;color:var(--vital-crit)">API ERROR</span>
          <p style="margin:0.4em 0 0">Failed to connect to Claude. Make sure your API key is correct.</p>
        </div>`;
    }
  });

  function showAttemptResponse(simResponse, lands, note) {
    if (lands) {
      state.rehearsed = true;
      outputDiv.innerHTML = `
        <div class="sim-response landed">
          <span class="who" style="font-family:var(--font-data);font-size:0.7rem;letter-spacing:0.14em;color:var(--vital-ok)">SIMULATION LANDED</span>
          <p style="margin:0.4em 0 0"><strong>${simResponse}</strong></p>
        </div>
        <p class="coach-hint" style="color: var(--vital-ok); margin-top: var(--space-1)">
          Success: Your repair opened the door instead of activating her defenses.
        </p>
        <div style="margin-top: var(--space-2)">
          <button class="btn btn-primary" id="goToBridge">Review Sent Message</button>
        </div>
      `;
      const goToBridge = outputDiv.querySelector('#goToBridge');
      if (goToBridge) {
        goToBridge.addEventListener('click', () => {
          go('bridge');
        });
      }
    } else {
      outputDiv.innerHTML = `
        <div class="sim-response">
          <span class="who" style="font-family:var(--font-data);font-size:0.7rem;letter-spacing:0.14em;color:var(--vital-warn)">SIMULATION BLOCKED</span>
          <p style="margin:0.4em 0 0"><strong>${simResponse}</strong></p>
        </div>
        <p class="coach-hint" style="margin-top: var(--space-1)">
          <strong>Feedback:</strong> ${REHEARSAL.coachHint}
        </p>
        <p class="fine" style="margin-top: 0.5em;">
          <em>Note: ${note}</em>
        </p>
      `;
    }
  }
}
