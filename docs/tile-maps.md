# Chapter One tile maps

Open `src/content/chapter-one/maps/*.json` directly in Tiled. Each file is an ordinary finite orthogonal map with uncompressed numeric tile layers. They share `assets/tiles/chapter-one.tileset.json` and the native **24 × 24** atlas, `public/art/chapter-one-tiles.png`. The atlas is under 10 KB. It is original pixel artwork built from terrain, rails, architectural parts and reusable props; no whole-map painting was sliced into tiles. `node assets/tiles/draw-chapter-one.mjs` rebuilds the atlas and its tile definitions. Normal development and builds use the checked-in files directly.

The four exploration maps and four tactical arenas use the same tile set. The chapter's former backgrounds and Rillbridge image fragments have been removed. Later chapters still use their current native scenery until their own map conversion.

| Map | Grid | Story route |
| --- | --- | --- |
| `station` | 42 × 26 | Festival square below the arrest platform; Iona's stall, memorial and west exit share one connected plaza |
| `yard` | 42 × 26 | Engine apron and Orrin first; spare shed to the south; disused branch to the northwest |
| `rillbridge` | 64 × 28 | Leave the engine west of the river, cross the wooden bridge, pass the residents and reach the collector; the north road leads to the pass |
| `tunnel` | 42 × 26 | Stone shelf through the blockade; mural recess above, rest shelter below, engine and boarding quay at the east |

The tactical `battle-*` maps frame clear fighting floors with location-specific tracks, train parts, machinery or cliffs. Their hex cells remain clear of scenery props. Combat rules, obstacles and rewards remain in `encounters.ts`.

## Layers and collision

Ground, paths, structures and details draw as native Phaser tile-map layers. Layers with the boolean `sort` property draw their individual tiles among the actors at their ground anchors. Multi-tile trees and machinery use each tile's `sortOffset` property to share one ground depth; walking in front of a canopy draws the character in front of it. Actor depth also updates during cutscenes and movement. No layer or actor is scaled or recolored.

Tile definitions carry an optional boolean `walkable` property. Navigation reads the same active tile layers as rendering, in map order. The last explicit value wins: a bridge deck can make water passable, while a wall, trunk or carriage blocks the floor beneath it. Decorative tiles omit the property. Do not add separate collision rectangles to these maps. Keep painted floor edges and navigable cells aligned.

Layer properties `requiredFlag` and `hiddenFlag` name existing campaign flags. They apply to both drawing and collision. Larkspur's festival line and prison coach disappear after the arrest; the cap appears. Rillbridge's suspended drops, threads and intact collector give way to running water and the broken casing after the release. These are story states, without confirming the crystal's nature.

## Story objects

The map owns three kinds of point-object layer:

- **Interactions:** object names are stable interaction IDs. Properties hold `label`, optional `sprite`, `sign`, and the existing visibility/completion flags. Moving a point moves its marker and interaction destination together. Place it on a floor or immediately beside a reachable approach.
- **Arrivals:** named travel and scene-completion positions, resolved by `arrival(map, name)`. Preserve the names when changing a layout.
- **Scene:scene-id:** initial character casts. Object names are registered character IDs; the optional boolean `hidden` property stages an initially absent actor. `stage(map, sceneId)` supplies the cast to the dialogue director. Staged moves and camera shots remain beside their dialogue in `scenes.ts`.

Point objects snap to cell centers. Preserve campaign map IDs, story flags and interaction IDs. Check staged destinations as well as initial casts when changing routes. The pass's row-14 floor ends at column 38; 39–41 remain blocked open air.

`tests/tilemaps.test.ts` verifies atlas references, layer dimensions, arrivals, bridge and cliff collision, state changes and clear tactical floors. Existing chapter tests cover interaction approaches and every staged endpoint. The manual Chapter One browser journey checks the full route, all four fights, equipment, departure and reload. Native rendering checks compose reference pixels from the tile atlas rather than a discarded background.

`tests/e2e/tilemaps.spec.ts` also walks the phone routes through both river banks and the pass's side recesses. Its foreground check compares native canopy/actor pixels with Nell behind and in front of the same tree. These detailed browser checks stay outside the default `@ci` gate.
