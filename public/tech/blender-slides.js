(function () {
  const stage = document.getElementById('slideStage');
  if (!stage || typeof BLENDER_SLIDES === 'undefined') return;

  const art = {
    nav: `<svg width="90" height="90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="42" fill="none" stroke="#fb923c" stroke-width="3" stroke-dasharray="6 6"/><path d="M60 18 A42 42 0 0 1 96 42" fill="none" stroke="#fff" stroke-width="3" marker-end="url(#navArrow)"/><defs><marker id="navArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#fff"/></marker></defs><circle cx="60" cy="60" r="5" fill="#fde68a"/></svg>`,
    house: `<svg width="90" height="90" viewBox="0 0 120 120"><polygon points="60,20 100,52 20,52" fill="#fb923c"/><rect x="30" y="52" width="60" height="46" fill="#f5ead6"/><rect x="52" y="72" width="16" height="26" fill="#7c5a3a"/></svg>`,
    table: `<svg width="90" height="90" viewBox="0 0 120 120"><rect x="15" y="35" width="90" height="14" rx="2" fill="#f5ead6"/><rect x="22" y="49" width="8" height="45" fill="#c9a876"/><rect x="90" y="49" width="8" height="45" fill="#c9a876"/></svg>`,
    chair: `<svg width="90" height="90" viewBox="0 0 120 120"><rect x="34" y="18" width="52" height="42" rx="3" fill="#c4b5fd"/><rect x="30" y="60" width="60" height="12" rx="2" fill="#ddd6fe"/><rect x="32" y="72" width="8" height="28" fill="#a78bfa"/><rect x="80" y="72" width="8" height="28" fill="#a78bfa"/></svg>`,
    pen: `<svg width="90" height="90" viewBox="0 0 120 120"><path d="M35 55 L85 55 L78 100 L42 100 Z" fill="#7dd3fc" opacity="0.9"/><ellipse cx="60" cy="55" rx="25" ry="7" fill="#38bdf8"/><rect x="66" y="15" width="8" height="55" rx="3" fill="#fde68a" transform="rotate(8 70 42)"/></svg>`,
    lamp: `<svg width="90" height="90" viewBox="0 0 120 120"><path d="M35 40 L85 40 L72 78 L48 78 Z" fill="#fde68a"/><rect x="57" y="78" width="6" height="24" fill="#e5e7eb"/><ellipse cx="60" cy="104" rx="26" ry="8" fill="#1f2937"/></svg>`,
  };

  // Recreates the real deck's cover art: a big yellow blob, an orange amoeba
  // shape and mint ring top-left, a sage leaf + orange dot top-right, scattered
  // navy dots, and loose dashed doodle loops — matching the actual PDF slides.
  const COVER_BG = `<svg class="slide-bg-art" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M60,150 Q40,110 75,85 Q115,60 155,80 Q180,95 165,125 Q185,145 155,165 Q120,185 85,175 Q55,168 60,150Z" fill="#e8654f"/>
    <circle cx="118" cy="128" r="62" fill="none" stroke="#bfe3d9" stroke-width="2.5" opacity=".75"/>
    <g fill="#22314a" opacity=".85">
      <circle cx="128" cy="192" r="3"/><circle cx="142" cy="198" r="3"/><circle cx="156" cy="192" r="3"/><circle cx="118" cy="206" r="3"/><circle cx="134" cy="212" r="3"/><circle cx="150" cy="210" r="3"/><circle cx="165" cy="204" r="3"/><circle cx="124" cy="222" r="3"/><circle cx="140" cy="226" r="3"/><circle cx="156" cy="222" r="3"/>
    </g>
    <path d="M195,168 Q170,215 210,255 Q255,290 320,270 Q385,250 400,195 Q412,140 375,100 Q338,60 280,68 Q222,76 200,120 Q188,142 195,168Z" fill="#eadf42"/>
    <circle cx="512" cy="46" r="26" fill="#e8654f"/>
    <path d="M470,60 Q500,20 545,35 Q585,50 575,95 Q567,125 530,120 Q495,116 480,90 Q470,75 470,60Z" fill="#8fbfa0" opacity=".9"/>
    <g fill="none" stroke="#e8654f" stroke-width="2" stroke-dasharray="5 5" opacity=".8">
      <path d="M430,148 Q460,130 480,155 Q495,175 475,190"/>
      <circle cx="500" cy="168" r="22"/>
    </g>
  </svg>`;
  const LOGO_HTML = `<div class="slide-logo">
    <span class="slide-logo-mark"><i></i><i></i></span>
    <span class="slide-logo-text"><b>THE TECH<br/>ACADEMY</b><small>a brand of Gamify Limited</small></span>
  </div>`;

  // Matches each real content slide's corner decoration: a scattered dot
  // cluster (sage on intro steps, gold on build steps) top-left, and a solid
  // orange "melted corner" shape top-right.
  function dotCluster(color) {
    const c = color === 'gold' ? '#eadf42' : '#8fbfa0';
    let dots = '';
    let seed = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        seed = (seed * 9301 + 49297) % 233280;
        const jitter = (seed / 233280 - 0.5) * 8;
        if ((row + col) % 3 === 2) continue;
        dots += `<circle cx="${12 + col * 18 + jitter}" cy="${10 + row * 18 + jitter}" r="3.2" fill="${c}"/>`;
      }
    }
    return `<svg class="slide-dot-cluster" viewBox="0 0 100 56" aria-hidden="true">${dots}</svg>`;
  }
  const CORNER_BG = `<svg class="slide-corner-art" viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true"><path d="M430,0 L600,0 L600,150 Q560,175 520,145 Q490,115 500,75 Q505,35 470,15 Q450,4 430,0Z" fill="#e8654f"/></svg>`;

  // Recreates the real deck's annotated "screenshot" callouts: a bordered dark
  // viewport panel holding a simplified render of the shape being built.
  function viewportPanel(p) {
    const borderColor = { orange: '#e8654f', yellow: '#eadf42', coral: '#f2a08c' }[p.border] || '#e8654f';
    return `<div class="slide-panel" style="border-color:${borderColor}">
      <div class="slide-panel-grid"></div>
      ${art[p.icon || 'nav'] || ''}
      ${p.badge ? `<span class="panel-badge" style="background:${borderColor}">${p.badge}</span>` : ''}
    </div>`;
  }

  let i = 0;
  const total = BLENDER_SLIDES.length;

  function render() {
    const s = BLENDER_SLIDES[i];
    let inner;
    if (s.kind === 'cover' || s.kind === 'thanks') {
      inner = `${COVER_BG}<div class="slide-cover">
        <span class="slide-deck-badge">Deck ${s.deck} of 3</span>
        <h2>${s.kind === 'thanks' ? '🎉 ' : ''}${s.title}${s.kind === 'thanks' ? ' 🎉' : ''}</h2>
        <p>${s.subtitle}</p>
      </div>${LOGO_HTML}`;
    } else if (s.kind === 'special') {
      inner = `${dotCluster('gold')}${CORNER_BG}<div class="slide-cover">
        <h2>🌟 ${s.title}</h2>
        <p>${s.subtitle}</p>
      </div>`;
    } else {
      const panelsHtml = s.panels && s.panels.length
        ? `<div class="slide-panels ${s.panelLayout === 'row' ? 'row' : ''}">${s.panels.map((p) => viewportPanel({ ...p, icon: p.icon || s.art })).join('')}</div>`
        : `<div class="slide-art">${art[s.art] || ''}</div>`;
      inner = `${dotCluster(s.dots)}${CORNER_BG}<div class="slide-content">
        <div class="slide-text">
          <span class="slide-deck-badge">Deck ${s.deck}</span>
          <h3>${s.title}</h3>
          <ul>${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
        </div>
        ${panelsHtml}
      </div>`;
    }
    stage.innerHTML = inner;
    document.getElementById('slideCounter').textContent = `Slide ${i + 1} of ${total}`;
    document.getElementById('slidePrev').disabled = i === 0;
    document.getElementById('slideNext').disabled = i === total - 1;
    const dots = document.getElementById('slideDots');
    if (dots) dots.querySelectorAll('span').forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function renderDots() {
    const dots = document.getElementById('slideDots');
    if (!dots) return;
    dots.innerHTML = BLENDER_SLIDES.map((s, idx) => `<span data-i="${idx}" title="${s.title}"></span>`).join('');
    dots.querySelectorAll('span').forEach((d) => d.addEventListener('click', () => { i = parseInt(d.dataset.i, 10); render(); }));
  }

  document.getElementById('slideNext').addEventListener('click', () => { if (i < total - 1) { i++; render(); } });
  document.getElementById('slidePrev').addEventListener('click', () => { if (i > 0) { i--; render(); } });
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('slideStage')) return;
    if (e.key === 'ArrowRight') document.getElementById('slideNext').click();
    if (e.key === 'ArrowLeft') document.getElementById('slidePrev').click();
  });

  renderDots();
  render();
})();
