# Chapter Six — Namar, Iria, Skeld and the allied landing

Run `npm run art:six` with Python 3 and the environment’s existing Pillow installation. No new game dependency, bitmap painting or image-generation call is involved.

- `assets/vector/chapter-six.py` authors the five 64 × 42 world layouts and four 42 × 20 arenas, continuous SVG planes/props and `src/content/chapter-six/scene-art.json`. Floors, collision, painted control hit rectangles, named arrivals, civilians and scene casts share the same 24px cells. It preserves editor-owned marker roles on export.
- `assets/characters/vector/chapter-six.py` authors Samira, Sahir and Amal at 80 × 80 with the common sole anchor. Their 128 × 128 portraits are seeded only when absent; the published SVGs are editable originals. Female faces have their own construction; Sahir has a broad jaw, brow and beard.
- `assets/bosses/export-sun-serpent.py` authors the 296 × 244 organic head/body and three breath poses, two 128 × 112 coils and a 128px portrait. Runtime masks use native SVG alpha. No raster resizing or palette reduction occurs.
- `assets/vector/chapter-six-jungle.py` runs the shared desert writer, adds three 64 × 42 river/forest/clinic maps and three 42 × 20 arenas, and writes the combined manifest. `assets/characters/vector/jungle.py` exports Ines/Tavi at the common sole anchor; their portrait originals are retained.
- Sunmesh, fernbound and frost common enemies are fixed Chapter Six recolors in `enemy-variants.json`, reproduced with `node scripts/export-enemy-variants.mjs`.

The outer mooring reuses Chapter Three’s royal white-marble portico and palace wings above a wooden survey deck; a handcart continues behind the translucent barrier. Palace-bar collision follows the same story layer as its artwork. Namar uses ochre sandstone, broad evening shadows, turquoise domes/canals, awnings and warm bronze instruments. The palace is a shaded open court rather than another imperial engine hall. Rooftops rise through the city to a bronze flood-measuring observatory. Architectural faces and floor lips stay below their walking surfaces; sorted props use actual ground anchors. The existing final 2px framebuffer gives text, actors and scenery the same weight.

The game and Maps → Chapter 6 load the same pieces. The serpent campaign and Vite-only preview share production vectors and combat presentation. Music → Ch 6 contains the regional score and battle variations. Keep every SVG below 128 KiB and run the staged art-upload guard before publishing. Re-exporting must leave the tracked outputs unchanged.


Iria uses broad green lighting planes, teal water, raised banks, wooden quays, stilted huts and an open treatment deck. Every walking surface is clipped to its real Tiled floor. The bridge’s flagged chain owns both its visible prop and its blocking tile layer. Keep the canopy launch between background and floor depths so it passes beneath the bridge; village/clinic launches sit outside the quay footprint. Sorted supplies, cot and basin use ground anchors. Temporary launch/pulse animation restores props and destroys effects on close/skip; only story completion changes flags.

The three imperial exterior SVGs under `scenery/palace-*` are editable originals with white stone, cool shadows and gold fittings. They preserve the established dimensions and ground anchors for Chapter Three; Chapter Six embeds those same sources above a cool marble plinth. Interior iron/brass machinery is unchanged. No bitmap conversion is involved.


## Northern kit

`assets/vector/chapter-six-north.py` runs the desert and jungle sources, adds Skeld’s four 64 × 42 world maps and a fifth capital landing, four 42 × 20 clear battlefields, then writes the combined manifest. Snow roof planes, blue glacier facets, broken relief hulls, covered passage gate and ice arch are native vectors. Floor clips share the Tiled walking rectangles. The windlass’s real gate layer is closed from the first arrival and hides on `northPassOpened`; its art and collision disappear together. The launch remains outside the harbor floor. Cool-white capital paving shares the imperial marble sources; never recolor it with desert sandstone.

`assets/characters/vector/north.py` exports Edric, Signe and Egil using the compact 80 × 80 actors and (40,68) sole anchor. Their portraits are seeded once and remain editable SVG originals. Signe uses a separate female face/braid; Edric/Egil have individual broad brows, jaws and beards.

`assets/bosses/export-winter-dragon.py` exports four 528 × 280 native poses and a deliberate 128 × 128 portrait crop from the same geometry. The sanctuary embeds the same dragon vector. Campaign and workshop decode the native poses, retain alpha for body picking and use the common display raster. Pose changes never resize the body or move its contact base. No bitmap sheets, resampling or image generation are involved.

Reproduce everything with `npm run art:six`, inspect the diff, stage only the intended files, then run `npm run check:art-upload`. Maps → Ch 6 exposes all world/arena layers and casts; Sprites exposes the cast and fixed frost recolors; Bosses → Winter dragon exposes the real battle. Detailed screenshots/traces belong outside the repository.


## Capital finale

`chapter-six-capital.py` extends the shared exporter with Stillwater Avenue, the last palace, remembered Larkspur morning, crown platform, real Larkspur aftermath and five tactical floors. White/cool marble and antique gold frame warm working residents. Tiled owns the two actual story gates, their collision and visibility, every interaction approach, arrivals and scene casts. The remembered morning and aftermath reuse Chapter One’s actual station geometry and SVG layers, with the prison coach hidden and the memory’s festival restored. The capital maps use a Tiled `cameraLeadY` property to keep upper architecture in view. The shared 2px renderer handles all SVGs with the same pixel weight as text. No raster sources or new tile fragmentation.

`assets/bosses/export-imperial.py` authors the 528×280 Emperor and Lightbearer poses, 96×160 crown supports and editable 128px portraits. Nell’s copper braids, orange jacket and anatomical right-hand lantern stay visible inside the mantle. The Emperor is a human in architectural machinery, with mechanical passive motion; the Lightbearer’s hover and shutter resistance are separate poses. Never draw the god’s true body in this kit.

Run `npm run art:six`; new portrait originals seed once and remain editable. The exporter is deterministic. Stage only changed outputs, run `npm run check:art-upload`, and keep QA screenshots outside the repository.
