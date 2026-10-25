import { ready, toast } from './common.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStage, buildPiece, disposeObject, makeSparkles, animatePiece, webglOK, METALS, GEMS, PIECES, THREE } from './scene-lib.js';

const q = new URLSearchParams(location.search);
const state = {
  piece: PIECES[q.get('piece')] ? q.get('piece') : 'ring',
  metal: METALS[q.get('metal')] ? q.get('metal') : 'gold',
  gem: GEMS[q.get('gem')] ? q.get('gem') : 'diamond',
  size: 1,
};
const $ = (id) => document.getElementById(id);
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

$('pieces').innerHTML = Object.entries(PIECES).map(([k, v]) => `<button data-k="${k}">${v.name}</button>`).join('');
$('metals').innerHTML = Object.entries(METALS).map(([k, v]) => `<button class="sw" title="${v.name}" data-k="${k}" style="background:linear-gradient(135deg,#fff8,${hex(v.color)} 45%,#0006)"></button>`).join('');
$('gems').innerHTML = Object.entries(GEMS).map(([k, v]) => `<button class="sw" title="${v.name}" data-k="${k}" style="background:radial-gradient(circle at 30% 30%,#fff,${hex(v.color)} 55%,#000a)"></button>`).join('');

function price() {
  return Math.round((METALS[state.metal].price + GEMS[state.gem].price * state.size ** 2.2) * PIECES[state.piece].base / 10) * 10;
}
function ui() {
  $('pieces').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === state.piece));
  $('metals').querySelectorAll('.sw').forEach((b) => b.classList.toggle('on', b.dataset.k === state.metal));
  $('gems').querySelectorAll('.sw').forEach((b) => b.classList.toggle('on', b.dataset.k === state.gem));
  $('l-piece').textContent = PIECES[state.piece].name; $('l-metal').textContent = METALS[state.metal].name;
  $('l-gem').textContent = GEMS[state.gem].name; $('l-size').textContent = (state.size ** 2.2 * 1.0).toFixed(2) + ' ct';
  const to = { v: +$('price').dataset.v || 0 }, end = price();
  gsap.to(to, { v: end, duration: .6, onUpdate: () => { $('price').textContent = '$' + Math.round(to.v).toLocaleString(); $('price').dataset.v = to.v; } });
}

let stage, current, controls;
function rebuild() {
  if (!stage) return;
  const old = current;
  current = buildPiece(state.piece, state.metal, state.gem, state.size);
  const base = { bracelet: 1.2, necklace: 1.15, ring: 1.5, earrings: 1.5 }[state.piece];
  current.userData.base = base; current.position.y = state.piece === 'ring' ? -0.7 : state.piece === 'necklace' ? 0.45 : 0;
  stage.scene.add(current);
  gsap.fromTo(current.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: base, y: base, z: base, duration: 1.1, ease: 'elastic.out(1,.6)' });
  gsap.fromTo(current.rotation, { y: current.rotation.y - 1.4 }, { y: current.rotation.y, duration: 1.1, ease: 'power3.out' });
  if (old) { stage.scene.remove(old); disposeObject(old); }
}

if (webglOK) {
  stage = createStage($('view'), { bloom: true, cam: [0, 0.8, 7], bloomStrength: 0.3 });
  controls = new OrbitControls(stage.camera, $('view'));
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.06, autoRotate: true, autoRotateSpeed: 1.6, minDistance: 3.5, maxDistance: 11, enablePan: false });
  const sp = makeSparkles(260, [10, 7, 6]); stage.scene.add(sp);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshBasicMaterial({ color: 0xe9c476, transparent: true, opacity: .06 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2; stage.scene.add(floor);
  rebuild();
  stage.loop((t) => { controls.update(); sp.userData.update(t); animatePiece(current, t); floor.material.opacity = .05 + Math.sin(t * 2) * .015; });
  controls.addEventListener('start', () => (controls.autoRotate = false));
  controls.addEventListener('end', () => setTimeout(() => (controls.autoRotate = true), 2500));
} else $('view').parentElement.insertAdjacentHTML('beforeend', '<p class="hint" style="top:50%">WebGL is required for the 3D configurator.</p>');

$('pieces').onclick = (e) => { const b = e.target.closest('button'); if (b) { state.piece = b.dataset.k; ui(); rebuild(); } };
$('metals').onclick = (e) => { const b = e.target.closest('.sw'); if (b) { state.metal = b.dataset.k; ui(); rebuild(); } };
$('gems').onclick = (e) => { const b = e.target.closest('.sw'); if (b) { state.gem = b.dataset.k; ui(); rebuild(); } };
let rb; $('size').oninput = (e) => { state.size = +e.target.value; ui(); clearTimeout(rb); rb = setTimeout(rebuild, 120); };
$('bloom').oninput = (e) => { if (stage) stage.bloomPass.strength = +e.target.value; };
$('add').onclick = () => toast(`Added: ${GEMS[state.gem].name} ${PIECES[state.piece].name} in ${METALS[state.metal].name} — $${price().toLocaleString()}`);
$('snap').onclick = () => {
  if (!stage) return;
  stage.render();
  const a = document.createElement('a'); a.download = `jewelry-${state.piece}.png`; a.href = stage.canvas.toDataURL('image/png'); a.click();
  toast('Snapshot saved');
};
ui();
ready(() => gsap.from('.panel-ui > *', { opacity: 0, x: 40, duration: 1, stagger: .07, ease: 'power3.out' }));
