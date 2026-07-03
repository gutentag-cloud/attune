// ATTUNE app shell: hash router, shared session state, global safety wiring.
import { screen } from './core/safety.js';
import { showCrisisOverlay, showAbuseOverlay } from './scenes/crisis.js';
import { mountConsent } from './scenes/consent.js';
import { mountListen } from './scenes/listen.js';
import { mountBreak } from './scenes/breakscene.js';
import { mountTable } from './scenes/table.js';
import { mountBridge } from './scenes/bridge.js';
import { mountDashboard } from './scenes/dashboard.js';
import { mountRehearsal } from './scenes/rehearsal.js';

export const state = {
  consent: { teen: false, parent: false },
  rupture: [],        // RuptureEvent[] from the listen scene
  floodedAt: null,    // turn index where the break was called
  tableDone: false,
  bridgeDraft: '',
  bridgeSent: null,
  rehearsed: false,
  apiKey: null,       // memory only — never persisted
  liveMode: false,
};

// Every user input and every agent line passes through here before it is
// used or rendered. Deterministic rule classifiers — not an LLM call.
export function guard(text, { source = 'user', party = null } = {}) {
  const r = screen(text);
  if (r.crisis) { showCrisisOverlay({ source }); return false; }
  if (r.abuse) { showAbuseOverlay({ targetParty: party }); return false; }
  return true;
}

const scenes = {
  consent: mountConsent,
  listen: mountListen,
  break: mountBreak,
  table: mountTable,
  bridge: mountBridge,
  signature: mountDashboard,
  rehearsal: mountRehearsal,
};

const stage = document.getElementById('stage');
const nav = document.querySelector('.scene-nav');
let cleanup = null;

export function go(name) {
  const target = `#/${name}`;
  if (location.hash === target) route(); // same hash fires no hashchange event
  else location.hash = target;
}

function route() {
  const requested = (location.hash.replace(/^#\//, '') || 'consent');
  const consented = state.consent.teen && state.consent.parent;
  const name = consented && scenes[requested] ? requested : 'consent';

  if (typeof cleanup === 'function') cleanup();
  stage.innerHTML = '';
  nav.dataset.locked = String(!consented);

  // the nav doubles as tonight's session tracker: done steps get a check
  const done = {
    listen: state.rupture.length > 0,
    break: state.floodedAt !== null,
    table: state.tableDone,
    bridge: Boolean(state.bridgeSent),
    signature: Boolean(state.bridgeSent),
    rehearsal: state.rehearsed,
  };
  nav.querySelectorAll('a').forEach(a => {
    a.setAttribute('aria-current', String(a.dataset.scene === name));
    a.dataset.done = String(Boolean(done[a.dataset.scene]));
  });

  const el = document.createElement('section');
  el.className = 'scene';
  stage.appendChild(el);
  cleanup = scenes[name](el, state) || null;
  stage.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);

// Settings drawer (optional live-agent mode)
const drawer = document.getElementById('settingsDrawer');
const toggle = document.getElementById('settingsToggle');
toggle.addEventListener('click', () => {
  const open = drawer.hidden;
  drawer.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
});
document.getElementById('applyKey').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  state.apiKey = key || null;
  state.liveMode = Boolean(key);
  document.getElementById('liveModeStatus').innerHTML =
    `Mode: <strong>${state.liveMode ? 'live Claude agents' : 'offline / scripted'}</strong>`;
});

route();
