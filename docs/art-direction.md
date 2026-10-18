# Art and interface

## Native presentation

Use a **1024 × 768** desktop framebuffer. Navy panels, brass borders, cream bitmap lettering, red coats and amber lanterns connect the UI to the railway scenery. The entire visible game—including text, menus, geometry and scenery—uses the same raster, enlarged by an integer number of physical pixels. Verify fractional device-pixel ratios as well as ordinary desktop and phone sizes.

Scenery renders at **1:1**, through a 1008 × 480 desktop viewport. Phones crop and pan at the same pixel density. Never shrink an environment to fit the viewport, posterize its colors or reduce its palette. Portraits are native **128 × 128**; world actors and HUD portraits are native **80 × 80**. Keep borders outside the image content. Initiative uses names rather than tiny portraits.

The semantic DOM is invisible; its hit areas, focus and file input remain accessible. `pixel-font.ts` paints the original glyph masks, and the bundled `switchyard.woff` provides matching DOM metrics. To rebuild the font, use `python scripts/build-font.py`; normal builds do not need Python.

## Chapter One scenery

| Source | Native size | Role |
| --- | --- | --- |
| `station.webp` | 1008 × 624 | Larkspur festival and the arrest; native bunting and lantern details appear before the raid, Ansel's cap afterward |
| `yard.webp` | 1008 × 624 | Orrin's workshop, independent engine, optional shed and quiet tactical clearing |
| `rillbridge.webp` | 1595 × 986 | The village stopped by a collector; fixed suspended motes disappear when the village is freed |
| `tunnel.webp` | 1008 × 624 | The eastern mountain pass, old shelter, hollow-sun mural and captain's blockade |

The scenery remains the original generated raster artwork. Tiled collision follows buildings, rail vehicles and walls. All interaction points and staged actor positions have connected, walkable approaches. Do not place characters on scenery whose visible floor is at a different height.

The other restored scenery and unused character assets remain an art library for future chapters. Their old narrative roles do not survive the reboot. `scripts/restore-map-art.mjs` reconstructs larger lossless files from verified source chunks and checks byte lengths and SHA-256 without changing dimensions or colors.

## Characters

`src/content/characters.ts` registers each named character. Ansel and Iona exclusively own the original `master` and `clerk` sprite/portrait pairs. Nell and Orrin retain their existing directional actors. Tilda retains her red hair, cream kerchief and green dress. Elspeth retains her wheelchair, plum shawl and blue register.

**Tomas** and **Captain Alban** have new matching actor and portrait pairs, created with built-in Image Gen using Nell's actor and portrait as style and proportion references. The transparent source sheets were mechanically separated and exported into native 80 × 80 actor and 128 × 128 portrait canvases with point sampling. Only near-transparent background glow was discarded; runtime never rescales or recolors the exported assets. The character tests verify native dimensions and distinct image contents.

Production prompt briefs:

- **Tomas:** Nell's older brother, 24; short tousled brown hair, brown eyes, clean-shaven, navy traveling jacket, cream shirt, worn red scarf, brass sun brooch and leather satchel. Warm but worried expression. A matching upper bust portrait and complete compact front-facing actor, real alpha background, intricate discrete early-PC pixel shading, no scenery, labels, extra poses or floor shadows. Match Nell's large-head/short-leg world proportions.
- **Captain Alban:** human imperial officer in his late thirties; pale skin, angular face, swept-back dark hair with a silver streak, navy longcoat, ivory breastplate, brass sun, burgundy sash, white gloves and saber. Clearly human face without mask or goggles. The same sheet layout, native export sizes, pixel treatment and transparency constraints as Tomas.

**Kit:** a seventeen-year-old boy courier; short tousled chestnut hair, clean-shaven boyish face, bashful smile, dusty blue jacket, cream shirt, ochre scarf, brown satchel and boots, compact repeating crossbow. His new transparent portrait/actor sheet was generated with Nell’s art as the style and proportion references, then mechanically separated and point-sampled into native 128 × 128 and 80 × 80 canvases. No runtime rescaling or recoloring.

Celia and Petra own matching unused sprite/portrait pairs for the future companion roster. Celia has gray hair, a green coat and a medical book; Petra has short dark hair and an imperial uniform. Their old story roles remain discarded. The Vite workshop alone preloads these future companions’ combat actors.

Keep these identities consistent in dialogue, exploration, staging and battle. The captain's combat archetype remains the engine's officer rules, but his appearance is `alban`, never the retired inspector character.

## Cutscenes and combat

Stage key events with temporary actors, camera cuts and pans, sound cues and concise dialogue. The director never changes scale. Reduced motion snaps actor/camera movement. Interrupted scenes commit no partial plot progress; Skip runs the same completion callback once. Final protagonist positions are committed with their scenes, so the return to exploration stays on the same walking surface.

Keep the crystal effects understated: a fleck in the lantern glass, a cold handle and a low beating resonance. The old sun mural is worn and incomplete. Do not overlay a divine eye, a radiant power symbol or a final-boss cutaway in Chapter One. Stage the pass scenes on the lower stone walkway (tile row 14), with the same footing in exploration and cinematic actors. The stone threshold ends at column 38; columns 39–41 are open air and blocked. Keep retreats and boarding inside that boundary.

The opening pursuit uses Larkspur square; the other encounters retain the quiet yard clearing and explicit geometry. Blue shows reachable ground, brass/white outlines show targeting, and orange marks warn of end-of-round steam. Keep preview and resolution on the same hex geometry. Use native actors, cover rocks, HP bars and damage text. Pan on narrow screens rather than shrinking the battlefield.
