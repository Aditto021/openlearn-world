(function () {
  const tabsEl = document.getElementById('procTabs');
  const bodyEl = document.getElementById('procBody');
  if (!tabsEl || !bodyEl || typeof PROCESSING_LESSONS === 'undefined') return;

  const PROGRESS_KEY = 'olw-progress-processing';
  function getProgress() { try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); } }
  function saveProgress(set) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set])); } catch { /* storage unavailable */ } }

  // Single-pass tokenizer — see the Arduino/ESP32 lessons.js for why chaining
  // separate .replace() calls corrupts the markup (a later pass can match
  // inside an earlier pass's own `class="kw"` attribute text).
  function highlight(code) {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const token = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(function|let|const|var|if|else|for|return|true|false)\b|\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/gm;
    return escaped.replace(token, (match, cmt, str, kw, fn, num) => {
      if (cmt) return `<span class="cmt">${cmt}</span>`;
      if (str) return `<span class="str">${str}</span>`;
      if (kw) return `<span class="kw">${kw}</span>`;
      if (fn) return `<span class="fn">${fn}</span>`;
      if (num) return `<span class="num">${num}</span>`;
      return match;
    });
  }

  function buildSketchDoc(code) {
    const safe = code.replace(/<\/script>/g, '<\\/script>');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden}</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></` + `script></head><body>
<script>${safe}</` + `script></body></html>`;
  }

  function runSketch(code) {
    const frame = document.getElementById('procFrame');
    if (frame) frame.srcdoc = buildSketchDoc(code);
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
  function starReward(x, y) {
    const s = document.createElement('div');
    s.className = 'star-reward';
    s.textContent = '⭐ +1 star!';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }

  function renderLesson(lesson) {
    const isDone = getProgress().has(lesson.id);
    bodyEl.innerHTML = `
      <div class="lesson-grid">
        <div>
          <div class="lesson-title">${lesson.icon} ${lesson.title}</div>
          <p class="lesson-desc">${lesson.summary}</p>
          <div class="code-block-wrap">
            <div class="code-block-head">
              <span>p5.js (Processing for the web) code</span>
              <button class="copy-code-btn" id="copyCodeBtn" type="button"><i data-lucide="copy" style="width:14px;height:14px"></i> Copy</button>
            </div>
            <div class="code-block">${highlight(lesson.code)}</div>
          </div>
        </div>
        <div>
          <div class="sim-box" style="padding:0;overflow:hidden">
            <div class="code-block-head" style="border-radius:12px 12px 0 0">
              <span>Live preview</span>
              <button class="copy-code-btn" id="rerunBtn" type="button"><i data-lucide="refresh-cw" style="width:14px;height:14px"></i> Restart</button>
            </div>
            <iframe id="procFrame" title="Live p5.js preview" style="width:100%;height:300px;border:0;display:block;background:#fff" sandbox="allow-scripts"></iframe>
          </div>
        </div>
      </div>
      <div class="build-btn-wrap">
        <button class="build-btn${isDone ? ' done' : ''}" id="buildBtn" type="button">${isDone ? '✅ Task done — great job!' : '🔨 I made this!'}</button>
      </div>
    `;
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyCode(copyBtn, lesson.code));
    const rerunBtn = document.getElementById('rerunBtn');
    if (rerunBtn) rerunBtn.addEventListener('click', () => runSketch(lesson.code));
    const buildBtn = document.getElementById('buildBtn');
    if (buildBtn) buildBtn.addEventListener('click', (e) => {
      const progress = getProgress();
      const nowDone = !progress.has(lesson.id);
      if (nowDone) progress.add(lesson.id); else progress.delete(lesson.id);
      saveProgress(progress);
      buildBtn.textContent = nowDone ? '✅ Task done — great job!' : '🔨 I made this!';
      buildBtn.classList.toggle('done', nowDone);
      if (nowDone) {
        const rect = e.target.getBoundingClientRect();
        confettiBurst(rect.left + rect.width / 2, rect.top);
        starReward(rect.left + rect.width / 2, rect.top);
      }
      renderTabs(lesson.id);
    });
    runSketch(lesson.code);
    if (window.lucide) lucide.createIcons();
  }

  function renderTabs(activeId) {
    const active = activeId || (tabsEl.querySelector('.lesson-tab.active')?.dataset.id) || PROCESSING_LESSONS[0].id;
    const progress = getProgress();
    tabsEl.innerHTML = PROCESSING_LESSONS.map((l) => `<button class="lesson-tab${l.id === active ? ' active' : ''}${progress.has(l.id) ? ' lesson-done' : ''}" data-id="${l.id}">${l.icon} ${l.title}${progress.has(l.id) ? ' <span class="tab-check">✅</span>' : ''}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(PROCESSING_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderTabs(PROCESSING_LESSONS[0].id);
  renderLesson(PROCESSING_LESSONS[0]);
})();
