// Shared info-panel updater used by both the 2D SVG schematic and the 3D model,
// so clicking a pin in either view shows the same details.
function showPinInfo(pin) {
  const nameEl = document.getElementById('pinInfoName');
  const descEl = document.getElementById('pinInfoDesc');
  const tagsEl = document.getElementById('pinInfoTags');
  if (!nameEl || !pin) return;
  nameEl.textContent = pin.name;
  descEl.textContent = pin.desc;
  tagsEl.innerHTML = (pin.tags || []).map((t) => `<span class="pin-tag">${t}</span>`).join('');

  document.querySelectorAll('.pin-dot').forEach((el) => el.classList.toggle('active', el.dataset.pinId === pin.id));
  if (window.__setActive3DPin) window.__setActive3DPin(pin.id);
}

function findPinById(id) {
  const all = [...ARDUINO_UNO_PINS.digital, ...ARDUINO_UNO_PINS.analog, ...ARDUINO_UNO_PINS.power];
  return all.find((p) => p.id === id);
}
