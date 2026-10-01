// Renders the flat 2D schematic of the Arduino Uno pin headers into #unoSvg.
(function () {
  const svg = document.getElementById('unoSvg');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const colorFor = (pin) => {
    if (pin.tags && pin.tags.includes('PWM')) return '#a78bfa';
    if (pin.tags && (pin.tags.includes('Analog In'))) return '#34d399';
    if (pin.tags && (pin.tags.includes('Power In') || pin.tags.includes('Power Out'))) return '#fb7185';
    return '#6ee7ff';
  };

  function addPin(group, x, y, pin, labelAbove) {
    const g = document.createElementNS(ns, 'g');
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 7);
    dot.setAttribute('fill', colorFor(pin));
    dot.setAttribute('class', 'pin-dot');
    dot.dataset.pinId = pin.id;
    dot.addEventListener('click', () => showPinInfo(pin));
    dot.addEventListener('mouseenter', () => showPinInfo(pin));
    g.appendChild(dot);

    // Highlighted, rotated label: a bold, bigger name in a bright chip so it's easy to read.
    const angle = labelAbove ? 55 : -55;
    const ty = labelAbove ? y + 16 : y - 16;
    const labelG = document.createElementNS(ns, 'g');
    labelG.setAttribute('transform', `rotate(${angle} ${x} ${ty})`);
    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('class', 'pin-label-bg');
    bg.setAttribute('fill', colorFor(pin));
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', x); text.setAttribute('y', ty);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'pin-label');
    text.textContent = pin.label;
    // Size the highlight chip from the (monospace) character count -- getBBox() can't be
    // trusted here since this SVG starts hidden (display:none) behind the 3D view.
    const boxW = pin.label.length * 8.2 + 10;
    bg.setAttribute('x', x - boxW / 2); bg.setAttribute('y', ty - 11);
    bg.setAttribute('width', boxW); bg.setAttribute('height', 18);
    bg.setAttribute('rx', 5);

    labelG.appendChild(bg);
    labelG.appendChild(text);
    g.appendChild(labelG);
    group.appendChild(g);
  }

  const digitalGroup = document.getElementById('digitalPins');
  // AREF/GND come from the `power` list; splice them in for the top header visual.
  const aref = ARDUINO_UNO_PINS.power.find((p) => p.id === 'AREF');
  const gnd = ARDUINO_UNO_PINS.power.find((p) => p.id === 'GND1');
  const topPins = [aref, gnd, ...[...ARDUINO_UNO_PINS.digital].reverse()];
  const startX = 90, endX = 670, y = 50;
  topPins.forEach((pin, i) => {
    const x = startX + (i * (endX - startX)) / (topPins.length - 1);
    addPin(digitalGroup, x, y, pin, false);
  });

  const powerGroup = document.getElementById('powerPins');
  const powerOrder = ['RESET', 'V33', 'V5', 'GND1', 'VIN'].map((id) => ARDUINO_UNO_PINS.power.find((p) => p.id === id));
  const pStartX = 90, pEndX = 300, py = 370;
  powerOrder.forEach((pin, i) => {
    const x = pStartX + (i * (pEndX - pStartX)) / (powerOrder.length - 1);
    addPin(powerGroup, x, py, pin, true);
  });

  const analogGroup = document.getElementById('analogPins');
  const aStartX = 470, aEndX = 670, ay = 370;
  ARDUINO_UNO_PINS.analog.forEach((pin, i) => {
    const x = aStartX + (i * (aEndX - aStartX)) / (ARDUINO_UNO_PINS.analog.length - 1);
    addPin(analogGroup, x, ay, pin, true);
  });
})();
