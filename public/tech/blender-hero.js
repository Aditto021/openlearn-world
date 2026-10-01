import * as THREE from 'three';

const mount = document.getElementById('blenderHeroMount');
if (mount) init();

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0.6, 5.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffb347, 0x0a0e14, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 5, 3);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  // A stylized rotating primitive cluster — evokes Blender's box-modeling workflow
  const orange = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.35, metalness: 0.15, wireframe: false });
  const wire = new THREE.MeshBasicMaterial({ color: 0xfdba74, wireframe: true, transparent: true, opacity: 0.35 });

  const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.36, 140, 20), orange);
  group.add(torusKnot);
  const torusKnotWire = new THREE.Mesh(new THREE.TorusKnotGeometry(1.18, 0.38, 60, 12), wire);
  group.add(torusKnotWire);

  function onResize() {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  }
  new ResizeObserver(onResize).observe(mount);

  function animate(t) {
    requestAnimationFrame(animate);
    group.rotation.y = t / 3200;
    group.rotation.x = Math.sin(t / 5000) * 0.25;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
