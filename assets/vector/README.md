# Cinematic vector scenery

The current direction takes its broad silhouettes, flat lighting planes and sparse outlines from cinematic polygonal adventures such as Another World. The old generated paintings supply architecture, rooflines, train silhouettes, cave recesses and lighting references. They are interpreted around the playable story layout rather than shipped as bitmaps.

The 24 SVGs in `public/art/vector/scenery/` are **editable originals**. Each includes a reference commit/path and crop in its metadata. They are whole buildings, trains, trees, bridge pieces and props, with natural dimensions up to 288 × 264; they are not tile atlases. Edit the SVG directly. The 29 continuous ground/layer SVGs under `public/art/vector/scenes/` and `src/content/chapter-one/scene-art.json` are reproducible compiler outputs:

```sh
python3 assets/vector/chapter-one.py
# Or compile maps and the animated/world cast together:
node scripts/export-chapter-one-art.mjs
```

The compiler uses Python's standard library. It unions the material cells into continuous contours, draws broad lighting/geological planes and continuous rails, then registers each whole SVG prop using its original module coordinates and ground depth. It never opens, quantizes or downsamples a reference painting. Source references can be recovered from full git history: station/yard/tunnel at `feb2d47^:public/art/{name}.webp`; Rillbridge's encoded map pack at that revision. Do not restore those retired bitmap files to the runtime bundle.

All eight Tiled maps declare `artStyle: rotoscope` and a `sceneArt` manifest key. Tiled still owns the 24px navigation grid, layer IDs, interactions, arrivals, scene casts, story flags and collision. No gameplay coordinates change. One SVG plane replaces each material layer; whole props remain sorted among actors. The bridge deck stays under feet and its near rail sorts separately. Required/hidden flags select the same layer IDs in the game and Maps workshop. Chapters Two, Three and Four share this scene system, with their SVGs loaded on demand. [Chapter Four](chapter-four.md) authors its new harbor and sanctuary scenes directly from vectors and connected navigation contours.

`?dev=maps` renders these same SVG pieces and identifies their actual source paths. Layer isolation, story flags, actor casts, review links, collision overlays and PNG review exports remain available. Tiled's thumbnails still show the shared legacy tile vocabulary retained for editor thumbnails. The old chapter-one SVG tile pages/registry are retired.

## Shared rasterization

SVGs decode once at their declared dimensions into in-memory canvas textures; the repo ships no pre-rasterized replacements. `src/game/pixel-display.ts` composes the entire scene and UI, then `raster.ts` samples it onto a 2 × 2 logical-pixel grid. Nearest-neighbor expansion gives art, portraits, text and borders the same pixel weight. It does not change input coordinates, camera geometry or save positions. Integer physical scaling avoids CSS smoothing at fractional DPR; very narrow views may crop the final coarse block.

Body text uses the existing 5 × 7 face at two-pixel stems. Small metadata uses the authored 3 × 5 uppercase face in `src/game/small-font.json`, also at two-pixel stems, rather than shrinking body text until it breaks. `python3 scripts/build-small-font.py` rebuilds its matching DOM metrics font with task-environment fontTools; it adds no production dependency. Larger labels retain the main face.

Run `npm run check`, the Chapter One journey, map/foreground/bridge and sprite scenarios, and presentation tests on desktop and phone at fractional DPR. Regeneration must be byte-identical and must not overwrite the primary SVG scenery/portraits. After staging, run `npm run check:art-upload`; SVGs may span a whole map, while retaining the per-file 128 KB byte budget and prohibition on embedded rasters, scripts or external resources.

## Chapter Two

The seven Chapter Two layouts now compile with the same scene system; see [the Chapter Two guide](chapter-two.md). Their eight new whole SVG scenery originals, Kit/Petra motion, Dena, Inspector and native civilian variants extend the palette into the harbor and ward. `node scripts/export-chapter-two-art.mjs` rebuilds their computed outputs. Chapter One keeps its initial art kit; Chapter Two scene assets load on demand with the destination and its battles. Chapter Three now shares this system; see [its guide](chapter-three.md).

## Chapter Three

All eight Chapter Three layouts now use whole SVG scene pieces. Seven new editable originals preserve the pressure hall, factory wings, medical pavilion, instrument bank, vessel, window bay and stairs. Registered vector pipes and steel/masonry fields keep the existing story geometry; [Chapter Three guide](chapter-three.md). `node scripts/export-chapter-three-art.mjs` rebuilds computed maps and the three supporting actors without overwriting any original scenery or portrait.


[Chapter Five Act I](chapter-five.md) continues the native direction across the western airfield, survey deck, Hammerplain, cooling race, anchor gantry and five arenas. `node scripts/export-chapter-five-art.mjs` reproduces the Tiled layouts and SVG planes/props, including the carrier’s world/battle geometry. Story flags control the street, water, crew and horizon. No bitmap input or new production dependency is needed.

## Larkspur opening study

The opening `station` map adds a cozy storybook/dollhouse treatment: angular eaves, narrowing walls, splayed stall supports, tilted paving courses and cool indigo festival-night colors against amber windows and oil lamps. Edges remain straight between deliberately crooked corners; do not replace slanted architecture with wavy warping. The viaduct parapet slopes continuously across its three spans. Lamp spill is authored as translucent, uneven pools that retain the stone underneath. The railway stays straight and mechanically legible. Keep real volume and shaded overlaps as the shapes become more playful.

`assets/vector/station.py` derives station-only native SVG prop variants from the shared originals, plus its floor palette and slanted painted contours. It is a reproducible vector transformation, with no raster source, palette quantization or image generator. Native dimensions, ground anchors and sorting remain fixed. Tiled still owns every interaction, collision cell and cutscene position. Iona's supply interaction is three cells lower, in front of her stall, with an unobscured silhouette. Other maps, including later Larkspur memories, retain their existing art.

Use `python3 assets/vector/chapter-one.py --map station` to rebuild just this screen and retain all other manifest entries. A normal Chapter One export uses the same station treatment. Review it in the opening campaign scene and `?dev=maps&map=station`, before and after `raidSeen`.

### Live actor lighting

The campaign's `src/game/world-lighting.ts` opts only `station` into Canvas actor lighting. The three visible lamp props supply ground coordinates and a 108px light height; `world-light.ts` owns cool ambient light, warm distance/height falloff and bounded shadow projection. All world characters and temporary cinematic actors use the same path. Reusing an actor's original texture/frame preserves animation selection and handedness. Native pixels are read once per frame asset; each actor caches its shaded surface until its pose or position changes. Alpha is copied exactly, and source SVGs/textures are never changed. Lighting is composed before the shared 2px final raster. No WebGL or production dependency is added.

One ground pass projects each visible actor's current silhouette away from up to three meaningful local sources, plus a restrained contact shadow. It clips to real floor cells and stays below sorted scenery, so shadows cannot draw over walls, tree canopies or the stall. These are stylized 2.5D actor shadows, not a full scene ray tracer: scenery does not block light rays. A shared 0.45 opacity budget limits overlapping shadows; sources below 18% of the strongest contribution are omitted. No lamp flicker is used, so stationary scenes stay stable and the compositor needs no extra idle repaint loop. Destroyed/hidden cinematic actors cast no shadows; returning to another map clears the rig and per-actor textures are released. The Maps workshop remains a static source-art view; review live lighting and shadows in the campaign.

Window beams now supply three directional shadow-casting lights registered to the painted floor trapezoids. Beam shadows clip to that aperture. Four small paper lanterns among the pennants provide a broad warm fill over the entrance and arrest staging, with matching diffuse floor spill; these area-like festival lights cast weaker silhouettes alongside window and street-lamp shadows. Visible props select both kinds of light, so removing a source also removes its lighting.

The festival lantern layer stays visible after `raidSeen`; its lights persist through the arrest aftermath and return visits.

Actor highlight planes: `src/game/actor-planes.ts` caches native per-frame faceted relief from contiguous material-color regions. Broad slanted left/front/right faces and exposed upper faces respond to the actual scene light directions in three discrete bands. Tiny details stay flat, original alpha is preserved, and no normal-map assets or new dependencies ship. These are stylized sprite relief planes, not a 3D character mesh. Each animation frame gets its own cached relief, so the planes follow pose changes; light response is normalized before the brightness cap to retain shape under the festival fill.
