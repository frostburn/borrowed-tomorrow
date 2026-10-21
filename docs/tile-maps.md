# Native tile maps

Chapter One uses the [traced SVG scene kit](../assets/vector/README.md), with broad architecture and lighting interpreted from its original generated paintings. Its eight maps declare `artStyle: rotoscope` and a `sceneArt` key. Whole continuous ground layers and whole SVG props replace the old vector tile pages. Tiled retains collision IDs, routes, layer flags, interactions, casts and registered ground anchors. The game and Maps workshop use the same scene manifest and SVG URLs. Chapter Two now uses the same system for all seven of its layouts; [source notes](../assets/vector/chapter-two.md). Chapter Three uses the same system across its eight layouts; [source notes](../assets/vector/chapter-three.md). A shared final 2px display raster gives all graphics and text matching pixel weight.

Open `src/content/chapter-one/maps/*.json` , `src/content/chapter-two/maps/*.json` and `src/content/chapter-three/maps/*.json` directly in Tiled. Each file is an ordinary finite orthogonal map with uncompressed numeric tile layers. They share a **24 × 24** tile vocabulary, catalogued in `assets/tiles/chapter-one.tileset.json`. Small native lossless PNG/WebP pages live in `public/art/chapter-one/`; each has a standard external Tiled tileset in `assets/tiles/pages/`. Maps reference those page tilesets directly, so they remain editable in Tiled. `assets/tiles/tile-definitions.ts` provides ordinary imports for both the game and Node-based content tools. Each page is at most **192 × 192 pixels and 128 KB**, and is uploaded as its own image file. The dimensional pack comes from the supplied modular railway scenery and material sheets; no whole-map painting was sliced into tiles. `assets/tiles/README.md` records the importer and source crop manifest. Normal development and builds use the checked-in files directly.

Keep existing tile IDs stable when extending the tile set: append new definitions so the maps' references keep their meaning.

Chapters One–Three share the tile pages: ten exploration maps and thirteen tactical arenas. Their map JSON files are the editable layout source. Chapter Two appends harbor and ward props without changing earlier tile IDs or image bytes. The obsolete coast and Cinderbank paintings and encoded fragments have been removed. Chapter Three appends palace gates, instrument banks and the restrained vessel. Its former whole paintings and encoded parts are removed. Chapter Four retains native scenery, including the `infirmary` painting used by the Chapter Four refuge.

| Map | Grid | Story route |
| --- | --- | --- |
| `station` | 42 × 26 | Festival square below the arrest platform; Iona's stall, memorial and west exit share one connected plaza |
| `yard` | 42 × 26 | Engine apron and Orrin first; spare shed to the south; disused branch to the northwest |
| `rillbridge` | 64 × 28 | Leave the engine west of the river, cross the wooden bridge, pass the residents and reach the collector; the north road leads to the pass |
| `tunnel` | 42 × 26 | Cave railway through the blockade; carved mural recess above, shelter below, engine and boarding quay at the east |
| `coast` | 64 × 42 | Sea and cranes behind the barred coach; west loading gate and east signal walk lead around the guard barrier; ward exit and Orrin’s engine below |
| `infirmary` | 64 × 42 | Windowed railway ward, medicine desk and stove; beds flank the clear central aisle between the exchange and siding exits |
| `cinderbank` | 64 × 42 | Medical coaches, miners’ homes and coal shed frame the collector; evacuation leads east to Petra shielding Alban at the capital crossing |
| `northglass` | 64 × 42 | A medical platform below the palace gate; patients, supplies and the coal engine remain visible while Petra refuses the renewed arrest |
| `relayhall` | 64 × 42 | Tomas’s bypass bench behind the instrument banks; central intake controls, western stairs and optional sealed stores |
| `conduit` | 64 × 42 | The restrained vessel behind a clear service deck; actual feed console on the right and gallery return stair in the south |

The tactical `battle-*` maps frame clear fighting floors with location-specific tracks, train parts, machinery or cliffs. Their hex cells remain clear of scenery props. Combat rules, obstacles and rewards remain in `encounters.ts`.

## Layers and collision

Chapters One–Three use SVG scene pieces. Chapter One compiles material layers into continuous SVG planes and groups the module cells into whole SVG props. Layers with the boolean `sort` property draw their individual tiles among the actors at their ground anchors. Multi-tile trees and machinery use each tile's `sortOffset` property to share one ground depth; walking in front of a canopy draws the character in front of it. Actor depth also updates during cutscenes and movement. No layer or actor is scaled or recolored.

Walkable bridge decks and stair treads are floor layers below actors. The footbridge's near rail and posts form a separate sorted layer, cut from the same source pixels without overlapping the deck image. Only its middle deck row crosses the river; the railings and water above/below it stay blocked. The importer records the split in `scenery.json` and appends foreground tiles without repacking existing image pages.

Through tracks continue to both map edges. The yard's engine stands on row 11; the pass uses rows 10 and 12, with shelf terrain beneath the eastern ends. Rillbridge's eastern carriage stands on row 14, aligned with the line, and a stone viaduct supports that line over the river.

The eastern pass and captain arena share cave wall, roof, floor and cutaway ledge tiles. Solid roof/wall tiles block movement; floor tiles open the existing route. Ledge lips are floor, with blocked faces below them, drawn beneath actors. The cave sheet is an independent material source, exported by `assets/tiles/import-caves.py`; re-importing railway scenery preserves those appended tile IDs. See `assets/tiles/caves.md` for the art brief and crop recipe.

Tile definitions carry an optional boolean `walkable` property. Navigation reads the same active tile layers as rendering, in map order. The last explicit value wins: a bridge deck can make water passable, while a wall, trunk or carriage blocks the floor beneath it. Decorative tiles omit the property. Do not add separate collision rectangles to these maps. Keep painted floor edges and navigable cells aligned.

Layer properties `requiredFlag` and `hiddenFlag` name existing campaign flags. They apply to both drawing and collision. Larkspur's festival line and prison coach disappear after the arrest; the cap appears. Rillbridge's suspended drops, threads and intact collector give way to running water and the broken casing after the release. These are story states, without confirming the crystal's nature.

## Terrain transitions

Chapter Two uses feathered ballast, paving and dirt edges over the neighboring ground. Tile layers marked `blendEdges: true` are baked by `python3 assets/tiles/blend-terrains.py`; the tool chooses reusable edge/corner tiles from their neighbors and appends missing variants without changing earlier IDs or pixels. Each join changes only edge alpha over seven native pixels. Solid centers keep their source colors, scale and walkability. There is no runtime filtering or palette reduction.

Paving and ballast have separate overlapping layers at crossings. A row of paving underneath the ballast lets the join reveal the actual neighboring surface. Water-facing quays, ward cutaways and map boundaries retain their architectural hard edges. Keep enough overlap beneath a join rather than exposing a stripe of unrelated base terrain. The standard finite Tiled JSON files remain the layout source; builds consume the baked pages directly.

Chapter Three's steel service walks blend into their underlying masonry or cavern floor; its four interior battle floors use the same edge treatment. The baker recognizes `works-stone` and `works-deck` fields and appends alpha-only variants, preserving their RGB and walkability. Equally visible floor layers with the same string `blendGroup` form one continuous surface for neighbor selection: the conduit's central deck and pressure walk use `service-deck`, so their shared boundary stays solid. Walls, stairs, machinery and architectural cutaways are not feathered. Re-running the baker is idempotent; only maps whose tile choices change are reserialized.

Cinderbank’s capital engine anchors at (57, 25), leaving Petra at (47, 23) and Alban at (49, 21) clear of its cab. Alban begins the confrontation at (49, 23) and retreats behind Petra. A walkable cell alone does not guarantee visibility: review the actor’s full silhouette against foreground scenery, as well as its footing.

## Story objects

The map owns four kinds of point-object layer:

- **Interactions:** object names are stable interaction IDs. Properties hold `label`, optional `sprite`, `sign`, and the existing visibility/completion flags. Moving a point moves its marker and interaction destination together. Place it on a floor or immediately beside a reachable approach.
- **Arrivals:** named travel and scene-completion positions, resolved by `arrival(map, name)`. Preserve the names when changing a layout.
- **Scene:scene-id:** initial character casts. Object names are registered character IDs; the optional boolean `hidden` property stages an initially absent actor. `stage(map, sceneId)` supplies the cast to the dialogue director. Staged moves and camera shots remain beside their dialogue in `scenes.ts`.
- **People:** silent background civilians. Object names identify placements; `sprite` selects a role from `src/content/civilians.ts`. Optional `requiredFlag` and `hiddenFlag` follow campaign progress. These actors use the same native scale and ground sorting as the cast, remain visible during cutscenes, and have no dialogue, marker, label or interaction target. Keep them away from doors, arrivals and staged actors. They do not change tile collision.

Point objects snap to cell centers. A rectangular interaction object can cover a painted door: `approachX` and `approachY` select its reachable grid destination while the rectangle owns its clickable area. The prison-coach door uses this form. Preserve campaign map IDs, story flags and interaction IDs. Check staged destinations as well as initial casts when changing routes. The pass's row-14 floor ends at column 38; 39–41 remain blocked rock beyond the boarding quay.

Chapter Two’s loading barrier hides after `trainRaidWon`; recovered medicine appears after `prisonersFreed`. At Cinderbank, `coastCollectorWon` replaces the working collector and suspended threads with its broken casing; `evacuationReady` adds supplies for the medical coaches. The boarding arena already shows the opened casing. Neither state changes the rescue route. Through tracks reach both edges at coast rows 13/31 and Cinderbank rows 13/25.

Each exploration map's `safeArrival` property names an arrival on its main connected route. Loading a valid current-format save keeps its position when that cell is still walkable. If a layout edit covers or crops the cell, restoration selects the nearest floor connected to that arrival, using the active story layers. Progress, party resources and equipment stay intact. This uses the current save format only; it does not migrate retired versions.

Only SVG scene sources used by the destination and its battlefields are required to enter it. Failed loads can be retried, and a chapter departure is consumed only after all destination maps load.

`tests/tilemaps.test.ts` verifies atlas references, layer dimensions, arrivals, bridge and cliff collision, state changes and clear tactical floors. Existing chapter tests cover interaction approaches and every staged endpoint. The manual Chapter One browser journey checks the full route, all four fights, equipment, departure and reload. Native rendering checks compose reference pixels from the tile pages rather than a discarded background.

`tests/e2e/tilemaps.spec.ts` also walks the phone routes through both river banks and the pass's side recesses. Its foreground check compares native canopy/actor pixels with Nell behind and in front of the same tree. Desktop and phone save checks restore former lower Rillbridge positions, save/reload them and walk back to the residents. These detailed browser checks stay outside the default `@ci` gate.

## Image publication budget

Whole-map SVG scenes are allowed for Chapters One–Three; the former 192px dimension limit applies only to native raster tile pages. Large raster authoring sheets stay outside the repository. Export reusable terrain tiles and scenery modules into small native image pages before staging anything. This also applies to authoring source imagery: do not commit a large source sheet alongside the small runtime pages, and do not disguise sheets as encoded text fragments. Preserve the pixels and alpha of exported tiles; use additional pages rather than lowering image quality to fit the limit.

After staging, run `npm run check:art-upload`. It checks the exact staged blobs for every added or modified raster image and refuses Chapter One pages over 128 KB (128 KB for other raster files). Upload each approved file independently. The content tests separately check native dimensions, page sizes, contiguous IDs and map references. The supplied previews have been recovered as 24 scenery modules and six terrain fields, exported into bounded native pages.


## Chapter Three

The current runtime renders the whole SVG engine-complex originals described in [Chapter Three vector artwork](../assets/vector/chapter-three.md). Tiled remains the layout, collision, staging and flag source; its raster page thumbnails and the following historical import recipes are retained for editing, not runtime fallbacks. The vector compiler preserves module extents, registered pipe ports and sorted ground depths.

The palace gate, control bank and vessel are reusable modules exported into small pages by `assets/tiles/import-chapter-three.py`; see `assets/tiles/chapter-three-art.md`. Existing page bytes and tile IDs stay stable. The chapter shares dimensional stone, cave and railway materials with earlier maps; no whole painting is subdivided into pieces. Each of the five encounters owns a clear tiled floor, including both regulator approaches.

`assets/tiles/import-palace.py` exports the imperial pressure hall, repeatable factory wings and medical receiving pavilion; `palace.json` owns their fixed native budgets and transparent headroom. Their stable module IDs replace the rejected limestone/slate facade in place. The exterior shares the vessel's ribbed green iron, brass retaining collars and gray masonry, with a large pressure dome and sun crest distinguishing the main entrance. Northglass uses the interior kit's metal stairs; the outdoor arrest repeats the exterior's lower factory bays above its clear paving. `import-engine-works.py` and `engine-works.json` export the accepted interior kit: masonry with riveted green-iron window bays, steel service walks, iron stairs, pipe fittings and a low steel cutaway. The gallery and stores arenas use masonry; the chamber's decks and both regulator arenas use steel. The rejected marble wall/floor slots are replaced in place, while the added steel, stairs and pipe pieces append IDs. Architectural floor edges stay crisp. Repeated modules share their ground anchors; do not put a facade or support over a staged actor or tactical cell.

The intake manifold descends into the gallery's control table. In the chamber, the vessel feed joins the right-hand console with a pressure branch along the deck; the auxiliary governor's pipe begins beneath its casing. Pipe ports register at native cell-edge midpoints, with actual elbow and junction pieces. Feed-light layers follow those connections and hide after shutdown. They are floor details and do not create invisible navigation walls.

Interactions, named arrivals and initial casts live in the three Tiled maps. The engine works door and feed console have clickable rectangles over their actual artwork and reachable approaches below it. Staged moves remain in the dialogue; do not leave actors hidden behind props when changing those endpoints. Current-format saves covered by a console or the vessel restore through the same connected-floor rules as earlier chapters.

Patients and families remain beside the medical coaches until the escape; the gallery fitters leave after Tomas is freed. Feed-light layers disappear after extraction stops. Dena helps unload the patients and protects them during the renewed arrest. These supporting people add no errands. The chapter still saves Tomas permanently, offers both intake routes and all five equipment rewards, and preserves the Chapter Four departure.
