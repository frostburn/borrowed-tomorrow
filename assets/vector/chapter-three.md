# Chapter Three vector artwork

Northglass, the control gallery, the vessel chamber and all five battlefields extend the cinematic planar SVG style from Chapters One–Two. The imperial conduit remains a monumental engine complex: green iron pressure dome, brass sun crest and retaining bands, gray masonry factory wings and a matching medical receiving pavilion. The interiors use the same materials, with large steel plates, functional gauge tables and connected pipework. The restrained crystal stays faceless; the cavern frames it without implying a divine character.

Seven whole editable originals live in `public/art/vector/scenery/`: `palace-portico`, `palace-wing`, `palace-gate`, `palace-controls`, `palace-vessel`, `works-wall` and `works-stairs`. Their metadata references the accepted raster kit at `ee63fb0` and its crop manifests in `assets/tiles/`. They are original geometric interpretations of those silhouettes/materials, not embedded images, small tile atlases or raster fallbacks. Edit these SVGs directly. Keep their declared dimensions and ground anchors; in particular, the controls use the actual 192 × 72 visible module and the vessel 216 × 312, matching the registered Tiled cells. Stair treads remain below feet.

```sh
# Supporting body models and all eight map compilations:
node scripts/export-chapter-three-art.mjs
# Maps only:
python3 assets/vector/chapter-one.py --chapter three
# Emperor and the two keepers only:
python3 assets/characters/vector/chapter-three.py
```

The compiler uses Python's standard library; character authoring shares the existing Drawing/Pillow tools. These are task-environment tools and add no production dependencies. Exports never overwrite primary scenery or portraits. Re-running the export produces identical computed SVG/manifest bytes. Whole continuous layers union the material cells, using broad stone/steel/cavern lighting planes. Pipe ports stay at cell-edge midpoints; cutaway strips form continuous floor edges. `src/content/chapter-three/scene-art.json` registers every source against the unchanged Tiled layer ID and sort depth. Eight map root selectors choose these scenes; tile data, object coordinates, collision, story flags and casts stay unchanged.

The Emperor, Engine Warden and Heart regulator now have distinct native 80px SVG bodies and 128px portrait originals. Silver hair, ivory mantle and dark collar distinguish the Emperor; the Warden has a narrow lantern head and semaphore signal; the regulator has a stout boiler, furnace grille, pressure dial and tall chimney. All use the shared (40,68) actor sole anchor. Their portraits reference `ee63fb0:public/art/portrait-*.png`; the six replaced PNGs are retired. Existing party, Tomas, Alban, Dena, Inspector and civilian SVGs are reused.

The game and Maps workshop load the same SVG URLs, decode each once at native dimensions and use the shared 2px final raster for art and text. Destinations and local battles load on demand before travel/chapter departure is consumed. Failed SVG loads preserve the departure checkpoint and can be retried. The legacy raster tile pages remain for Tiled thumbnails and collision definitions, not runtime scene fallbacks. Chapter Four retains its existing painting manifests.

Review `?dev=maps&map=northglass`, `?dev=maps&map=relayhall`, `?dev=maps&map=conduit` and each `battle-*` map in the Chapter Three catalog. Toggle `tomasRescued` and `extractionStopped`, inspect registered source URLs, isolate layers, review all scene casts and inspect all three NPCs in `?dev=sprites`. The right-hand feed console must line up with its clickable rectangle and have an open approach. Verify the dome's title-strip headroom, every tactical cell, both intake routes, optional stores, Tomas's permanent rescue, five equipment rewards and Chapter Four departure on desktop/phone.

Run `npm run check` and the focused Chapter Three, sprites and Maps workshop browser suites. Keep the full journey outside default CI. Stage explicit outputs and run `npm run check:art-upload` before publishing; all self-contained SVGs retain the 128 KiB per-file budget. No oversized source sheet or pre-rasterized substitute is required.
