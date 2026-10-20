# Native tile maps

Open `src/content/chapter-one/maps/*.json` and `src/content/chapter-two/maps/*.json` directly in Tiled. Each file is an ordinary finite orthogonal map with uncompressed numeric tile layers. They share a **24 × 24** tile vocabulary, catalogued in `assets/tiles/chapter-one.tileset.json`. Small native lossless PNG/WebP pages live in `public/art/chapter-one/`; each has a standard external Tiled tileset in `assets/tiles/pages/`. Maps reference those page tilesets directly, so they remain editable in Tiled. `assets/tiles/tile-definitions.ts` provides ordinary imports for both the game and Node-based content tools. Each page is at most **192 × 192 pixels and 128 KB**, and is uploaded as its own image file. The dimensional pack comes from the supplied modular railway scenery and material sheets; no whole-map painting was sliced into tiles. `assets/tiles/README.md` records the importer and source crop manifest. Normal development and builds use the checked-in files directly.

Keep existing tile IDs stable when extending the tile set: append new definitions so the maps' references keep their meaning.

Chapters One and Two share the tile pages: seven exploration maps and eight tactical arenas. Their map JSON files are the editable layout source. Chapter Two appends harbor and ward props without changing earlier tile IDs or image bytes. The obsolete coast and Cinderbank paintings and encoded fragments have been removed. Chapters Three and Four retain native scenery, including the `infirmary` painting used by the Chapter Four refuge.

| Map | Grid | Story route |
| --- | --- | --- |
| `station` | 42 × 26 | Festival square below the arrest platform; Iona's stall, memorial and west exit share one connected plaza |
| `yard` | 42 × 26 | Engine apron and Orrin first; spare shed to the south; disused branch to the northwest |
| `rillbridge` | 64 × 28 | Leave the engine west of the river, cross the wooden bridge, pass the residents and reach the collector; the north road leads to the pass |
| `tunnel` | 42 × 26 | Cave railway through the blockade; carved mural recess above, shelter below, engine and boarding quay at the east |
| `coast` | 64 × 42 | Sea and cranes behind the barred coach; west loading gate and east signal walk lead around the guard barrier; ward exit and Orrin’s engine below |
| `infirmary` | 64 × 42 | Windowed railway ward, medicine desk and stove; beds flank the clear central aisle between the exchange and siding exits |
| `cinderbank` | 64 × 42 | Medical coaches, miners’ homes and coal shed frame the collector; evacuation leads east to Petra shielding Alban at the capital crossing |

The tactical `battle-*` maps frame clear fighting floors with location-specific tracks, train parts, machinery or cliffs. Their hex cells remain clear of scenery props. Combat rules, obstacles and rewards remain in `encounters.ts`.

## Layers and collision

Ground, paths, structures and details draw as native Phaser tile-map layers. Layers with the boolean `sort` property draw their individual tiles among the actors at their ground anchors. Multi-tile trees and machinery use each tile's `sortOffset` property to share one ground depth; walking in front of a canopy draws the character in front of it. Actor depth also updates during cutscenes and movement. No layer or actor is scaled or recolored.

Walkable bridge decks and stair treads are floor layers below actors. The footbridge's near rail and posts form a separate sorted layer, cut from the same source pixels without overlapping the deck image. Only its middle deck row crosses the river; the railings and water above/below it stay blocked. The importer records the split in `scenery.json` and appends foreground tiles without repacking existing image pages.

Through tracks continue to both map edges. The yard's engine stands on row 11; the pass uses rows 10 and 12, with shelf terrain beneath the eastern ends. Rillbridge's eastern carriage stands on row 14, aligned with the line, and a stone viaduct supports that line over the river.

The eastern pass and captain arena share cave wall, roof, floor and cutaway ledge tiles. Solid roof/wall tiles block movement; floor tiles open the existing route. Ledge lips are floor, with blocked faces below them, drawn beneath actors. The cave sheet is an independent material source, exported by `assets/tiles/import-caves.py`; re-importing railway scenery preserves those appended tile IDs. See `assets/tiles/caves.md` for the art brief and crop recipe.

Tile definitions carry an optional boolean `walkable` property. Navigation reads the same active tile layers as rendering, in map order. The last explicit value wins: a bridge deck can make water passable, while a wall, trunk or carriage blocks the floor beneath it. Decorative tiles omit the property. Do not add separate collision rectangles to these maps. Keep painted floor edges and navigable cells aligned.

Layer properties `requiredFlag` and `hiddenFlag` name existing campaign flags. They apply to both drawing and collision. Larkspur's festival line and prison coach disappear after the arrest; the cap appears. Rillbridge's suspended drops, threads and intact collector give way to running water and the broken casing after the release. These are story states, without confirming the crystal's nature.

## Terrain transitions

Chapter Two uses feathered ballast, paving and dirt edges over the neighboring ground. Tile layers marked `blendEdges: true` are baked by `python3 assets/tiles/blend-terrains.py`; the tool chooses reusable edge/corner tiles from their neighbors and appends missing variants without changing earlier IDs or pixels. Each join changes only edge alpha over seven native pixels. Solid centers keep their source colors, scale and walkability. There is no runtime filtering or palette reduction.

Paving and ballast have separate overlapping layers at crossings. A row of paving underneath the ballast lets the join reveal the actual neighboring surface. Water-facing quays, ward cutaways and map boundaries retain their architectural hard edges. Keep enough overlap beneath a join rather than exposing a stripe of unrelated base terrain. The standard finite Tiled JSON files remain the layout source; builds consume the baked pages directly.

Cinderbank’s capital engine anchors at (57, 25), leaving Petra at (47, 23) and Alban at (49, 21) clear of its cab. Alban begins the confrontation at (48, 23) and retreats behind Petra. A walkable cell alone does not guarantee visibility: review the actor’s full silhouette against foreground scenery, as well as its footing.

## Story objects

The map owns three kinds of point-object layer:

- **Interactions:** object names are stable interaction IDs. Properties hold `label`, optional `sprite`, `sign`, and the existing visibility/completion flags. Moving a point moves its marker and interaction destination together. Place it on a floor or immediately beside a reachable approach.
- **Arrivals:** named travel and scene-completion positions, resolved by `arrival(map, name)`. Preserve the names when changing a layout.
- **Scene:scene-id:** initial character casts. Object names are registered character IDs; the optional boolean `hidden` property stages an initially absent actor. `stage(map, sceneId)` supplies the cast to the dialogue director. Staged moves and camera shots remain beside their dialogue in `scenes.ts`.

Point objects snap to cell centers. A rectangular interaction object can cover a painted door: `approachX` and `approachY` select its reachable grid destination while the rectangle owns its clickable area. The prison-coach door uses this form. Preserve campaign map IDs, story flags and interaction IDs. Check staged destinations as well as initial casts when changing routes. The pass's row-14 floor ends at column 38; 39–41 remain blocked rock beyond the boarding quay.

Chapter Two’s loading barrier hides after `trainRaidWon`; recovered medicine appears after `prisonersFreed`. At Cinderbank, `coastCollectorWon` replaces the working collector and suspended threads with its broken casing; `evacuationReady` adds supplies for the medical coaches. The boarding arena already shows the opened casing. Neither state changes the rescue route. Through tracks reach both edges at coast rows 13/31 and Cinderbank rows 13/25.

Each exploration map's `safeArrival` property names an arrival on its main connected route. Loading a valid current-format save keeps its position when that cell is still walkable. If a layout edit covers or crops the cell, restoration selects the nearest floor connected to that arrival, using the active story layers. Progress, party resources and equipment stay intact. This uses the current save format only; it does not migrate retired versions.

Only tile pages used by the destination map are required to enter it. Failed page loads can be retried, and a chapter departure is consumed only after all destination maps load.

`tests/tilemaps.test.ts` verifies atlas references, layer dimensions, arrivals, bridge and cliff collision, state changes and clear tactical floors. Existing chapter tests cover interaction approaches and every staged endpoint. The manual Chapter One browser journey checks the full route, all four fights, equipment, departure and reload. Native rendering checks compose reference pixels from the tile pages rather than a discarded background.

`tests/e2e/tilemaps.spec.ts` also walks the phone routes through both river banks and the pass's side recesses. Its foreground check compares native canopy/actor pixels with Nell behind and in front of the same tree. Desktop and phone save checks restore former lower Rillbridge positions, save/reload them and walk back to the residents. These detailed browser checks stay outside the default `@ci` gate.

## Image publication budget

Large authoring sheets stay outside the repository. Export reusable terrain tiles and scenery modules into small native image pages before staging anything. This also applies to authoring source imagery: do not commit a large source sheet alongside the small runtime pages, and do not disguise sheets as encoded text fragments. Preserve the pixels and alpha of exported tiles; use additional pages rather than lowering image quality to fit the limit.

After staging, run `npm run check:art-upload`. It checks the exact staged blobs for every added or modified raster image and refuses Chapter One pages over 128 KB (128 KB for other raster files). Upload each approved file independently. The content tests separately check native dimensions, page sizes, contiguous IDs and map references. The supplied previews have been recovered as 24 scenery modules and six terrain fields, exported into bounded native pages.
