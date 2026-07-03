// LISTEN — the referee view. Replays the scripted argument through the real
// classifier + meter, or takes live input (typed / Web Speech mic) through the
// exact same pipeline. Flooding auto-routes to the BREAK.
import { classifyTurn } from '../core/horsemen.js';
import { createMeter } from '../core/escalation.js';
import { SCRIPT, DYAD } from '../data/script.js';
import { go, guard } from '../app.js';

const HORSEMAN_GLYPH = {
  criticism: '⚑ CRITICISM', contempt: '⚑ CONTEMPT',
  defensiveness: '⚑ DEFENSIVENESS', stonewalling: '⚑ STONEWALLING',
};

const IDLE_PLACEHOLDER = 'Type a line and press Enter — try being unfair and watch the flags.';

export function mountListen(el, state) {
  el.innerHTML = `
    <p class="scene-kicker">Scene 1 · The kitchen, 9:04 pm</p>
    <h1>LISTEN</h1>
    <p class="lede">Consent is on for both. Each turn is classified on-device for the
    Four Horsemen (Gottman) and feeds the flooding meter. No coaching mid-fight —
    past the threshold nothing lands, so ATTUNE’s only live move is to call the break.</p>

    <div class="listen-grid">
      <div>
        <div class="phones" id="ticker" aria-live="polite"></div>
        <div class="live-bar">
          <button class="btn btn-primary" id="play">▸ Replay the argument</button>
          <button class="btn btn-ghost" id="micBtn" hidden>🎙 Live listen</button>
          <button class="btn btn-ghost" id="speakerBtn" title="Tap to switch who the next line belongs to"></button>
        </div>
        <div class="live-bar">
          <textarea class="field" id="liveInput" placeholder="${IDLE_PLACEHOLDER}"></textarea>
          <button class="btn btn-ghost" id="addTurn">Add turn</button>
        </div>
        <p class="mode-note">Act out your own argument: every line — typed or spoken — becomes
        a turn for the speaker shown on the button, runs through the same classifier as the
        replay, and pushes the meter. Cross the threshold and ATTUNE calls the break.
        Typed lines never leave this page; the optional mic uses the browser's speech
        service to transcribe (production ATTUNE transcribes fully on-device).</p>
      </div>
      <div class="meter-rail" id="meterRail" data-zone="ok">
        <span class="meter-label">Flooding<br>meter</span>
        <div class="meter"><div class="threshold"></div><div class="fill" id="meterFill"></div></div>
        <span class="meter-value" id="meterValue">0.00</span>
      </div>
    </div>
  `;

  const ticker = el.querySelector('#ticker');
  const fill = el.querySelector('#meterFill');
  const value = el.querySelector('#meterValue');
  const rail = el.querySelector('#meterRail');
  const liveInput = el.querySelector('#liveInput');
  const speakerBtn = el.querySelector('#speakerBtn');
  const micBtn = el.querySelector('#micBtn');
  const meter = createMeter();
  let liveSpeaker = 'parent';
  const timers = [];

  function updateSpeakerBtn() {
    speakerBtn.textContent = `Next line: ${DYAD[liveSpeaker].label}`;
  }
  updateSpeakerBtn();
  speakerBtn.addEventListener('click', () => {
    liveSpeaker = liveSpeaker === 'parent' ? 'teen' : 'parent';
    updateSpeakerBtn();
  });

  function renderMeter() {
    const pct = Math.round(meter.level * 100);
    fill.style.height = `${Math.max(2, pct)}%`;
    fill.style.width = `${Math.max(2, pct)}%`; // mobile horizontal variant
    value.textContent = meter.level.toFixed(2);
    rail.dataset.zone = meter.level >= 0.72 ? 'crit' : meter.level >= 0.5 ? 'warn' : 'ok';
  }

  function addTurn({ speaker, text, interruption }, index) {
    const result = classifyTurn(text);
    if (result.horseman) {
      state.rupture.push({
        t: index, speaker, horseman: result.horseman,
        intensity: result.intensity, quote: text,
      });
    }
    meter.push(result, { interruption });
    renderMeter();

    const div = document.createElement('div');
    div.className = 'turn';
    div.dataset.speaker = speaker;
    div.innerHTML = `
      <span class="who">${DYAD[speaker]?.label ?? speaker}${interruption ? ' · interrupts' : ''}</span>
      <span class="bubble"></span>`;
    div.querySelector('.bubble').textContent = text;
    const flag = document.createElement('span');
    if (result.horseman) {
      flag.className = `flag flag-${result.horseman}`;
      flag.textContent = `${HORSEMAN_GLYPH[result.horseman]} · ${result.cues[0]} · ${result.intensity.toFixed(2)}`;
    } else {
      flag.className = 'flag flag-clear';
      flag.textContent = '✓ clear';
    }
    div.appendChild(flag);
    ticker.appendChild(div);
    div.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    if (meter.flooded && state.floodedAt === null) {
      state.floodedAt = index;
      timers.forEach(clearTimeout);
      setTimeout(() => go('break'), 1600);
      return true;
    }
    return false;
  }

  el.querySelector('#play').addEventListener('click', (e) => {
    e.target.disabled = true;
    ticker.innerHTML = '';
    state.rupture = [];
    state.floodedAt = null;
    let at = 400;
    SCRIPT.forEach((turn, i) => {
      at += turn.delayMs;
      timers.push(setTimeout(() => addTurn(turn, i), at));
    });
  });

  // Every committed line — typed or spoken — goes through here: safety guard,
  // classifier, meter. The speaker auto-alternates (arguments do), and the
  // button always shows who the next line belongs to so you can correct it.
  function classifyLive(text) {
    text = text.trim();
    if (!text) return;
    if (!guard(text, { party: liveSpeaker === 'parent' ? 'Maya' : 'Dana' })) return;
    addTurn({ speaker: liveSpeaker, text }, ticker.children.length);
    liveSpeaker = liveSpeaker === 'parent' ? 'teen' : 'parent';
    updateSpeakerBtn();
  }

  function submitTyped() {
    classifyLive(liveInput.value);
    liveInput.value = '';
  }
  el.querySelector('#addTurn').addEventListener('click', submitTyped);
  liveInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTyped();
    }
  });

  // Optional live mic via Web Speech API (Chrome/Safari). Each finished phrase
  // is committed as a turn automatically — interim words preview in the box.
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SR) {
    micBtn.hidden = false;

    function stopRecognition() {
      isListening = false;
      if (recognition) {
        try { recognition.stop(); } catch (e) { /* already stopped */ }
      }
      recognition = null;
      micBtn.textContent = '🎙 Live listen';
      micBtn.classList.remove('mic-active');
      liveInput.placeholder = IDLE_PLACEHOLDER;
    }

    function startRecognition() {
      recognition = new SR();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isListening = true;
        micBtn.textContent = '● Stop listening';
        micBtn.classList.add('mic-active');
        liveInput.placeholder = 'Listening — each finished sentence joins the chat as a turn…';
      };

      recognition.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i];
          if (res.isFinal) {
            liveInput.value = '';
            classifyLive(res[0].transcript);
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim) liveInput.value = interim;
      };

      recognition.onerror = (ev) => {
        console.error('Speech recognition error:', ev.error);
        const msg = ev.error === 'not-allowed' ? 'Mic blocked'
          : ev.error === 'no-speech' ? 'No speech heard'
          : ev.error === 'network' ? 'Speech service offline'
          : 'Mic error';
        stopRecognition();
        micBtn.textContent = `🎙 ${msg}`;
        setTimeout(() => {
          if (!isListening) micBtn.textContent = '🎙 Live listen';
        }, 3000);
      };

      // Chrome ends recognition after silence even in continuous mode —
      // restart quietly until the user actually stops it.
      recognition.onend = () => {
        if (isListening && recognition) {
          try { recognition.start(); } catch (e) { stopRecognition(); }
        }
      };

      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        stopRecognition();
        micBtn.textContent = '🎙 Error starting';
        setTimeout(() => { micBtn.textContent = '🎙 Live listen'; }, 2000);
      }
    }

    micBtn.addEventListener('click', () => {
      if (isListening) stopRecognition();
      else startRecognition();
    });
  }

  renderMeter();
  return () => {
    timers.forEach(clearTimeout);
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) { /* already stopped */ }
    }
  };
}
