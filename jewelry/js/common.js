// Shared chrome: nav, footer, loader, page transitions, smooth scroll, cursor, reveals.
const PAGES = [
  ['index.html', 'Home'], ['collections.html', 'Collections'], ['atelier.html', 'Atelier'],
  ['story.html', 'Our Story'], ['contact.html', 'Contact'],
];
const here = location.pathname.split('/').pop() || 'index.html';
const gemSVG = `<svg viewBox="0 0 64 64" fill="none" stroke="#e9c476" stroke-width="2" stroke-linejoin="round"><path d="M16 8h32l12 16-28 34L4 24z"/><path d="M4 24h56M22 24l10 34 10-34M16 8l6 16 10-16 10 16 6-16"/></svg>`;
const { gsap } = window;
gsap.registerPlugin(ScrollTrigger);

/* ── inject chrome ── */
document.body.insertAdjacentHTML('afterbegin', `
  <div class="loader"><div><div class="gem-svg">${gemSVG}</div><div class="pct">0</div></div></div>
  <div class="curtain">${'<i></i>'.repeat(5)}</div>
  <div class="cursor"></div><div class="cursor-dot"></div><div class="grain"></div><div class="toast"></div>
  <header class="nav"><div class="wrap">
    <a class="logo" href="index.html">${gemSVG}Jewelry</a>
    <ul>${PAGES.map(([h, n]) => `<li><a href="${h}" class="${h === here ? 'active' : ''}">${n}</a></li>`).join('')}</ul>
    <button class="burger" aria-label="Menu"><i></i><i></i></button>
  </div></header>`);
document.body.insertAdjacentHTML('beforeend', `
  <footer><div class="wrap">
    <div class="cols">
      <div><a class="logo" href="index.html">${gemSVG}Jewelry</a><p class="lead" style="margin-top:1.2rem">Fine jewellery, cut from light. Handcrafted in gold, platinum and the world's rarest stones.</p></div>
      <div><h4>Explore</h4><ul>${PAGES.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div>
      <div><h4>Collections</h4><ul><li><a href="collections.html">Rings</a></li><li><a href="collections.html">Necklaces</a></li><li><a href="collections.html">Earrings</a></li><li><a href="collections.html">Bracelets</a></li></ul></div>
      <div><h4>Visit</h4><ul><li>12 Gold Lane, Jaipur</li><li>hello@jewelry.example</li><li>+91 00000 00000</li></ul></div>
    </div>
    <div class="copy-line"><span>© ${new Date().getFullYear()} Jewelry. All rights reserved.</span><span>Built with Three.js · GSAP · Lenis</span></div>
  </div></footer>`);

export const toast = (msg) => {
  const t = document.querySelector('.toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800);
};

/* ── smooth scroll ── */
let lenis = null;
if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export { lenis };

/* ── nav behaviour ── */
const nav = document.querySelector('.nav'), burger = document.querySelector('.burger'), menu = nav.querySelector('ul');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY; nav.classList.toggle('scrolled', y > 40);
  nav.classList.toggle('hide', y > lastY && y > 400 && !menu.classList.contains('open')); lastY = y;
}, { passive: true });
burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };

/* ── page transitions (curtain wipe) ── */
const bars = gsap.utils.toArray('.curtain i');
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]'); if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || a.target || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  menu.classList.remove('open'); burger.classList.remove('open');
  gsap.set('.curtain', { pointerEvents: 'all' });
  gsap.fromTo(bars, { yPercent: -101 }, { yPercent: 0, duration: .7, ease: 'power4.inOut', stagger: .06, onComplete: () => (location.href = href) });
});
addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(bars, { yPercent: 101 }); });

/* ── cursor + sparkle trail ── */
const cur = document.querySelector('.cursor'), dot = document.querySelector('.cursor-dot');
if (matchMedia('(hover: hover)').matches) {
  const cx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  let lastTrail = 0;
  addEventListener('pointermove', (e) => {
    cur.style.opacity = dot.style.opacity = 1;
    cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY);
    const now = performance.now();
    if (now - lastTrail > 55) { // little diamond sparks fall from the pointer
      lastTrail = now;
      const s = document.createElement('i'); s.className = 'trail'; document.body.appendChild(s);
      gsap.fromTo(s, { x: e.clientX, y: e.clientY, scale: gsap.utils.random(.6, 1.6), rotate: gsap.utils.random(0, 90) },
        { y: e.clientY + gsap.utils.random(20, 60), x: e.clientX + gsap.utils.random(-25, 25), scale: 0, opacity: 0, duration: .9, ease: 'power2.out', onComplete: () => s.remove() });
    }
  });
  document.addEventListener('pointerover', (e) => cur.classList.toggle('big', !!e.target.closest('a, button, .card, .sw, .chip, canvas')));
}

/* ── magnetic buttons ── */
document.querySelectorAll('.btn, .logo').forEach((el) => {
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4 }); });
  el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }));
});

/* ── text split + reveals ── */
function splitWords(el) {
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w.trim()) { f.append(w); return; }
        const o = document.createElement('span'); o.className = 'w'; const i = document.createElement('span'); i.textContent = w; o.append(i); f.append(o);
      });
      n.replaceWith(f);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el); el.classList.add('split');
  // background-clip text can't survive a transformed child: move the gold gradient onto each word
  el.querySelectorAll('.gold-text').forEach((g) => { g.classList.remove('gold-text'); g.querySelectorAll('.w > span').forEach((s) => s.classList.add('gold-text')); });
}
export function initReveals() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (!el.classList.contains('split')) splitWords(el);
    gsap.to(el.querySelectorAll('.w > span'), { yPercent: -110, duration: 1.2, ease: 'power4.out', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: +el.dataset.delay || 0, scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%' }, onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString() + (el.dataset.suffix || '')) });
  });
}

/* ── loader → intro ── */
export function ready(onIntro) {
  const pct = document.querySelector('.loader .pct'), o = { v: 0 };
  gsap.set(bars, { yPercent: 0 });
  gsap.to(o, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => (pct.textContent = Math.round(o.v)),
    onComplete: () => {
      gsap.to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut', onComplete: () => document.querySelector('.loader').remove() });
      gsap.set('.curtain', { pointerEvents: 'none' });
      gsap.to(bars, { yPercent: 101, duration: .8, ease: 'power4.inOut', stagger: .05, delay: .1 });
      gsap.from('.nav', { yPercent: -100, opacity: 0, duration: 1, delay: .5, ease: 'power3.out' });
      initReveals(); onIntro && onIntro();
    } });
}
