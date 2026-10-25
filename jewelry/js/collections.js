import { ready } from './common.js';
import { createStage, buildPiece, makeSparkles, animatePiece, disposeObject, webglOK, THREE, METALS, GEMS } from './scene-lib.js';

const CATALOG = [
  { n: 'Aurora',  t: 'ring',     m: 'gold',     g: 'diamond',  p: 5400, tag: 'Bestseller' },
  { n: 'Celeste', t: 'necklace', m: 'platinum', g: 'sapphire', p: 6900, tag: 'New' },
  { n: 'Luna',    t: 'earrings', m: 'rose',     g: 'amethyst', p: 2800, tag: '' },
  { n: 'Ember',   t: 'bracelet', m: 'gold',     g: 'ruby',     p: 7600, tag: 'Limited' },
  { n: 'Eden',    t: 'necklace', m: 'gold',     g: 'emerald',  p: 5900, tag: '' },
  { n: 'Solis',   t: 'ring',     m: 'rose',     g: 'ruby',     p: 4300, tag: '' },
  { n: 'Nova',    t: 'earrings', m: 'platinum', g: 'diamond',  p: 6200, tag: 'New' },
  { n: 'Marina',  t: 'bracelet', m: 'platinum', g: 'sapphire', p: 8100, tag: '' },
  { n: 'Verdant', t: 'ring',     m: 'platinum', g: 'emerald',  p: 5100, tag: '' },
  { n: 'Dusk',    t: 'necklace', m: 'rose',     g: 'amethyst', p: 3400, tag: '' },
  { n: 'Halo',    t: 'earrings', m: 'gold',     g: 'diamond',  p: 4700, tag: 'Bestseller' },
  { n: 'Regal',   t: 'bracelet', m: 'rose',     g: 'diamond',  p: 9200, tag: '' },
];
const grid = document.getElementById('grid');
grid.innerHTML = CATALOG.map((c, i) => `
  <a class="card" data-type="${c.t}" href="atelier.html?piece=${c.t}&metal=${c.m}&gem=${c.g}">
    ${c.tag ? `<span class="tag">${c.tag}</span>` : ''}
    <div class="stage"><canvas data-i="${i}"></canvas><div class="glare"></div></div>
    <div class="meta"><div><small>${GEMS[c.g].name} · ${METALS[c.m].name}</small><h3>${c.n} ${c.t[0].toUpperCase() + c.t.slice(1, c.t.endsWith('s') ? -1 : undefined)}</h3></div><div class="price">$${c.p.toLocaleString()}</div></div>
  </a>`).join('');

if (webglOK) {
  // one small live scene per card; each sleeps when off-screen
  document.querySelectorAll('.card canvas').forEach((cv) => {
    const c = CATALOG[+cv.dataset.i];
    const st = createStage(cv, { fov: 36, cam: [0, 0.3, 6.2], pixelRatio: 1.5 });
    const piece = buildPiece(c.t, c.m, c.g); piece.scale.setScalar(c.t === 'bracelet' ? 1.15 : 1.25);
    if (c.t === 'ring') piece.position.y = -0.55;
    st.scene.add(piece);
    const card = cv.closest('.card'); let hover = 0, tx = 0, ty = 0;
    card.addEventListener('pointerenter', () => (hover = 1));
    card.addEventListener('pointerleave', () => { hover = 0; tx = ty = 0; card.style.transform = ''; });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tx = x - .5; ty = y - .5;
      card.style.transform = `perspective(900px) rotateY(${tx * 14}deg) rotateX(${-ty * 14}deg) translateZ(0)`;
      card.style.setProperty('--gx', x * 100 + '%'); card.style.setProperty('--gy', y * 100 + '%');
    });
    let spin = Math.random() * 6, sp = 0.01;
    st.loop((t) => {
      sp += ((hover ? 0.035 : 0.008) - sp) * 0.08; spin += sp;
      piece.rotation.y = spin + tx * 1.2; piece.rotation.x = (c.t === 'ring' ? -.3 : 0) + ty * .5;
      animatePiece(piece, t);
    });
  });
  // page background: slow drifting sparkles
  const bg = createStage(document.getElementById('bg3d'), { cam: [0, 0, 8] });
  const sp = makeSparkles(380, [16, 10, 6]); bg.scene.add(sp);
  bg.loop((t) => { sp.userData.update(t); sp.rotation.y = t * .02; sp.position.y = scrollY * .001; });
} else document.getElementById('bg3d').remove();

/* filters */
const cards = [...document.querySelectorAll('.card')];
document.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
  cards.forEach((c) => { const show = b.dataset.f === 'all' || c.dataset.type === b.dataset.f; c.classList.toggle('gone', !show);
    if (show) gsap.fromTo(c, { opacity: 0, y: 40, scale: .95 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out' }); });
  ScrollTrigger.refresh();
}));
ready(() => gsap.from('.card', { opacity: 0, y: 70, duration: 1.1, ease: 'power3.out', stagger: .07, delay: .1 }));
