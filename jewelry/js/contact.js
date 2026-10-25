import { ready, toast } from './common.js';
import { createStage, buildPiece, makeSparkles, webglOK, THREE, lerp } from './scene-lib.js';

const cv = document.getElementById('bg3d');
if (webglOK) {
  const st = createStage(cv, { bloom: true, cam: [0, 0, 9], bloomStrength: 0.45 });
  const rings = ['gold', 'rose', 'platinum'].map((m, i) => {
    const r = buildPiece('ring', m, ['diamond', 'ruby', 'sapphire'][i]);
    r.userData.phase = i * 2.1; st.scene.add(r); return r;
  });
  const sp = makeSparkles(300, [14, 9, 6]); st.scene.add(sp);
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  st.loop((t) => {
    rings.forEach((r, i) => {
      const a = t * .25 + r.userData.phase;
      r.position.set(Math.cos(a) * 4.2, Math.sin(a * 1.3) * 1.6, Math.sin(a) * 2 - 2);
      r.rotation.set(t * .4 + i, t * .6, Math.sin(t) * .3); r.scale.setScalar(.8);
    });
    sp.userData.update(t);
    st.camera.position.x = lerp(st.camera.position.x, mouse.x * 1.5, .05); st.camera.position.y = lerp(st.camera.position.y, -mouse.y, .05);
    st.camera.lookAt(0, 0, 0);
  });
} else cv.remove();

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault(); e.target.reset(); toast('Thank you — our atelier will reply within 24 hours.');
});
ready();
