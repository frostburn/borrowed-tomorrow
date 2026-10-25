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

The three imperial exterior SVGs under `scenery/royal-palace-*` are editable originals with white stone, cool shadows and gold fittings. They preserve the royal exterior’s established dimensions and ground anchors; Chapter Six embeds those same sources above a cool marble plinth. Interior iron/brass machinery is unchanged. No bitmap conversion is involved.


## Northern kit

`assets/vector/chapter-six-north.py` runs the desert and jungle sources, adds Skeld’s four 64 × 42 world maps and a fifth capital landing, four 42 × 20 clear battlefields, then writes the combined manifest. Snow roof planes, blue glacier facets, broken relief hulls, covered passage gate and ice arch are native vectors. Floor clips and Tiled walking cells share authored polygon perimeters. The windlass’s real gate layer is closed from the first arrival and hides on `northPassOpened`; its art and collision disappear together. The launch remains outside the harbor floor. Cool-white capital paving shares the imperial marble sources; never recolor it with desert sandstone.

`assets/characters/vector/north.py` exports Edric, Signe and Egil using the compact 80 × 80 actors and (40,68) sole anchor. Their portraits are seeded once and remain editable SVG originals. Signe uses a separate female face/braid; Edric/Egil have individual broad brows, jaws and beards.

`assets/bosses/export-winter-dragon.py` exports four 528 × 280 native poses and a deliberate 128 × 128 portrait crop from the same geometry. The sanctuary embeds the same dragon vector. Campaign and workshop decode the native poses, retain alpha for body picking and use the common display raster. Pose changes never resize the body or move its contact base. No bitmap sheets, resampling or image generation are involved.

Reproduce everything with `npm run art:six`, inspect the diff, stage only the intended files, then run `npm run check:art-upload`. Maps → Ch 6 exposes all world/arena layers and casts; Sprites exposes the cast and fixed frost recolors; Bosses → Winter dragon exposes the real battle. Detailed screenshots/traces belong outside the repository.


## Capital finale

`chapter-six-capital.py` extends the shared exporter with Stillwater Avenue, the last palace, remembered Larkspur morning and coast, crown platform, real Larkspur aftermath and five tactical floors. White/cool marble and antique gold frame warm working residents. Tiled owns the two actual story gates, their collision and visibility, every interaction approach, arrivals and scene casts. The remembered morning and aftermath reuse Chapter One’s actual station geometry and SVG layers, with the prison coach hidden and the memory’s festival restored. The capital maps use a Tiled `cameraLeadY` property to keep upper architecture in view. The shared 2px renderer handles all SVGs with the same pixel weight as text. No raster sources or new tile fragmentation.

`assets/bosses/export-imperial.py` authors the 528×280 Emperor and Lightbearer poses, including a separate fallen Emperor, 96×160 crown supports and editable 128px portraits. Nell’s copper braids, orange jacket and anatomical right-hand lantern stay visible inside the mantle. The Emperor has stepped throne architecture, connected armored forearms, recessed human facial planes and a twelve-ray embossed sun breastplate. The fallen pose closes his eyes, cracks the insignia and extinguishes the core. His passive motion remains mechanical; the Lightbearer’s hover and shutter resistance are separate poses. Never draw the god’s true body in this kit.

Run `npm run art:six`; new portrait originals seed once and remain editable. The exporter is deterministic. Stage only changed outputs, run `npm run check:art-upload`, and keep QA screenshots outside the repository.


## Angular scenery and actor lighting

`chapter_six_style.py` owns the sixteen new exploration perimeters and their 24px cell coverage. `chapter_six_floors.py` paints each region: sand-scoured exchange paving and woven market mats, instrument-centred court/observatory masonry, terracotta roofs, timber/bamboo quays, earth paths, ice facets and white royal marble. Timber uses narrow joints; circular masonry replaces straight joints completely. Cutaway faces follow only the outside perimeter. The five gated necks retain their full blocking rows; their corners cannot provide a shortcut around the story gate. Lastshore keeps its natural coast. The two Larkspur scenes still reuse the actual Chapter One map and scenery; the remembered morning maps the current night grass palette back to daylight.

`src/content/chapter-six/lighting.json` is the shared source for runtime actors and compiler-painted ground spill. Visible bronze opals, woven river lanterns, northern glass lamps and royal globes use the same native anchors as their emitters. Desert dusk, leaf bounce, snow fill and white palace interiors have distinct ambient profiles. The clinic and palace interiors use diffuse fill and the 0.035 shadow budget, without rain covers. Actor highlight planes and bounded multi-source shadows use the existing shared renderer, in exploration and all sixteen battlefields, including custom serpent, dragon, Emperor and Lightbearer presentations. Chapter Seven's reprises retain their own presentation.

The mooring handcart and below-bridge canopy launch have explicit `live` layers so static-ground caching cannot swallow their cinematic movement. The released observatory glow and its ground spill share the same story flag layer. Blocked mechanism and optional-loot markers use their actual guard prerequisites while keeping explanatory dialogue available. Casts, interaction IDs, arrivals, items, music and sick/recovered Nell routes are preserved. Re-export also refreshes the embedded sanctuary/crown boss silhouettes from the accepted shared boss sources.

Reproduction and checks:

```sh
npm run art:six
npm run check
# Stage the intended authoring files, native SVGs, maps and lighting registry.
npm run check:art-upload
```

A second `art:six` run must produce identical output. Review all nineteen exploration maps and sixteen arenas through Maps → Ch 6, including open/closed gates and released seals. Check desktop and fractional-DPR phone journeys, both Nell outcomes and the passive mooring/river cinematics. Browser QA can use the existing Playwright/Chromium setup when no Browser plugin is available; screenshots and traces stay outside the repository. All generated scenery stays self-contained SVG below 128 KiB, with no added production dependency.


### Chapter Six presentation corrections

The mooring uses `nell-bed.svg`, a single native reclining/cot composition, under a separate shelter. `illness.py` reproduces it alongside the reclining-only treatment pose; the latter remains separate so the Iria scene does not gain a second cot. Both ship-return scene families place ill Nell at the actual berth. The nearby lamp and Namar palms leave the bed and water clock visible.

Namar’s sixteen small native clock poses show the inlet, filling bowl, tip, discharge and one-tooth dial step. `WorldMechanisms` uses scene time and requests passive framebuffer refresh; it stops on scene teardown and displays a stationary pose under reduced motion. Frames preload with Namar, including deep restores. `pact-open` lifts/fades the actual live capital wall, and the pact presenter participates in passive-time reporting and restores temporary state on close. North’s existing bell effect now also has its presenter. Gate graphics are open bronze latticework with the same blocking rows. Tactical lamp bases and their light emitters sit inside the floor. Dispatched post and post-Emperor entrance use conversation objects, preserving each original actionable interaction before completion.

The Open Court fountain has eight native flow poses and shares the scene-time mechanism runner with Namar’s water clock. The rooftop arrival frames the party and nearby glasswing, with phone dialogue clearance. Imperial-capital interactions accept only their own maps, so Namar’s identically named palace exit cannot enter Stillwater Avenue; regression coverage includes the barred court, escaped court and post-serpent return.
