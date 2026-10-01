(function () {
  const tabsEl = document.getElementById('robloxTabs');
  const bodyEl = document.getElementById('robloxBody');
  if (!tabsEl || !bodyEl || typeof ROBLOX_LESSONS === 'undefined') return;

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
    `;
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyCode(copyBtn, lesson.code));
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

  function renderTabs() {
    tabsEl.innerHTML = ROBLOX_LESSONS.map((l, i) => `<button class="lesson-tab${i === 0 ? ' active' : ''}" data-id="${l.id}">${l.icon} ${l.title}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(ROBLOX_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderTabs();
  renderLesson(ROBLOX_LESSONS[0]);
})();
