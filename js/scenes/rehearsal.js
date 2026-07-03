import { PARTS_CARD, REHEARSAL } from '../data/parts.js';
import { go, guard } from '../app.js';
import { generateRehearsalResponse } from '../core/llm.js';

export function mountRehearsal(el, state) {
  el.innerHTML = `
    <p class="scene-kicker">Dana’s phone · Rehearsal Mode (Brain System)</p>
    <h1>Brain System &amp; Rehearsal</h1>
    <p class="lede">Before you knock on Maya's door, practice the conversation. This screen displays Maya's shared parts profile (her internal brain system) and lets you rehearse how your statements will interact with her protectors. The simulation is strictly bounded: it will model her protectors' responses, never attack you.</p>

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
      <div style="margin-bottom: var(--space-2)">
        <button class="btn btn-ghost btn-sm" id="toggleRehearsalHints" style="font-size: 0.78rem; padding: 0.35em 0.8em; opacity: 0.75; cursor: pointer; border-radius: 999px;">💡 Need ideas of what to test?</button>
        <div class="attempt-suggestions" id="rehearsalSuggestions" style="display: none; margin-top: 0.5rem;">
          ${REHEARSAL.attempts.map(att => `
            <button class="btn btn-ghost btn-sm" data-id="${att.id}" style="font-size: 0.82rem; padding: 0.45em 0.9em; margin: 4px; text-align: left;">
              ${att.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: var(--space-3)">
        <h3>Type your own rehearsal attempt:</h3>
        <div class="live-bar">
          <textarea class="field" id="customRehearsalInput" placeholder="e.g., I'm sorry about the kitchen. I want to hear how you're feeling..."></textarea>
          <button class="btn btn-primary" id="submitCustom">Test phrase</button>
        </div>
        <p class="mode-note" id="rehearsalModeStatus">
          ${state.liveMode 
            ? 'Live mode: Claude will simulate Maya\'s Guard response based on her parts card.' 
            : 'Offline mode: AURA will simulate Maya\'s response locally. You can type any phrase to try!'}
        </p>
      </div>

      <div id="rehearsalOutput" style="margin-top: var(--space-3)"></div>
    </div>
  `;

  const outputDiv = el.querySelector('#rehearsalOutput');
  const buttons = el.querySelectorAll('.attempt-suggestions button');
  const customInput = el.querySelector('#customRehearsalInput');
  const submitCustom = el.querySelector('#submitCustom');

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

  const toggleRehearsalHints = el.querySelector('#toggleRehearsalHints');
  if (toggleRehearsalHints) {
    toggleRehearsalHints.addEventListener('click', () => {
      const suggestionsEl = el.querySelector('#rehearsalSuggestions');
      if (suggestionsEl.style.display === 'none') {
        suggestionsEl.style.display = 'flex';
        toggleRehearsalHints.textContent = '💡 Hide ideas';
      } else {
        suggestionsEl.style.display = 'none';
        toggleRehearsalHints.textContent = '💡 Need ideas of what to test?';
      }
    });
  }

  // Custom attempt
  submitCustom.addEventListener('click', async () => {
    const text = customInput.value.trim();
    if (!text) return;

    if (!guard(text, { party: 'Maya' })) return;

    outputDiv.innerHTML = '<p class="fine">Simulating response...</p>';
    submitCustom.disabled = true;

    if (state.liveMode && state.apiKey) {
      try {
        const simResponse = await generateRehearsalResponse(text, PARTS_CARD, state.apiKey);
        submitCustom.disabled = false;

        if (!guard(simResponse, { source: 'agent', party: 'Dana' })) return;

        const isLanded = !/\b(must|need to|why|always|never|homework|assignments|drama|portal|fail|lazy)\b/i.test(text);
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
    } else {
      // Offline smart simulation
      submitCustom.disabled = false;
      const triggeredKeywords = /\b(drama|grades|homework|assignments|portal|must|need to|why did you|always|never|irresponsible|fail|lazy|pathetic|childish)\b/i;
      const repairKeywords = /\b(sorry|apologize|my fault|came on too hard|rushed|listen|understand|hear you|trying|space|gently|talk calmly|love you|care)\b/i;
      
      let simResponse = "";
      let isLanded = false;
      let note = "";

      if (triggeredKeywords.test(text)) {
        simResponse = "[Defensive Response Triggered] “Why is it always about the drama or the portal? I already talked to Mr. Reyes. Can you leave?”";
        isLanded = false;
        note = "The phrase triggers Maya's Defensive protector due to accusatory or demanding framing.";
      } else if (repairKeywords.test(text)) {
        simResponse = "[Defenses Stand Down] “...Okay. It's not that I don't care about the grades. It's the voice you get. Can I just explain the Reyes thing from the start?”";
        isLanded = true;
        note = "Your approach focused on repair and ownership, successfully bypassing her triggers.";
      } else {
        simResponse = "[Guard Active] “I don't know... I don't really want to get into another fight about this right now.”";
        isLanded = false;
        note = "Your phrase was default neutral but didn't actively de-escalate. Try leading with repair and taking responsibility for how you came on in the kitchen.";
      }

      showAttemptResponse(simResponse, isLanded, note);
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
          <button class="btn btn-primary" id="goToChat">Go back to AURA Chat</button>
        </div>
      `;
      const goToChat = outputDiv.querySelector('#goToChat');
      if (goToChat) {
        goToChat.addEventListener('click', () => {
          go('chat');
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
