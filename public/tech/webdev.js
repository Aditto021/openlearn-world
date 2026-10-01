(function () {
  const tabsEl = document.getElementById('lessonTabs');
  const bodyEl = document.getElementById('lessonBody');
  if (!tabsEl || !bodyEl || typeof WEBDEV_LESSONS === 'undefined') return;

  const diagrams = {
    boxmodel: `<svg width="420" height="260" viewBox="0 0 420 260">
      <rect x="10" y="10" width="400" height="240" fill="#fdf8e8" stroke="#9c7209" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="20" y="28" fill="#9c7209" font-size="11" font-weight="700" font-family="monospace">margin</text>
      <rect x="45" y="45" width="330" height="170" fill="#f3ecfc" stroke="#7c3aed" stroke-width="2"/>
      <text x="55" y="62" fill="#7c3aed" font-size="11" font-weight="700" font-family="monospace">border</text>
      <rect x="75" y="75" width="270" height="110" fill="#e8f2fa" stroke="#1e73be" stroke-width="2"/>
      <text x="85" y="92" fill="#1e73be" font-size="11" font-weight="700" font-family="monospace">padding</text>
      <rect x="115" y="110" width="190" height="45" fill="#dcf5e6" stroke="#15803d" stroke-width="2"/>
      <text x="210" y="137" fill="#15803d" font-size="12" font-weight="700" text-anchor="middle" font-family="monospace">content</text>
    </svg>`,
    flexbox: `<svg width="440" height="220" viewBox="0 0 440 220">
      <rect x="20" y="30" width="400" height="140" fill="#e8f2fa" stroke="#1e73be" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="30" y="22" fill="#1e73be" font-size="11" font-weight="700" font-family="monospace">.container { display: flex }</text>
      <rect x="45" y="60" width="90" height="80" rx="8" fill="#e8654f"/>
      <rect x="175" y="60" width="90" height="80" rx="8" fill="#ef8674"/>
      <rect x="305" y="60" width="90" height="80" rx="8" fill="#f4a999"/>
      <line x1="20" y1="185" x2="420" y2="185" stroke="#9c7209" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="200" y="205" fill="#9c7209" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">main axis (justify-content)</text>
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#9c7209"/></marker></defs>
      <line x1="10" y1="55" x2="10" y2="145" stroke="#15803d" stroke-width="2" marker-end="url(#arrow2)"/>
      <defs><marker id="arrow2" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto"><path d="M0,0 L8,0 L4,8 Z" fill="#15803d"/></marker></defs>
      <text x="15" y="105" fill="#15803d" font-size="10" font-weight="700" font-family="monospace" transform="rotate(-90 15 105)">cross axis (align-items)</text>
    </svg>`
  };

  // ---------- Fun progress tracking: a friendly mascot + "I built this!" ----------
  const PROGRESS_KEY = 'olw-progress-webdev';
  function getProgress() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
  }
  function saveProgress(set) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set])); } catch { /* storage unavailable */ }
  }
  function mascotMessage(done, total) {
    if (done === 0) return 'Pick a lesson below and try editing the code! 🚀';
    if (done === total) return "WOW — you built every single web page! You're a real web developer now! 🏆";
    if (done / total >= 0.6) return "You're on fire! Just a few more pages to go! 🔥";
    return `Nice work! You've built ${done} page${done === 1 ? '' : 's'} so far. Keep going! ⭐`;
  }
  function renderProgress() {
    const el = document.getElementById('progressTracker');
    if (!el) return;
    const done = getProgress().size;
    const total = WEBDEV_LESSONS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const starRow = WEBDEV_LESSONS.map((l) => `<span class="collect-star${getProgress().has(l.id) ? ' earned' : ''}" title="${l.title}">⭐</span>`).join('');
    el.innerHTML = `
      <div class="progress-card glass">
        <div class="progress-mascot">🤖</div>
        <div class="progress-info">
          <b>${mascotMessage(done, total)}</b>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <span class="progress-count">${done} / ${total} pages built</span>
        </div>
      </div>
      <div class="star-case glass">
        <div class="star-case-head"><span>⭐ Your star collection</span><b>${done} / ${total}</b></div>
        <div class="star-case-row">${starRow}</div>
      </div>`;
  }
  function starReward(x, y) {
    const s = document.createElement('div');
    s.className = 'star-reward';
    s.textContent = '⭐ +1 star!';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
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

  function renderLesson(lesson) {
    const isDone = getProgress().has(lesson.id);
    bodyEl.innerHTML = `
      <div class="lesson-title">${lesson.icon} ${lesson.title}</div>
      <p class="lesson-desc">${lesson.summary}</p>
      ${lesson.diagram ? `<div class="diagram-box">${diagrams[lesson.diagram]}</div>` : ''}
      <div class="playground">
        <div>
          <textarea class="code-editor" id="codeEditor" spellcheck="false" aria-label="Code editor for ${lesson.title}">${lesson.starter.replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="preview-panel">
          <div class="preview-bar"><span style="color:var(--muted);font:700 11px var(--mono)">Live Preview</span><button class="run-btn" id="runBtn">▶ Run</button></div>
          <iframe class="preview-frame" id="previewFrame" title="preview"></iframe>
        </div>
      </div>
      <div class="build-btn-wrap">
        <button class="build-btn${isDone ? ' done' : ''}" id="buildBtn" type="button">${isDone ? '✅ Task done — great job!' : '🔨 I built this!'}</button>
      </div>
    `;
    const editor = document.getElementById('codeEditor');
    const frame = document.getElementById('previewFrame');
    const run = () => { frame.srcdoc = editor.value; };
    document.getElementById('runBtn').addEventListener('click', run);
    run();
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

  function renderTabs(activeId) {
    const active = activeId || (tabsEl.querySelector('.lesson-tab.active')?.dataset.id) || WEBDEV_LESSONS[0].id;
    const progress = getProgress();
    tabsEl.innerHTML = WEBDEV_LESSONS.map((l) => `<button class="lesson-tab${l.id === active ? ' active' : ''}${progress.has(l.id) ? ' lesson-done' : ''}" data-id="${l.id}">${l.icon} ${l.title}${progress.has(l.id) ? ' <span class="tab-check">✅</span>' : ''}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(WEBDEV_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderProgress();
  renderTabs(WEBDEV_LESSONS[0].id);
  renderLesson(WEBDEV_LESSONS[0]);
})();
