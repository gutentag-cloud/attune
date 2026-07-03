// BREAK — the flooding interrupt. Gottman: past ~100 bpm nothing lands;
// the evidence-based move is a 20+ minute physiological break, separately.
import { go } from '../app.js';

export function mountBreak(el, state) {
  const floodTurn = state.rupture.at(-1);
  el.innerHTML = `
    <div class="break-scene">
      <p class="scene-kicker">Scene 2 · Both phones, simultaneously</p>
      <h1>Let's pause.</h1>
      <p class="lede" style="margin-inline:auto">None of what you guys are saying is going to work right now.
      The conversation has crossed into emotional flooding${floodTurn ? ` (triggered by <strong>${floodTurn.horseman}</strong>)` : ''}.
      When conflict gets this intense, your bodies enter a physical fight-or-flight state, making constructive dialogue impossible.
      Take 20 minutes separately to let your nervous systems cool down. The argument can wait.</p>
      <div class="breath-orb" aria-hidden="true"></div>
      <p class="fine">AURA's heartlight — breathe with it, in as it grows, out as it settles.
      Six breaths a minute, the vagal brake.</p>
      <div class="break-actions">
        <button class="btn btn-primary" id="toTable">Maya · reset with AURA</button>
        <button class="btn btn-ghost" id="toRehearsal">Dana · rehearse the check-in</button>
      </div>
      <p class="fine">Each button is that person’s private phone. Neither can see the other’s.</p>
    </div>
  `;
  el.querySelector('#toTable').addEventListener('click', () => go('table'));
  el.querySelector('#toRehearsal').addEventListener('click', () => go('rehearsal'));
}
