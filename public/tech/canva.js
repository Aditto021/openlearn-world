(function () {
  const tabsEl = document.getElementById('canvaTabs');
  const bodyEl = document.getElementById('canvaBody');
  if (!tabsEl || !bodyEl || typeof CANVA_LESSONS === 'undefined') return;

  // ---------- Fun progress tracking: a friendly mascot + "I made this!" ----------
  const PROGRESS_KEY = 'olw-progress-canva';
  function getProgress() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
  }
  function saveProgress(set) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set])); } catch { /* storage unavailable */ }
  }
  function mascotMessage(done, total) {
    if (done === 0) return 'Pick a design below and try it in Canva! 🚀';
    if (done === total) return "WOW — you made every single design! You're a real designer now! 🏆";
    if (done / total >= 0.6) return "You're on fire! Just a few more designs to go! 🔥";
    return `Nice work! You've made ${done} design${done === 1 ? '' : 's'} so far. Keep going! ⭐`;
  }
  function renderProgress() {
    const el = document.getElementById('progressTracker');
    if (!el) return;
    const done = getProgress().size;
    const total = CANVA_LESSONS.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const starRow = CANVA_LESSONS.map((l) => `<span class="collect-star${getProgress().has(l.id) ? ' earned' : ''}" title="${l.title}">⭐</span>`).join('');
    el.innerHTML = `
      <div class="progress-card glass">
        <div class="progress-mascot">🤖</div>
        <div class="progress-info">
          <b>${mascotMessage(done, total)}</b>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <span class="progress-count">${done} / ${total} designs made</span>
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
    const stepsHtml = lesson.steps.map((s) => `<li>${s}</li>`).join('');
    bodyEl.innerHTML = `
      <div class="lesson-title">${lesson.icon} ${lesson.title}</div>
      <p class="lesson-desc">${lesson.summary}</p>
      <div class="parts-list">${lesson.parts.map((p) => `<span class="part-chip">${p}</span>`).join('')}</div>
      <ol class="step-list">${stepsHtml}</ol>
      <div class="build-btn-wrap">
        <button class="build-btn${isDone ? ' done' : ''}" id="buildBtn" type="button">${isDone ? '✅ Task done — great job!' : '🎨 I made this!'}</button>
      </div>
    `;
    const buildBtn = document.getElementById('buildBtn');
    if (buildBtn) buildBtn.addEventListener('click', (e) => {
      const progress = getProgress();
      const nowDone = !progress.has(lesson.id);
      if (nowDone) progress.add(lesson.id); else progress.delete(lesson.id);
      saveProgress(progress);
      buildBtn.textContent = nowDone ? '✅ Task done — great job!' : '🎨 I made this!';
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
    const active = activeId || (tabsEl.querySelector('.lesson-tab.active')?.dataset.id) || CANVA_LESSONS[0].id;
    const progress = getProgress();
    tabsEl.innerHTML = CANVA_LESSONS.map((l) => `<button class="lesson-tab${l.id === active ? ' active' : ''}${progress.has(l.id) ? ' lesson-done' : ''}" data-id="${l.id}">${l.icon} ${l.title}${progress.has(l.id) ? ' <span class="tab-check">✅</span>' : ''}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(CANVA_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderProgress();
  renderTabs(CANVA_LESSONS[0].id);
  renderLesson(CANVA_LESSONS[0]);
})();
