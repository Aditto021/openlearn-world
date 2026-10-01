import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// A soft ash-grey studio backdrop (radial vignette, lighter center fading to a
// deeper charcoal at the edges) — set directly as scene.background rather than
// relying on CSS behind a transparent canvas, since EffectComposer's bloom/SMAA
// passes don't reliably preserve renderer alpha, which otherwise paints solid
// black over the page's real background.
function makeStudioBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(256, 210, 40, 256, 256, 420);
  g.addColorStop(0, '#9a9ea3');
  g.addColorStop(0.55, '#7b7f85');
  g.addColorStop(1, '#45484d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

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
function makeLabelSprite(text, bgColor, sizeMul = 1) {
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
  texture.anisotropy = 8;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  const spriteHeight = 0.32 * sizeMul;
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
  scene.background = makeStudioBackground();
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
  controls.dampingFactor = 0.06;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.85;
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.6;
  controls.target.set(0, 0.1, 0);
  ['pointerdown', 'wheel'].forEach((evt) => renderer.domElement.addEventListener(evt, () => { controls.autoRotate = false; }, { once: true }));

  // Re-frames the camera around whatever is currently in `board` — called once
  // for the hand-built placeholder, and again once the real scanned model
  // (unknown exact size/proportions) loads, so neither can end up clipped
  // outside the frame or shrunk to a speck regardless of its real-world scale.
  function frameCameraToContent() {
    // Fit around the physical board/pins only — not the floating pin-label
    // sprites, which deliberately extend well outside the board for
    // legibility and would otherwise push the camera back so far the board
    // itself renders tiny in the middle of a mostly-empty frame.
    const contentBox = new THREE.Box3();
    board.traverse((obj) => { if (obj.isMesh && !obj.userData.excludeFromFraming) contentBox.expandByObject(obj); });
    if (contentBox.isEmpty()) return;
    const sphere = new THREE.Sphere();
    contentBox.getBoundingSphere(sphere);
    if (!sphere.radius || !isFinite(sphere.radius)) return;
    const fovRad = (camera.fov * Math.PI) / 180;
    const fitDistance = (sphere.radius * 1.25) / Math.sin(fovRad / 2);
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(0.5, 0.45, 0.55);
    dir.normalize();
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(dir, fitDistance);
    // Generous zoom range both ways — kids should be able to pull back for
    // the whole board or push in close enough to read one pin's label big.
    controls.minDistance = fitDistance * 0.18;
    controls.maxDistance = fitDistance * 2.4;
    camera.near = Math.max(0.05, fitDistance * 0.02);
    camera.far = fitDistance * 25;
    camera.updateProjectionMatrix();
    controls.update();
  }

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
  groundShadow.userData.excludeFromFraming = true;
  board.add(groundShadow);

  // Hand-built fallback board visuals — shown immediately, and left in place
  // if the real scanned model (loaded below) fails to fetch. Grouped so the
  // whole thing can be removed in one shot once the real model is ready.
  const fallbackBoard = new THREE.Group();
  board.add(fallbackBoard);

  // --- PCB --- (real Arduino Uno blue, not the generic-clone green), gently
  // rounded edges for a manufactured, premium-product feel instead of a raw box.
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1565a3, roughness: 0.35, metalness: 0.25, envMapIntensity: 1.1 });
  const pcb = new THREE.Mesh(new RoundedBoxGeometry(BW, BT, BD, 3, 0.05), pcbMat);
  fallbackBoard.add(pcb);

  // Silkscreen-ish edge trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.02, 0.02, BD + 0.02), new THREE.MeshStandardMaterial({ color: 0x2b7ec2, roughness: 0.35, metalness: 0.2 }));
  trim.position.y = BT / 2 + 0.005;
  fallbackBoard.add(trim);

  // --- USB connector (left edge) ---
  const usb = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.5, 1.1, 2, 0.04), new THREE.MeshStandardMaterial({ color: 0xb8bec9, metalness: 0.85, roughness: 0.25, envMapIntensity: 1.3 }));
  usb.position.set(-BW / 2 - 0.35, 0.33, 0.9);
  fallbackBoard.add(usb);

  // --- Barrel jack (opposite corner) ---
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.55, 32), new THREE.MeshStandardMaterial({ color: 0x15181d, metalness: 0.5, roughness: 0.4, envMapIntensity: 1.1 }));
  jack.rotation.z = Math.PI / 2;
  jack.position.set(-BW / 2 - 0.28, 0.2, -1.7);
  fallbackBoard.add(jack);

  // --- ATmega328P chip ---
  const chip = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.16, 0.75, 2, 0.02), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.35, envMapIntensity: 0.8 }));
  chip.position.set(0.3, BT / 2 + 0.08, 0.15);
  fallbackBoard.add(chip);
  const chipDot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  chipDot.rotation.x = -Math.PI / 2;
  chipDot.position.set(0.3 - 0.42, BT / 2 + 0.161, 0.15 - 0.28);
  fallbackBoard.add(chipDot);

  // --- Crystal oscillator ---
  const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xc7cdd9, metalness: 0.8, roughness: 0.2, envMapIntensity: 1.3 }));
  crystal.rotation.z = Math.PI / 2;
  crystal.position.set(0.95, BT / 2 + 0.09, -0.1);
  fallbackBoard.add(crystal);

  // --- Reset button ---
  const resetBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.35, envMapIntensity: 0.9 }));
  resetBtn.position.set(1.55, BT / 2 + 0.06, 1.9);
  fallbackBoard.add(resetBtn);

  // --- Onboard LEDs --- (bloom in the composer below makes these genuinely glow;
  // kept as a small overlay even once the scanned model loads, since a static
  // scan has no lit/animatable LEDs of its own)
  const ledMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.8, toneMapped: false });
  const led13 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), ledMat);
  led13.position.set(1.9, BT / 2 + 0.03, 1.4);
  board.add(led13);
  const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.6, toneMapped: false }));
  pwrLed.position.set(-1.4, BT / 2 + 0.03, 1.4);
  board.add(pwrLed);

  // --- Load the real scanned Arduino Uno model, replacing the hand-built
  // fallback once it's ready. Auto-fit by bounding box so it lines up with
  // the BW/BD footprint the pin header math below already assumes. ---
  new GLTFLoader().load(
    '/tech/models/arduino-uno.glb',
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (size.x < 1e-4 || size.z < 1e-4) return; // malformed model, keep fallback

      const scale = BW / Math.max(size.x, size.z);
      model.scale.setScalar(scale);

      const fitted = new THREE.Box3().setFromObject(model);
      const fittedSize = new THREE.Vector3();
      fitted.getSize(fittedSize);
      const center = new THREE.Vector3();
      fitted.getCenter(center);
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= fitted.min.y;

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      model.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        obj.material.envMapIntensity = 1.1;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach((slot) => {
            if (mat[slot]) { mat[slot].anisotropy = maxAniso; mat[slot].needsUpdate = true; }
          });
        });
      });

      board.remove(fallbackBoard);
      board.add(model);

      // The scanned model's real footprint rarely matches the hand-built
      // placeholder's BW/BD exactly (different aspect ratio, different
      // header height) — rebuild the pin pegs/labels against its *actual*
      // measured size so they land on its real edges instead of floating
      // off in space at the old placeholder's coordinates.
      buildPins(fittedSize.x, fittedSize.z, fittedSize.y);
    },
    undefined,
    (err) => console.warn('Arduino 3D model failed to load, showing built-in board instead:', err)
  );

  // --- Header blocks + pins --- rebuildable so they can be re-anchored to
  // the real scanned model's measured footprint once it loads (see above).
  const pinGroup = new THREE.Group();
  board.add(pinGroup);
  const pinMeshes = [];
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.55, envMapIntensity: 0.6 });

  function addHeaderRow(pins, x0, x1, z, topY, depthSign, s) {
    const blockLen = Math.abs(x1 - x0) + 0.3 * s;
    const block = new THREE.Mesh(new RoundedBoxGeometry(blockLen, 0.22 * s, 0.34 * s, 2, 0.02 * s), headerMat);
    block.position.set((x0 + x1) / 2, topY + 0.11 * s, z);
    pinGroup.add(block);

    // A dense row (the 16-pin digital header) needs its labels both smaller
    // and staggered into two height tiers, or neighboring labels overlap
    // into an unreadable smear — a wide 5-6 pin row doesn't need either.
    // Relying on perspective alone to separate them (the old approach) only
    // worked at one specific fixed camera distance; this holds up regardless
    // of how the camera ends up framing the real loaded board.
    const pitch = pins.length > 1 ? Math.abs(x1 - x0) / (pins.length - 1) : Infinity;
    const zigzag = pins.length > 8;
    const refLabelWidth = 0.77; // ~width-per-height-unit footprint of a short pin label at sizeMul=1
    const budget = (zigzag ? pitch * 2 : pitch) * 0.82;
    const labelSizeMul = s * Math.min(1, budget / (refLabelWidth * s));

    pins.forEach((pin, i) => {
      const x = pins.length === 1 ? x0 : x0 + (i * (x1 - x0)) / (pins.length - 1);
      const pinGeo = new THREE.CylinderGeometry(0.028 * s, 0.028 * s, 0.42 * s, 16);
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: pinColor(pin), metalness: 0.7, roughness: 0.2, emissive: pinColor(pin), emissiveIntensity: 0.15, envMapIntensity: 1.2 }));
      pinMesh.position.set(x, topY + 0.24 * s, z);
      pinMesh.userData.pin = pin;
      pinMesh.userData.baseEmissive = 0.15;
      pinGroup.add(pinMesh);
      pinMeshes.push(pinMesh);

      // Big, bold, always-readable floating label — raised and pushed well
      // clear of the pin row so the pins themselves stay visible as distinct
      // pegs. Odd-indexed labels in a dense row sit a further tier out, so
      // each label only competes for space with every OTHER pin, not its
      // immediate neighbor.
      const tier = zigzag ? i % 2 : 0;
      const label = makeLabelSprite(pin.label, `#${pinColor(pin).toString(16).padStart(6, '0')}`, labelSizeMul);
      label.position.set(x, topY + (0.52 + tier * 0.3) * s, z + depthSign * (0.85 + tier * 0.6) * s);
      pinGroup.add(label);
    });
  }

  function buildPins(boardW, boardD, topY) {
    pinGroup.clear();
    pinMeshes.length = 0;
    // Every offset/size below was tuned for the placeholder's BW-wide board;
    // `s` rescales all of it uniformly to match however big the real loaded
    // model actually turns out to be, so pins/labels/margins stay in the same
    // visual proportion to the board regardless of its real-world scale.
    const s = boardW / BW;
    const m = Math.min(0.5 * s, boardW * 0.08);
    const dm = Math.min(0.45 * s, boardD * 0.1);

    const aref = ARDUINO_UNO_PINS.power.find((p) => p.id === 'AREF');
    const gnd = ARDUINO_UNO_PINS.power.find((p) => p.id === 'GND1');
    const topPins = [aref, gnd, ...[...ARDUINO_UNO_PINS.digital].reverse()];
    addHeaderRow(topPins, -boardW / 2 + m, boardW / 2 - m, -boardD / 2 + dm, topY, -1, s);

    const powerOrder = ['RESET', 'V33', 'V5', 'GND1', 'VIN'].map((id) => ARDUINO_UNO_PINS.power.find((p) => p.id === id));
    addHeaderRow(powerOrder, -boardW / 2 + m, -boardW * 0.09, boardD / 2 - dm, topY, 1, s);

    addHeaderRow(ARDUINO_UNO_PINS.analog, boardW * 0.09, boardW / 2 - m, boardD / 2 - dm, topY, 1, s);
    frameCameraToContent();
  }

  buildPins(BW, BD, BT / 2);

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
