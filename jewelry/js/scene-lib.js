// Shared Three.js helpers: stage, jewellery builders, sparkles.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };

export const METALS = {
  gold:     { name: 'Yellow Gold', color: 0xf0c060, price: 1200 },
  rose:     { name: 'Rose Gold',   color: 0xe9a38c, price: 1100 },
  platinum: { name: 'Platinum',    color: 0xe3e6ee, price: 1800 },
};
export const GEMS = {
  diamond:  { name: 'Diamond',  color: 0xeaf6ff, price: 3200, ior: 2.4 },
  ruby:     { name: 'Ruby',     color: 0xe0102f, price: 2100, ior: 1.77 },
  sapphire: { name: 'Sapphire', color: 0x2350ff, price: 1900, ior: 1.77 },
  emerald:  { name: 'Emerald',  color: 0x0fb06a, price: 2300, ior: 1.58 },
  amethyst: { name: 'Amethyst', color: 0x9b4dff, price: 900,  ior: 1.55 },
};
export const PIECES = {
  ring:     { name: 'Ring',     base: 1.0 },
  necklace: { name: 'Necklace', base: 1.6 },
  earrings: { name: 'Earrings', base: 1.3 },
  bracelet: { name: 'Bracelet', base: 1.45 },
};

export const webglOK = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
})();

/* ───────────── stage ───────────── */
export function createStage(canvas, { bloom = false, fov = 38, cam = [0, 0.4, 6], bloomStrength = 0.55, pixelRatio = 2 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(...cam);

  // coloured accent lights so facets throw warm / cool sparks
  const warm = new THREE.PointLight(0xffc680, 40, 20); warm.position.set(3, 3, 4);
  const cool = new THREE.PointLight(0x8fb4ff, 30, 20); cool.position.set(-4, -1, 3);
  const rim  = new THREE.PointLight(0xffffff, 25, 20); rim.position.set(0, 4, -4);
  scene.add(warm, cool, rim);

  let composer = null, bloomPass = null;
  if (bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomStrength, 0.7, 0.82);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  const stage = { renderer, scene, camera, composer, bloomPass, lights: { warm, cool, rim }, canvas };

  function resize() {
    const host = canvas.parentElement && canvas.parentElement !== document.body ? canvas : canvas;
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  stage.render = () => (composer ? composer.render() : renderer.render(scene, camera));

  // render loop that sleeps while off-screen / tab hidden
  stage.loop = (tick) => {
    const clock = new THREE.Clock();
    let visible = true, running = false;
    const frame = () => {
      if (!visible || document.hidden) { running = false; return; }
      requestAnimationFrame(frame);
      tick(clock.getElapsedTime(), Math.min(clock.getDelta(), 0.05));
      stage.render();
    };
    const kick = () => { if (!running && visible && !document.hidden) { running = true; frame(); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(canvas);
    document.addEventListener('visibilitychange', kick);
    kick();
  };
  return stage;
}

/* ───────────── materials ───────────── */
export function metalMaterial(key = 'gold') {
  return new THREE.MeshStandardMaterial({ color: METALS[key].color, metalness: 1, roughness: 0.16, envMapIntensity: 1.35 });
}
export function gemMaterials(key = 'diamond') {
  const g = GEMS[key];
  const outer = new THREE.MeshPhysicalMaterial({
    color: key === 'diamond' ? 0xbfdcff : g.color, metalness: 0.15, roughness: 0.02, flatShading: true, side: THREE.DoubleSide,
    clearcoat: 1, clearcoatRoughness: 0, iridescence: key === 'diamond' ? 1 : 0.35, iridescenceIOR: 1.6,
    envMapIntensity: key === 'diamond' ? 3.2 : 2.6, transparent: true, opacity: key === 'diamond' ? 0.66 : 0.9,
    emissive: g.color, emissiveIntensity: key === 'diamond' ? 0.05 : 0.22,
  });
  // dark inner shell seen through the front faces = fake refraction depth
  const inner = new THREE.MeshStandardMaterial({
    color: g.color, metalness: 0.9, roughness: 0.05, flatShading: true, side: THREE.BackSide, envMapIntensity: 2.2,
    emissive: g.color, emissiveIntensity: 0.35,
  });
  return { outer, inner };
}

/* ───────────── gem geometry (brilliant cut) ───────────── */
export function gemGeometry(segs = 10) {
  // brilliant-cut profile (radius, height); alternate segments are nudged so facets read as kites + stars
  const rings = [[0, 0.34], [0.52, 0.34], [0.8, 0.22], [0.98, 0.06], [1, 0], [0.97, -0.04], [0.55, -0.42], [0, -0.9]];
  const nudge = [0, 0.82, 0.9, 0.97, 1, 1, 0.8, 0];
  const lift = [0, 0, -0.07, -0.03, 0, 0, 0.1, 0];
  const n = segs * 2, pos = [];
  const v = (k, j) => {
    const odd = j % 2, [r, y] = rings[k], a = (j / n) * Math.PI * 2;
    const rr = odd ? r * nudge[k] : r, yy = y + (odd ? lift[k] : 0);
    return [Math.cos(a) * rr, yy, Math.sin(a) * rr];
  };
  for (let k = 0; k < rings.length - 1; k++) for (let j = 0; j < n; j++) {
    const a = v(k, j), b = v(k, j + 1), c = v(k + 1, j), d = v(k + 1, j + 1);
    if (k === 0) pos.push(...a, ...d, ...b); // table fan (cap)
    else pos.push(...a, ...c, ...b, ...b, ...c, ...d);
  }
  // fix winding of table fan & pavilion tip by letting normals be recomputed; render DoubleSide-safe via materials
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
export function makeGem(key = 'diamond', segs = 8) {
  const geo = gemGeometry(segs);
  const { outer, inner } = gemMaterials(key);
  const g = new THREE.Group();
  const a = new THREE.Mesh(geo, outer);
  const b = new THREE.Mesh(geo, inner); b.scale.setScalar(0.94);
  g.add(b, a);
  g.userData = { outer, inner };
  return g;
}
export function setGemType(gem, key) {
  const g = GEMS[key];
  gem.userData.outer.color.set(g.color); gem.userData.outer.emissive.set(g.color);
  gem.userData.inner.color.set(g.color); gem.userData.inner.emissive.set(g.color);
  gem.userData.outer.emissiveIntensity = key === 'diamond' ? 0.05 : 0.22;
  gem.userData.outer.iridescence = key === 'diamond' ? 1 : 0.35;
  gem.userData.outer.opacity = key === 'diamond' ? 0.66 : 0.9;
}

/* ───────────── pieces ───────────── */
function prongs(metal, r = 0.46, y = 0, h = 0.5) {
  const grp = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.018, 0.04, h, 8);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const p = new THREE.Mesh(geo, metal);
    p.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    p.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22);
    grp.add(p);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), metal);
    tip.position.set(Math.cos(a) * (r - 0.06), y + h / 2, Math.sin(a) * (r - 0.06));
    grp.add(tip);
  }
  return grp;
}

function buildRing(metal, gemKey, size) {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.095, 32, 96), metal);
  g.add(band);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.16, 0.3, 24), metal);
  head.position.y = 1.08; g.add(head);
  const gem = makeGem(gemKey); gem.scale.setScalar(0.62 * size); gem.position.y = 1.5;
  const pr = prongs(metal, 0.4 * size, 1.36, 0.46); g.add(pr);
  g.add(gem);
  // tiny side stones
  for (const s of [-1, 1]) {
    const sm = makeGem(gemKey, 8); sm.scale.setScalar(0.11);
    sm.position.set(s * 0.36, 0.93, 0); sm.rotation.z = -s * 0.5; g.add(sm);
  }
  g.userData.gem = gem;
  return g;
}

function buildNecklace(metal, gemKey, size) {
  const g = new THREE.Group();
  // catenary-ish chain
  const N = 64, links = new THREE.InstancedMesh(new THREE.TorusGeometry(0.075, 0.018, 8, 16), metal, N);
  const dummy = new THREE.Object3D(), R = 1.35;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), a = Math.PI * (0.12 + 0.76 * t) + Math.PI; // lower arc
    const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.95 + 0.9 + 0.0;
    dummy.position.set(x, y, 0);
    dummy.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, a + Math.PI / 2);
    dummy.updateMatrix(); links.setMatrixAt(i, dummy.matrix);
  }
  g.add(links);
  const cap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 12, 24), metal);
  cap.position.set(0, -0.5, 0); g.add(cap);
  const gem = makeGem(gemKey); gem.scale.setScalar(0.5 * size); gem.position.y = -1.0;
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.46 * size, 0.035, 12, 40), metal);
  bezel.rotation.x = Math.PI / 2; bezel.position.y = -0.98;
  g.add(gem, bezel);
  // accent beads
  for (let i = -2; i <= 2; i++) {
    if (!i) continue;
    const s = makeGem(gemKey, 8); s.scale.setScalar(0.09);
    const a = Math.PI * 1.5 + i * 0.16; s.position.set(Math.cos(a) * R * 0.99, Math.sin(a) * R * 0.95 + 0.9, 0); g.add(s);
  }
  g.position.y = 0.2; g.userData.gem = gem;
  return g;
}

function buildEarrings(metal, gemKey, size) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 12, 40, Math.PI * 1.6), metal);
    hook.position.y = 0.95; hook.rotation.z = Math.PI * 0.2;
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), metal); stud.position.y = 0.5;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 8), metal); rod.position.y = 0.15;
    const gem = makeGem(gemKey); gem.scale.setScalar(0.4 * size); gem.position.y = -0.35;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.37 * size, 0.022, 10, 36), metal);
    halo.rotation.x = Math.PI / 2; halo.position.y = -0.35;
    e.add(hook, stud, rod, gem, halo);
    e.position.x = s * 0.9; e.userData.sway = s;
    g.add(e); (g.userData.drops ||= []).push(e);
  }
  g.userData.gem = g.children[0].children[3];
  return g;
}

function buildBracelet(metal, gemKey, size) {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 24, 96), metal); band.rotation.x = Math.PI / 2;
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.04, 16, 96), metal); band2.rotation.x = Math.PI / 2; band2.position.y = 0.2;
  const band3 = band2.clone(); band3.position.y = -0.2;
  g.add(band, band2, band3);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const gem = makeGem(gemKey, 8); gem.scale.setScalar(0.2 * size);
    gem.position.set(Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3);
    gem.rotation.set(0, -a, Math.PI / 2 * 1); gem.lookAt(gem.position.clone().multiplyScalar(2)); gem.rotateX(-Math.PI / 2);
    const bez = new THREE.Mesh(new THREE.TorusGeometry(0.17 * size, 0.02, 8, 24), metal);
    bez.position.copy(gem.position).multiplyScalar(0.98); bez.lookAt(bez.position.clone().multiplyScalar(2));
    g.add(gem, bez);
    if (i === 0) g.userData.gem = gem;
  }
  g.rotation.x = 0.9;
  return g;
}

export function buildPiece(type = 'ring', metalKey = 'gold', gemKey = 'diamond', size = 1) {
  const metal = metalMaterial(metalKey);
  const fn = { ring: buildRing, necklace: buildNecklace, earrings: buildEarrings, bracelet: buildBracelet }[type] || buildRing;
  const piece = fn(metal, gemKey, size);
  piece.userData.type = type; piece.userData.metal = metal;
  return piece;
}
export function animatePiece(piece, t) {
  piece.userData.drops?.forEach((d) => { d.rotation.z = Math.sin(t * 1.4 + d.userData.sway) * 0.12 * d.userData.sway; d.rotation.y = t * 0.6 * d.userData.sway; });
}
export function disposeObject(o) {
  o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) [].concat(c.material).forEach((m) => m.dispose()); });
}

/* ───────────── rough stone (story page) ───────────── */
export function roughStone() {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const k = 0.72 + 0.5 * Math.abs(Math.sin(v.x * 7.3 + v.y * 3.1) * Math.cos(v.z * 5.7));
    v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x6f6a62, roughness: 0.95, metalness: 0.05, flatShading: true }));
  return m;
}

/* ───────────── sparkles ───────────── */
export function makeSparkles(count = 400, spread = [9, 6, 6], color = 0xffe7a8) {
  const pos = new Float32Array(count * 3), phase = new Float32Array(count), size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - .5) * spread[0], (Math.random() - .5) * spread[1], (Math.random() - .5) * spread[2]], i * 3);
    phase[i] = Math.random(); size[i] = 0.4 + Math.random() * 1.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(devicePixelRatio, 2) }, uColor: { value: new THREE.Color(color) }, uAmp: { value: 1 } },
    vertexShader: `attribute float aPhase; attribute float aSize; uniform float uTime; uniform float uPx; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.);
        float tw = pow(.5+.5*sin(uTime*(1.2+aPhase*2.)+aPhase*40.), 6.); vA = tw;
        gl_PointSize = min(aSize * uPx * (14. + 46.*tw) * (6. / -mv.z), 70. * uPx); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAmp; varying float vA;
      void main(){ vec2 p = gl_PointCoord - .5; float d = length(p);
        float core = smoothstep(.5, 0., d); core *= core;
        float cross = max(0., 1. - abs(p.x)*16.) * max(0., 1. - abs(p.y)*2.2) + max(0., 1. - abs(p.y)*16.) * max(0., 1. - abs(p.x)*2.2);
        float a = (core*.5 + cross) * (.08 + vA) * uAmp; if (a < .01) discard; gl_FragColor = vec4(uColor * a * 1.6, a); }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.userData.update = (t) => { mat.uniforms.uTime.value = t; };
  return pts;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
