# Art and interface

## Native presentation

Use a **1024 × 768** desktop framebuffer. Navy panels, brass borders, cream bitmap lettering, red coats and amber lanterns connect the UI to the railway scenery. The entire visible game—including text, menus, geometry and scenery—uses the same raster, enlarged by an integer number of physical pixels. Verify fractional device-pixel ratios as well as ordinary desktop and phone sizes.

Scenery renders at **1:1**, through a 1008 × 480 desktop viewport. Phones crop and pan at the same pixel density. Never shrink an environment to fit the viewport, posterize its colors or reduce its palette. Portraits are native **128 × 128**; world actors and HUD portraits are native **80 × 80**. Keep borders outside the image content. Initiative uses names rather than tiny portraits.

The semantic DOM is invisible; its hit areas, focus and file input remain accessible. `pixel-font.ts` paints the original glyph masks, and the bundled `switchyard.woff` provides matching DOM metrics. To rebuild the font, use `python scripts/build-font.py`; normal builds do not need Python.

## Chapter One scenery

| Tile map | Native size | Role |
| --- | --- | --- |
| `station.json` | 1008 × 624 | Festival square below the arrest platform; bunting and the prison coach disappear after the raid, Ansel's cap appears |
| `yard.json` | 1008 × 624 | Orrin's engine apron, northwest branch and southern spare shed |
| `rillbridge.json` | 1536 × 672 | River crossing, bakery, collector carriage and north road; suspended drops and threads give way to running water and a broken casing |
| `tunnel.json` | 1008 × 624 | Continuous stone shelf, mural recess, lower shelter and captain's crossing |

Chapter One uses original native 24 × 24 pixel tiles and real Tiled layers. Shared terrain, architectural parts, rails and props replace its former wholesale images. Tile properties define collision; map object layers own interactions, arrivals and initial scene casts. [Tile-map authoring](tile-maps.md) describes the files and story-state layers. All interaction points and staged actor positions have connected, walkable approaches. Do not place characters on scenery whose visible floor is at a different height.

Restored scenery and character assets not assigned to the playable chapters remain an art library for future chapters. Their old narrative roles do not survive the reboot. `scripts/restore-map-art.mjs` reconstructs larger lossless files from verified source chunks and checks byte lengths and SHA-256 without changing dimensions or colors.

## Characters

`src/content/characters.ts` registers each named character. Ansel and Iona exclusively own the `master` and `clerk` sprite/portrait identities. The whole registered cast uses one consistent pixel-art style; the five playable characters have four directional actors each. Tilda retains her red hair, cream kerchief and green dress. Elspeth retains her wheelchair, plum shawl and blue register.

**Tomas** and **Captain Alban** have new matching actor and portrait pairs, created with built-in Image Gen using Nell's actor and portrait as style and proportion references. The transparent source sheets were mechanically separated and exported into native 80 × 80 actor and 128 × 128 portrait canvases with point sampling. Only near-transparent background glow was discarded; runtime never rescales or recolors the exported assets. The character tests verify native dimensions and distinct image contents.

Production prompt briefs:

- **Tomas:** Nell's older brother, 24; short tousled brown hair, brown eyes, clean-shaven, navy traveling jacket, cream shirt, worn red scarf, brass sun brooch and leather satchel. Warm but worried expression. A matching upper bust portrait and complete compact front-facing actor, real alpha background, intricate discrete early-PC pixel shading, no scenery, labels, extra poses or floor shadows. Match Nell's large-head/short-leg world proportions.
- **Captain Alban:** human imperial officer in his late thirties; pale skin, angular face, swept-back dark hair with a silver streak, navy longcoat, ivory breastplate, brass sun, burgundy sash, white gloves and saber. Clearly human face without mask or goggles. The same sheet layout, native export sizes, pixel treatment and transparency constraints as Tomas.

**Kit:** a seventeen-year-old boy courier; short tousled chestnut hair, clean-shaven boyish face, bashful smile, dusty blue jacket, cream shirt, ochre scarf, brown satchel and boots, compact repeating crossbow. His new transparent portrait/actor sheet was generated with Nell’s art as the style and proportion references, then mechanically separated and point-sampled into native 128 × 128 and 80 × 80 canvases. No runtime rescaling or recoloring.

Celia and Petra retain their established identities in the new matching playable-character set. Celia has gray hair, a green coat and a medical book; Petra has short dark hair and an imperial uniform. Their old story roles remain discarded. Petra appears in Chapter Two as a staged rival and ally. Celia is introduced and recruited on the sanctuary road in Chapter Four; the workshop also makes her artwork available for review.

Keep these identities consistent in dialogue, exploration, staging and battle. The captain's combat archetype remains the engine's officer rules, but his appearance is `alban`, never the retired inspector character.

## Cutscenes and combat

Stage key events with temporary actors, camera cuts and pans, sound cues and concise dialogue. The director never changes scale. Reduced motion snaps actor/camera movement. Interrupted scenes commit no partial plot progress; Skip runs the same completion callback once. Final protagonist positions are committed with their scenes, so the return to exploration stays on the same walking surface.

Keep the crystal effects understated: a fleck in the lantern glass, a cold handle and a low beating resonance. The old sun mural is worn and incomplete. Do not overlay a divine eye, a radiant power symbol or a final-boss cutaway in Chapter One. Stage the pass scenes on the lower stone walkway (tile row 14), with the same footing in exploration and cinematic actors. The stone threshold ends at column 38; columns 39–41 are open air and blocked. Keep retreats and boarding inside that boundary.

The opening pursuit uses Larkspur square; the other encounters retain the quiet yard clearing and explicit geometry. Blue shows reachable ground, brass/white outlines show targeting, and orange marks warn of end-of-round steam. Keep preview and resolution on the same hex geometry. Use native actors, cover rocks, HP bars and damage text. Pan on narrow screens rather than shrinking the battlefield.


## Chapter Two scenery and music

The Iron Coast exchange uses a new built-in Image Gen raster (`public/art/coast.webp`, 1536 × 1024), exported losslessly without scaling or palette changes. Its verified source chunks live in `assets/maps/coast.*.b64`; the manifest records its full SHA-256. The arrival establishes the sea and barred train before cutting to Nell, Orrin and Kit on the lower cobbles. All actors and movements use the same connected ground level. The retained `infirmary.webp` and `cinderbank.webp` assets now depict the railway ward and mining settlement’s medical siding; their former narrative identities remain discarded. Collisions exclude the train bodies, raised ward entrance, cargo and outer fences.

Production prompt brief: a detailed discrete-pixel fantasy railway harbor at blue dawn, brass lamps and navy iron; a barred prison train with imperial sun crests across the upper quarter; sea, cranes and masts beyond; one broad flat cobbled platform, signal hut, loading gate and clear exits. No people, writing, UI or hospital crosses. The Cinderbank artwork was a style reference only. Built-in Image Gen produced the source; lossless PNG/WebP preserves every RGBA pixel. No runtime resizing or recoloring.

The exchange has an original sixteen-bar harbor melody (`score-coast.ts`) using the remembered C–Bm7b5–Em7–Am–Gm7–C7–F–Em–Dm–G–C harmonic reference, extended through a lifted phrase and quiet return. The ward and siding reuse their distinct retained arrangements. Combat retains the tactical and captain themes. Mobile three-fighter exploration lists names and HP without squeezing three native portraits into one row; actors in the world and combat remain 80 × 80.

## Chapter Three scenery and characters

The retained native 1536 × 1024 `northglass.webp` is the capital’s medical siding and `relayhall.webp` its control gallery. The new 1536 × 1024 `conduit.webp` is a subterranean extraction chamber, generated with the gallery and Cinderbank as style references. It shows a restrained faceless crystal vessel above a continuous stone floor, iron/brass machinery, amber and cyan lighting, a console and right access stair; no actors, words or UI are painted into the background. The lossless PNG/WebP preserves the source’s RGB pixels. Verified chunks and the manifest restore it before builds.

The Emperor’s new `emperor.png` (80 × 80) and `portrait-emperor.png` (128 × 128) come from a transparent source sheet generated with Nell’s world actor and portrait as style/proportion references. Brief: weary older human man, shoulder-length silver hair, gray eyes, short silver beard, brass sun circlet, ivory/navy imperial coat and dark mourning ribbon. Two matching depictions, separated by transparent space, no scenery or lettering. Mechanical crop and point sampling export the native canvases; alpha is preserved and runtime never scales/recolors them.

The Engine Warden exclusively uses the previously unused `relay-keeper` actor/portrait; the heart regulator uses `boiler-keeper`. Register both identities for consistent named dialogue and combat artwork. They are separate mechanical characters, not reskins of Alban or the emperor.


## Chapter Four scenery and cast

`refuge` is the same railway ward and loads the existing native 1536 × 1024 `infirmary.webp`. `breakwater` assigns the unused 1591 × 988 `sluice.webp` to its first reboot location; no scaling or recoloring occurs. The alias is explicit in map data, so exploration, combat backdrops and deep save restores use the same art. Collision keeps actors on the cobbled floor below the flood wheels.

The new `sanctuary.webp` is native 1536 × 1024, generated with built-in Image Gen. Production brief: a roofless mountain guardian hall, a hollow sun and three linked rings carved into its rear door, broad continuous stone floor, shallow rear stair, bench at the left arch, chest at the right arch, and an open lower exit; warm brass lamps, cool mountain shadows, no people, words or interface. The generated source was losslessly encoded to WebP with identical RGB pixels. Thirteen verified source parts restore it before development/build. Characters stop on the flat floor below the raised stairs; interaction areas cover the painted door, bench and chest and lead to accessible floor points.

Bram, Dena and the Sanctuary Warden use previously unused matching native actor/portrait pairs. The warden owns `sluice-keeper`; neither its identity nor its art is shared with the two defeated palace machines. Temporary viewpoints use the actual Orrin, Petra and Celia world sprites. Native gold world markers retain the contrasting outline added after Chapter Three.

The refuge’s garden fence and stone pillars are blocked. Reunion stages Celia on the central plaza and commits Nell to her own plaza position afterward; returning from the sanctuary also lands on the open paving.


## Playable-character redraw

Nell, Orrin, Kit, Celia and Petra now share one compact JRPG style: discrete pixel clusters, dark warm outlines, upper-left highlights and cool shadows. Portraits use the same simplified faces and costumes as their world actors. All five have front, left, right and back views. The 80 x 80 exports share a ground anchor at (40, 68); no world actor is stretched or recolored at runtime. Exploration leaders and followers use their actual direction of travel. Cutscenes and combat continue to use the same registered identities and native files.

The Vite-only **Sprites** workshop compares the whole cast, native portraits, directional strips and deliberate integer zoom against light/dark backdrops with optional ground guides. The generated-atlas prompts and authoring export procedure are recorded in `assets/characters/prompts.md`.

## Supporting cast and enemies

All twelve registered NPCs and the Inspector use the party's compact proportions, simplified faces, warm outlines, upper-left highlights and blue-violet shadows. Each has a matching new portrait and front actor. Hound, Crow and Guardian retain their original native sprites: the attempted replacements lost too much detail during downsampling. Existing asset IDs preserve dialogue portraits, exploration encounters and named boss appearances across all four chapters.

The old art supplied identity and costume references while Nell's approved atlas supplied rendering and proportions. Elspeth stays seated in her complete wheelchair; Tilda keeps her kerchief and apron; Ansel keeps his white moustache; Iona keeps her hat, spectacles and ledger. Alban remains visibly human, distinct from the Inspector's steel mask and orange lenses. The Engine Warden keeps its glass signal head and semaphore apparatus; the heart regulator keeps its pressure gauge and clamp hands; the Sanctuary Warden keeps its blue visor and large chest valve. The generic guardian has furnace armor and closed fists, without the regulator's pressure gauge.

World actors use native 80 x 80 canvases. The replacement figures use the common ground anchor at (40, 68) and a 64-pixel height budget; the three original enemy sprites retain their original silhouettes and placement. Width limits preserve aspect ratios. Portraits remain native 128 x 128. The authoring exporter separates portrait/actor pairs at their transparent gap, removes detached fragments and applies recorded nearest-neighbor sampling phases without blending colors. Runtime rendering is unchanged.

`assets/characters/supporting-prompts.md` records the built-in Image Gen prompts and export workflow. `supporting-cast.json` records source-sheet filenames and size budgets; `sampling-offsets.json` records selected actor phases. The workshop reviews every replacement against the same native ground guides as the party.


## Chapter One modular scenery

Chapter One uses the supplied atmospheric railway scenery and six terrain fields as a shared vocabulary: pitched slate roofs and warm windows, rounded iron boilers, layered foliage, mossy cliff faces, stone steps and bridge masonry. Place reusable modules around each scene's route rather than tracing the former whole-map paintings. The station has a raised arrest platform and market square; the workshop centers on the engine and optional shed; Rillbridge frames the crossing and collector; the pass uses a broad supported stone shelf with mural and shelter recesses.

The native 24px pieces retain full colors and transparency. Terrain joins soften the grid, and smaller paving stones keep the scale consistent with 80px actors. Foreground modules share ground-anchor depth across all their pieces so actors pass naturally behind canopies and in front of trunks. Every image page is lossless PNG/WebP, at most 128 KB, with decoded RGBA pixels verified during export. Source sheets remain outside git. See `assets/tiles/README.md` and `docs/tile-maps.md` for import and publication rules.
