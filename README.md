# Borrowed Tomorrow

Nell is seventeen. Her brother has finally returned from the capital—and the imperial train has followed him. A stolen crystal, a coal-fired engine and a village where time has stopped begin a JRPG about an empire living on tomorrow's promise.

**Chapter One: Leaving Home** is playable from beginning to end: Larkspur's festival, the arrest of Nell's brother, the escape from the square, Orrin's recruitment, the frozen village of Rillbridge and a showdown with Captain Severin at the mountain pass. Three required battles and one optional workshop encounter use the existing tactical hex engine. Staged cutscenes carry the arrest, discoveries, rescue and departure. The chapter ends with a saved journey toward the Iron Coast.

The previous Disks A–D story has been replaced. A **seven-chapter grand outline** is committed under [docs/story/grand-outline.md](docs/story/grand-outline.md), with a separate [final-chapter plan](docs/story/final-chapter.md) for entering the Benefactor's domain and defeating the god itself. Chapters Two–Seven are planned, not yet playable. Story documents contain spoilers.

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
| Battle abilities | 2–5, then choose a target |
| Confirm battle plan | Confirmation button or Enter |
| Defend / wait | F / W |

Exploration and combat support pointer input. Phones have movement and battlefield-pan controls. Audio starts only when enabled with Sound. Reduced-motion settings turn camera movement into cuts. You control dialogue pacing; there is no hidden real-time countdown.

Each combatant occupies one cell of an 11 × 7 axial hex grid. Move, then act. Rocks and other units block movement; rocks block sight and steam rays. Nell's lantern burst hits a hex and all six neighbors. Orrin's steam lance hits a four-hex ray. **Both hit allies.** Previews and resolution share the same geometry. Melee provokes one retaliation per defender per round; Defend and Wait support positioning. Captain Severin's arena adds marked steam outlets that discharge after the last turn of each round.

Iona offers supplies and free rest in Larkspur. The pass shelter offers free rest and a one-time bandage cache. The workshop battle is optional and rewards a lantern upgrade. Previously cleared battles and caches cannot be farmed.

## Saves

IndexedDB holds an autosave and three manual slots. Checkpoints occur at scene completion, travel and before battles; an immediate tab close also preserves the pending checkpoint. Reloading during a battle restores the preceding checkpoint. Save exports and imports use JSON.

The reboot uses **version 5**, campaign `imperial-debt`. Saves from the previous story (versions 1–4) stay available to export and retain their manual slots. They cannot be loaded into the new campaign. Begin Chapter One for the rewritten adventure. The saved ending is `chapter-two:iron-coast`; no unavailable chapter button is offered.

## Presentation and source

The whole visible game uses a 1024 × 768 native framebuffer and integer physical-pixel scaling, including text and menus. Scenery renders at 1:1 through a scrolling viewport; 80 × 80 actors and 128 × 128 portraits retain their native size. Phones crop and pan the same scene. New brother Tomas and Captain Severin have distinct matching actor/portrait pairs.

- `src/rules/`: framework-independent combat, hex geometry and save validation.
- `src/content/chapter-one/`: objectives, journals, interactions, encounters and Tiled maps.
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

Normal CI runs Node 24 rule/content checks, the production build, and browser smoke tests. The full `@journey` test plays Chapter One through actual controls; use Check → Run workflow → full_journey for that run and full-length audio rendering. `BT_QA_SCREENSHOTS` can point to a directory outside the repository for captures. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation.

`window.borrowedTomorrow.inspect()` and `window.borrowedTomorrowPixels.inspect()` provide read-only diagnostics. They do not change progress or bypass combat.

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).

MIT licensed. The original license is preserved.
