// Renders the flat 2D schematic of the ESP32 DevKit V1 into #esp32Svg.
(function () {
  const svg = document.getElementById('esp32Svg');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const colorFor = (pin) => {
    const t = pin.tags || [];
    if (t.some((x) => x.includes('Do not use'))) return '#fb7185';
    if (t.some((x) => x.includes('Not 5V'))) return '#fb7185';
    if (t.includes('Onboard LED')) return '#fbbf24';
    if (t.some((x) => x.startsWith('ADC'))) return '#34d399';
    if (t.includes('Input only')) return '#f472b6';
    return '#6ee7ff';
  };

  function addPin(x, y, pin, labelSide) {
    const g = document.createElementNS(ns, 'g');
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 7);
    dot.setAttribute('fill', colorFor(pin));
    dot.setAttribute('class', 'pin-dot');
    dot.dataset.pinId = pin.id;
    dot.addEventListener('click', () => showPinInfo(pin));
    dot.addEventListener('mouseenter', () => showPinInfo(pin));
    g.appendChild(dot);

    const tx = labelSide === 'left' ? x - 16 : x + 16;
    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('class', 'pin-label-bg');
    bg.setAttribute('fill', colorFor(pin));
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', y + 4);
    text.setAttribute('text-anchor', labelSide === 'left' ? 'end' : 'start');
    text.setAttribute('class', 'pin-label');
    text.textContent = pin.label;
    // Size the highlight chip from the (monospace) character count -- getBBox() can't be
    // trusted here since this SVG starts hidden (display:none) behind the 3D view.
    const boxW = pin.label.length * 8.2 + 10;
    bg.setAttribute('x', labelSide === 'left' ? tx - boxW : tx); bg.setAttribute('y', y - 11);
    bg.setAttribute('width', boxW); bg.setAttribute('height', 18);
    bg.setAttribute('rx', 5);

    g.appendChild(bg); g.appendChild(text);
    svg.appendChild(g);
  }

  const left = [...ESP32_PINS.power.filter((p) => p.id !== 'VIN'), ...ESP32_PINS.digital.slice(0, 13)];
  const right = [ESP32_PINS.power.find((p) => p.id === 'VIN'), ...ESP32_PINS.digital.slice(13)];

  const top = 55, bottom = 400, leftX = 130, rightX = 630;
  left.forEach((pin, i) => addPin(leftX, top + (i * (bottom - top)) / (left.length - 1), pin, 'left'));
  right.forEach((pin, i) => addPin(rightX, top + (i * (bottom - top)) / (right.length - 1), pin, 'right'));
})();
