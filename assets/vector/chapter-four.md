# Chapter Four: A Light on the Water — vector source

This chapter is newly authored in the established polygonal SVG style. It does not trace, resample, embed or restore the retired ward/sluice/sanctuary paintings. Its readable architecture uses broad green-iron, stone, bronze, dusk-sky and sea planes. The harbor works as a place people use; the sanctuary is an old hospice and astronomical signal terrace, rather than a marble palace.

```sh
node scripts/export-chapter-four-art.mjs
# Independently:
python3 assets/vector/chapter-four.py
python3 assets/characters/vector/chapter-four.py
```

The scene authoring source is `assets/vector/chapter-four.py`. It writes the three 1536 × 1008 exploration layouts, five 1008 × 624 battle layouts, whole SVG planes/props under `public/art/vector/chapter-four/`, and `src/content/chapter-four/scene-art.json`. Edit that source for reproducible changes; the emitted SVGs are ordinary readable polygons, paths and lines. No source bitmap, AI generation, renderer dependency or production package is required. The scene compiler uses Python's standard library and the existing contour-union helper; body authoring uses the existing Drawing/Pillow tool. Re-running the exporter is deterministic.

Tiled floors use existing 24px material IDs and union into continuous drawn surfaces. Only actual outer quay boundaries receive a cutaway; rectangle joins never draw fake internal edges. Scenery footprints use the same map cells. Whole props have explicit ground depths; decks and stairs remain under actors. The maps own interactions, safe arrivals, civilian placements and every initial scene cast. All scene coordinates and moved endpoints must remain on connected floor. Battlefield scenery ends above the fighting cells. Shallow-water/obstacle behavior remains in encounter data.

Story layers show the gate opening, ferry changing mooring, crews leaving the pump house, supplies arriving at the refuge, and the copper cable separating. `sanctuaryWardenWon` removes suspended water in all three locations. They use normal visibility flags in both game and Maps review. The existing coal engine and coach SVGs remain at native dimensions beside tracks reaching both edges.

Bram and the Sanctuary Warden have new 80 × 80 body models in `assets/characters/vector/chapter-four.py`, with the common (40,68) sole anchor. Bram has a brass work helmet, gray beard, blue sleeves, leather apron and right-hand mallet. The warden has a hollow bronze ring, metal mask, green hospice mantle, articulated limbs and right-hand signal staff. Their matching 128 × 128 portraits in `public/art/vector/portrait-*.svg` are editable originals; the exporter does not overwrite them. The four replaced PNGs and all three encoded painting packs are removed. No original paintings are restored before dev/build.

All four chapters now use the same on-demand native SVG scene loader, nearest filtering and shared final 2px raster for graphics/text. Failed destination assets preserve the previous checkpoint; retry completes preparation before entry. The Maps workshop catalogs all eight new layouts with layers, story flags, collision and casts. Inspect `?dev=maps&map=refuge`, `breakwater`, `sanctuary`, or the `battle-*` entries; inspect Bram and the warden in Sprites. The Vite-only canonical Chapter Four start replays the new refuge arrival.

Run `npm run check`, the focused `tests/e2e/chapter-four.spec.ts` journeys and production Chapter Four checks. Screenshots and traces belong outside the repo. Stage explicit changes and run `npm run check:art-upload`; every SVG remains self-contained and below 128 KiB. The three maps share the same 64 × 42 navigation size; no oversized raster sheets are uploaded.
