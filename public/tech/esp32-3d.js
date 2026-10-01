import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const mount = document.getElementById('threeMount');
const loadingEl = document.getElementById('threeLoading');
if (mount) init();

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
  const spriteHeight = 0.27;
  sprite.scale.set(spriteHeight * (w / h), spriteHeight, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function pinColor(pin) {
  const t = pin.tags || [];
  if (t.some((x) => x.includes('Do not use') || x.includes('Not 5V'))) return 0xfb7185;
  if (t.includes('Onboard LED')) return 0xfbbf24;
  if (t.some((x) => x.startsWith('ADC'))) return 0x34d399;
  if (t.includes('Input only')) return 0xf472b6;
  return 0x6ee7ff;
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(4.6, 5.4, 6.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  mount.appendChild(renderer.domElement);

  // Real-feeling PBR reflections on the RF shield, USB shell, and pins,
  // generated cheaply from a lit "room" instead of loading an external HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 3.5; controls.maxDistance = 13;
  controls.autoRotate = true; controls.autoRotateSpeed = 1.6;
  controls.target.set(0, 0.1, 0);
  ['pointerdown', 'wheel'].forEach((evt) => renderer.domElement.addEventListener(evt, () => { controls.autoRotate = false; }, { once: true }));

  // Lighting — a soft 3-point rig; the environment map above now carries most
  // of the ambient/reflection load, so these stay focused on shape + sparkle.
  scene.add(new THREE.HemisphereLight(0xcfe6f0, 0x0a0e14, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.75); key.position.set(5, 8, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfe3ff, 0.45); fill.position.set(-4, 3, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xaed4e6, 0.9); rim.position.set(-6, 4, -5); scene.add(rim);

  const board = new THREE.Group();
  scene.add(board);

  // --- PCB (narrow and long, like a real DevKit V1 -- black solder mask, matching the real board) ---
  const BW = 2.6, BD = 6.3, BT = 0.14;

  // Soft contact shadow, grounding the board so it doesn't float.
  const groundShadow = makeGroundShadow(BD * 1.4, BD * 1.4);
  groundShadow.position.y = -0.35;
  board.add(groundShadow);

  const pcb = new THREE.Mesh(new RoundedBoxGeometry(BW, BT, BD, 3, 0.045), new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.38, metalness: 0.25, envMapIntensity: 1.1 }));
  board.add(pcb);

  // --- ESP32 module with metal RF shield can ---
  const shield = new THREE.Mesh(new RoundedBoxGeometry(1.65, 0.32, 1.85, 2, 0.03), new THREE.MeshStandardMaterial({ color: 0xb8bec9, metalness: 0.9, roughness: 0.22, envMapIntensity: 1.4 }));
  shield.position.set(0, BT / 2 + 0.16, 1.9);
  board.add(shield);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.55, envMapIntensity: 0.7 }));
  antenna.position.set(0, BT / 2 + 0.01, 2.95);
  board.add(antenna);

  // --- Micro-USB connector ---
  const usb = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.32, 0.5, 2, 0.03), new THREE.MeshStandardMaterial({ color: 0xc7cdd9, metalness: 0.8, roughness: 0.25, envMapIntensity: 1.3 }));
  usb.position.set(0, 0.22, -BD / 2 - 0.2);
  board.add(usb);

  // --- CP210x/USB bridge chip ---
  const usbChip = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.1, 0.4, 2, 0.015), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.35, envMapIntensity: 0.8 }));
  usbChip.position.set(0, BT / 2 + 0.05, -2.4);
  board.add(usbChip);

  // --- Buttons (EN + BOOT) ---
  [ -0.9, 0.9 ].forEach((x) => {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.35, envMapIntensity: 0.9 }));
    btn.position.set(x, BT / 2 + 0.05, -2.75);
    board.add(btn);
  });

  // --- Onboard LED (GPIO2) --- (bloom in the composer below makes these genuinely glow)
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.7, toneMapped: false }));
  led.position.set(0.9, BT / 2 + 0.03, -1.9);
  board.add(led);
  const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xfb7185, emissiveIntensity: 1.5, toneMapped: false }));
  pwrLed.position.set(-0.9, BT / 2 + 0.03, -1.9);
  board.add(pwrLed);

  // --- Header pins (two long side rows) ---
  const pinMeshes = [];
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.55, envMapIntensity: 0.6 });

  function addSideHeader(pins, xSide) {
    const z0 = -BD / 2 + 0.55, z1 = BD / 2 - 0.55;
    const blockLen = Math.abs(z1 - z0) + 0.3;
    const block = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.2, blockLen, 2, 0.02), headerMat);
    block.position.set(xSide, BT / 2 + 0.1, (z0 + z1) / 2);
    board.add(block);
    pins.forEach((pin, i) => {
      if (!pin) return;
      const z = pins.length === 1 ? z0 : z0 + (i * (z1 - z0)) / (pins.length - 1);
      const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.4, 16), new THREE.MeshStandardMaterial({ color: pinColor(pin), metalness: 0.7, roughness: 0.2, emissive: pinColor(pin), emissiveIntensity: 0.15, envMapIntensity: 1.2 }));
      pinMesh.position.set(xSide, BT / 2 + 0.22, z);
      pinMesh.userData.pin = pin; pinMesh.userData.baseEmissive = 0.15;
      board.add(pinMesh);
      pinMeshes.push(pinMesh);

      // Big, bold, always-readable floating label — pushed further out from the
      // board edge and raised above the pins so both stay clearly visible.
      const label = makeLabelSprite(pin.label, `#${pinColor(pin).toString(16).padStart(6, '0')}`);
      label.position.set(xSide + Math.sign(xSide) * 0.95, BT / 2 + 0.42, z);
      board.add(label);
    });
  }

  const left = [...ESP32_PINS.power.filter((p) => p.id !== 'VIN'), ...ESP32_PINS.digital.slice(0, 13)];
  const right = [ESP32_PINS.power.find((p) => p.id === 'VIN'), ...ESP32_PINS.digital.slice(13)];
  addSideHeader(left, -BW / 2 - 0.16);
  addSideHeader(right, BW / 2 + 0.16);

  // --- Raycasting ---
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
    if (moved > 6) return;
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
    led.material.emissiveIntensity = 0.9 + Math.sin(t / 500) * 0.8;
    controls.update();
    composer.render();
    if (first) { first = false; loadingEl?.classList.add('hidden'); }
  }
  requestAnimationFrame(animate);
}
