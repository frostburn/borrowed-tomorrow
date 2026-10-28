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

## Chapter One night scenery and lighting

All eight Chapter One maps now share the approved opening's crooked, faceted vector style and festival-night lighting. Station retains its accepted SVG study. The other seven maps use variants under `public/art/vector/chapter-one-kit/`, derived from the editable shared originals. Building walls narrow toward slanted lintels and eaves; wood supports lean; broad ground and cave contours break at angular corners. Railway mechanics and prop anchors stay exact. Most painted terrain edges move by less than half a navigation cell. The source map data, routes, story flags, cutscene staging and tactical geometry remain unchanged.

`chapter_one_landforms.py` authors Rillbridge's river and crossings and the pass's resting recess. The river widens and bends beyond the routes, with uneven rocky banks, stones, reeds and sparse current ribbons. The paths clip to those same bank vertices, removing stray paving strips over water. A single open masonry arch supports the railway, and a worn plank footbridge meets stone abutments below it. The deck remains below actors, with its near rail separately sorted. The river-release effect remains a small story-flag layer. The tunnel's cubby has a widened, fractured rock silhouette, matching floor and slanted front ledge around the existing shelter/lamp anchors. Its original walkable floor remains enclosed. Regenerate with `python3 assets/vector/chapter-one.py --map rillbridge` and `--map tunnel`; do not hand-edit their generated SVGs.

| Location | Treatment |
| --- | --- |
| Larkspur | Indigo square, warm windows and persistent paper festival lanterns |
| Orrin's yard | Crooked workshop and shed; amber windows, hanging oil lamp and engine headlamp |
| Rillbridge | Blue river light, tilted bakery/storefronts, warm windows and a cold collector core that goes dark on release |
| Eastern pass | Faceted blue rock, amber service lamps, lit shelter and engine; clear stone walkway |
| Four battlefields | Related regional palettes and light, with unobstructed tactical floors |

Reproduce scenery with `python3 assets/vector/chapter-one.py`, or `--map yard` (likewise any Chapter One map ID) for a focused export. `station.py` owns the accepted opening study; `chapter_one_style.py` owns the rest. Both use native SVGs only. Shared original scenery and later chapters retain their existing artwork. Each SVG remains below 128 KiB.

`src/content/chapter-one/lighting.json` registers ambient colors, broad cool bounce, and prop-local emitters for all eight maps. The compiler paints matching floor spill; `sceneLight` builds the runtime rig from the visible props. Spill inherits each emitter's own visibility layer, so the collector's glow disappears with its working casing. Festival lanterns remain lit after the arrest. Light sources use exact ground positions and heights: warm lamps, directional window apertures, a subtle blue fill and the collector's pale turquoise core.

The campaign's `world-lighting.ts` applies the same Canvas actor lighting to exploration, temporary cutscene casts and battle units. Cached native pixels and shaded per-actor surfaces retain original alpha, dimensions, handedness and animation frames. Mirrored enemy art is lit in its displayed orientation. Dead battle units cast no shadows. Custom later bosses now use the same native-frame lighting adapter; see the boss lighting notes below. There is no new production dependency or raster asset. Chapter Two's registry and angular variants are documented in [its guide](chapter-two.md); `scene_lighting.py` shares compiler-painted spill without changing the accepted Chapter One outputs.

`actor-planes.ts` derives cached, stylized relief from contiguous material-color regions: broad slanted left/front/right and exposed upper planes respond to scene lights in three discrete bands. Tiny details stay flat. Festival and regional fill keep action readable without removing the surface planes. These are sprite relief planes, not a 3D mesh.

Up to three meaningful nearby sources project each visible actor's current silhouette onto real floor, alongside a restrained contact shadow. The shared 0.45 opacity budget and 18% relative cutoff bound overlapping darkness. Window shadows clip to the painted beam apertures. Shadows stay below sorted scenery and tactical indicators. `light-canvas.ts` shares the shadow projection and floor clipping with the Maps workshop. Scenery does not ray-occlude light; this remains stylized 2.5D lighting. No flicker or extra idle repaint loop is used. Frame surfaces and per-actor textures are released when their owners are cleared.

The Maps workshop (`?dev=maps`) previews the actual Chapter One colors, emitter visibility, actor highlight planes and shadows. Scene casts, layer isolation, flags and native PNG review exports use the same rig and floor mask. Chapters Five onward retain their existing map previews. Review lit moving actors and attack frames in the campaign or practice battles; detailed visual/journey checks stay outside the small default CI gate.

Chapter Three now extends angular scenery and registered illumination through the green-iron conduit complex and its battlefields; see [its source and lighting guide](chapter-three.md). Royal marble remains a separate asset family.

[Chapter Four](chapter-four.md) now shares native actor planes/shadows, flag-aware coastal lamps and the angular architecture treatment across its three world maps and five arenas. Authored crooked quay outlines generate matching 24px walking cells; Breakwater's flag-blocked stair leads through the gate to the sanctuary. Cast anchors, interaction IDs and story flags stay intact.

[Chapter Five](chapter-five.md) extends angular terraces, shaded architecture and live actor planes/shadows through all thirteen exploration maps and fourteen arenas. Its floor author gives each location distinct brick, grating, cobbles, ceramics, terrazzo, parquet, timber or riveted armor, with local wear/inlays rather than a shared slab grid. Its shared light registry owns opal work lights, furnace/hospital/cabin glow and flag-bound anchor light. Whole perimeters generate matching walking cells; Dawnwatch/Windmere have actual survey moorings. Keep takeoff and command-deck destruction pieces live through floor caching.

Repeatable rest/supply interactions declare the boolean Tiled property `rest`. The shared marker renderer uses a pale-blue shelter (⌂); one-time rewards and optional encounters keep the green diamond. `map_metadata.py` preserves the rest classification through every chapter's art export.

## Railway placement repairs (#91, #71)

Larkspur's two northern trees are stamped into Tiled layers 14/15 with their
roots on the verge above the first ballast bed (y=144), rather than through the
rails. The remembered morning, empty-seat ending and ordinary departure inherit
those layers and the station manifest from the same source map.

An engine layer's string `railFacing: right` selects a right-facing native SVG
through `assets/vector/railway.py`. The existing left-facing original is retained
for Rillbridge's west-end engine and the exchange's shunting engine. The yard,
eastern pass and their battle views, eastbound exchange train, capital-line
engine and Northglass medical train face right. Cabs face the trailing coaches.
`engine-right` in each Chapter One–Three lighting registry places the lamp at
native x=247 (288−41); the generated halo, floor spill and actor illumination
therefore agree. Dimensions, ground anchors, flags and navigation stay fixed.
The refuge's coach and right-facing engine also share a continuous consist,
removing the former 132px gap.

Reproduce these changes using Python's standard library, in this order:

```sh
python3 assets/vector/chapter-one.py
python3 assets/vector/chapter-one.py --chapter two
python3 assets/vector/chapter-one.py --chapter three
python3 assets/vector/chapter-four.py
python3 assets/vector/chapter-seven.py
python3 assets/vector/chapter-six-capital.py
```

The final capital pass restores the completed capital entrance after the domain
export imports its earlier regional layout tools. No painting, raster conversion,
production dependency or runtime art mirroring is involved. Review the same
files under Maps for station, yard, tunnel, coast, cinderbank, northglass, refuge
and the three later Larkspur visits; the west-facing siding stays independent.

The railway fixture audit also covers lamp/tree footings across Chapters
One–Three. Rillbridge's eastern lamp stands on the platform north of the line;
the pass's two northern lamps stand on the southern apron (the eastern one is
set left of Orrin's cutscene position). The exchange's eastern platform lamp
sits one cell back from its lower rail bed. The Tiled stamps own positions and
collision, and recompilation relocates the matching native light pools. The
repeated vertical thread stamps on Rillbridge's pavement are removed; suspended
water drops at the river remain. Rebuild these maps with `chapter-one.py --map
rillbridge`, `--map tunnel` and `--chapter two --map coast`. No actors, route IDs,
story markers or cutscene destinations move.


### Filled roof gables and regional rest furniture

The editable workshop, bakery, miners’ cottage and coal-shed originals include
solid wall faces behind the angled roof trim. Their Chapter One/Two variants
inherit those faces. `chapter-five.py::factory()` fills both sawtooth gables;
`chapter-six-north.py::house()` fills the complete northern timber gable before
painting the snow trim. Roof silhouettes, windows, door positions, dimensions
and navigation are preserved. The station already has a closed front gable;
the desert and Iria roof planes are solid.

Rebuild Chapters One–Three with `chapter-one.py` and its `--chapter two` /
`--chapter three` options, the factory kit with `chapter-five.py`, and the north
and regional benches with `chapter-six-capital.py`. Chapter Six’s rest furniture
is described in [its source guide](chapter-six.md); medical beds are separate.
All results remain native SVGs, with no new raster assets or dependencies.


## Later boss lighting

`src/game/boss-lighting.ts` owns opt-in stage moods for the large Chapter Five–Seven bosses and their domain reprises: furnace carrier, mirrored ward engine, flagship, dragon, serpent, Emperor, Lightbearer and all three Benefactor forms. Campaign and Bosses previews use the same runtime field. Early encounters, the royal conduit workshop and ordinary maps keep their authored illumination.

The existing `WorldLight` field lights native boss frames as well as party actors. The adapter retains the original image, atlas frame, scale, alpha and body-picking mask; no SVG or runtime art export is rewritten. `SceneIllumination.sample` supplies a cached scene-clock field, and `floorLight` paints ambient colour and soft source pools through the real floor silhouette, below grid lines and warning cells. Opposed rim light keeps silhouettes readable; party shadows retain the shared bounded multi-source projection. Large bosses do not project stretched actor shadows.

Living boss parts supply the key light. It follows their displayed positions, fades with disabled components and strengthens through the actual attack contact/recovery timeline, including impact redraws. Slow pulses use quantized brightness to reuse shaded surfaces. Reduced motion holds a steady rig and suppresses attack-light pulses. No full-screen flashes, new assets, gameplay writes or delayed lighting callbacks are involved. Per-image textures and native frame caches clear with the world layer; restart, defeat and leaving the preview must not retain a field.

Review Bosses with the pointer parked, each final form, a full enemy turn, reduced motion, restart and painted-body selection. Detailed desktop/phone lighting checks stay outside the small default CI gate.
