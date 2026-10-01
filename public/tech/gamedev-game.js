(function () {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scoreEl = document.getElementById('gameScore');
  const stateEl = document.getElementById('gameState');
  const startBtn = document.getElementById('gameStart');

  let player, blocks, score, speed, running, keys, lastSpawn;

  function reset() {
    player = { x: W / 2 - 18, y: H - 40, w: 36, h: 20 };
    blocks = [];
    score = 0;
    speed = 2.2;
    running = true;
    lastSpawn = 0;
    stateEl.textContent = '';
  }

  keys = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  function update(dt) {
    if (!running) return;
    if (keys['ArrowLeft'] || keys['a']) player.x -= 5;
    if (keys['ArrowRight'] || keys['d']) player.x += 5;
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    lastSpawn += dt;
    if (lastSpawn > Math.max(300, 900 - score * 4)) {
      lastSpawn = 0;
      const w = 18 + Math.random() * 22;
      blocks.push({ x: Math.random() * (W - w), y: -20, w, h: w });
    }

    blocks.forEach((b) => { b.y += speed; });
    blocks = blocks.filter((b) => b.y < H + 30);

    for (const b of blocks) {
      if (player.x < b.x + b.w && player.x + player.w > b.x && player.y < b.y + b.h && player.y + player.h > b.y) {
        running = false;
        stateEl.textContent = `Game over — score ${Math.floor(score)}. Press Start to try again.`;
      }
    }

    score += dt / 100;
    speed = 2.2 + score / 40;
    scoreEl.textContent = `Score: ${Math.floor(score)}`;
  }

  function draw() {
    ctx.fillStyle = '#060708';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#6ee7ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#fb7185';
    blocks.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
    if (!running) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = now - last;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  reset();
  running = false;
  stateEl.textContent = 'Press Start to play. ← → or A/D to move, dodge the falling blocks.';
  requestAnimationFrame(loop);

  startBtn.addEventListener('click', () => { reset(); });
})();
