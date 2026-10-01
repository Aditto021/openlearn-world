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

  function renderLesson(lesson) {
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
    `;
    const editor = document.getElementById('codeEditor');
    const frame = document.getElementById('previewFrame');
    const run = () => { frame.srcdoc = editor.value; };
    document.getElementById('runBtn').addEventListener('click', run);
    run();
    if (window.lucide) lucide.createIcons();
  }

  function renderTabs() {
    tabsEl.innerHTML = WEBDEV_LESSONS.map((l, i) => `<button class="lesson-tab${i === 0 ? ' active' : ''}" data-id="${l.id}">${l.icon} ${l.title}</button>`).join('');
    tabsEl.querySelectorAll('.lesson-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderLesson(WEBDEV_LESSONS.find((l) => l.id === btn.dataset.id));
      });
    });
  }

  renderTabs();
  renderLesson(WEBDEV_LESSONS[0]);
})();
