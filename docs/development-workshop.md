# Development workshop

The **Sprites** tab offers Pixel Art Fixer comparisons when a base civilian is selected under NPCs. It shows the campaign's filtered 63px standing-height presentation alongside the full recovered grid, using the same campaign PNG for both. Raw-grid zoom remains nearest-neighbor at 1x/2x/3x; ordinary actor previews use the same uniform fit as the game. The approved recovered artwork and native-resolution clothing variants now ship in the campaign. See `assets/characters/pixel-fixer.md` for conversion, dimensions and reproduction. Review controls remain dev-only; rejected historical comparison assets have been removed.

The **Maps** tab opens directly at `?dev=maps`. It reviews all thirteen exploration maps and thirteen tiled battlefields without loading or changing campaign progress. Choose a chapter and World/Battle, then select the map by its stable ID. The initial view is Northglass.

Drag with the mouse or scroll to pan; touch scrolling also works. Review at 1x or 2x integer zoom. Click a cell, use the X/Y fields, or move the selection with arrow keys. Arrival centers the map's first named arrival. The inspector lists the cell's tile layers, GIDs, art names, native page files and frame numbers. Hidden tiles remain listed so a bad seam can still be identified after isolating a layer.

Layer buttons toggle individual tile layers; Only isolates one and Reset layers restores the full stack. Story flags compare authored scenery phases. Scene cast previews the map-owned initial actor placements. Actors, Grid, Collision and Markers are separate overlays; collision follows both the selected story flags and visible tile layers. Painted Chapter Four maps retain their native dimensions and offer people/collision review, with a retry message when their optional art is unavailable.

**Copy reference** copies the map ID, selected cell/pixel coordinates, scene, flags, tile sources and a review link. The address bar also retains map, selection, pan, integer zoom, overlays and layer visibility, so a copied link reopens that view. **Download view PNG** exports the visible map crop for attaching to feedback. No campaign saves, inventory, character builds or repository map files are written. All of this code remains Vite-only.

Run `npm run dev`, then choose **Workshop** on the title screen, or open `/?dev=workshop`. The former `/?dev=inventory` link opens the Equipment tab. The workshop exists only in Vite's dev server. `npm run build` and `npm run preview` include the campaign inventory; neither query parameter enables the workshop there.

Choose Nell, Orrin, Kit, Celia or Petra, then **Character** or **Equipment**. Each character has an independent level, build and loadout. **Add to party** and **Remove from party** edit the practice lineup: at least one and at most three companions may fight. Selecting a portrait edits that character without changing party membership. Reserves keep their builds and equipment; reloading preserves the selected lineup. The portrait column shows effective stats, including equipped bonuses.

## Canonical Chapter Two start

On the Vite dev title screen, choose **Begin Chapter Two (canonical)**. It creates a fresh version-10 campaign save at the Iron Coast: Chapter One complete, Nell and Orrin at level 3 with full HP/focus, five bandages, the Chapter One combat rewards, and Nell’s brass reflector equipped. Kit is introduced and recruited normally. It uses no workshop builds or storage. If a journey already exists, the in-game confirmation explains that the autosave will be replaced; manual slots remain available. Continue, equipment, export and ordinary progression work normally afterward. The factory, button and confirmation are absent from production.


## Canonical Chapter Three start

On the Vite dev title, **Begin Chapter Three (canonical)** starts a fresh level-5 save (420 XP) with Nell, Orrin and Kit at the capital medical siding. It records the loading-gate raid, all rescued passengers and the victory over Petra at the crossing; she has refused Alban but has not joined. Nell carries her brass reflector, Kit his courier sight, and Orrin the reinforced work coat. The remaining earned marks and five bandages are available, everyone has full HP/focus, and the capital arrival replays normally. It uses no workshop settings and follows the same autosave confirmation/manual-slot rules as the Chapter Two start. The factory and button are absent from production.

## Future companions

The workshop previews companions planned for later story chapters. Kit is a fast Iron Coast boy courier who gets flustered around Nell; Celia is an older physician; Petra is an imperial knight whose defection develops across Chapters Two and Three. Recruitment plans and the constraints on Kit’s unresolved puppy-love gag live in `docs/story/characters.md`. Kit has new matching artwork; Celia and Petra use the unused art library. Each has an 80 × 80 actor and 128 × 128 portrait.

| Companion | Default HP / Attack / Armor / Speed / Move | Level 1 | Level 2 | Level 3 | Level 5 |
| --- | --- | --- | --- | --- | --- |
| Kit | 38 / 10 / 0 / 9 / 4 | Strike, Quick shot, Bandage | Piercing bolt | Feint | Volley |
| Celia | 40 / 8 / 0 / 6 / 3 | Strike, Celestial bolt, Mend, Bandage | Rally | Beacon | Sanctuary |
| Petra | 62 / 14 / 1 / 4 / 3 | Strike, Shield bash, Bandage | Taunt | Saber sweep | Crushing blow |

Celestial bolt is available at level 1: a weak attack on any enemy, 1 focus, ignoring distance and obstacles. It uses Celia’s Attack bonus. Rally restores another ally’s focus, up to six. Sanctuary grants an area barrier only to allies and preserves stronger barriers. Shield bash is an optional extra action once per turn, before Petra’s main action. It deals no damage, leaves barriers and Dazzle counters unchanged, costs 1 focus, uses the existing clear-hex push rules and preserves her movement and main action. Its button disables after use, and waiting is unavailable after a bash. Taunt replaces Cover at level 2. Select it to preview all affected enemies, then confirm without aiming. For 2 focus, every enemy targets Petra until her next turn; enemies that cannot reach her approach her instead of attacking someone else. Area attacks can still catch other units. Taunt ends early if Petra falls. Saber sweep previews immediately on selection, excludes Petra and can hit neighboring allies. The courier sight, medic clasp and balanced saber hilt fit their respective owners; coats fit all five companions.

## Levels and base stats

Levels range from 1 to 10. Changing level restores that level's base stats and recomputes learned abilities; equipment stays equipped. Each level adds 6 max HP and 2 attack. Speed, armor, movement and starting focus keep their character defaults. Petra’s default movement is three. Existing saved stat edits stay intact; use Level defaults to apply updated defaults to an existing build.

Edit Max HP (1–999), Attack (1–199), Armor (0–99), Speed (1–30), Movement (1–10), or Starting focus (0–6), then choose **Apply base stats**. Plus and minus buttons edit the same fields. Only whole numbers in the shown ranges are accepted; an invalid field prevents the entire build from being applied. **Level defaults** restores the selected character's base stats without changing their level or equipment.

Starting focus is the value before normal turn regeneration. A character gains one focus at the start of their turn, up to six. Higher speed acts earlier; armor reduces damage; movement determines reachable hexes. Base Attack is Strike's damage before armor, defense and equipment. Other attacks use the same bonus relative to their own power. Healing and support strength do not scale with Attack.

| Level | Nell | Orrin |
| --- | --- | --- |
| 1 | Strike, Lantern burst, Bandage | Strike, Steam lance, Bandage |
| 2 | Mend: heal one ally | Rivet shot: ranged attack ignoring 2 armor |
| 3 | Dazzle: the enemy's next three attacks deal 40% less damage, including retaliations | Safety guard: a 10-point barrier for one ally |
| 5 | Beacon: heal allies in a seven-hex area | Pressure wave: damage neighboring units and push survivors one clear hex |

The Abilities panel shows every unlock and whether it is known. Lowering level removes abilities above that level. Combat buttons and number shortcuts include every learned ability. Beacon can aim at an empty center and never heals enemies. Guard lasts until absorbed and does not stack; reapplying it restores at most 10 points. Dazzle tracks attacks rather than turns: retaliation consumes one, an area attack consumes one for its whole area, and moving, defending, waiting, healing or granting guard consumes none. The remaining attack count appears on the unit. Pressure wave previews all affected hexes immediately when selected; only confirmation is required. It hits allies as well as enemies, excludes Orrin, and cannot push into a rock, an occupied hex or off the board. Its preview marks clear landing hexes.

## Equipment

Select an item in the shared bag, compare Attack / Armor / Speed, then equip it. Each character has a tool-fitting slot and a coat slot. Their basic tools remain part of the character. The brass reflector fits Nell's lantern; the pressure nozzle fits Orrin's lance. Coats fit all five characters, but each copy protects only its wearer. The heavy coat trades speed for protection.

Receiving equipment adds copies to the bag without equipping them. Equipping consumes one spare copy and returns the old item to the bag. Unequip a shared item before giving that copy to the other character. The initial stock includes one heavy coat and one of each fitting. New workshops have three reinforced coats, enough for a full party.

## Practice and persistence

### Battle testing tools

Every battle on the Vite dev server, including campaign encounters, has a **DEV** strip above the normal commands:

| Control | Effect |
| --- | --- |
| Win battle | Defeat all enemies and open the normal victory panel with one click. Campaign battles award their usual rewards, journal entries and progress; Continue the journey resumes the story and saves normally. Practice gives no rewards. |
| Lose battle | Down the party and open the normal defeat panel, allowing campaign retry testing without awarding progress. |
| Refill party | Restore every party member to full HP and 6 focus, including downed companions. Keep positions, turn order, actions already used, enemy resources and shared bandages. |
| Restart battle | Restore the encounter’s exact starting snapshot: formation, builds, HP/focus, bandages, round and turn order. Workshop edits and campaign state stay intact. |

Tools work during enemy turns and animations. Each action replaces the battle object and discards pending callbacks from the previous one. Finished battles disable the controls; returning to exploration or the workshop removes them. These controls, their styles and their implementation are absent from production builds.

**Test battle** runs the existing hex engine with the selected party’s builds, learned abilities and equipped items. **Workshop** or Escape returns to the workshop. Completing or abandoning practice gives no campaign rewards and never writes campaign saves. Re-entering practice restores HP, starting focus and bandages.

Equipment uses local-storage key `borrowed-tomorrow:inventory-workshop:v1`; character settings use `borrowed-tomorrow:character-workshop:v1`. Both accept only version-2 records containing the current five companions. Retired version-1 records and replaced-character aliases are not migrated; invalid records use the existing reset behavior. Current loadouts and stat edits remain supported. **Reset workshop** restores all five characters to level 1, selects Nell and Orrin, and returns the equipment stock to the bag. Campaign version-10 saves carry their own inventory and active formation. Workshop storage never feeds campaign equipment.

## Implementation boundary

- `src/rules/characters.ts` owns editable level defaults, stat ranges and validated workshop settings. `src/rules/progression.ts` shares read-only base stats and learned abilities with the campaign. Abilities are derived from level rather than trusted from storage.
- `src/rules/inventory.ts` owns item definitions, spare-copy counts, character loadouts, validation and manual equip/unequip rules.
- `createBattle` accepts optional equipment bonuses, character profiles and an explicit party of one to three distinct companions. Three-person parties spawn on separate hexes. Chapter One remains limited to Nell and Orrin. Chapter Two recruits only Kit; Celia remains available in the workshop for later story development. Campaign saves retain the active formation separately. Without explicit workshop arguments, combat uses campaign HP/focus, equipment and level abilities. Nell retains her original early Mend. The item catalog, read-only progression and inventory rules are shared with production; stat editing remains dev-only.
- `src/dev/workshop.ts` is imported only behind `import.meta.env.DEV`. Its styles, controls and fixture stock are excluded from builds.
- `Adventure` supplies an isolated practice host around the existing renderer and controls. It skips campaign loading, autosaves and victory rewards. Delayed battle callbacks discard work belonging to an abandoned encounter.

Character inventory, equipment loot, shops and current-format saves are integrated into the campaign. Only Kit joins in Chapter Two; Petra joins in Chapter Three; Celia’s introduction is deferred. Equipment retains the formation controls for later recruits. The workshop’s arbitrary levels and stat edits remain isolated.

## Checks

`npm run check` covers progression, validation, equipment conservation and actual combat effects. The optional `npm run test:e2e:smoke` suite exercises character builds, ability controls and equipment on desktop and phone alongside the campaign checks. After building, `npm run test:e2e:production` verifies that both development routes, workshop controls and editable build settings are absent from production, while campaign equipment remains available. `npm run test:e2e:journeys` also completes an equipped practice battle and checks that it gives no campaign rewards.

## Music

Open **Music** in the workshop or go directly to `/?dev=music`. This route and all review UI are excluded from production. Music review does not write campaign saves, inventory or character builds.

- Browse Chapters 1–4 or the retained Library to review all 24 arrangements. The selected cue shows its tempo, meter and 16- or 32-bar loop length. Chapter Two groups Iron Coast, Cinderbank, the 3/4 Railway Ward and all three battle variations together.
- Play from the selected bar, Stop, or Restart cue. Previous/Next bar wrap around the loop; entering a bar number seeks directly. Playback follows the current bar in the inspector. Play after Stop begins at that bar's downbeat.
- Isolate reed, piano, bell, strings, bass or drums, or return to All. Piano includes both its melodic and accompanying notes. Changing the instrument filter restarts the current bar. Volume changes the cue mix.
- Inspect every note's spelling, step class (0–30), frequency and attack beat. Triplet positions use readable fractions such as `2+1/3`. Click a pitch to stop the cue and hear that note alone through the same synth rack.
- Click a circle-of-fifths member to hear its root and fifth. Compare C#4 and Db4 directly: these are distinct notes in 31-EDO. Each adjacent circle member advances 18 steps; the 31-member circle includes both sharp and flat spellings.

Audio starts only after a playback or audition click. The header Sound control also starts/stops review audio. Leaving Music or entering a practice battle stops the review. The campaign uses the same 31-EDO score data, mixer and instruments.


## Sprites

Choose **Sprites** in the workshop or open `/?dev=sprites`. The five playable characters have matching native portraits and four-direction world actors. Choose Party, NPCs or Enemies. Named NPCs come from the character registry; the NPC collection also includes the four silent civilian roles (dock worker, traveler, parent/child and ward patient), including five clothing color variants. These use their actor image without a portrait. Combat enemies are also available, using their actor image when no portrait exists. Single-view entries disable unavailable facings. Compare the cast, choose Front / Left / Right / Back, and inspect one character at 1x, 2x or 3x with nearest-neighbor enlargement. Slate, Paper and Night backgrounds expose alpha edges. Ground guides show the frame, center and common foot anchor. Native lineup and direction strips scroll horizontally on a phone without shrinking the artwork.

Review controls never write campaign saves, equipment or character builds. Leaving Music for Sprites stops music playback; practice still uses the selected character builds. The tab, direct route and review code are excluded from production. Production uses the same new actor and portrait files in exploration, cutscenes, inventory and combat.

Nell offers **Idle** and a three-frame **Attack** preview; **Walk** is disabled. Nell and Orrin use rasterized vector shapes, a 16-color palette, native 80px frames and the row-68 sole guide. Wind-up/contact/follow-through begin at 0/140/220ms, with idle recovery at 300ms. See `assets/characters/vector/README.md`. Orrin, Kit and Petra offer **Idle**, **Walk** and **Attack** previews. Walk cycles through six distinct poses per direction, labeled left contact/support, right passing, right contact/support and left passing. Play/Pause and Next frame review all six walking steps (wrapping 6 back to 1), attack wind-up/contact and recovery in any direction. The file label names the active page and frame. Pausing preserves the displayed frame; leaving the tab stops playback. Petra additionally offers **Bash**, with distinct left-shield wind-up/contact and recovery. Celia retains her static direction review. Motion frames are native 80 x 80 images with the same (40, 68) ground anchor, and tools and blades remain in their anatomical right hands through the complete cycle; Petra keeps her shield in the left. In-game gait follows pixels traveled, preserving its phase through cells and turns.

## Layered animation reference

Choose **Animation** or open `?dev=animation` for a simplified walker made from separate head, torso, leg, upper-arm, forearm, hand and weapon parts. Select Unarmed, Lantern (Nell), Steam lance (Orrin), Crossbow (Kit) or Saber and shield (Petra). The free left arm counter-swings while the selected placeholder weapon stays attached to the anatomical right hand in every view. The saber preset instead carries a separate shield on the left grip. **Arms and weapon** hides those layers together to review the accepted armless body. Review all four directions, play/pause or step through six poses, adjust playback speed, and hide or solo any layer. Teal identifies the anatomical left limbs; amber identifies the right. Shaped feet have separate soles and roll from heel contact through flat support to toe-off. Joint guides include heels/toes, shoulders/elbows/wrists and weapon grips; ankle paths expose the swing. The moving floor marks fixed heel/toe locations so slipping is visible, and the contact readout identifies each support phase. The native strip and 3x inspector use the same layer renderer.


Export the current frame or all six frames as transparent native PNGs, with only the visible layers. Solo a part to export its cycle separately. Filenames identify the selected character skin or mannequin weapon. Pose-data export includes the skin, leg/arm joints, heel/toe landmarks, foot pitch/contact state, right-hand weapon attachment, optional left-hand shield attachment, root travel and native anchor. Review settings are temporary and do not affect saves or character builds. The source model, coordinate system and support-foot constraints are described in `assets/characters/reference-animation.md`.

Side-view equipment keeps its anatomical side, including Nell’s right-hand lantern. The inspector lists each playable character’s handed equipment. Native exports exclude detached alpha fragments, and the browser checks inspect all nonzero-alpha components, not just opaque bounds.


Animation's **Proportions / native pixels** section adjusts the reference skeleton and mannequin body dimensions. It offers compact Nell, stocky Orrin, courier Kit and armored Petra presets and reset controls, with separate session-only edits for the mannequin and all four character skins. Invalid reaches leave the last valid rig visible and explain which measurements to adjust. Native face and costume pixels remain intact. Pose exports include the selected dimensions and cycle travel; these tools never write campaign saves or production animation pages.


Choose **Kit** in Animation for his native face, scarf, rolled sleeves, gloves and boots on the compact courier rig. **Satchel** can be hidden or exported independently; it stays on the left hip while the crossbow stays in the right hand. All 24 walking poses match the baked pages. Sprites adds his braced crossbow wind-up/contact/recovery preview. The same frames play during exploration, following, staged moves and tactical combat. See `assets/characters/kit-rig.md`.


Choose **Petra** in Animation for her native armor, gloves, tabard, saber and shield on the restrained armored rig. **Left weapon** and **Right weapon** expose the shield and saber independently. All 24 walking poses match the baked pages, with independent measurements and anatomical attachments in pose JSON. Sprites reviews walking, saber attacks and shield bash. These frames also serve her staged moves, party combat and Chapter Two boss appearance. See `assets/characters/petra-rig.md`.

## Epic boss preview

Choose **Bosses** or open `/?dev=boss`. **Start finale preset** uses level-10 Nell, Petra and Celia with twelve bandages. **Start phase two** opens the same battle at half health; **Use workshop party** respects the selected one-to-three companions, levels, base stats and equipment. Neither preset changes saved builds or campaign saves. Escape or Workshop returns to this tab. Win, Lose, Refill and Restart use the normal development battle tools.

The Benefactor occupies nineteen connected hexes above the party. Every occupied hex identifies the same unit; movement cannot cross its body, and a blast or line damages it once. Range, melee retaliation, cover and pushes use actual footprints. Anchored enemies resist knockback. The camera keeps the native 360 x 288 boss and back-facing heroes visible without scaling; phone arrows pan normally. Clicking the painted body selects a legal body hex when necessary; legal hex aims retain their exact position for area and line attacks. Healing and support keep their ordinary hex targeting; allies take priority over the projected boss artwork.

Red X hexes announce an attack before the party acts. Heavenfall, Sundering rays and The last horizon rotate by round. Their marked cells stay fixed while heroes move. At the next round after reaching half health, The hollow heart widens the patterns. Taunt redirects judgment to its user; Dazzle, barriers and defense use the shared damage rules. A miss still spends the god's turn. The preview currently uses the Chapter Four warden cue. Story integration, the full transformation sequence and the finale score remain later work.

`src/dev/boss-battle.ts` owns the encounter, presets and attack announcements. `boss-preview.ts` owns its domain, native art assembly and display. `src/game/battle-preview.ts` is a presentation-hook interface; campaign encounters use their ordinary rendering. The reusable footprint and announced-pattern rules are shared, but the god encounter, preset, art imports and UI are reachable only through the Vite development import. The seven small lossless WebP files live under `src/dev/art`, so production does not even copy them as public assets.

`assets/bosses/benefactor-prompt.json` preserves the built-in Image Gen prompt and native export geometry. The regenerated design requests a 1440 x 1152 canvas with coarse 4 x 4 pixel clusters. The tool returned 1402 x 1122; the exporter restores transparent margins at (19, 15), then reduces exactly 4:1 to 360 x 288. It never crops the opaque bounds and scales them to fit. Oversized sources fail instead of silently changing the sampling ratio. Generation does not guarantee a perfectly aligned pixel grid; inspect the final native export, not just its enlarged source.

Run `python3 assets/bosses/export-benefactor.py SOURCE.png` to reproduce six 120 x 144 sprite pages and one 128 x 128 portrait crop. The large source stays outside git. Pages assemble at 1:1 native pixels; no runtime resizing, mirroring or palette reduction occurs. Stage the actual pages and run `npm run check:art-upload` before publishing.

`tests/multi-hex.test.ts` covers perimeter targeting/retaliation, rigid-body movement, whole-body pushes, area-hit deduplication, warnings, phase timing and ordinary defensive effects. The manual `boss-preview.spec.ts` browser checks cover desktop/phone presentation, native chest pixels at fractional DPR, targeting, a complete enemy turn, phase presets, restart/outcomes and campaign isolation. The existing production-exclusion check includes this route and verifies the boss code and assets are absent.
