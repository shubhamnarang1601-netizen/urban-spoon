import { ready } from './common.js';
import { createStage, buildPiece, makeGem, roughStone, makeSparkles, webglOK, THREE, lerp, smooth, clamp01 } from './scene-lib.js';

const cv = document.getElementById('bg3d');
if (!webglOK) { cv.remove(); ready(); } else {
  const st = createStage(cv, { bloom: true, cam: [0, 0.3, 7], bloomStrength: 0.4 });
  const rock = roughStone(); st.scene.add(rock);
  const gem = makeGem('diamond', 7); st.scene.add(gem);
  const ring = buildPiece('ring', 'gold', 'diamond'); st.scene.add(ring);
  const sp = makeSparkles(450, [12, 8, 8]); st.scene.add(sp);
  const burst = makeSparkles(250, [3, 3, 3], 0xfff1c9); st.scene.add(burst);

  const chapters = [...document.querySelectorAll('.chapter')];
  const section = document.getElementById('story'), bar = document.querySelector('.progress i');
  let P = 0;
  const ringGem = ring.userData.gem; ringGem.visible = false;

  const update = () => {
    const r = section.getBoundingClientRect();
    P = clamp01(-r.top / (r.height - innerHeight));
    bar.style.height = P * 100 + '%';
    const n = chapters.length;
    chapters.forEach((c, i) => {
      const lo = i / n, hi = (i + 1) / n, local = (P - lo) / (hi - lo);
      const o = local < 0 || local > 1 ? 0 : Math.min(smooth(0, .18, local), 1 - smooth(.82, 1, local));
      c.style.opacity = o; c.style.transform = `translateY(${(0.5 - local) * 40}px)`;
    });
  };
  addEventListener('scroll', update, { passive: true });
  update();

  let spin = 0;
  st.loop((t) => {
    spin += 0.006;
    const narrow = innerWidth < 960, yOff = narrow ? 1.3 : 0;
    // chapter windows
    const toGem = smooth(0.18, 0.38, P), toRing = smooth(0.5, 0.68, P), finish = smooth(0.78, 0.95, P);
    // 1 rough stone → 2 gem
    rock.visible = toGem < 0.99;
    rock.scale.setScalar(1.45 * (1 - toGem) + 0.001); rock.rotation.set(t * .2, spin, 0);
    // gem appears, then shrinks into ring
    const gemS = toGem * (1.7 - toRing * 1.05);
    gem.visible = gemS > 0.01 && toRing < 1; gem.scale.setScalar(Math.max(gemS, 0.001));
    gem.position.y = lerp(0, 1.5 * 1.35 - 0.4, toRing) + yOff;
    gem.rotation.set(0.3 * (1 - toRing), spin * 1.6, 0);
    // ring assembles
    ring.visible = toRing > 0.01;
    ring.scale.setScalar(Math.max(1.35 * toRing, 0.001));
    ring.position.y = -0.4 * toRing + yOff;
    rock.position.y = yOff;
    ring.rotation.set(-0.35 + finish * 0.35, spin * (1 - finish * 0.5) + finish * 0.8, 0);
    // after assembly the standalone gem is replaced by the ring's own stone
    ringGem.visible = toRing >= 0.999; if (ringGem.visible) gem.visible = false;
    // horizontal composition against the text
    const side = narrow ? 0 : (P < .25 ? 1 : P < .5 ? -1 : P < .75 ? 1 : -1);
    const tx = side * 2.4 * (narrow ? 0 : 1);
    [rock, gem, ring].forEach((o) => (o.position.x = lerp(o.position.x, tx, 0.06)));
    burst.position.set(ring.position.x, 0.8 + yOff, 0);
    burst.userData.update(t * 3); burst.material.uniforms.uAmp.value = finish * 1.6;
    burst.rotation.y = t * .6;
    sp.userData.update(t); sp.rotation.y = t * .03;
    st.bloomPass.strength = 0.3 + toGem * 0.25 + finish * 0.5;
    st.camera.position.z = lerp(7.5, 6, P); st.camera.lookAt(0, 0, 0);
  });
  ready();
}
