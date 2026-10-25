import { ready } from './common.js';
import { createStage, buildPiece, makeGem, makeSparkles, animatePiece, webglOK, THREE, lerp } from './scene-lib.js';

const canvas = document.getElementById('bg3d');
if (!webglOK) { canvas.remove(); ready(); } else {
  const stage = createStage(canvas, { bloom: true, cam: [0, 0.2, 7.5], bloomStrength: 0.5 });
  const { scene, camera } = stage;

  const items = {
    ring: buildPiece('ring', 'gold', 'diamond'),
    necklace: buildPiece('necklace', 'rose', 'sapphire'),
    gem: makeGem('ruby', 6),
  };
  items.gem.scale.setScalar(1.8);
  const holder = new THREE.Group(); scene.add(holder);
  Object.values(items).forEach((o) => { o.scale.multiplyScalar(0.001); holder.add(o); });
  const baseScale = { ring: 1.35, necklace: 1.25, gem: 1.8 };
  const vis = { ring: 0, necklace: 0, gem: 0 };

  const sparkles = makeSparkles(500, [14, 9, 8]); scene.add(sparkles);
  const dust = makeSparkles(120, [8, 5, 3], 0xbcd4ff); dust.userData.amp = 0.5; dust.material.uniforms.uAmp.value = 0.5; scene.add(dust);

  // which section is centred in the viewport decides which object is shown, and on which side
  const panels = [...document.querySelectorAll('[data-piece]')];
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  let intro = 0; // 0 → 1 on first load
  let active = 'ring', side = 1.0, spin = 0, scrollVel = 0, lastY = scrollY;

  stage.loop((t) => {
    const mid = innerHeight / 2;
    let best = null, bd = 1e9;
    panels.forEach((p) => { const r = p.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - mid); if (r.top < mid && r.bottom > mid && d < bd) { bd = d; best = p; } });
    const heroVisible = scrollY < innerHeight * 0.6;
    if (best) { active = best.dataset.piece; side = { left: -1, right: 1, center: 0 }[best.dataset.side]; }
    if (heroVisible) { active = 'ring'; side = 1; }
    const narrow = innerWidth < 960;

    scrollVel = lerp(scrollVel, scrollY - lastY, 0.1); lastY = scrollY;
    spin += 0.004 + Math.abs(scrollVel) * 0.0016;

    for (const k in items) {
      const o = items[k];
      vis[k] = lerp(vis[k], k === active ? 1 : 0, 0.08);
      const s = baseScale[k] * Math.max(0.0001, vis[k]) * (narrow ? 0.5 : 1) * Math.min(1, intro);
      o.scale.setScalar(s);
      o.visible = vis[k] > 0.01;
      const tx = narrow ? 0 : -side * 2.5, ty = narrow ? 2.3 : 0;
      o.position.x = lerp(o.position.x, tx, 0.06);
      o.position.y = lerp(o.position.y, ty + Math.sin(t * 1.1) * 0.12, 0.06);
      o.rotation.y = spin * (k === 'gem' ? 1.4 : 1) + mouse.x * 0.8;
      o.rotation.x = k === 'ring' ? -0.35 + mouse.y * 0.6 : (k === 'gem' ? 0.25 + mouse.y * 0.4 : mouse.y * 0.3);
      if (k !== 'gem') o.rotation.z = Math.sin(t * 0.5) * 0.05;
      animatePiece(o, t);
    }
    sparkles.userData.update(t); dust.userData.update(t * 1.3);
    sparkles.rotation.y = t * 0.02 + scrollY * 0.0002;
    sparkles.position.y = scrollY * 0.0006;
    camera.position.x = lerp(camera.position.x, mouse.x * 0.8, 0.05);
    camera.position.y = lerp(camera.position.y, 0.2 - mouse.y * 0.5, 0.05);
    camera.lookAt(0, 0, 0);
    stage.lights.warm.position.x = Math.sin(t * 0.7) * 5;
    stage.lights.cool.position.y = Math.cos(t * 0.5) * 3;
    stage.bloomPass.strength = 0.45 + Math.sin(t * 1.5) * 0.08 + Math.min(0.15, Math.abs(scrollVel) * 0.005);
  });

  ready(() => {
    const o = { v: 0 };
    gsap.to(o, { v: 1, duration: 2.2, ease: 'expo.out', onUpdate: () => (intro = o.v) });
  });
}
