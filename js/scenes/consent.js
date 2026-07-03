import { go } from '../app.js';

export function mountConsent(el, state) {
  el.innerHTML = `
    <p class="scene-kicker">Before anything listens</p>
    <h1>Both of you, or neither of you.</h1>
    <p class="lede">The emotional climate of a home is one of the strongest known predictors
    of psychiatric relapse — and until now, measuring it took a 90-minute lab interview.
    ATTUNE measures it passively, on-device, and closes the loop: detect the rupture,
    pause the flood, regulate with AURA, repair the relationship. It is a shared instrument,
    not surveillance: it runs only while both people say yes, either can revoke with one tap,
    and audio is classified in the moment and discarded.</p>

    <div class="stat-strip">
      <div class="stat"><span class="n">~65% vs ~35%</span>
        <span class="d">relapse rate in high- vs low-hostility homes</span>
        <cite>Butzlaff &amp; Hooley, 1998</cite></div>
      <div class="stat"><span class="n">90 min → passive</span>
        <span class="d">the Camberwell interview, replaced by continuous on-device measurement</span>
        <cite>Expressed Emotion, since 1972</cite></div>
      <div class="stat"><span class="n">5 : 1</span>
        <span class="d">warmth-to-criticism ratio that separates stable from distressed dyads</span>
        <cite>Gottman</cite></div>
      <div class="stat"><span class="n">0 bytes</span>
        <span class="d">leave this device — check the network tab</span>
        <cite>privacy by architecture</cite></div>
    </div>

    <div class="consent-grid">
      <div class="consent-card" id="cardParent">
        <span class="role">Parent</span>
        <h3>Dana</h3>
        <p>I consent to ATTUNE listening during conversations I’m part of, classifying
        my turns, and showing me my own patterns.</p>
        <label class="switch"><input type="checkbox" id="ckParent"><span class="track"></span><span>I consent</span></label>
      </div>
      <div class="consent-card" id="cardTeen">
        <span class="role">Teen · 15</span>
        <h3>Maya</h3>
        <p>Same terms — and my parts table is mine alone. Nothing I explore there is
        ever visible to Mom unless I explicitly share it.</p>
        <label class="switch"><input type="checkbox" id="ckTeen"><span class="track"></span><span>I consent</span></label>
      </div>
    </div>

    <blockquote class="privacy-stance">
      <strong>The stance, stated plainly:</strong> Maya’s table is never visible to Dana. Ever.
      The only thing that crosses between their phones is what each of them explicitly
      approves and sends. A tool that lets a parent read a teen’s inner world isn’t care —
      it’s surveillance, and ATTUNE refuses to be that.
    </blockquote>

    <p style="margin-top: var(--space-3)">
      <button class="btn btn-primary" id="begin" disabled>Begin the evening · open LISTEN</button>
    </p>
  `;

  const ckParent = el.querySelector('#ckParent');
  const ckTeen = el.querySelector('#ckTeen');
  const begin = el.querySelector('#begin');

  function sync() {
    state.consent.parent = ckParent.checked;
    state.consent.teen = ckTeen.checked;
    el.querySelector('#cardParent').dataset.on = ckParent.checked;
    el.querySelector('#cardTeen').dataset.on = ckTeen.checked;
    begin.disabled = !(ckParent.checked && ckTeen.checked);
  }
  ckParent.addEventListener('change', sync);
  ckTeen.addEventListener('change', sync);
  begin.addEventListener('click', () => go('listen'));
}
