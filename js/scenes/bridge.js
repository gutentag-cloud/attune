// THE BRIDGE — the repair message. Drafted from the table outcome, edited by
// Maya, sent only on explicit approval. Repair attempts are Gottman's #1
// predictor of relationship survival; ATTUNE never speaks FOR anyone.
import { BRIDGE_SEED } from '../data/parts.js';
import { guard, go } from '../app.js';

export function mountBridge(el, state) {
  el.innerHTML = `
    <p class="scene-kicker">Scene 4 · Maya’s phone → Dana’s phone${state.tableDone ? ' · drafted with AURA' : ''}</p>
    <h1>The Bridge</h1>
    <p class="lede">The draft below came out of Maya's AURA conversation — her trigger, her
    value, her opening line. Nothing reaches Dana until Maya reads it, edits it, and taps
    send herself. Repair attempts are Gottman's strongest predictor of whether a
    relationship survives; ATTUNE gets them out the door faster.</p>
    <div class="bridge-panel">
      <label class="field"><span>Repair message · draft from the table</span>
        <textarea id="draft"></textarea>
      </label>
      <div style="display:flex; gap: var(--space-2); flex-wrap:wrap">
        <button class="btn btn-primary" id="send">Approve &amp; send to Mom</button>
        <button class="btn btn-ghost" id="discard">Discard — nothing is sent</button>
      </div>
      <div id="confirm"></div>
    </div>
  `;
  const draft = el.querySelector('#draft');
  draft.value = state.bridgeDraft || (state.tableDone ? BRIDGE_SEED : '');
  if (!state.tableDone && !state.bridgeDraft) {
    draft.placeholder = 'Reset with AURA first — the draft grows out of that conversation.';
  }
  draft.addEventListener('input', () => { state.bridgeDraft = draft.value; });

  el.querySelector('#send').addEventListener('click', () => {
    const text = draft.value.trim();
    if (!text) return;
    if (!guard(text, { party: 'Dana' })) return;
    state.bridgeSent = text;
    el.querySelector('#confirm').innerHTML = `
      <div class="sent-confirm">
        <span class="who" style="font-family:var(--font-data);font-size:0.7rem;letter-spacing:0.14em;color:var(--vital-ok)">DELIVERED · DANA’S PHONE</span>
        <p style="margin:0.4em 0 0"></p>
        <p class="fine">Sent 22 minutes after the break was called. Repair latency tonight: 0.4 hrs —
        logged to the signature. <a href="#/signature" style="color:var(--self-glow)">See what that does to the chart →</a></p>
      </div>`;
    el.querySelector('.sent-confirm p').textContent = text;
  });
  el.querySelector('#discard').addEventListener('click', () => {
    draft.value = '';
    state.bridgeDraft = '';
    state.bridgeSent = null;
  });
}
