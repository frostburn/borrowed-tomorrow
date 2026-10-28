# Chapter Five Acts I–IV — vector source

```sh
node scripts/export-chapter-five-art.mjs
```

`assets/vector/chapter-five.py` reproduces thirteen 1536 × 1008 exploration maps, fourteen 1008 × 624 arenas, native whole SVG layers and their scene manifest. It uses Python's standard library. `assets/characters/vector/chapter-five.py` uses the existing Drawing/Pillow authoring helper to reproduce Alda, Hester, Durn, Aurel, Enna and two unnamed watch models. Their individual 128px portraits are editable originals: the exporter never overwrites them. Aurel and Durn have hand-authored portrait SVGs; only initial female portrait seeds remain in the model helper. The carrier's 80px catalogue actor, 128px portrait, 224 × 168 battle body and 280 × 210 gantry model use the same geometry in the scenery exporter. No bitmap input, resampling or new production dependency is involved.

The new cast follows the accepted broad polygonal models, 80 × 80 frames and (40,68) ground anchor. Alda has a blue pilot coat, pale scarf, gray hair and cap; Hester wears a russet headwrap and rolled sleeves with a brown apron; Durn has a narrow face, green uniform and requisition board. The women have distinct female face construction. Forge enemy recolors preserve their base geometry and are reproduced with `node scripts/export-enemy-variants.mjs`.

Tiled owns navigation, interaction rectangles/approaches, safe arrivals, civilian states and scene casts. The Chapter Five style helper owns whole polygon floor outlines and generates their matching 24px cells, avoiding rectangle seams. Whole architecture sits at ground depths; sky, ship, decks and gangway surfaces remain behind the cast. The wheel, chart, gangway and anchor can be selected through their painted areas. `coolingOpened`, `hammerplainFreed`, `hammerplainComplete` and `fleetSighted` change water, families, crew and horizon layers in the game and Maps workshop.

Hammerplain's western landing uses the same survey hull as the airfield, with mooring lines, cleats and a painted boarding gangway. Hull collision keeps the party beside it; the start and supply approach leave clear standing room. Covered current-version save positions use the existing safe-arrival restore. The gangway remains behind walking actors. The cooling wheel alone has a red rim and spokes; other wheels retain their brass. The lower anchor gantry has a bench, water flask and bandage chest with a reachable supply interaction before the carrier.

The boarding scene sends the five companions and Alda into the cabin in a staggered procession, then hides them inside. The takeoff moves the whole survey ship and its boarded cast together on scene time. It reports passive animation to the shared framebuffer; reduced motion settles immediately. Skip/close removes the update listener and restores temporary transforms. All campaign writes stay in scene completion. The carrier uses legal whole-footprint movement, temporary hot tracks and actual fixed-round attack patterns; custom actor placement follows the path and whole-body alpha picking follows its current base. It has mechanical recoil, not breathing.

Runtime SVGs load with all thirteen regions and local arenas before departure/deep restore. Missing assets retain the prior checkpoint and allow retry. Every SVG is self-contained and below 128 KiB; the common final 2px raster keeps art and text consistent. Maps, Sprites and Music review actual campaign assets. The flagship now shares its native battle presentation with Act IV; only the preset factory remains dev-only.

Run `npm run check`, `tests/e2e/chapter-five.spec.ts` and the focused Chapter Five production checks. Detailed journeys/device/audio checks remain outside the default CI gate. Stage explicit owned files and run `npm run check:art-upload` before publication. Screenshots/traces belong outside the repository.

Dawnwatch adds inhabited terraces, a shelter, gun positions and the signal wall. Aurel wears a plum command coat with brass shoulder plates and has a square, greying face; Enna has dark short hair, a green scarf and a separate female portrait. Common shield/gunner bodies have independent gear. The observation cabin’s station scene is a projection painted into the glass; its Ansel, Tomas and Emperor actors have map-owned projection flags. Only Nell enters the private scene. Completion removes the memory, and telling the others replaces the distant fleet with a closer cordon. No living station NPC is restored.

`shelter-cinematic.ts` temporarily lifts the bar and brings the visible residents to the doorway on scene time, reporting activity to the shared framebuffer. Close/skip removes tweens and restores temporary transforms before the completion flag selects permanent residents. Reduced motion settles immediately. Gun hit rectangles end above the connecting terrace so pointer travel remains clear on phones. All new scenery stays native SVG and all cast soles remain at (40,68).

Windmere is authored in `assets/vector/windmere.py`, called by the same exporter. Its lakeside plaster/green-iron pavilion, cutaway ordinary ward, lower water lift and mirrored gallery use whole SVG geometry over Tiled-owned floor unions. The main canopy is sorted at its column feet; the patient endpoints are by the ordinary beds. The painted engine doubles as the encounter hit area until victory, then the release controls take over. No duplicate miniature boss sits under the whole body.

`assets/characters/vector/windmere.py` authors Iven, Sera and Teren with narrower native body planes compatible with the party, independent male/female face geometry and unchanged (40,68) soles. It can seed the initial Sera portrait, preserving edited originals. Iven and Teren’s hand-authored portrait SVGs are the canonical source. The 256 × 240 ward engine, 80px world/workshop actor, portrait and two side reflectors share geometry. The engine has no breathing motion. The actual fired beam travels through its captured mirror even if the model has announced the next round.

`ward-cinematic.ts` raises equipment and staff together and moves waiting patients to map-owned ordinary-ward endpoints. Passive scene time refreshes the common framebuffer; reduced motion settles immediately. Skip/close kills tweens and restores originals before permanent flag layers appear. All twelve regions and their local arenas, including `ward-engine-battle.svg`, preload before a chapter departure or deep restore replaces the old checkpoint. Maps/Sprites/Music review these same assets. The detailed Windmere journey, review/motion/audio and production-save checks remain outside `@ci`.

The all-three blockade paints a complete 300px horizon before its hulls. It replaces the old distant fleet even when the player deferred the Emperor offer; deck floor and cast remain outside that horizon.

The Chapter Five men have separate facial constructions rather than variants of the female seed: Aurel has a broad, flat jaw, heavy brow, deep-set eyes, cropped grey temples and a thick neck; Durn has a longer, lean jaw, short side-parted hair, a sharper nose and tight mouth; Iven has a square silver beard, pronounced nose and framed eyes; Teren has a broader adult jaw and short dark hair with a quieter expression. The four 80px actors echo these jaw, brow and hair shapes without changing their costumes, frame sizes or sole anchors. Their 128px portrait SVGs are editable originals; do not replace them with a shared template. Review both native portraits and the common 2px game raster before publishing.

Act IV’s `assets/vector/flagship.py` adds a continuous steel command deck, angular bridge windows and console, western evacuation gangway, survey launch and an open-capital horizon selected by `flagshipWon`. Tiled owns the crew, prisoners, interactions, two surrender/evacuation casts and checkpoint arrivals. The approach and final deck casts live on the survey map. Alban’s command-rod and unarmed poses derive from his existing body through `supporting.py`; they preserve his identity and native dimensions. The shared boss exporter now writes to public vectors, including an unarmed crew variant after surrender. `flagship-cinematic.ts` animates the whole approach on scene time with cleanup and reduced-motion support. Re-exporting preserves explicit interaction roles without duplicating their Tiled properties.


## Revised Act IV intervention

The command deck now stages `five-benefactor-claim`, followed aboard by `five-retaliation` and the berth departure. `src/game/claim-cinematic.ts` draws a seam and destructive light and fades the hull/imperial crew; it never loads the Benefactor’s dev-only body. Reduced motion settles immediately. The western gangway and surveyed launch support the escaping party.

`assets/characters/vector/retaliation.py` exports the 80px herald/glasswing and 128px portraits, plus Nell’s `nell-faint` and `nell-ill` poses from her exact current SVG body. The captive-Alban asset is retired. The survey map owns the illness-gated berth, hunter interaction and dedicated minion battle floor. Reproduce everything with `node scripts/export-chapter-five-art.mjs`; no raster processing or production dependency is required.

## Regional angular art and actor illumination

`chapter_five_style.py` owns the thirteen crooked floor perimeters, colored underside/overlap planes, and the slanted factory, cottage and pavilion treatments. `chapter_five_floors.py` authors a distinct material layout for each location; no map-wide slab lattice is shared across the chapter. Windows and mechanical ports remain legible; the red cooling wheel, shared survey hull, boss bodies, source cast anchors and all interaction IDs retain their identities. Dawnwatch and Windmere now have real survey moorings and boarding planks, with hull collision and the existing safe-arrival restoration for covered current-version saves.

`chapter-five/lighting.json` is the shared source registry for campaign, cutscenes, civilians, combat and Maps. It describes uncovered opal work lights, furnace/window glow, hospital glazing, the cabin memory and the three flag-bound anchor sources. Interiors use bright diffuse ambient light and very faint shadows. Outdoor terraces and wooden flight decks have bounded overlapping shadows. The cooling wheel drives the water header, and the hospital wheel connects to the lift guide through a supported line. All fourteen tactical floors retain their actual cells and receive matching fixtures; the furnace, ward and flagship presentations opt into their correct floor silhouettes without changing the accepted boss art or later domain reprises.

Keep the survey takeoff piece on its appended `live` layer, and every command-deck piece individually `live` for the Benefactor strike. Static floor caching must not swallow the images used by cinematic transforms. Command-deck fixture/spill keys share its destruction prefix. Shelter bars, patients, lift equipment, fleet/cordon/blockade/open-crossing flags and Nell’s berth remain separate story layers. Native actors, manual equipment, resources and campaign checkpoints are unchanged.

Run `npm run art:five` to reproduce the full kit. Inspect all thirteen exploration layouts, fourteen arenas and regional flag states in Maps. Run `npm run check`, the native-lighting matrix, regional journeys and the existing takeoff/shelter/lift/finale motion checks; detailed browser checks remain outside the small default CI set. Stage and run `npm run check:art-upload` before publishing.

## Regional floor materials and markers

| Location | Construction and wear |
| --- | --- |
| Airfield | Packed cinder, gravel patches, tie-down rings and cart scuffs |
| Survey deck | Tapered timber planks, staggered butt joints, knots and service hatches |
| Hammerplain | Casting-yard brick, cinder wear and fan-laid landing stones |
| Cooling race | Riveted weathered panels, inset open grates and mineral deposits |
| Anchor gantry | Heat brick and the carrier's paired curved casting rails |
| Dawnwatch | Short, uneven cobbles and fan-laid repairs |
| Gun terraces | Diagonal slate bond, gun platforms and drainage grating |
| Signal wall | Chipped slate and a worn compass/sun inlay |
| Observation cabin | Timber parquet and a woven runner |
| Windmere | Garden fieldstone, moss patches and pale aggregate |
| Dispensary | Small cream/sage ceramic hexagons and a utility runner |
| Mirrored ward | Terrazzo, broad mineral planes and brass optical inlays |
| Flagship bridge | Riveted armor panels, a worn naval stripe and insignia |

Each arena inherits its actual region's material at the same physical scale. Patterns and local repairs are deterministic native SVG geometry, clipped to the unchanged floor perimeter. Keep tactical overlays readable, short material joints, modest contrast and the 128 KiB image budget. Re-export with `npm run art:five`.

The gantry's carrier is a whole native prop, visible during its introduction and hidden on `furnaceWon`. Its painted interaction rectangle covers the model and approaches from the clear floor below its tracks; do not add a second 80px actor to the introduction. Battle art and rules remain shared and unchanged.

`markerFlags` is a comma-separated list of prerequisites for a marker's active color. It requires every listed flag while preserving the interaction's explanatory dialogue. `accessFlag` retains its existing actual access restriction. Both game and Maps use `interactionMarker`; the signal-wall stair/locker require both guns, while the empty observation cabin becomes available after any two regions. Completed and automatic aftermath markers remain suppressed. The Benefactor's opening seam uses a broad ivory core and warm layered halo, on scene time with reduced-motion and skip cleanup.

Circular paving replaces the straight bond on an opaque mortar bed. Curved, staggered courses surround the exploration turntable, gun platforms, fan repairs and signal-wall emblem. The furnace battle retains only its straight casting rails; it has no turntable. The mirrored ward's terrazzo panels and complete concentric inlays share the actual native engine base: (812,415) in exploration and (463,263) in combat. The scene-art regression derives the latter from the real three-contact encounter and the model's base ellipse, so engine placement changes cannot silently detach the floor motif.

Boarding ramps use `gangway.py`, with explicit ship-deck and shore anchors. Keep the landing below the deck and check the rail/plank perspective at each port. Hammerplain, Dawnwatch, Windmere, the flagship, airfield and Chapter Seven crossing share this geometry. The airfield ramp is a live layer: boarding keeps it visible, departure stows it before lift, and cinematic cleanup restores it.
