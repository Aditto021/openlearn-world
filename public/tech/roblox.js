(function () {
  const tabsEl = document.getElementById('robloxTabs');
  const bodyEl = document.getElementById('robloxBody');
  if (!tabsEl || !bodyEl || typeof ROBLOX_LESSONS === 'undefined') return;

  // ---------- Fun progress tracking: a friendly mascot + "I built this!" ----------
  const PROGRESS_KEY = 'olw-progress-roblox';
  function getProgress() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
  }
  function saveProgress(set) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set])); } catch { /* storage unavailable */ }
  }
  function mascotMessage(done, total) {
    if (done === 0) return 'Pick a script below and try it in Roblox Studio! 🚀';
    if (done === total) return "WOW — you tried every single script! You're a real Roblox scripter now! 🏆";
    if (done / total >= 0.6) return "You're on fire! Just a few more scripts to go! 🔥";
    return `Nice work! You've tried ${done} script${done === 1 ? '' : 's'} so far. Keep going! ⭐`;
  }
  function renderProgress() {
    const el = document.getElementById('progressTracker');
    if (!el) return;
    const done = getProgress().size;
    const total = ROBLOX_LESSONS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const starRow = ROBLOX_LESSONS.map((l) => `<span class="collect-star${getProgress().has(l.id) ? ' earned' : ''}" title="${l.title}">⭐</span>`).join('');
    el.innerHTML = `
      <div class="progress-card glass">
        <div class="progress-mascot">🤖</div>
        <div class="progress-info">
          <b>${mascotMessage(done, total)}</b>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <span class="progress-count">${done} / ${total} scripts tried</span>
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

  // Single-pass tokenizer — see the Arduino/ESP32 lessons.js for why chaining
  // separate .replace() calls corrupts the markup (a later pass can match
  // inside an earlier pass's own `class="kw"` attribute text).
  function highlight(code) {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const token = /(--.*$)|("(?:[^"\\]|\\.)*")|\b(local|function|end|then|if|return|for|do|in|true|false|nil)\b|\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/gm;
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
    const isDone = getProgress().has(lesson.id);
    bodyEl.innerHTML = `
      <div class="lesson-title">${lesson.icon} ${lesson.title}</div>
      <p class="lesson-desc">${lesson.summary}</p>
      <div class="parts-list"><span class="part-chip">📍 ${lesson.where}</span></div>
      <div class="code-block-wrap">
        <div class="code-block-head">
          <span>Lua code</span>
          <button class="copy-code-btn" id="copyCodeBtn" type="button"><i data-lucide="copy" style="width:14px;height:14px"></i> Copy</button>
        </div>
        <div class="code-block">${highlight(lesson.code)}</div>
      </div>
      <div class="build-btn-wrap">
        <button class="build-btn${isDone ? ' done' : ''}" id="buildBtn" type="button">${isDone ? '✅ Task done — great job!' : '🔨 I tried this!'}</button>
      </div>
    `;
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyCode(copyBtn, lesson.code));
    const buildBtn = document.getElementById('buildBtn');
    if (buildBtn) buildBtn.addEventListener('click', (e) => {
      const progress = getProgress();
      const nowDone = !progress.has(lesson.id);
      if (nowDone) progress.add(lesson.id); else progress.delete(lesson.id);
      saveProgress(progress);
      buildBtn.textContent = nowDone ? '✅ Task done — great job!' : '🔨 I tried this!';
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
    const active = activeId || (tabsEl.querySelector('.lesson-tab.active')?.dataset.id) || ROBLOX_LESSONS[0].id;
    const progress = getProgress();
    tabsEl.innerHTML = ROBLOX_LESSONS.map((l) => `<button class="lesson-tab${l.id === active ? ' active' : ''}${progress.has(l.id) ? ' lesson-done' : ''}" data-id="${l.id}">${l.icon} ${l.title}${progress.has(l.id) ? ' <span class="tab-check">✅</span>' : ''}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(ROBLOX_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderProgress();
  renderTabs(ROBLOX_LESSONS[0].id);
  renderLesson(ROBLOX_LESSONS[0]);
})();
