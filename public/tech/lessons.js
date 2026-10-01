// Renders lesson tabs + lesson body (wiring table, code, simulator) for the Arduino/ESP32 pages.
(function () {
  const tabsEl = document.getElementById('lessonTabs');
  const bodyEl = document.getElementById('lessonBody');
  if (!tabsEl || !bodyEl || typeof LESSONS === 'undefined') return;

  // ---------- Fun progress tracking: a friendly mascot + "I built this!" ----------
  const BOARD = location.pathname.includes('esp32') ? 'esp32' : 'arduino';
  const PROGRESS_KEY = `olw-progress-${BOARD}`;
  function getProgress() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
  }
  function saveProgress(set) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set])); } catch { /* storage unavailable */ }
  }
  function mascotMessage(done, total) {
    if (done === 0) return "Pick a project below and build your first circuit! 🚀";
    if (done === total) return "WOW — you built every single circuit! You're a real engineer now! 🏆";
    if (done / total >= 0.6) return "You're on fire! Just a few more to go! 🔥";
    return `Nice work! You've built ${done} circuit${done === 1 ? '' : 's'} so far. Keep going! ⭐`;
  }
  function renderProgress() {
    const el = document.getElementById('progressTracker');
    if (!el) return;
    const done = getProgress().size;
    const total = LESSONS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    // One star per lesson — completed ones are gold and earned, the rest wait
    // outlined — so the whole set reads as a little trophy case at a glance.
    const starRow = LESSONS.map((l) => `<span class="collect-star${getProgress().has(l.id) ? ' earned' : ''}" title="${l.title}">⭐</span>`).join('');
    el.innerHTML = `
      <div class="progress-card glass">
        <div class="progress-mascot">🤖</div>
        <div class="progress-info">
          <b>${mascotMessage(done, total)}</b>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <span class="progress-count">${done} / ${total} circuits built</span>
        </div>
      </div>
      <div class="star-case glass">
        <div class="star-case-head"><span>⭐ Your star collection</span><b>${done} / ${total}</b></div>
        <div class="star-case-row">${starRow}</div>
      </div>`;
  }
  // A star that pops up from the button and floats away, landing the idea
  // that completing a lesson = earning a star (shown permanently in the
  // collection case above once the tracker re-renders).
  function starReward(x, y) {
    const s = document.createElement('div');
    s.className = 'star-reward';
    s.textContent = '⭐ +1 star!';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
  function stars(n) {
    const filled = '⭐'.repeat(n);
    const empty = '<span style="opacity:.25">' + '⭐'.repeat(3 - n) + '</span>';
    return filled + empty;
  }
  function confettiBurst(x, y) {
    const colors = ['#ee705d', '#4caaa1', '#eadf42', '#2f8fd1', '#a78bfa'];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.background = colors[i % colors.length];
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  // A single-pass tokenizer: one combined regex classifies each stretch of the
  // (already HTML-escaped) code exactly once. Chaining separate .replace()
  // calls — the previous approach — re-scans text that earlier calls had
  // already wrapped in HTML, so a later pass (e.g. the string-literal regex)
  // ends up matching inside a previous pass's own `class="kw"` attribute and
  // corrupting the markup, which is why labels like `"kw">` were leaking
  // into the page as literal text instead of styling the code.
  function highlight(code) {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const token = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(void|int|float|long|bool|const|if|else|return|true|false|define|include)\b|\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|\b(\d+)\b/gm;
    return escaped.replace(token, (match, cmt, str, kw, fn, num) => {
      if (cmt) return `<span class="cmt">${cmt}</span>`;
      if (str) return `<span class="str">${str}</span>`;
      if (kw) return `<span class="kw">${kw}</span>`;
      if (fn) return `<span class="fn">${fn}</span>`;
      if (num) return `<span class="num">${num}</span>`;
      return match;
    });
  }

  function renderLesson(lesson) {
    const wiringRows = lesson.wiring.map(([a, b]) => `<tr><td class="mono">${a}</td><td>${b}</td></tr>`).join('');
    const isDone = getProgress().has(lesson.id);
    bodyEl.innerHTML = `
      <div class="lesson-grid">
        <div>
          <div class="lesson-title-row">
            <div class="lesson-title">${lesson.icon} ${lesson.title}</div>
            <span class="difficulty-stars" title="Difficulty">${stars(lesson.difficulty || 1)}</span>
          </div>
          <p class="lesson-desc">${lesson.summary}</p>
          <div class="parts-list">${lesson.parts.map((p) => `<span class="part-chip">${p}</span>`).join('')}</div>
          <table class="wiring-table">
            <thead><tr><th>From</th><th>To</th></tr></thead>
            <tbody>${wiringRows}</tbody>
          </table>
          ${lesson.note ? `<div class="glass" style="padding:13px 16px;margin-top:16px;border-left:3px solid var(--accent);font-size:12.5px;color:var(--ink-soft)">💡 ${lesson.note}</div>` : ''}
        </div>
        <div>
          <div class="code-block-wrap">
            <div class="code-block-head">
              <span>${location.pathname.includes('esp32') ? 'ESP32' : 'Arduino'} code</span>
              <button class="copy-code-btn" id="copyCodeBtn" type="button"><i data-lucide="copy" style="width:14px;height:14px"></i> Copy</button>
            </div>
            <div class="code-block">${highlight(lesson.code)}</div>
          </div>
          ${lesson.sim ? `<div class="sim-box" id="simBox" style="margin-top:16px"></div>` : ''}
        </div>
      </div>
      <div class="build-btn-wrap">
        <button class="build-btn${isDone ? ' done' : ''}" id="buildBtn" type="button">${isDone ? '✅ Task done — great job!' : '🔨 I built this!'}</button>
      </div>
    `;
    if (lesson.sim) mountSimulator(lesson.sim, document.getElementById('simBox'));
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyCode(copyBtn, lesson.code));
    const buildBtn = document.getElementById('buildBtn');
    if (buildBtn) buildBtn.addEventListener('click', (e) => {
      const progress = getProgress();
      const nowDone = !progress.has(lesson.id);
      if (nowDone) progress.add(lesson.id); else progress.delete(lesson.id);
      saveProgress(progress);
      buildBtn.textContent = nowDone ? '✅ Task done — great job!' : '🔨 I built this!';
      buildBtn.classList.toggle('done', nowDone);
      if (nowDone) {
        const rect = e.target.getBoundingClientRect();
        confettiBurst(rect.left + rect.width / 2, rect.top);
        starReward(rect.left + rect.width / 2, rect.top);
      }
      renderProgress();
      renderTabs(lesson.id);
    });
    if (window.lucide) lucide.createIcons();
  }

  // Copies the raw, unhighlighted code (not the HTML) so pasting into the
  // Arduino IDE gives back plain text, with brief "Copied!" feedback.
  function copyCode(btn, code) {
    const done = () => {
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> Copied!';
      btn.classList.add('copied');
      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px"></i> Copy';
        btn.classList.remove('copied');
        if (window.lucide) lucide.createIcons();
      }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));
    } else {
      fallbackCopy(code, done);
    }
  }
  function fallbackCopy(code, done) {
    const ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  function renderTabs(activeId) {
    const current = activeId || tabsEl.querySelector('.lesson-tab.active')?.dataset.id || LESSONS[0].id;
    const done = getProgress();
    tabsEl.innerHTML = LESSONS.map((l) => `<button class="lesson-tab${l.id === current ? ' active' : ''}${done.has(l.id) ? ' lesson-done' : ''}" data-id="${l.id}">${l.icon} ${l.title}${done.has(l.id) ? ' <span class="tab-check">✅</span>' : ''}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderTabs();
  renderLesson(LESSONS[0]);
  renderProgress();

  // ---------- Real, working simulators ----------
  function mountSimulator(type, el) {
    if (type === 'blink') return simBlink(el);
    if (type === 'button') return simButton(el);
    if (type === 'pot') return simPot(el);
  }

  function ledSvg(on, size = 70) {
    const glow = on ? `<circle cx="35" cy="35" r="30" fill="#fbbf24" opacity="0.35" filter="blur(6px)"/>` : '';
    const color = on ? '#fde68a' : '#3a3d44';
    return `<svg width="${size}" height="${size}" viewBox="0 0 70 70">${glow}
      <path d="M20 40 Q20 15 35 15 Q50 15 50 40 L50 50 L20 50 Z" fill="${color}" stroke="#111" stroke-width="1.5"/>
      <rect x="24" y="50" width="6" height="14" fill="#9a9fa8"/>
      <rect x="40" y="50" width="6" height="18" fill="#9a9fa8"/>
    </svg>`;
  }

  function simBlink(el) {
    el.innerHTML = `<div class="sim-stage">${ledSvg(false)}</div>
      <div class="sim-controls">
        <button class="sim-btn" id="blinkRun">▶ Run sketch</button>
        <span class="sim-readout" id="blinkState">LED: LOW</span>
      </div>`;
    const stage = el.querySelector('.sim-stage');
    const btn = el.querySelector('#blinkRun');
    const state = el.querySelector('#blinkState');
    let timer = null, on = false, running = false;
    btn.addEventListener('click', () => {
      running = !running;
      btn.textContent = running ? '■ Stop' : '▶ Run sketch';
      btn.classList.toggle('on', running);
      if (running) {
        const tick = () => { on = !on; stage.innerHTML = ledSvg(on); state.textContent = `LED: ${on ? 'HIGH' : 'LOW'}`; };
        tick();
        timer = setInterval(tick, 500);
      } else {
        clearInterval(timer); on = false; stage.innerHTML = ledSvg(false); state.textContent = 'LED: LOW';
      }
    });
  }

  function simButton(el) {
    el.innerHTML = `<div class="sim-stage">${ledSvg(false)}</div>
      <div class="sim-controls">
        <button class="sim-btn" id="pressBtn">Hold to press button</button>
        <span class="sim-readout" id="btnState">digitalRead(2) = HIGH</span>
      </div>`;
    const stage = el.querySelector('.sim-stage');
    const state = el.querySelector('#btnState');
    const press = el.querySelector('#pressBtn');
    const setPressed = (pressed) => {
      stage.innerHTML = ledSvg(pressed);
      state.textContent = `digitalRead(2) = ${pressed ? 'LOW (pressed)' : 'HIGH'}`;
      press.classList.toggle('on', pressed);
    };
    ['mousedown', 'touchstart'].forEach((evt) => press.addEventListener(evt, (e) => { e.preventDefault(); setPressed(true); }));
    ['mouseup', 'mouseleave', 'touchend'].forEach((evt) => press.addEventListener(evt, () => setPressed(false)));
  }

  function simPot(el) {
    el.innerHTML = `<div class="sim-stage">${ledSvg(false, 90)}</div>
      <div class="sim-controls" style="flex-direction:column">
        <input type="range" min="0" max="1023" value="0" class="sim-slider" id="potSlider" />
        <span class="sim-readout" id="potReadout">analogRead(A0) = 0 → analogWrite(9) = 0</span>
      </div>`;
    const stage = el.querySelector('.sim-stage');
    const readout = el.querySelector('#potReadout');
    const slider = el.querySelector('#potSlider');
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      const brightness = Math.round(val / 4);
      stage.innerHTML = `<div style="opacity:${0.15 + (brightness / 255) * 0.85}">${ledSvg(true, 90)}</div>`;
      readout.textContent = `analogRead(A0) = ${val} → analogWrite(9) = ${brightness}`;
    });
  }
})();
