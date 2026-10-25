# JEWELRY — 3D multi-page jewellery website

A static, build-free website (no npm install needed). All libraries are vendored in `vendor/`.

## Run
```bash
cd jewelry
python3 -m http.server 8000     # or: npx serve .
# open http://localhost:8000
```
(ES modules + import maps need an HTTP server; opening the files via `file://` will not work.)

## Pages
| Page | What it does |
|---|---|
| `index.html` | Hero + scroll-driven 3D ring → ruby → necklace, bloom, sparkles, marquee, counters |
| `collections.html` | 12 live 3D product cards, filter chips, tilt + glare hover, links into the atelier |
| `atelier.html` | Live 3D configurator: piece, metal, gemstone, carat, price, snapshot (PNG) |
| `story.html` | Scroll-scrubbed story: rough stone → cut gem → set in ring → final polish |
| `contact.html` | Orbiting 3D rings background + animated form |

## Free libraries / techniques used
- **Three.js** (MIT) – procedural brilliant-cut gems, rings, chains, earrings, bracelets; PBR metals; `RoomEnvironment` reflections
- **UnrealBloomPass** post-processing – glow / VFX
- Custom **GLSL twinkling star-sparkle particles**
- **GSAP + ScrollTrigger** (free licence) – text reveals, counters, curtain page transitions, magnetic buttons
- **Lenis** (MIT) – smooth scrolling
- Custom cursor with falling diamond-spark trail, film grain, vignette

All 3D models are generated in code (`js/scene-lib.js`), so there are no model files to download.
