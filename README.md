# Borrowed Tomorrow

Vite development includes an off-story [character workshop](docs/development-workshop.md): open `/?dev=workshop` or choose **Workshop** on the title screen. Choose up to three companions from the five-character roster, adjust levels and base stats, discover level abilities, equip items and test the builds in combat. The campaign has its own [character inventory](docs/character-inventory.md): open Equipment or press I outside combat. The workshop’s build editing remains dev-only.

Dev-mode battles also include one-click Win battle, Lose battle, Refill party and Restart battle controls above the combat commands, in both the story and workshop.

Nell's brother has finally returned from the capital—and the imperial train has followed him. A stolen crystal, a coal-fired engine and a village where time has stopped begin a JRPG about an empire living on tomorrow's promise.

**Chapter One: Leaving Home** is playable from beginning to end: Larkspur's festival, the arrest of Nell's brother, the escape from the square, Orrin's recruitment, the frozen village of Rillbridge and a showdown with Captain Alban at the mountain pass. Three required battles and one optional workshop encounter use the existing tactical hex engine. Staged cutscenes carry the arrest, discoveries, rescue and departure. The chapter ends with a saved journey toward the Iron Coast.

The previous Disks A–D story has been replaced. A **seven-chapter grand outline** is committed under [docs/story/grand-outline.md](docs/story/grand-outline.md), with a separate [final-chapter plan](docs/story/final-chapter.md) for entering the Benefactor's domain and defeating the god itself. Chapter Two: Prison Trains continues at the Iron Coast departure: meet Kit as Alban seizes his legitimate postal deliveries, recover them while opening the prison train, evacuate Cinderbank and fight through Alban’s recapture attempt. Nell, Orrin and Kit are the three travelers; Celia’s introduction is saved for later. Equipment manages individual gear. Chapter Three: Beneath the Palace continues from the capital departure: Petra refuses an arrest order, Tomas is rescued alive, and the party stops the extraction before the emperor enters its vessel. Five equipment rewards support the recruited companions. Chapter Four: The Broken World continues from that departure: follow Orrin and Kit through the works, meet Celia alongside Petra, reunite the cast and open the guardians’ sanctuary. Five more equipment rewards, distinct location themes and a dedicated sanctuary boss score accompany the counterattack. Chapters Five–Seven remain planned. Story documents contain spoilers.

## Run

Use Node 24 and npm:

```sh
npm ci
npm run dev
```

`npm run build` creates a static `dist/` directory. Serve it on any static host; relative asset paths support hosting in a subdirectory. Phaser has a separate bundle. No account, API key or live story service is needed at runtime.

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

Each combatant occupies one cell of an 11 × 7 axial hex grid. Move, then act. Rocks and other units block movement; rocks block sight and steam rays. Nell's lantern burst hits a hex and all six neighbors. Orrin's steam lance hits a four-hex ray. **Both hit allies.** Previews and resolution share the same geometry. Melee provokes one retaliation per defender per round; Defend and Wait support positioning. Captain Alban's arena adds marked steam outlets that discharge after the last turn of each round.

Iona offers supplies and free rest in Larkspur. The coal siding and the railway ward offer rest on the Iron Coast; the ward sells bandages. The pass shelter offers free rest and a one-time bandage cache. The workshop battle is optional and rewards a lantern upgrade. Previously cleared battles and caches cannot be farmed.

## Saves

IndexedDB holds an autosave and three manual slots. Checkpoints occur at scene completion, travel and before battles; an immediate tab close also preserves the pending checkpoint. Reloading during a battle restores the preceding checkpoint. Save exports and imports use JSON.

The reboot uses **version 10**, campaign `imperial-debt`. Version-9 departures continue into Chapter Four and Version-8 departures into Chapter Three with their gear, health and progress intact. Version-7 saves preserve the journey while removing Celia’s earlier draft recruitment and returning her equipped copies to the bag. Version-6 saves gain their existing active formation without changing progress. Version-5 saves migrate automatically, preserving progress and converting old gear into equivalent equipped items. Saves from the previous story (versions 1–4) stay available to export and retain their manual slots. They cannot be loaded into the new campaign. Begin Chapter One for the rewritten adventure. The Chapter One ending is `chapter-two:iron-coast`; the installed Chapter Two art pack enables Begin Chapter Two. Its saved ending is `chapter-three:capital`. Chapter Three continues there and ends at `chapter-four:broken-world`. Chapter Four reunites the companions and ends at `chapter-five:anchors`. A source checkpoint without that art pack preserves the old departure and offers no unavailable chapter button.

## Presentation and source

The whole visible game uses a 1024 × 768 native framebuffer and integer physical-pixel scaling, including text and menus. Scenery renders at 1:1 through a scrolling viewport; 80 × 80 actors and 128 × 128 portraits retain their native size. Phones crop and pan the same scene. New brother Tomas and Captain Alban have distinct matching actor/portrait pairs.

- `src/rules/`: framework-independent combat, hex geometry and save validation.
- `src/content/chapter-one/` and `chapter-two/`: objectives, journals, interactions, encounters and collision.
- `src/content/scenes.ts`: dialogue and staging; `src/content/dialogue.ts`: shared dialogue types.
- `src/content/maps.ts`: map data, collision and pathfinding.
- `src/game/`: Phaser scene, cutscene director, native bitmap UI, procedural music and save storage.
- `public/art/`: production artwork. Larger scenery sources in `assets/maps/` are restored and verified before dev/build. Retained unused art and scores are available for future chapters.
- `docs/story/`: full outline, playable canon, character knowledge and exact next-chapter handoff.
- `.agents/skills/write-game-prose/`: repository writing guidance adapted from Stephen D. Turner's MIT-licensed [deslop](https://github.com/stephenturner/skill-deslop).

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e:smoke
npm run test:e2e:journeys
```

Normal CI runs Node 24 rule/content checks, the production build, and browser smoke tests. The full `@journey` tests play both chapters through actual controls; use Check → Run workflow → full_journey for that run and full-length audio rendering. `BT_QA_SCREENSHOTS` can point to a directory outside the repository for captures. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation.

`window.borrowedTomorrow.inspect()` and `window.borrowedTomorrowPixels.inspect()` provide read-only diagnostics. They do not change progress or bypass combat.

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).

MIT licensed. The original license is preserved.
