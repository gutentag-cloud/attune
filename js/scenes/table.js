// RESET WITH AURA — Maya's private co-regulation session, run as one guided
// conversation (the AURA talk model). Typing is first-class: typed answers fill
// the ACT steps in Maya's own words and feed the repair draft; the chips are
// just quick replies. Offline, AURA reflects with on-device rules; with an API
// key the open-ended replies come from live Claude. Seeded from LISTEN.
import { go, guard } from '../app.js';
import { createLiveAgent } from '../core/llm.js';

const TRIGGER_CHIPS = [
  'I felt accused of failing or being irresponsible',
  'I felt like nothing I do is ever good enough',
];
const VALUE_CHIPS = [
  'I want us to communicate without blaming each other',
  'I want you to hear that I am trying, even when I make mistakes',
];
const INTENT_CHIPS = [
  "I want to explain the Mr. Reyes situation calmly",
  "I'm ready to talk, but I need us to speak in a calmer tone",
];

const GREET_REPLIES = {
  'Still angry.':
    "Fair. Anger is information — something you care about got stepped on. We're not going to argue it away; we're going to get your body out of alarm first.",
  "I don't even know. Numb.":
    "Numb usually means the system is overloaded, not that you don't care. Body first, then words.",
};

const REGULATE_PROMPT =
  'The meter crossed the flooding line back there — your body is in fight-or-flight, and nothing said in that state lands. One minute of body work before any words. Pick one, or tell me what you need:';

const RESET_ACK = {
  breathing: 'Three slow cycles — that was the vagal brake doing its work.',
  cold: 'Good. The dive reflex is the fastest brake the body has.',
  pressure: 'Good. Steady pressure reads as safety to the nervous system.',
};

const PLACEHOLDERS = {
  greet: "Say how you're actually feeling…",
  regulate: 'Tell AURA what you need…',
  act1: 'What did it actually hit? Your own words…',
  act2: 'What do you want between you two?',
  act3: 'How do you want to open the repair?',
  draft: 'Or rewrite the whole draft in your own words…',
  done: 'Anything else on your mind…',
};

// offline reflective listening — on-device rules, no model call
function reflect(text) {
  const t = text.toLowerCase();
  if (/(angry|mad|furious|pissed|hate)/.test(t))
    return "That anger is telling you something you care about got stepped on. It's allowed to be in here.";
  if (/(unfair|always|never|blame)/.test(t))
    return "The unfairness is the part that burns, yeah. You don't have to win that point right now — just name it.";
  if (/(sad|hurt|cry|crying|awful)/.test(t))
    return 'That hurts, and it makes sense that it hurts. Nothing is wrong with you for feeling it.';
  if (/(scared|afraid|anxious|worried|panic)/.test(t))
    return "That worry is your system trying to protect you. You're safe in this room right now.";
  if (/(numb|nothing|whatever|tired|done)/.test(t))
    return "Numb and tired usually mean the system is overloaded, not that you don't care.";
  return "I hear you. There's no wrong way to say it in here.";
}

export function mountTable(el, state) {
  let resets = 0;
  let exercise = null;      // 'breathing' | 'cold' | 'pressure'
  let step = 'greet';       // greet → regulate → act1 → act2 → act3 → draft → done
  const sel = { trigger: '', value: '', intent: '' };
  const thread = [];
  let exerciseTimer = null;

  const aura = text => thread.push({ role: 'aura', text });
  const maya = text => thread.push({ role: 'maya', text });

  // opening: correlate with what actually happened in LISTEN
  const flood = state.rupture.at(-1);
  aura(flood
    ? `Hey Maya. I'm AURA, your co-regulation guide. I noticed things got heated in the kitchen (Mom said: “${flood.quote}”). That would flood anyone. Before we talk it through: how are you right now?`
    : "Hey Maya. I'm AURA. I noticed things got heated in the kitchen. Before we talk it through: how are you right now?");

  function currentChoices() {
    if (step === 'greet') return [
      { label: 'Still angry.', k: 'greet' },
      { label: "I don't even know. Numb.", k: 'greet' }
    ];
    if (step === 'regulate') {
      const c = [
        { label: '🫁 Breathe with you — 1 min', k: 'ex', ex: 'breathing' },
        { label: '🧊 Cold water reset', k: 'ex', ex: 'cold' },
        { label: '🤗 Pillow hug · deep pressure', k: 'ex', ex: 'pressure' },
        { label: "Skip to finding the words", k: 'ready' }
      ];
      return c;
    }
    if (step === 'act1') return TRIGGER_CHIPS.map(label => ({ label, k: 'act1' }));
    if (step === 'act2') return VALUE_CHIPS.map(label => ({ label, k: 'act2' }));
    if (step === 'act3') return INTENT_CHIPS.map(label => ({ label, k: 'act3' }));
    if (step === 'draft') return [
      { label: 'Send to Mom & Rehearse →', k: 'save' },
      { label: 'Rework the words', k: 'rework' },
    ];
    if (step === 'done') return [{ label: 'Go to Brain System →', k: 'brain' }];
    return [];
  }

  // shared by chips and typed input: an answer to the current ACT question
  function answerAct(text) {
    const clean = s => s.trim().replace(/[.!?]+$/, '');
    if (step === 'act1') {
      sel.trigger = clean(text);
      aura("I hear you. Defending yourself makes complete sense when you feel accused. Next: if tonight went the way you actually want, what would be true between you and Mom going forward?");
      step = 'act2';
    } else if (step === 'act2') {
      sel.value = clean(text);
      aura('Understood. Last one: how do you want to open the repair when you decide to talk to her?');
      step = 'act3';
    } else if (step === 'act3') {
      sel.intent = clean(text);
      const lcFirst = s => /^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
      state.bridgeDraft = `Mom — back in the kitchen, ${lcFirst(sel.trigger)}. ${sel.value}. ${sel.intent}.`;
      aura('Here is a first draft based on your words:');
      thread.push({ role: 'aura', draft: true, text: state.bridgeDraft });
      step = 'draft';
    }
  }

  function choose(c) {
    if (c.k === 'brain') { go('brain'); return; }
    maya(c.label.replace(/^[^\w"“']+\s*/, ''));

    if (c.k === 'greet') {
      aura(GREET_REPLIES[c.label]);
      aura("Before we find the words to repair, let's do a quick physical reset to get your body out of fight-or-flight. Pick one, or type 'skip':");
      step = 'regulate';
    } else if (c.k === 'ex') {
      exercise = c.ex;
    } else if (c.k === 'ready') {
      aura('Okay. Let’s look at the argument. When Mom brought up the portal — what did it actually hit? Say it your way, or select a suggestion:');
      step = 'act1';
    } else if (c.k === 'act1' || c.k === 'act2' || c.k === 'act3') {
      answerAct(c.label);
    } else if (c.k === 'save') {
      state.tableDone = true;
      state.bridgeSent = state.bridgeDraft;
      aura('Delivered to Mom! Repair latency: 0.4 hrs. Now that you have sent the repair message, let\'s practice how Mom will react. Head over to the Brain System tab (Rehearsal mode) to test your approach!');
      step = 'done';
    } else if (c.k === 'rework') {
      aura('Let’s try again. When Mom brought up the portal, what did it actually hit?');
      step = 'act1';
    }
    render();
  }

  async function handleTyped(text) {
    text = text.trim();
    if (!text) return;
    if (!guard(text)) return;
    maya(text);

    if (step === 'act1' || step === 'act2' || step === 'act3') {
      answerAct(text);
      render();
      return;
    }
    if (step === 'draft') {
      state.bridgeDraft = text;
      state.bridgeSent = text;
      state.tableDone = true;
      aura('Delivered to Mom! Repair latency: 0.4 hrs. Now that you have sent the repair message, let\'s practice how Mom will react. Head over to the Brain System tab (Rehearsal mode) to test your approach!');
      step = 'done';
      render();
      return;
    }
    if (step === 'regulate') {
      const t = text.toLowerCase();
      if (/(breath|air|breathe)/.test(t)) { exercise = 'breathing'; render(); return; }
      if (/(cold|water|ice|splash)/.test(t)) { exercise = 'cold'; render(); return; }
      if (/(hug|pressure|blanket|pillow|squeeze)/.test(t)) { exercise = 'pressure'; render(); return; }
      if (/(ready|calm|calmer|words|talk|fine now|better|skip)/.test(t)) {
        aura('Okay. Let’s look at the argument. When Mom brought up the portal — what did it actually hit? Say it your way, or select a suggestion:');
        step = 'act1';
        render();
        return;
      }
    }

    // open-ended turn (greet / regulate / done): reflect, or live Claude
    render();
    let reply = null;
    if (state.liveMode && state.apiKey) {
      try {
        const agent = createLiveAgent(state.apiKey);
        reply = await agent.speak({
          recent: thread.filter(m => !m.draft).slice(-6).map(m =>
            ({ role: m.role === 'maya' ? 'user' : 'assistant', content: m.text })),
          latestInput: text,
        });
        if (!guard(reply, { source: 'agent', party: 'Maya' })) return;
      } catch (err) {
        console.error(err);
        reply = null;
      }
    }
    aura(reply ?? reflect(text));
    if (step === 'greet') {
      aura("Before we find the words to repair, let's do a quick physical reset to get your body out of fight-or-flight. Pick an exercise below, or type 'skip':");
      step = 'regulate';
    }
    render();
  }

  const RESET_ACK_FOLLOWUP = 'Another reset, or ready to find the words?';
  function finishExercise(kind) {
    resets++;
    exercise = null;
    aura([
      RESET_ACK[kind],
      resets > 1 ? 'You should feel your system coming down.' : '',
      RESET_ACK_FOLLOWUP,
    ].filter(Boolean).join(' '));
    render();
  }

  function renderExercise() {
    if (exercise === 'breathing') return `
      <div class="exercise-card">
        <h4>Breathe with AURA</h4>
        <p class="fine">Follow the light — in as it grows, out as it settles. Six breaths a minute.</p>
        <div class="breathing-circle-container">
          <div class="breathing-circle" id="breathingCircle"></div>
          <div class="pacer-label" id="pacerLabel">Prepare to breathe...</div>
        </div>
        <div class="progress-bar-container" style="margin-top: var(--space-2)">
          <div class="progress-bar-fill" id="pacerProgress" style="width: 0%"></div>
        </div>
        <p class="fine" id="breathingCyclesLeft" style="margin-top: var(--space-1); text-align: center;">3 cycles left</p>
      </div>`;
    if (exercise === 'cold') return `
      <div class="exercise-card">
        <h4>Cold reset</h4>
        <p>Splash cold water on your face, or hold a cold, damp cloth against the side of
        your neck for 15 seconds. The cold triggers the dive reflex — your heart rate drops
        within seconds.</p>
        <div style="text-align: center; margin-top: var(--space-2);">
          <button class="btn btn-ghost" id="completeCold">Done — I did it</button>
        </div>
      </div>`;
    if (exercise === 'pressure') return `
      <div class="exercise-card">
        <h4>Deep-pressure embrace</h4>
        <p>Wrap yourself in a weighted blanket, hug a firm cushion, or press your palms flat
        against your chest. Steady, deep pressure signals your nervous system that you're safe.</p>
        <div class="pressure-meter-container" id="pressureMeterContainer" style="display: none; margin-top: var(--space-2);">
          <div class="p-meter-fill" id="pressureFill" style="width: 0%"></div>
          <span class="p-meter-text">Hold steady…</span>
        </div>
        <div style="text-align: center; margin-top: var(--space-2);">
          <button class="btn btn-ghost" id="startPressure">Start the hold</button>
        </div>
      </div>`;
    return '';
  }

  function bubble(m) {
    if (m.draft) return `
      <div class="chat-line coach">
        <span class="chat-who">AURA · draft for the Bridge</span>
        <div class="chat-bubble chat-draft">${m.text}</div>
      </div>`;
    return `
      <div class="chat-line ${m.role === 'maya' ? 'user' : 'coach'}">
        <span class="chat-who">${m.role === 'maya' ? 'Maya' : 'AURA'}</span>
        <div class="chat-bubble">${m.text}</div>
      </div>`;
  }

  function render() {
    const chips = currentChoices();
    el.innerHTML = `
      <p class="scene-kicker">Scene 3 · Maya’s phone — private. Dana cannot see this.</p>
      <h1>AURA Chat</h1>
      <p class="lede">Talk to AURA the way you'd text — the suggestions below are optional shortcuts.
      It saw the kitchen argument, gets your body out of fight-or-flight first, then helps
      you find the words for the repair. This screen is yours alone.</p>

      <div class="aura-hub">
        <div>
          <div class="coach-chat-log" id="chatLog">${thread.map(bubble).join('')}</div>
          ${exercise ? '' : `
          ${chips.length ? `
            ${(step === 'greet' || step === 'act1' || step === 'act2' || step === 'act3') ? `
              <div class="hints-wrapper" style="margin-bottom: var(--space-2)">
                <button class="btn btn-ghost btn-sm" id="toggleHints" style="font-size:0.78rem; padding: 0.35em 0.8em; opacity: 0.75; cursor: pointer; border-radius: 999px;">💡 Need suggestions?</button>
                <div class="reply-chips" id="chips" style="display: none; margin-top: 0.5rem;">
                  ${chips.map((c, i) => `<button class="btn btn-ghost reply-chip" data-i="${i}" style="margin: 2px; font-size: 0.85rem;">${c.label}</button>`).join('')}
                </div>
              </div>
            ` : `
              <div class="reply-chips" id="chips" style="margin-bottom: var(--space-2)">
                ${chips.map((c, i) => `<button class="btn btn-ghost reply-chip" data-i="${i}" style="margin: 2px">${c.label}</button>`).join('')}
              </div>
            `}
          ` : ''}
          <div class="live-bar">
            <textarea class="field" id="sayIt" placeholder="${PLACEHOLDERS[step] ?? 'Say it your way…'}"></textarea>
            <button class="btn btn-primary" id="sendIt">Send</button>
          </div>
          <p class="mode-note">${state.liveMode && state.apiKey
            ? 'Live mode: open-ended replies come from Claude. Your words still never render unscreened.'
            : 'Offline: AURA reflects with on-device rules — nothing you type leaves this page.'}</p>`}
        </div>

        ${exercise ? `<div class="aura-workspace">${renderExercise()}</div>` : ''}
      </div>
    `;
    wire(chips);
    const log = el.querySelector('#chatLog');
    log.scrollTop = log.scrollHeight;
  }

  function wire(chips) {
    el.querySelectorAll('.reply-chip').forEach(btn =>
      btn.addEventListener('click', () => choose(chips[Number(btn.dataset.i)])));

    const toggleHints = el.querySelector('#toggleHints');
    if (toggleHints) {
      toggleHints.addEventListener('click', () => {
        const chipsEl = el.querySelector('#chips');
        if (chipsEl.style.display === 'none') {
          chipsEl.style.display = 'flex';
          toggleHints.textContent = '💡 Hide suggestions';
        } else {
          chipsEl.style.display = 'none';
          toggleHints.textContent = '💡 Need suggestions?';
        }
      });
    }

    const sayIt = el.querySelector('#sayIt');
    if (sayIt) {
      const send = () => { const v = sayIt.value; sayIt.value = ''; handleTyped(v); };
      el.querySelector('#sendIt').addEventListener('click', send);
      sayIt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
      });
      if (step !== 'greet' && step !== 'done') sayIt.focus();
    }

    if (exercise === 'breathing') runBreathingPacer();
    if (exercise === 'cold') {
      el.querySelector('#completeCold').addEventListener('click', () => finishExercise('cold'));
    }
    if (exercise === 'pressure') {
      el.querySelector('#startPressure').addEventListener('click', (e) => {
        e.target.disabled = true;
        el.querySelector('#pressureMeterContainer').style.display = 'block';
        const fillEl = el.querySelector('#pressureFill');
        let progress = 0;
        exerciseTimer = setInterval(() => {
          progress += 5;
          fillEl.style.width = `${progress}%`;
          if (progress >= 100) { clearInterval(exerciseTimer); finishExercise('pressure'); }
        }, 150);
      });
    }
  }

  function runBreathingPacer() {
    const circle = el.querySelector('#breathingCircle');
    const label = el.querySelector('#pacerLabel');
    const progress = el.querySelector('#pacerProgress');
    const cyclesLabel = el.querySelector('#breathingCyclesLeft');
    let cycles = 3;
    let seconds = 0;

    exerciseTimer = setInterval(() => {
      if (!el.contains(circle)) { clearInterval(exerciseTimer); return; }
      const cycleProgress = seconds % 10;
      if (cycleProgress < 5) {
        circle.style.transform = `scale(${0.6 + (cycleProgress / 5) * 0.4})`;
        label.textContent = `Inhale… (${(5 - cycleProgress).toFixed(0)}s)`;
      } else {
        const exhale = cycleProgress - 5;
        circle.style.transform = `scale(${1.0 - (exhale / 5) * 0.4})`;
        label.textContent = `Exhale… (${(5 - exhale).toFixed(0)}s)`;
      }
      const totalSeconds = 30;
      seconds++;
      progress.style.width = `${(seconds / totalSeconds) * 100}%`;
      if (seconds % 10 === 0) {
        cycles--;
        if (cycles > 0) cyclesLabel.textContent = `${cycles} ${cycles === 1 ? 'cycle' : 'cycles'} left`;
      }
      if (seconds >= totalSeconds) { clearInterval(exerciseTimer); finishExercise('breathing'); }
    }, 1000);
  }

  render();
  return () => { if (exerciseTimer) clearInterval(exerciseTimer); };
}
