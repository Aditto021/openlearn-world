import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Soft blurred contact-shadow "blob" under the board — a classic cheap product-shot
// trick that reads as grounded/premium without the cost of real shadow maps.
function makeGroundShadow(sizeX, sizeZ) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(10,14,20,0.55)');
  g.addColorStop(0.6, 'rgba(10,14,20,0.28)');
  g.addColorStop(1, 'rgba(10,14,20,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(sizeX, sizeZ), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}

const mount = document.getElementById('threeMount');
const loadingEl = document.getElementById('threeLoading');
if (!mount) { /* not on this page */ } else {
  init();
}

// Big, bold, always-legible floating pin label (a billboarded sprite drawn from a
// canvas), since Three.js has no crisp built-in text and kids need to actually
// read these without hovering.
function makeLabelSprite(text, bgColor) {
  const scale = 4;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = "800 40px 'JetBrains Mono', monospace";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 30;
  const h = 56;
  canvas.width = w * scale; canvas.height = h * scale;
  ctx.scale(scale, scale);
  ctx.font = font;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.fillStyle = '#14151a';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  const spriteHeight = 0.32;
  sprite.scale.set(spriteHeight * (w / h), spriteHeight, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function pinColor(pin) {
  if (pin.tags?.includes('PWM')) return 0xa78bfa;
  if (pin.tags?.includes('Analog In')) return 0x34d399;
  if (pin.tags?.includes('Power In') || pin.tags?.includes('Power Out') || pin.tags?.includes('Control') || pin.tags?.includes('Reference') || pin.tags?.includes('Ground')) return 0xfb7185;
  return 0x6ee7ff;
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(5.6, 5.2, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  mount.appendChild(renderer.domElement);

  // Real-feeling PBR reflections on the metal pins/chip/USB shell, generated
  // cheaply from a lit "room" instead of loading an external HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.6;
  controls.target.set(0, 0.1, 0);
  ['pointerdown', 'wheel'].forEach((evt) => renderer.domElement.addEventListener(evt, () => { controls.autoRotate = false; }, { once: true }));

  // Lighting — a soft 3-point rig; the environment map above now carries most
  // of the ambient/reflection load, so these stay focused on shape + sparkle.
  scene.add(new THREE.HemisphereLight(0x9ecbff, 0x0a0e14, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.7);
  key.position.set(5, 8, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfe3ff, 0.45);
  fill.position.set(-4, 3, 5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x6ee7ff, 0.9);
  rim.position.set(-6, 4, -5);
  scene.add(rim);

  const board = new THREE.Group();
  scene.add(board);

  // Soft contact shadow, grounding the board so it doesn't float.
  const BW = 6.86, BD = 5.33, BT = 0.16; // board width/depth/thickness (roughly Uno proportions, scaled)
  const groundShadow = makeGroundShadow(BW * 1.7, BD * 1.7);
  groundShadow.position.y = -0.35;
  board.add(groundShadow);

  // --- PCB --- (real Arduino Uno blue, not the generic-clone green), gently
  // rounded edges for a manufactured, premium-product feel instead of a raw box.
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1565a3, roughness: 0.35, metalness: 0.25, envMapIntensity: 1.1 });
  const pcb = new THREE.Mesh(new RoundedBoxGeometry(BW, BT, BD, 3, 0.05), pcbMat);
  board.add(pcb);

  // Silkscreen-ish edge trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.02, 0.02, BD + 0.02), new THREE.MeshStandardMaterial({ color: 0x2b7ec2, roughness: 0.35, metalness: 0.2 }));
  trim.position.y = BT / 2 + 0.005;
  board.add(trim);

  // --- USB connector (left edge) ---
  const usb = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.5, 1.1, 2, 0.04), new THREE.MeshStandardMaterial({ color: 0xb8bec9, metalness: 0.85, roughness: 0.25, envMapIntensity: 1.3 }));
  usb.position.set(-BW / 2 - 0.35, 0.33, 0.9);
  board.add(usb);

  // --- Barrel jack (opposite corner) ---
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.55, 32), new THREE.MeshStandardMaterial({ color: 0x15181d, metalness: 0.5, roughness: 0.4, envMapIntensity: 1.1 }));
  jack.rotation.z = Math.PI / 2;
  jack.position.set(-BW / 2 - 0.28, 0.2, -1.7);
  board.add(jack);

  // --- ATmega328P chip ---
  const chip = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.16, 0.75, 2, 0.02), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.35, envMapIntensity: 0.8 }));
  chip.position.set(0.3, BT / 2 + 0.08, 0.15);
  board.add(chip);
  const chipDot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  chipDot.rotation.x = -Math.PI / 2;
  chipDot.position.set(0.3 - 0.42, BT / 2 + 0.161, 0.15 - 0.28);
  board.add(chipDot);

  // --- Crystal oscillator ---
  const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xc7cdd9, metalness: 0.8, roughness: 0.2, envMapIntensity: 1.3 }));
  crystal.rotation.z = Math.PI / 2;
  crystal.position.set(0.95, BT / 2 + 0.09, -0.1);
  board.add(crystal);

  // --- Reset button ---
  const resetBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.35, envMapIntensity: 0.9 }));
  resetBtn.position.set(1.55, BT / 2 + 0.06, 1.9);
  board.add(resetBtn);

  // --- Onboard LEDs --- (bloom in the composer below makes these genuinely glow)
  const ledMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.8, toneMapped: false });
  const led13 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), ledMat);
  led13.position.set(1.9, BT / 2 + 0.03, 1.4);
  board.add(led13);
  const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.6, toneMapped: false }));
  pwrLed.position.set(-1.4, BT / 2 + 0.03, 1.4);
  board.add(pwrLed);

  // --- Header blocks + pins ---
  const pinMeshes = [];
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.55, envMapIntensity: 0.6 });

  function addHeaderRow(pins, x0, x1, z, depthSign) {
    const blockLen = Math.abs(x1 - x0) + 0.3;
    const block = new THREE.Mesh(new RoundedBoxGeometry(blockLen, 0.22, 0.34, 2, 0.02), headerMat);
    block.position.set((x0 + x1) / 2, BT / 2 + 0.11, z);
    board.add(block);
    pins.forEach((pin, i) => {
      const x = pins.length === 1 ? x0 : x0 + (i * (x1 - x0)) / (pins.length - 1);
      const pinGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.42, 16);
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: pinColor(pin), metalness: 0.7, roughness: 0.2, emissive: pinColor(pin), emissiveIntensity: 0.15, envMapIntensity: 1.2 }));
      pinMesh.position.set(x, BT / 2 + 0.24, z);
      pinMesh.userData.pin = pin;
      pinMesh.userData.baseEmissive = 0.15;
      board.add(pinMesh);
      pinMeshes.push(pinMesh);

      // Big, bold, always-readable floating label — raised and pushed well clear
      // of the pin row (rather than sitting right at pin height) so the pins
      // themselves stay visible as distinct pegs instead of being crowded out.
      const label = makeLabelSprite(pin.label, `#${pinColor(pin).toString(16).padStart(6, '0')}`);
      label.position.set(x, BT / 2 + 0.52, z + depthSign * 0.85);
      board.add(label);
    });
  }

  const aref = ARDUINO_UNO_PINS.power.find((p) => p.id === 'AREF');
  const gnd = ARDUINO_UNO_PINS.power.find((p) => p.id === 'GND1');
  const topPins = [aref, gnd, ...[...ARDUINO_UNO_PINS.digital].reverse()];
  addHeaderRow(topPins, -BW / 2 + 0.5, BW / 2 - 0.5, -BD / 2 + 0.45, -1);

  const powerOrder = ['RESET', 'V33', 'V5', 'GND1', 'VIN'].map((id) => ARDUINO_UNO_PINS.power.find((p) => p.id === id));
  addHeaderRow(powerOrder, -BW / 2 + 0.5, -0.6, BD / 2 - 0.45, 1);

  addHeaderRow(ARDUINO_UNO_PINS.analog, 0.6, BW / 2 - 0.5, BD / 2 - 0.45, 1);

  // --- Raycasting for pin hover/click ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;

  function setHover(mesh) {
    if (hovered === mesh) return;
    if (hovered) hovered.material.emissiveIntensity = hovered.userData.baseEmissive;
    hovered = mesh;
    if (hovered) hovered.material.emissiveIntensity = 1.1;
  }

  function pointerFromEvent(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  renderer.domElement.addEventListener('pointermove', (e) => {
    pointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pinMeshes)[0];
    setHover(hit ? hit.object : null);
    renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  });

  let downPos = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (moved > 6) return; // was a drag/rotate, not a tap
    pointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pinMeshes)[0];
    if (hit) showPinInfo(hit.object.userData.pin);
  });

  window.__setActive3DPin = (pinId) => {
    const mesh = pinMeshes.find((m) => m.userData.pin.id === pinId);
    if (mesh) setHover(mesh);
  };

  // --- Post-processing: subtle bloom for the LED glow + an SMAA pass to keep
  // edges crisp, since render-to-texture compositing bypasses native MSAA. ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.45, 0.65, 0.82);
  composer.addPass(bloomPass);
  composer.addPass(new SMAAPass(mount.clientWidth * renderer.getPixelRatio(), mount.clientHeight * renderer.getPixelRatio()));
  composer.addPass(new OutputPass());

  function onResize() {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    composer.setSize(mount.clientWidth, mount.clientHeight);
    bloomPass.resolution.set(mount.clientWidth, mount.clientHeight);
  }
  new ResizeObserver(onResize).observe(mount);

  let first = true;
  function animate(t) {
    requestAnimationFrame(animate);
    led13.material.emissiveIntensity = 1.0 + Math.sin(t / 380) * 0.9;
    controls.update();
    composer.render();
    if (first) { first = false; loadingEl?.classList.add('hidden'); }
  }
  requestAnimationFrame(animate);
}
