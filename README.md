# Borrowed Tomorrow

Vite development includes an off-story [character workshop](docs/development-workshop.md): open `/?dev=workshop` or choose **Workshop** on the title screen. Choose up to three companions from the five-character roster, adjust levels and base stats, discover level abilities, equip items and test the builds in combat. Its **Music** tab (directly `/?dev=music`) auditions every cue in spelling-aware 31-EDO, with bar seeking, instrument isolation and a pitch/frequency inspector. The campaign has its own [character inventory](docs/character-inventory.md): open Equipment or press I outside combat. The workshop’s build editing remains dev-only.

Dev-mode battles also include one-click Win battle, Lose battle, Refill party and Restart battle controls above the combat commands, in both the story and workshop.

Nell's brother has finally returned from the capital—and the imperial train has followed him. A stolen crystal, a coal-fired engine and a village where time has stopped begin a JRPG about an empire living on tomorrow's promise.

**Chapter One: Leaving Home** is playable from beginning to end: Larkspur's festival, the arrest of Nell's brother, the escape from the square, Orrin's recruitment, the frozen village of Rillbridge and a showdown with Captain Alban at the mountain pass. Three required battles and one optional workshop encounter use the existing tactical hex engine. Staged cutscenes carry the arrest, discoveries, rescue and departure. The chapter ends with a saved journey toward the Iron Coast.

The previous Disks A–D story has been replaced. A **seven-chapter grand outline** is committed under [docs/story/grand-outline.md](docs/story/grand-outline.md), with a separate [final-chapter plan](docs/story/final-chapter.md) for entering the Benefactor's domain and defeating the god itself. Chapter Two: Prison Trains continues at the Iron Coast departure: meet Kit as Alban seizes his legitimate postal deliveries, recover them while opening the prison train, hold Cinderbank’s loading walk and defeat Petra while Alban shelters behind her. Her refusal to fire on the departing medical coaches costs her commission; the public break follows in Chapter Three. Nell, Orrin and Kit are the three travelers; Celia’s introduction is saved for later. Equipment manages individual gear. Chapter Three: Beneath the Palace continues from the capital departure: Petra refuses an arrest order, Tomas is rescued alive, and the party stops the extraction before the emperor enters its vessel. Five equipment rewards support the recruited companions. Chapter Four: A Light on the Water continues from that departure: meet Celia treating ferry crews, open the sea gate by hand, cut the sanctuary signal and release the coast. Nell and Tomas take their promised walk to the sea before she chooses the anchor counterattack. Five more equipment rewards, distinct location themes and a dedicated sanctuary boss score accompany the counterattack.

**Chapter Five — Act I: Hammerplain** continues from the coast departure. Free Alda’s survey ship, choose a landing on its flight chart, reopen Hester’s cooling race by the freight lift or shallow walk, and hold off a mobile furnace carrier while the crew changes the engines over. Pull the anchor breaker, see the street resume, and return aboard to sight Alban’s fleet. Five vector maps, regional music, manually fitted loot and a canonical dev start accompany the act. Dawnwatch is also playable independently as Act II: open the lower-town shelter with Petra, choose which gun position to clear first, and defeat her former commander at the signal wall. Volunteer pilots join the ship, and completing both regions opens the Emperor’s offer in the observation cabin. Act III’s Windmere hospital and Act IV’s flagship finale are also playable. Disconnect the hospital safely, bring the three crews through Alban’s cordon, defeat his flagship, then escape as the unseen Benefactor destroys Alban and his men. Defend the survey ship from divine hunters while Nell lies ill from the shard’s pulse; her companions continue toward the capital. Chapter Five ends at the saved capital approach. Chapter Six’s optional Iria journey can restore Nell before, during or after Namar. Story documents contain spoilers.


Chapter Six now opens at the sealed imperial capital and continues through Namar’s complete desert expedition: evening canals, the divided court, two palace escape approaches, rooftop ascent and the sun-serpent boss. Namar breaks the western pact seal publicly. The optional Iria river journey is also playable: open the medical waterway, clear the rain house and bring Nell for treatment. A recovered Nell takes part in Namar’s scenes; formation, gear and existing desert progress persist. Skeld’s northern expedition is playable in either regional order: reopen Frostwatch, discover the frozen relief fleet, defeat the winter dragon and release the second pact. Nell can remain ill or join after Iria’s cure, including mid-expedition. Both seals open the allied capital quay and the playable inner-city assault. The imperial capital exterior uses royal white marble. The Vite title includes canonical Chapter Six, Iria, Skeld and winter-dragon starts (the northern starts offer either Nell state), `/?dev=boss&boss=serpent` and `/?dev=boss&boss=dragon` preview the bosses, and Maps/Music have Chapter 6 collections. Iria’s six 31-EDO Slendric cues add hand drums, shaker and pitched wood; solo them in Music. Run `npm run art:six` to reproduce its vectors and Tiled layouts. See [the exact continuation](docs/story/chapter-six-continuation.md).


## Run

Use Node 24 and npm:

```sh
npm ci
npm run dev
```

`npm run build` creates a static `dist/` directory. Serve it on any static host; relative asset paths support hosting in a subdirectory. Phaser, chapter maps, dialogue and optional music have separate bundles. `npm run build:size` reports distribution sizes and startup versus deferred JavaScript; see [production build notes](docs/production-build.md). No account, API key or live story service is needed at runtime.

## Play

| Action | Input |
| --- | --- |
| Walk | WASD / arrows, or click a destination |
| Talk / inspect | E / Enter / Space, or click a marked object |
| Journal | J |
| Close menu / cancel target | Escape |
| Skip a staged scene | Skip scene / Escape |
| Battle movement | 1, then choose a blue hex |
| Battle abilities | 2–9, then choose a target |
| Confirm battle plan | Confirmation button or Enter |
| Defend / wait | F / W |

Exploration and combat support pointer input. Phones have movement and battlefield-pan controls. Audio starts only when enabled with Sound. Reduced-motion settings turn camera movement into cuts. You control dialogue pacing; there is no hidden real-time countdown.

Most combatants occupy one cell of an 11 × 7 axial hex grid. Large enemies cover several cells while sharing one HP pool; area attacks damage each unit once. Move, then act. Rocks and other units block movement; rocks block sight and steam rays. Nell's lantern burst hits a hex and all six neighbors. Orrin's steam lance hits a four-hex ray. **Both hit allies.** Previews and resolution share the same geometry. Melee provokes one retaliation per defender per round; Defend and Wait support positioning. Captain Alban's arena adds marked steam outlets that discharge after the last turn of each round.

Iona offers supplies and free rest in Larkspur. The coal siding and the railway ward offer rest on the Iron Coast; the ward sells bandages. The pass shelter offers free rest and a one-time bandage cache. The workshop battle is optional and rewards a lantern upgrade. Previously cleared battles and caches cannot be farmed.

## Saves

IndexedDB holds an autosave and three manual slots. Each write captures the state when requested, so later game changes cannot enter a pending save. Checkpoints occur at scene completion, travel and before battles; an immediate tab close also preserves the pending checkpoint. Reloading during a battle restores the preceding checkpoint. Save exports and imports use JSON.

The campaign uses **version 10**, campaign `imperial-debt`. Only that format is supported. Older saves are not migrated and are omitted from the save list; JSON imports with unsupported versions are rejected. Current version-10 saves keep their progress. The Chapter One ending is `chapter-two:iron-coast`; the bundled Chapter Two tile pages enable Begin Chapter Two. Its saved ending is `chapter-three:capital`. Chapter Three continues there and ends at `chapter-four:broken-world`. Chapter Four preserves the traveling roster and ends at `chapter-five:anchors`. Destination art must finish loading before a departure is consumed. Chapters One–Four and all four Chapter Five acts ship Tiled layouts and native SVG scenery. In Vite dev mode, the title screen offers **Begin Chapter Two (canonical)** from the authored level-3 completion and **Begin Chapter Three (canonical)** with Nell/Orrin/Kit at level 5 and their earned equipment. A **Begin Chapter Four (canonical)** start supplies the rescued passengers and four recruits at level seven. **Begin Chapter Five (canonical)** opens the airfield with five recruits and the main-route coast rewards at 1225 XP. **Begin Chapter Five · Act IV (canonical)** starts aboard with all three anchors, the Emperor offer and the alliance recorded at 2740 XP, regional equipment and twelve bandages. All preserve manual slots and are absent from production. Chapter Five ends at `chapter-six:capital-approach`.

The Vite-only workshop includes Character, Equipment, Music, Sprites, Maps and Bosses tabs. Open `/?dev=sprites` to compare the five playable characters, four directions and matching portraits against selectable backgrounds and ground guides.

## Presentation and source

The whole visible game uses a 1024 × 768 native framebuffer and integer physical-pixel scaling, including text and menus. Scenery renders at 1:1 through a scrolling viewport; 80 × 80 actors and 128 × 128 portraits retain their native size. Phones crop and pan the same scene. New brother Tomas and Captain Alban have distinct matching actor/portrait pairs.

- `src/rules/`: framework-independent combat and state changes; `state.ts` owns the model, `save.ts` validates current-format JSON.
- `src/content/chapter-*/`: objectives, journals, interactions, encounters, native scenery manifests and map layouts. `content/chapters.ts` wires their entries, map groups, story hooks and completion panels; `content/encounters.ts` collects campaign battles.
- `src/content/scenes.ts`: dialogue and staging; `src/content/dialogue.ts`: shared dialogue types.
- `src/content/maps.ts`: map data and pathfinding; the playable chapters use [real tile maps and layers](docs/tile-maps.md) with collision defined by the tiles.
- `src/game/`: Phaser scene, cutscene director, native bitmap UI, procedural music and save storage. `region-assets.ts` owns scene loading and vector preparation.
- `public/art/`: production artwork. All playable scenery is loaded from native SVGs; no painting restoration step runs before dev/build. Retained unused art and scores are available for future chapters.
- `docs/story/`: full outline, playable canon, character knowledge and exact next-chapter handoff.
- `.agents/skills/write-game-prose/`: repository writing guidance adapted from Stephen D. Turner's MIT-licensed [deslop](https://github.com/stephenturner/skill-deslop).

See [Working on Borrowed Tomorrow](docs/development.md) for a source map, local commands and the chapter-extension checklist. `npm run typecheck`, `npm run test:watch` and `npm run art:one` through `art:five` are available independently.

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e:smoke
npm run test:e2e:journeys
```

Normal CI runs Node 24 rule/content checks, the production build, and seven critical browser tests (`@ci`): opening checkpoints, phone combat, save-version rejection, workshop validation, bass synthesis, production isolation and equipment persistence. Chromium's headless shell is cached. The broader smoke suite, all chapter journeys, desktop/phone matrices and full-length audio rendering remain available through Check → Run workflow → full_journey. Run `npm run test:e2e:ci` and, after building, `npm run test:e2e:ci:production` to reproduce the default browser gate. `BT_QA_SCREENSHOTS` can point to a directory outside the repository for captures. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation.

`window.borrowedTomorrow.inspect()` and `window.borrowedTomorrowPixels.inspect()` provide read-only diagnostics. They do not change progress or bypass combat.

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).

MIT licensed. The original license is preserved.


The Chapter Six capital finale is playable: free Stillwater Avenue, clear the palace, face the Emperor and reach either the recovered departure or the explicitly committed uncured Lightbearer ending. Recovered Nell alone receives the playable Larkspur morning. Dev canonical Capital/Final preparations starts and both boss previews are available. The recovered departure leads into Chapter Seven. See `docs/story/chapter-six-continuation.md` (from the repository root) for checkpoints.

**Chapter Seven — The God Who Lent Tomorrow** completes the campaign from the recovered capital departure. Enter the sea of stolen mornings, discover the first harvest and original hospice, fight familiar guardians in their divine setting, free the captives and confront three forms of the Benefactor. Native SVG maps and bosses, sixteen procedural 31-EDO cues, manually fitted final equipment and levels through fifteen lead to a playable Larkspur homecoming and the real seaside holiday. The uncured Lightbearer ending remains separate. See [the final route and checkpoints](docs/story/chapter-seven-continuation.md). Vite-only canonical chapter/refuge starts, all three campaign-form previews and Maps/Music → Ch 7 support review. `npm run art:seven` reproduces the new native art without bitmap inputs.
