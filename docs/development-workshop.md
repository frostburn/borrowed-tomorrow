# Development workshop

The **Sprites** tab reviews the current campaign artwork, including native 80px vector civilians and their clothing variants. The earlier Pixel Art Fixer comparison panel is retired; its conversion record remains in `assets/characters/pixel-fixer.md`.

The **Maps** tab opens directly at `?dev=maps`. It reviews all thirteen exploration maps and thirteen tiled battlefields without loading or changing campaign progress. Choose a chapter and World/Battle, then select the map by its stable ID. The initial view is Northglass.

Drag with the mouse or scroll to pan; touch scrolling also works. Review at 1x or 2x integer zoom. Click a cell, use the X/Y fields, or move the selection with arrow keys. Arrival centers the map's first named arrival. The inspector lists the cell's tile layers, GIDs, art names, native page files and frame numbers. Hidden tiles remain listed so a bad seam can still be identified after isolating a layer.

Layer buttons toggle individual tile layers; Only isolates one and Reset layers restores the full stack. Story flags compare authored scenery phases. Scene cast previews the map-owned initial actor placements. Actors, Grid, Collision and Markers are separate overlays; collision follows both the selected story flags and visible tile layers. Chapter Four uses the same SVG layer, cast, collision and story-flag review as the earlier chapters, with retry when a scene source cannot load.

**Copy reference** copies the map ID, selected cell/pixel coordinates, scene, flags, tile sources and a review link. The address bar also retains map, selection, pan, integer zoom, overlays and layer visibility, so a copied link reopens that view. **Download view PNG** exports the visible map crop for attaching to feedback. No campaign saves, inventory, character builds or repository map files are written. All of this code remains Vite-only.

Run `npm run dev`, then choose **Workshop** on the title screen, or open `/?dev=workshop`. The former `/?dev=inventory` link opens the Equipment tab. The workshop exists only in Vite's dev server. `npm run build` and `npm run preview` include the campaign inventory; neither query parameter enables the workshop there.

Choose Nell, Orrin, Kit, Celia or Petra, then **Character** or **Equipment**. Each character has an independent level, build and loadout. **Add to party** and **Remove from party** edit the practice lineup: at least one and at most three companions may fight. Selecting a portrait edits that character without changing party membership. Reserves keep their builds and equipment; reloading preserves the selected lineup. The portrait column shows effective stats, including equipped bonuses.

## Canonical Chapter Two start

On the Vite dev title screen, choose **Begin Chapter Two (canonical)**. It creates a fresh version-11 campaign save at the Iron Coast: Chapter One complete, Nell and Orrin at level 3 with full HP/focus, five bandages, the Chapter One combat rewards, and Nell’s brass reflector equipped. Kit is introduced and recruited normally. It uses no workshop builds or storage. If a journey already exists, the in-game confirmation explains that the autosave will be replaced; manual slots remain available. Continue, equipment, export and ordinary progression work normally afterward. The factory, button and confirmation are absent from production.


## Canonical Chapter Three start

On the Vite dev title, **Begin Chapter Three (canonical)** starts a fresh level-5 save (420 XP) with Nell, Orrin and Kit at the capital medical siding. It records the loading-gate raid, all rescued passengers and the victory over Petra at the crossing; she has refused Alban but has not joined. Nell carries her brass reflector, Kit his courier sight, and Orrin the reinforced work coat. The remaining earned marks and five bandages are available, everyone has full HP/focus, and the capital arrival replays normally. It uses no workshop settings and follows the same autosave confirmation/manual-slot rules as the Chapter Two start. The factory and button are absent from production.

## Canonical Chapter Four start

In Vite dev mode, **Begin Chapter Four (canonical)** starts A Light on the Water at the railway refuge. Tomas and every medical passenger are rescued; Nell, Orrin, Kit and Petra are recruited, with Nell/Orrin/Kit active and Celia unintroduced. The party has 740 XP (level seven), the main Chapter Three rewards and manually fitted equipment. The opening replays, manual slots remain untouched and the control/factory are absent from production. Use Maps to inspect `refuge`, `breakwater`, `sanctuary` and their five battle arenas.

## Future companions

The workshop previews companions planned for later story chapters. Kit is a fast Iron Coast boy courier who gets flustered around Nell; Celia is an older physician; Petra is an imperial knight whose defection develops across Chapters Two and Three. Recruitment plans and the constraints on Kit’s unresolved puppy-love gag live in `docs/story/characters.md`. Kit, Celia and Petra use matching vector artwork while preserving their established costumes. Each has an 80 × 80 actor and 128 × 128 portrait.

| Companion | Default HP / Attack / Armor / Speed / Move | Level 1 | Level 2 | Level 3 | Level 5 |
| --- | --- | --- | --- | --- | --- |
| Kit | 38 / 10 / 0 / 9 / 4 | Strike, Quick shot, Bandage | Feint | — | Ricochet |
| Celia | 40 / 8 / 0 / 6 / 3 | Strike, Celestial bolt, Heal, Bandage | Rallying cry | Area Heal (rank 2) | Sanctuary |
| Petra | 62 / 14 / 1 / 4 / 3 | Strike, Shield bash, Bandage | Taunt | Saber sweep | Crushing blow |

Celestial bolt is available at level 1: a weak attack on any enemy, 1 focus, ignoring distance and obstacles. It uses Celia’s Attack bonus. Rallying cry creates a moving three-round aura that adds one focus regeneration at normal turn start: surrounding allies, then Celia too, then the whole party. It costs three focus, never refills immediately, cannot stack, and ends if Celia falls. Combat offers a separate practice for each rank. Sanctuary grants an area barrier only to allies and preserves stronger barriers. Shield bash is an optional extra action once per turn, before Petra’s main action. It deals no damage, leaves barriers and Dazzle counters unchanged, costs 1 focus, uses the existing clear-hex push rules and preserves her movement and main action. Its button disables after use, and waiting is unavailable after a bash. Taunt replaces Cover at level 2. Select it to preview all affected enemies, then confirm without aiming. For 2 focus, every enemy targets Petra until her next turn; enemies that cannot reach her approach her instead of attacking someone else. Area attacks can still catch other units. Taunt ends early if Petra falls. Saber sweep previews immediately on selection, excludes Petra and can hit neighboring allies. The courier sight, medic clasp and balanced saber hilt fit their respective owners; coats fit all five companions.

## Levels and base stats

Levels range from 1 to 15. Changing the workshop level restores base stats and installs a balanced authored skill allocation; equipment stays equipped. Reset skill choices to assign those points manually. In the campaign, one point per level after one may be spent or saved, and skills never upgrade automatically. Each level adds 6 max HP and 2 attack. Speed, armor, movement and starting focus keep their character defaults. The shared [combat and skill rules](combat-upgrade.md) describe all ranks and character-level requirements. Workshop → Combat supplies isolated level-10/13 practice presets. Petra’s default movement is three. Existing saved stat edits stay intact; use Level defaults to apply updated defaults to an existing build.

Edit Max HP (1–999), Attack (1–199), Armor (0–99), Speed (1–30), Movement (1–10), or Starting focus (0–6), then choose **Apply base stats**. Plus and minus buttons edit the same fields. Only whole numbers in the shown ranges are accepted; an invalid field prevents the entire build from being applied. **Level defaults** restores the selected character's base stats without changing their level or equipment.

Starting focus is the value before normal turn regeneration. A character gains one focus at the start of their turn, up to six. Higher speed acts earlier; armor reduces damage; movement determines reachable hexes. Base Attack is Strike's damage before armor, defense and equipment. Other attacks use the same bonus relative to their own power. Healing and barriers scale with caster level, independently of Attack; bandages remain fixed at 24 HP. Exact values appear in the battle preview. See [Combat and skill rules](combat-upgrade.md#other-geometry-and-support).

| Level | Nell | Orrin |
| --- | --- | --- |
| 1 | Strike, Lantern burst, Bandage | Strike, Steam lance, Bandage |
| 2 | Choose Burst rank 2 or learn Mend | Learn Rivet shot or Safety guard |
| 3 | Learn Dazzle: three weakened attacks | Save a point or choose an eligible skill |
| 5 | Mend rank 2: heal allies in seven hexes | Learn Pressure wave or choose Safety guard rank 2 |

Orrin’s Steam lance keeps its contiguous four-hex caster-originating ray at every rank; upgrades increase damage without introducing gaps. Celia’s Heal has independent progression from Nell’s Mend.

These tables show the earliest character level at which a skill or rank can be chosen, not automatic awards. The Abilities panel shows current/next ranks, their costs and level requirements. Lowering the workshop level installs a valid allocation for that level. Combat buttons and number shortcuts include learned solo skills and derived combinations whose partners are present. Area Mend can aim at an empty center and never heals enemies. Guard scales by rank and character level, lasts until absorbed and never stacks. Dazzle tracks attacks rather than turns: retaliation consumes one, an area attack consumes one for its whole area, and moving, defending, waiting, healing or granting guard consumes none. The remaining attack count appears on the unit. Pressure wave previews all affected hexes immediately when selected; only confirmation is required. It hits allies as well as enemies, excludes Orrin, and cannot push into a rock, an occupied hex or off the board. Its preview marks clear landing hexes.

Team moves require both corresponding solo skills, with no extra upgrade purchase or distance between partners. They spend both attacks; the assisting fighter keeps unused movement at their initiative position, with Move and End turn (F) controls. Lantern volley grows from a seven-hex ball to ten hexes and finally the supplied twelve-hex 3/4/3/2 stencil, following Kit’s Pinning shot rank. Damage sums both solo contributions; Daybreak combines Celia’s Heal and Petra’s Taunt; Lantern volley combines Nell’s Burst with Kit’s Pinning shot; Prism lance combines Horizon light with Steam lance. Both become available when their later solo skill is learned at level seven, without additional rank gates. The circle is Nell → Orrin → Celia → Petra → Kit → Nell, giving everyone two partners. Unavailable moves are gray but can be selected to inspect the named partner's reason in the fixed confirmation area. Campaign upgrade cards reveal combinations only with recruited characters. Workshop → Combat previews Falling stars, Prism lance, Crossfire, Daybreak and Lantern volley with their dedicated effects; both participants animate.

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

Equipment uses local-storage key `borrowed-tomorrow:inventory-workshop:v1`; character settings use `borrowed-tomorrow:character-workshop:v3`. Inventory accepts version-2 records; character settings accept version-3 records with per-character skill choices. Both contain the current five companions. Retired version-1 records and replaced-character aliases are not migrated; invalid records use the existing reset behavior. Current loadouts and stat edits remain supported. **Reset workshop** restores all five characters to level 1, selects Nell and Orrin, and returns the equipment stock to the bag. Campaign version-11 saves carry their own inventory and active formation. Workshop storage never feeds campaign equipment.

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

- Choose **Themes** for a short comparison of Nell (Larkspur festival), Orrin (The Next Shift), Kit (Iron Coast), Petra (The Open Gate), Celia (The Garden Walk) and Alban (Iron Above the Clouds), with intent notes beneath each cue. Browse Chapters 1–7 or the retained Library for every arrangement. The selected cue shows its tempo, meter and 16-, 24- or 32-bar form, or the flagship’s 2-bar introduction plus 32-bar loop. Chapter Two groups Iron Coast, Cinderbank, the 3/4 Railway Ward and all three battle variations together.
- Play from the selected bar, Stop, or Restart cue. Previous/Next bar wrap around the loop; entering a bar number seeks directly. Playback follows the current bar in the inspector. Play after Stop begins at that bar's downbeat.
- Isolate reed, piano, bell, strings, brass, timpani, bass or drums, or return to All. Piano includes both its melodic and accompanying notes. Changing the instrument filter restarts the current bar. Volume changes the cue mix.
- Inspect every note's spelling, step class (0–30), frequency and attack beat. Triplet positions use readable fractions such as `2+1/3`. Click a pitch to stop the cue and hear that note alone through the same synth rack.
- Click a circle-of-fifths member to hear its root and fifth. Compare C#4 and Db4 directly: these are distinct notes in 31-EDO. Each adjacent circle member advances 18 steps; the 31-member circle includes both sharp and flat spellings.

**Expression** compares authored dynamics, vibrato, pitch bends and bell release against a neutral performance. It appears on every expressive cue. **Rubato** appears on Above the Railway, The Garden Walk, A Place to Return, Under the Gantry, The Town Wheel and The Empty Cabin; the whole ensemble shares its clock, including cross-bar holds. Both switches start on; toggling while playing restarts the selected bar. Other cues keep their normal pulse. These choices are session-only and do not alter campaign performance. See [music-direction.md](music-direction.md#expression-and-review) for suggested bars and parts.

**Room** starts with each track’s canonical acoustic space. Select another room or **Dry** while listening; it crossfades without restarting the bar. Picking a different cue restores Canonical. Pitch and fifth auditions share the selected room, and leaving review restores campaign map acoustics. See [room-audio.md](room-audio.md) for authored mappings and routing.

Audio starts only after a playback or audition click. The header Sound control also starts/stops review audio. Leaving Music or entering a practice battle stops the review. The campaign uses the same 31-EDO score data, mixer and instruments.


## Sprites

Choose **Sprites** in the workshop or open `/?dev=sprites`. The five playable characters have matching native portraits and four-direction world actors. Choose Party, NPCs or Enemies. Named NPCs come from the character registry; the NPC collection also includes the four silent civilian roles (dock worker, traveler, parent/child and ward patient), including five clothing color variants. These use their actor image without a portrait. Combat enemies are also available, using their actor image when no portrait exists. Single-view entries disable unavailable facings. Compare the cast, choose Front / Left / Right / Back, and inspect one character at 1x, 2x or 3x with nearest-neighbor enlargement. Slate, Paper and Night backgrounds expose alpha edges. Ground guides show the frame, center and common foot anchor. Native lineup and direction strips scroll horizontally on a phone without shrinking the artwork.

Review controls never write campaign saves, equipment or character builds. Leaving Music for Sprites stops music playback; practice still uses the selected character builds. The tab, direct route and review code are excluded from production. Production uses the same new actor and portrait files in exploration, cutscenes, inventory and combat.

Nell offers **Idle**, a six-frame **Walk** and a three-frame **Attack** preview. Nell, Orrin, Kit and Petra load SVG shapes with a warm, extensible palette, native 80px frames and the row-68 sole guide. Chapter-one NPCs and enemies use the same vector direction. The file label reports the actual SVG/PNG URL. Wind-up/contact/follow-through begin at 0/140/220ms, with idle recovery at 300ms. See `assets/characters/vector/README.md`. Orrin, Kit and Petra offer **Idle**, **Walk** and **Attack** previews. Walk cycles through six distinct poses per direction, labeled left contact/support, right passing, right contact/support and left passing. Play/Pause and Next frame review all six walking steps (wrapping 6 back to 1), attack wind-up/contact and recovery in any direction. The file label names the active page and frame. Pausing preserves the displayed frame; leaving the tab stops playback. Petra additionally offers **Bash**, with distinct left-shield wind-up/contact and recovery. Celia offers Idle and six-pose Walk review, with independent SVG profiles, a swaying green coat and steady left-hand medical book. Her attack preview remains disabled. Motion frames are native 80 x 80 images with the same (40, 68) ground anchor, and tools and blades remain in their anatomical right hands through the complete cycle; Petra keeps her shield in the left. In-game gait follows pixels traveled, preserving its phase through cells and turns.

## Layered animation reference

Choose **Animation** or open `?dev=animation` for a simplified walker made from separate head, torso, leg, upper-arm, forearm, hand and weapon parts. Select Unarmed, Lantern (Nell), Steam lance (Orrin), Crossbow (Kit) or Saber and shield (Petra). The free left arm counter-swings while the selected placeholder weapon stays attached to the anatomical right hand in every view. The saber preset instead carries a separate shield on the left grip. **Arms and weapon** hides those layers together to review the accepted armless body. Review all four directions, play/pause or step through six poses, adjust playback speed, and hide or solo any layer. Teal identifies the anatomical left limbs; amber identifies the right. Shaped feet have separate soles and roll from heel contact through flat support to toe-off. Joint guides include heels/toes, shoulders/elbows/wrists and weapon grips; ankle paths expose the swing. The moving floor marks fixed heel/toe locations so slipping is visible, and the contact readout identifies each support phase. The native strip and 3x inspector use the same layer renderer.


Export the current frame or all six frames as transparent native PNGs, with only the visible layers. Solo a part to export its cycle separately. Filenames identify the selected character skin or mannequin weapon. Pose-data export includes the skin, leg/arm joints, heel/toe landmarks, foot pitch/contact state, right-hand weapon attachment, optional left-hand shield attachment, root travel and native anchor. Review settings are temporary and do not affect saves or character builds. The source model, coordinate system and support-foot constraints are described in `assets/characters/reference-animation.md`.

Side-view equipment keeps its anatomical side, including Nell’s right-hand lantern. The inspector lists each playable character’s handed equipment. Native exports exclude detached alpha fragments, and the browser checks inspect all nonzero-alpha components, not just opaque bounds.


Animation's **Proportions / native pixels** section adjusts the reference skeleton and mannequin body dimensions. It offers compact Nell, stocky Orrin, courier Kit and armored Petra presets and reset controls, with separate session-only edits for the mannequin and all four character skins. Invalid reaches leave the last valid rig visible and explain which measurements to adjust. Native face and costume pixels remain intact. Pose exports include the selected dimensions and cycle travel; these tools never write campaign saves or production animation pages.


Choose **Kit** in Animation for his native face, scarf, rolled sleeves, gloves and boots on the compact courier rig. **Satchel** can be hidden or exported independently; it stays on the left hip while the crossbow stays in the right hand. All 24 walking poses match the baked pages. Sprites adds his braced crossbow wind-up/contact/recovery preview. The same frames play during exploration, following, staged moves and tactical combat. See `assets/characters/kit-rig.md`.


Choose **Petra** in Animation for her native armor, gloves, tabard, saber and shield on the restrained armored rig. **Left weapon** and **Right weapon** expose the shield and saber independently. All 24 walking poses match the baked pages, with independent measurements and anatomical attachments in pose JSON. Sprites reviews walking, saber attacks and shield bash. These frames also serve her staged moves, party combat and Chapter Two boss appearance. See `assets/characters/petra-rig.md`.

## Epic boss preview

Choose **Bosses** or open `/?dev=boss`. The retained early practice fixture’s **Start finale preset** uses level-10 Nell, Petra and Celia with twelve bandages. **Start phase two** opens the same battle at half health; **Use workshop party** respects the selected one-to-three companions, levels, base stats and equipment. Neither preset changes saved builds or campaign saves. Escape or Workshop returns to this tab. Win, Lose, Refill and Restart use the normal development battle tools.

The Benefactor occupies nineteen connected hexes above the party. Every occupied hex identifies the same unit; movement cannot cross its body, and a blast or line damages it once. Range, melee retaliation, cover and pushes use actual footprints. Anchored enemies resist knockback. The camera keeps the native 360 x 288 boss and back-facing heroes visible without scaling; phone arrows pan normally. Clicking the painted body selects a legal body hex when necessary; legal hex aims retain their exact position for area and line attacks. Healing and support keep their ordinary hex targeting; allies take priority over the projected boss artwork.

Red X hexes announce an attack before the party acts. Heavenfall, Sundering rays and The last horizon rotate by round. Their marked cells stay fixed while heroes move. At the next round after reaching half health, The hollow heart widens the patterns. Taunt redirects judgment to its user; Dazzle, barriers and defense use the shared damage rules. A miss still spends the god's turn. This older practice fixture keeps the Chapter Four warden cue. The three **Campaign** buttons review the shipped final forms and their dedicated music; see Chapter Seven below.

`src/dev/boss-battle.ts` owns the encounter, presets and attack announcements. `boss-preview.ts` owns its vector textures and display. `src/game/battle-presentation.ts` is the shared optional presentation interface; the campaign regulator uses it too. The reusable footprint, native display and clock are shared. The early practice encounter, presets and workshop UI stay behind the Vite development import; the actual Chapter Seven encounters and presentation ship with the campaign.

The editable originals `public/art/vector/benefactor/benefactor.svg` (360 × 288) and `benefactor-domain.svg` (1024 × 480) use broad ivory, blue and antique-gold polygonal planes. The boss preserves the approved broken halo, empty face aperture, crystalline heart, layered mantle and connected cupped hands. The domain preserves the platform and camera geometry. Both decode once at their declared dimensions and share the final 2px raster with actors and text. Each motion pose has its own native alpha mask for projected-body picking. These accepted native vectors now live in public assets and ship with Chapter Seven.

Run `python3 assets/bosses/export-benefactor.py` to regenerate `benefactor-portrait.svg` as a 128 × 128 vector viewBox crop of the boss. The exporter also creates a twelve-pose SVG atlas from the eleven named part groups, without overwriting the two originals. Retired WebP panels are recoverable at `8b21977:src/dev/art/`; `benefactor-prompt.json` records the historical image-generation workflow rather than a current runtime/export requirement. See `assets/bosses/README.md`. Stage actual SVGs and run `npm run check:art-upload` before publishing.

`tests/multi-hex.test.ts` covers perimeter targeting/retaliation, rigid-body movement, whole-body pushes, area-hit deduplication, warnings, phase timing and ordinary defensive effects. The manual `boss-preview.spec.ts` browser checks cover desktop/phone presentation, native chest pixels at fractional DPR, targeting, a complete enemy turn, phase presets, restart/outcomes and campaign isolation. The production-exclusion check includes this route and verifies that workshop code and fixtures are absent; the campaign’s Benefactor art is expected in production.

Chapter Two now reviews native 80px SVG civilians and new vector Kit/Petra/Dena/Inspector assets in Sprites. The former Pixel Art Fixer comparison panel is retired. The Animation panel retains the old Kit/Petra raster rig studies as authoring references; current campaign artwork and all four directional motion pages are in Sprites. See `assets/vector/chapter-two.md`.

The Benefactor breathes through eight phases over 3.2 seconds. Judgment raises the forearms inward, gathers, releases at 420ms and recovers by 920ms. Shoulder spikes and serrated porcelain remain visible throughout. Restart and outcomes cancel pending animations; reduced motion displays the resting pose. All five companions now have directional walking playback in Sprites; Celia’s Walk keeps the book in her left arm.

## Conduit guardian preview

Open `/?dev=boss&boss=conduit` or choose **Bosses → Heart regulator**. The Chapter Three preset uses level-7 Nell, Orrin and Kit with six bandages. **Use workshop party** uses the current builds and equipment. The party faces upward toward a 256 × 240 vector expansion of the existing boiler keeper, above a compact triangle of three adjacent occupied hexes. Each contact or painted body can target the same unit; blasts and lines damage it once. Its feet are anchored. Both campaign intake routes now use this same battle. The workshop supplies level presets; the campaign keeps its real party resources, loot and checkpoints.

| Route | Approach |
| --- | --- |
| Sealed intake | Hold both blue earth plates simultaneously to drop the seal permanently; a feed hound guards the flank. Requires at least two workshop companions. |
| Pressure walk | The seal is down; two pressure crows and four hot floor vents guard the approach. A solo workshop party can use this route. |

Pressure lock marks a hero's surrounding hexes, Scouring jets mark three columns, and Crossfeed purge sweeps one row. Red X warnings stay fixed for the round; Taunt redirects the discharge. These attacks use the existing pattern damage, defensive effects and initiative rules, with mechanical steam effects and sound. Eight mechanical idle poses run a 1.6-second horizontal compressor cycle in a side-mounted shoulder pump, with a ticking gauge and dissipating exhaust. A solid lower chassis contains no moving drive parts. The boiler casing, cowl, dial housing and feet remain still. Four discharge poses open the mechanical arms. The clock player supports separate mechanical/breathing labels and cycle durations; the Benefactor retains its own 3.2-second breathing loop. Attack timing and reduced-motion handling remain shared. Restart, forced outcomes and workshop exit cancel pending attacks and remove motion listeners. The preview never writes campaign saves or rewards.

The route and boss selection are shareable in the URL (`&route=pressure` selects pressure walk); both are session-only review settings. `src/content/chapter-three/regulator.ts` owns the campaign layouts/rewards, `src/rules/conduit.ts` the shared pressure rules, `src/game/conduit-presentation.ts` the presentation, and `src/game/boss-display.ts` the native decode, labels, placement and projected-body picking. `src/dev/conduit-battle.ts` only supplies workshop presets. `public/art/vector/bosses/conduit-regulator.svg` and `conduit-chamber.svg` are editable originals. Run `python3 assets/bosses/export-conduit.py` for the vector portrait and motion page. Regulator runtime art loads with the conduit region, including departure, travel and deep-restore retries. Only the workshop presets and controls remain behind the Vite development entry.

Run `npm run check`, `tests/e2e/conduit-boss.spec.ts` and the existing boss presentation checks. These detailed browser cases cover desktop/phone framing, both routes, actual earth-plate release, single-hit targeting, warning resolution, preset/workshop parties, idle output with the pointer parked, attack/restart cleanup, reduced motion and campaign isolation. They stay outside default CI. The production-exclusion check continues to forbid the Benefactor and workshop presets. Separate production cases fight both regulator routes through normal combat, verify rewards/reload and the Emperor handoff, exercise defeat/retry and reject a solo sealed-intake formation before combat. Missing regulator art preserves the chapter departure for retry.


## Chapter Five flagship preview

Open `/?dev=boss&boss=flagship` or choose **Bosses → Alban’s flagship**. **Start Chapter Five preset** uses level-10 Nell, Orrin and Petra with twelve bandages. **Use workshop party** preserves the current one-to-three workshop fighters, builds and gear. **Start exposed bridge** removes both batteries for reviewing the emergency pattern. Escape or **Back to workshop** returns to the picker; its boss choice is retained in the URL.

Fight upward from the survey ship's deck. Each independent battery and the bridge occupy a compact triangle of three hexes. Painted bodies shortcut to legal contact cells; area attacks hit each component once. Port and starboard alternate a three-hex raking column with a seven-hex bombardment. Warnings stay fixed for the round. Destroyed guns stay down and stop attacking. The bridge remains shielded until both guns fall, then announces a full-row emergency broadside on its next round. Two boarding marines use ordinary movement, strikes and bonus Shield bash. Destroying the exposed bridge ends the boarding immediately. Taunt and Dazzle retain their normal effects.

The hull, cannon houses, bridge, shield and propellers drift together by at most 2px horizontally and 3px vertically on 11-second/8-second scene-clock cycles. Local geometry stays rigid; the party, survey deck, tactical contacts and health panels stay fixed. Alpha picking uses the same displacement. Outboard propellers turn on scene time. Gun barrels recoil on their 420ms contact / 920ms recovery timeline, and impacts show the actual attack footprint. Reduced motion settles the craft at its base anchor and stops propellers and recoil. Restart and exit remove update listeners and pending impacts through the shared preview lifecycle. Small boss labels have enough canvas height for every row of the compact font.

`src/dev/flagship-battle.ts` owns the isolated presets; `flagship-preview.ts` wraps the shared campaign presentation. Campaign and preview share `rules/flagship.ts`, `game/flagship-presentation.ts` and the production vectors. Only preset builds, shortcuts and the reward-free factory stay behind the Vite development entry. This preview does not write campaign saves or rewards; Act I’s separate canonical start and campaign progression are described below. Iron Above the Clouds is its dedicated 31-EDO score: a two-bar brass/timpani fanfare leads into a 32-bar loop in 10/8 at quarter=132. The first four eighths march in two pairs; two groups of three extend the second half. Brass calls, a wider string middle and a varied return form the loop. Brass, tuned timpani and cymbals are new procedural instruments. See [Act IV](story/chapter-five-act-four.md) for the campaign scenes, balance and saved departure.

Rebuild all eleven native SVG files with `python3 assets/bosses/export-flagship.py`; no image generator, raster input or resampling is involved. The deck is 1008 × 480, hull 952 × 256, batteries 192 × 184, bridge 224 × 232, marine 80 × 80 with row-68 soles, and portrait 128 × 128. They share the game's final 2px raster. Run `npm run check`, `tests/e2e/flagship-boss.spec.ts` and the production-exclusion check. Detailed device/combat checks stay outside default CI. Stage the SVGs and pass `npm run check:art-upload` before publishing.

Music → **Ch 5 → Iron Above the Clouds** reviews the actual cue, including separate Brass and Timpani controls. The header shows 10/8 and the two-bar intro/32-bar loop; note headings distinguish Intro and Loop. Seeking and stopping normalize absolute playback to the loop's correct bar after the intro. Restart cue and starting/restarting the battle replay the fanfare; natural loop wraps resume at bar 3. The scheduler still counts quarter-note beats (five per 10/8 bar). Other arrangements keep their existing bar-aligned changes. Sound toggles and all new instrument releases use the shared click-free envelopes. Full-loop, live-entry, device and cancellation checks stay outside default CI.


## Chapter Five Act I

The dev title’s **Begin Chapter Five (canonical)** starts the airfield at 1225 XP with all five recruits, earned main-route coast gear and Nell/Orrin/Kit active. It replaces only the autosave after the usual existing-save prompt; manual slots remain available. Its factory stays behind `import.meta.env.DEV`. Ordinary Chapter Four departures use **Begin Chapter Five** with the player’s actual formation and resources.

Maps → Ch 5 reviews airfield, airship, Hammerplain, cooling works, anchor gantry and five local arenas, including story flags and all scene casts. Sprites includes Alda, Hester, Durn, the furnace carrier and three forge recolors. Music → Ch 5 includes Above the Railway, The Western Mooring, The Next Shift, The Cooling Race, Under the Gantry, Hold the Floor and The Pouring Lane, alongside the unchanged flagship 10/8 cue. Campaign level ten starts at 1490 XP.

The campaign furnace carrier is mobile with a three-hex base, fixed-round pour warnings and hot tracks lasting through the following round. Hot ground deals six damage at round end; flying crows ignore it. Taunt redirects the pour, Dazzle lasts three attacks, and overlapping area contacts hit once. Dev outcome/restart tools use the existing normal campaign reward and retry paths. The flagship also appears in Act IV with the campaign’s real party and supplies.


## Chapter Five Act II

Choose **Dawnwatch · the lower town** on the survey ship’s chart, before or after Hammerplain. The existing Chapter Five canonical start and Act I saves both work. Clear either gun position first, then the other; defeat its opposing spotter to stop the first battle’s fixed-round support warning. The northern signal-wall stair stays closed until both positions are clear. Aurel orders shield soldiers one legal hex forward and braces them for six guard before his attack; Taunt stops his order. All rewards use normal bag/manual fitting. No preset party or resource reset is used in the campaign.

Maps → Chapter 5 adds Dawnwatch, gun terraces, signal wall, observation cabin and five regional arena variants. Sprites adds Aurel, Enna, shield soldier and gunner; named portraits are editable originals. Music → Ch 5 adds The Open Gate, The Gun Terraces, The Town Wheel, Across the Terraces, Orders Worth Refusing and The Empty Cabin. Regional/boss themes are 32-bar 4/4 in 31-EDO; the existing flagship 10/8 cue is unchanged.

Complete any two regional anchors to open the observation-cabin projection through the aft hatch. Its completion returns to the shared deck scene. Reload during the uncommitted projection replays it; skip commits normally. Windmere is available from the flight chart. After all three regions, the ship stages the capital blockade; the flagship approach opens once the Emperor offer is recorded and told. Detailed journey, motion, music and production checks stay outside default CI.


Chapter Five Act III: choose Windmere at the flight chart after the shared opening, or continue a version-11 Act I/II save. Maps → Chapter 5 adds `windmere`, `dispensary`, `mirrorward` and the three `wind-` arenas. Sprites includes Iven, Sera, Teren, the mirrored engine and its reflector. Music → Ch 5 adds the five Windmere arrangements (ward/lift 3/4; gallery/battles 4/4), all 32 bars in 31-EDO. The campaign boss uses real resources and an anchored three-contact core: break the lit projection to interrupt its beam and expose it. Dev Win/Lose/Refill/Restart use the usual shared battle tools. Exact continuation and rewards are in `docs/story/chapter-five-act-three.md`.

## Chapter Five — Act IV review start

Vite title → **Begin Chapter Five · Act IV (canonical)** supplies a fresh authored Acts I–III completion: 2740 XP, five recruits, Nell/Orrin/Petra active, full HP/focus, regional loadouts, twelve bandages (seven purchases deducted from marks), and the Emperor offer/alliance recorded. No flagship progress is granted. The usual autosave prompt preserves manual slots. Factory and control stay absent from production.

From the flight chart choose **Capital approach · Alban’s flagship**, then **Enter the capital crossing**. Regional visits, Equipment and the aft rest bench stay available before entering. Destroy both batteries and the bridge, follow Petra onto the new command deck, then use its western evacuation gangway. The final ship scene records and exports `chapter-six:capital-approach`; Chapter Six continues from this boundary. Maps reviews `flagship` and the survey battle deck. The shared SVGs live under `public/art/vector/bosses/flagship-*` (80px marine/crew actors at `public/art/vector/`). Rebuild with `node scripts/export-chapter-five-art.mjs`. Detailed Act IV journey/device/reload/asset-failure checks stay outside default CI.


Chapter Five Act IV’s canonical start still precedes the flagship fight. In the campaign’s revised ending, the unseen Benefactor destroys Alban and his crew; Nell becomes unavailable and a separate minion encounter follows. Campaign Equipment shows her illness, retains her gear and allows formation changes among the other four. Rest cannot cure her. The workshop remains an off-story sandbox with its ordinary full roster; it does not set or clear campaign illness. Sprites includes Sun herald and Glasswing; Music → Ch 5 includes The Sky Answers. Chapter Six’s optional Iria recovery journey is playable from the shared flight chart.


## Chapter Six review

The dev title includes **Begin Chapter Six (canonical)**: 3270 XP, actual Chapter Five completion, twelve bandages, Nell ill and equipped, and Kit/Orrin/Petra active. It replays the sealed-capital opening and preserves manual slots. Namar and Iria’s maps are in Maps → Chapter 6 and their thirteen cues in Music → Ch 6; lute, wood, hand drum and shaker can be soloed. The new scores use neutral 31-EDO thirds and retain ASCII half accidentals.

`/?dev=boss&boss=serpent` reviews the real sun-serpent rules and vectors. The preset uses level-12 Kit/Orrin/Petra and twelve bandages, without campaign progress. The three-contact head remains attackable while the coils alternate vulnerability. Coil destruction weakens head armor and removes reflections; actual breath glass lasts for the next announcement only. Red warnings include every affected lane. Reduced motion settles the scene-clock breath poses. Restart and exit use the shared battle lifecycle.


For the recovery route, choose **Begin Iria (canonical)** at the dev title: shared briefing complete, Namar unvisited, 3270 XP, Nell ill, Kit/Orrin/Petra active. Her arrival plays normally. **Begin Namar · Nell recovered (canonical)** starts after the main jungle route at 3810 XP, with Nell/Kit/Celia selected and all new loot in the bag, before Namar’s first visit. Both factories are isolated from live saves/workshop settings and preserve manual slots. Maps includes river landing, canopy, rain house and their three tactical floors; Sprites includes Ines, Tavi and fernbound patrols. Music adds six Slendric cues and the new percussion solo buttons. Detailed region-order, interrupted-treatment, motion and full-loop audio checks stay outside default CI.

## Skeld and the winter dragon

The Vite title’s **Begin Skeld (canonical)** and **Begin winter dragon (canonical)** each open a condition chooser for Nell. Ill presets use Kit/Orrin/Petra; recovered presets use Nell/Kit/Celia after the real Iria treatment. Neither reads campaign/workshop storage. The first begins at the bell harbor; the second includes both northern approach fights, before the sanctuary introduction and dragon rewards. Namar is unvisited in both. Manual slots remain available.

Bosses → **Winter dragon** (`?dev=boss&boss=dragon`) shares the campaign’s eleven-contact body, native alpha targeting, scene-time breathing, attack poses, fixed warnings, legal pulls and passable loose ice. The preset is level twelve with twelve bandages; Use workshop party uses the actual selected builds/gear. Preview victory grants no campaign rewards. Restart clears the ice. The live/reduced-motion regression samples the visible `.pixel-output` wing pixels with the pointer parked, so an internally changing texture cannot hide a frozen display.

Maps → Ch 6 includes `bellharbor`, `frostwatch`, `glacier`, `wintershrine`, `capitalquay` and four northern arenas. Frostwatch’s gate is visibly closed on arrival and its art/collision disappear together on `northPassOpened`. The dispatch case has a painted hit area and changes to its opened appearance after the main-route discovery. Sprites includes Edric, Signe, Egil and the three frost recolors. Music → Ch 6 includes six northern cues; the dragon’s 5/4 theme has a two-bar intro followed by a 32-bar loop. See [music direction](music-direction.md) and [exact story continuation](story/chapter-six-continuation.md).

The dev title groups all authored starts under **Canonical saves**, with compact three-column desktop / two-column phone buttons. **Workshop** stays among the primary actions above the group. Long preset names wrap; the card can scroll within the stage on unusually small displays. Existing autosave confirmation and Nell-condition choices remain available. Music’s **Sine** and **Tritaver** filters review the northern exploration and battle leads.


Capital review adds **Capital** and **Final preparations** under the single Canonical saves heading. Each offers ill/recovered Nell; both pact seals are complete. Capital replays the landing and the full city route. Final preparations starts after the two city battles and, only if recovered, the remembered morning. Both remain uncommitted with normal authored supplies and regional gear. Workshop remains above the compact preset group.

Bosses adds **The Emperor** and **The Lightbearer**, also at `?dev=boss&boss=emperor` / `lightbearer`. The level-12 Kit/Orrin/Petra preset has twelve bandages; Use workshop party uses actual edited builds. Both previews share campaign rules, native poses, alpha targeting and reduced motion. They award no campaign progress. Music → Ch 6 exposes seven new capital/ending cues; Maps includes all five world scenes and tactical floors.


## Chapter Seven and the final forms

Under **Canonical saves**, **Begin Chapter Seven (canonical)** starts beyond the recovered capital departure; **Begin final refuge (canonical)** supplies the five required domain victories and their bag rewards, before the refuge arrival and all final forms. Both use authored history, retain manual slots and read no live builds. The earlier uncured ending remains terminal.

Bosses → **The Benefactor** adds **Campaign · the Benefactor**, **Campaign · hollow sun** and **Campaign · exposed heart**. These use the actual Chapter Seven rules, 19/19/7-contact bodies, native motion, targeting and dedicated scores with a prepared refuge party. They grant no campaign rewards or progress. The older phase fixture remains separately available.

Maps → **Ch 7** includes nine exploration/epilogue scenes and nine tactical arenas. Music → **Ch 7** exposes sixteen complete cues, their meters and final two-bar intros, expression and quieter rubato; **Organ** isolates the new harmonic instrument. Run `npm run art:seven` to reproduce native vector art and Tiled layouts. See [the exact route](story/chapter-seven-continuation.md), [music direction](music-direction.md) and `tests/e2e/chapter-seven*.spec.ts` for detailed review. Full journeys, ordinary boss combat and full-form audio renders remain outside default CI.

### Chunky camera scrolling

The campaign's bounded main camera aligns scroll to `RASTER_UNIT` (currently two
logical pixels) through `game/raster-camera.ts`. Phaser applies this at its bounds
clamp, after follow/pan calculation and before building the camera matrix. The
rendered world, camera view and pointer picking therefore share the same aligned
coordinates. Odd viewport dimensions use the last complete raster step inside
the map bounds. Actor positions and movement/cutscene timing stay in world space.
Maps uses the same bounded snap for its scroll viewport at either zoom, including
restored review links, dragging, centering and the bottom/right edges.

`tests/e2e/raster-scroll.spec.ts` samples actual moving camera frames and compares
a stationary face through the screen raster; it also covers cinematic pans and
workshop scrolling on desktop and an odd-width phone at fractional DPR. These
rendered checks stay outside the default CI gate.

Character-specific equipment entries dim when they do not fit the selected character, in both the workshop and campaign bag. They remain selectable for inspection; the Equip button stays disabled for an incompatible item. Shared coats remain available to every character.
