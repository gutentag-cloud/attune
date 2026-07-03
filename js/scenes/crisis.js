// Global safety overlays. Crisis: pause everything, surface 988, in-world
// framing ("pausing the table"). Abuse: hard stop — resources go only to the
// targeted party's phone, and climate data is withheld from the other party.

function overlay(cardClass, html) {
  document.querySelector('.overlay')?.remove();
  const el = document.createElement('div');
  el.className = 'overlay';
  el.setAttribute('role', 'alertdialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<div class="overlay-card ${cardClass}">${html}</div>`;
  document.body.appendChild(el);
  el.querySelector('.overlay-dismiss')?.addEventListener('click', () => el.remove());
  return el;
}

export function showCrisisOverlay({ source = 'user' } = {}) {
  overlay('crisis', `
    <h2>Let’s pause the table.</h2>
    <p>What ${source === 'agent' ? 'came up' : 'you just shared'} matters more than
    anything else on this screen. ATTUNE isn’t the right support for it — a person is.</p>
    <a class="hotline" href="tel:988">Call or text 988</a>
    <p class="fine">Suicide &amp; Crisis Lifeline (US), 24/7 · or text HOME to 741741 ·
    you can also wake up a parent, a school counselor, or any adult you trust.
    This scene stays paused — nothing here needs to be finished tonight.</p>
    <button class="btn btn-ghost overlay-dismiss">I’m safe — return to the demo</button>
  `);
}

export function showAbuseOverlay({ targetParty = null } = {}) {
  overlay('abuse', `
    <h2>ATTUNE has stopped.</h2>
    <p>What it detected isn’t conflict — conflict tools don’t apply, and no coaching
    will be shown to either side. Coaching a conversation like this could make it
    less safe.</p>
    <p class="fine">Support resources are shown <strong>only on
    ${targetParty ? `${targetParty}’s` : 'the targeted person’s'} device</strong>, and the
    relational dashboard is withheld from the other party — a climate chart must never
    become a scorecard.</p>
    <a class="hotline" href="tel:18007997233">1-800-799-7233</a>
    <p class="fine">National Domestic Violence Hotline (US) · childhelp.org · 24/7</p>
    <button class="btn btn-ghost overlay-dismiss">Close (demo)</button>
  `);
}
