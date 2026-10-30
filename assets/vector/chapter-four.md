# Chapter Four: A Light on the Water — vector source

This chapter is newly authored in the established polygonal SVG style. It does not trace, resample, embed or restore the retired ward/sluice/sanctuary paintings. Its readable architecture uses broad green-iron, stone, bronze, dusk-sky and sea planes. The harbor works as a place people use; the sanctuary is an old hospice and astronomical signal terrace, rather than a marble palace.

```sh
node scripts/export-chapter-four-art.mjs
# Independently:
python3 assets/vector/chapter-four.py
python3 assets/characters/vector/chapter-four.py
```

The scene authoring source is `assets/vector/chapter-four.py`. It writes the three 1536 × 1008 exploration layouts, five 1008 × 624 battle layouts, whole SVG planes/props under `public/art/vector/chapter-four/`, and `src/content/chapter-four/scene-art.json`. Edit that source for reproducible changes; the emitted SVGs are ordinary readable polygons, paths and lines. No source bitmap, AI generation, renderer dependency or production package is required. The scene compiler uses Python's standard library and the shared coastal style helpers; body authoring uses the existing Drawing/Pillow tool. Re-running the exporter is deterministic.

The three exploration quays use authored polygon outlines with crooked straight edges, angled corners and a real harbor water slot. The same contours clip the SVG floor/spill and generate the existing 24px material cells by testing their centers. Painted shorelines and navigation therefore share a source instead of warping an unrelated rectangular tile mask. Only near-facing outer edges receive cutaway planes. Scenery footprints retain their registered map cells. Whole props have explicit ground depths; decks and stairs remain under actors. The maps own interactions, safe arrivals, civilian placements and every initial scene cast. All scene coordinates and moved endpoints must remain on connected floor. Battlefield scenery ends above the fighting cells. Shallow-water/obstacle behavior remains in encounter data.

Story layers show the gate opening, ferry changing mooring, crews leaving the pump house, supplies arriving at the refuge, and the copper cable separating. `sanctuaryWardenWon` removes the arrested skiff/reflection layer at the harbor and refuge. The sea stays flat; no raised wave crests are painted. They use normal visibility flags in both game and Maps review. The existing coal engine and coach SVGs remain at native dimensions beside tracks reaching both edges.

The arrested water reflections and stranded skiff sort between the distant sea and the quay floor. At Breakwater, their placement leaves the whole hull in open water above the pier and clear of the pump-house roof.

Bram and the Sanctuary Warden have new 80 × 80 body models in `assets/characters/vector/chapter-four.py`, with the common (40,68) sole anchor. Bram has a brass work helmet, gray beard, blue sleeves, leather apron and right-hand mallet. The warden has a hollow bronze ring, metal mask, green hospice mantle, articulated limbs and right-hand signal staff. Their matching 128 × 128 portraits in `public/art/vector/portrait-*.svg` are editable originals; the exporter does not overwrite them. The four replaced PNGs and all three encoded painting packs are removed. No original paintings are restored before dev/build.

All four chapters now use the same on-demand native SVG scene loader, nearest filtering and shared final 2px raster for graphics/text. Failed destination assets preserve the previous checkpoint; retry completes preparation before entry. The Maps workshop catalogs all eight new layouts with layers, story flags, collision and casts. Inspect `?dev=maps&map=refuge`, `breakwater`, `sanctuary`, or the `battle-*` entries; inspect Bram and the warden in Sprites. The Vite-only canonical Chapter Four start replays the new refuge arrival.

Run `npm run check`, the focused `tests/e2e/chapter-four.spec.ts` journeys and production Chapter Four checks. Screenshots and traces belong outside the repo. Stage explicit changes and run `npm run check:art-upload`; every SVG remains self-contained and below 128 KiB. The three maps retain their 64 × 42 navigation size; no oversized raster sheets are uploaded.

## Angular coastal art and illumination

`chapter_four_style.py` supplies the chapter-local geometry/material treatment and `chapter-four/lighting.json` owns registered emitters. The ward and pump-house have slanted roofs/lintels and colored depth planes; the old hospice wings lean around a rigid calibrated bronze ring. Straight slanted masonry/deck courses span each whole floor without rectangular restarts. Only outer quay edges have depth faces, with sparse foam beneath exposed sea walls. The sanctuary's rock faces are fractured planes; the sea has sparse unequal reflections against a dusk horizon.

The sanctuary's bronze ring uses `hollow_sun.py` and the shared twelve-ray geometry, including the missing upper-left wedge and smaller closed fractures. It is a constructed emblem on the existing plinth, with sky visible through its aperture and break; no portal surface or glow is added. Its bronze palette, supports, cable connection and scene anchor remain in place.

The pump-house awning and ward entry have uncovered opal lights. Outdoor coastal lanterns illuminate the forecourts, rest spots and the sea-wall conversation; matching window/ferry spill clips to actual quay surfaces. Campaign, cutscene casts, civilians, all five tactical floors and Maps share actor highlight planes and restrained overlapping shadows. Ferry lighting inherits each mooring's story layer. There is no extra idle animation loop. The wheel now visibly connects to the gate tower through a supported drive shaft. Controls, casts, interaction IDs, flag semantics and saved resources stay intact; shoreline cells follow the new quay contours.

The suspended sailboats have visible wooden masts, booms and rigging. Both ferry hulls sit in open water: the waiting ferry moors north-east of the gate, clear of the eastern quay and stair; the returning ferry moors below the southwest quay rather than on its walking surface. The suspended skiff stays between distant water and foreground land. Review both `harborOpened` states and the separated cable/arrested-water states in Maps. Existing Chapter One–Three art and the train originals are untouched.

Phone sea-wall framing keeps Nell and Tomas above the dialogue through camera tracking and reflow, without moving their stage positions.

Reproduce with `npm run art:four` or `python3 assets/vector/chapter-four.py`. All SVGs remain native, self-contained and below 128 KiB. Run `npm run check` and the detailed Chapter Four, native-lighting and Maps browser checks outside normal CI.

The sanctuary exit now sits on the service stair between the gate towers. The existing closed-gate layer owns both its art and the upper stair collision until `harborOpened`, without renumbering layers. The approach from the sanctuary resumes below the threshold. Gate-guard and bridge-guard victories automatically play the wheel and cable scenes through the shared aftermath dispatcher, including interrupted-save replay. Their recovery interactions remain but show no redundant markers. The warden uses `signalCut` as its real access prerequisite and stays grey until the line is cut.

## Route geometry

The refuge paving and its cutaway end above the first ballast bed at y=841. A continuous lower railway embankment supports both tracks across the full map width; neither rail nor ballast is painted over by the quay. The train originals keep their accepted anchors.

Breakwater’s service span has a wide near threshold and a narrow far landing on a headland. Deck joints, parapets and shrinking posts share converging perspective edges. Its polygon also owns the walking cells; the closed gate still blocks the only approach. The floating capital remains visible beyond the headland.

The Sanctuary’s descending return stair continues through the bottom edge, with its exit kept above the screen margin and its arrival on the same approach. The western refuge exit has a small passenger launch, a wooden boarding gangway, a clickable boat/landing area and registered warm window light. The launch’s hull stays wholly in water. Both exits preserve their existing IDs and destinations.
