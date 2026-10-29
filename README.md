# Borrowed Tomorrow

A story-complete, seven-chapter JRPG for the browser. Nell sets out to find her
brother after an imperial raid. A stolen crystal, a coal-fired engine and a
village where time has stopped draw her into an empire living on tomorrow's
promise.

- Five playable companions, with up to three active fighters and manually equipped gear.
- Turn-based hex combat with upgradeable skills, paired team abilities, battlefield hazards and towering bosses.
- Optional quests, permanent training, an alternate ending and playable epilogues.
- Polygonal vector scenery, animated characters, dynamic actor lighting and a shared chunky display for graphics and text.
- Procedural music in 31-tone equal temperament, synthesized sound effects, room reverb and a public soundtrack menu.

The campaign runs locally in the browser after loading. No account, API key or
live story service is required.

## Run and play

Use Node 24 and npm:

```sh
npm ci
npm run dev
```

For a playthrough of the release build:

```sh
npm run build
npm run preview
```

Open the local URL printed by Vite. The production preview omits the development
workshop, canonical starts and battle cheats.

| Action | Input |
| --- | --- |
| Walk | WASD / arrows, or click a destination |
| Talk / inspect | E / Enter / Space, or click a marked object |
| Equipment | I, or Equipment in the menu |
| Journal | J |
| Close menu / cancel target | Escape |
| Skip a staged scene | Skip scene / Escape |
| Pause a cinematic | Space, or Play / Pause |
| Battle movement | 1, then choose a highlighted hex |
| Battle abilities | Numbered commands, then choose a target |
| Confirm battle action | Confirmation button or Enter |
| Defend / wait | F / W |

Phones have movement and battlefield-pan controls. Dialogue advances at your
pace; cinematics can be paused or skipped. Reduced-motion settings provide
cuts and still poses. The sound on/off preference is remembered in this
browser; use the Sound button to change it. The **?** menu includes the
soundtrack and credits.

## Combat and progression

Move and act separately on the hex battlefield. Read the affected hexes before
confirming: some attacks hit companions as well as enemies. Cover blocks many
shots, while boss warnings show the area of an upcoming attack. Large enemies
can occupy multiple hexes; an area attack damages each body only once.

Skill points buy ranks when a character meets the required level. For example,
Nell's Lantern burst starts as four slanted hexes, grows to a seven-hex area,
then gains stronger damage with reduced friendly fire. Orrin's Steam lance
stays a four-hex straight ray. Team moves require both learned solo skills and
spend both fighters' main actions; the assisting fighter keeps unused movement.
Skills and their previews show the current rank's actual effects.

Bought and found equipment goes into the shared bag. Open **Equipment** to fit
it, choose active companions or upgrade skills. Reserves keep their equipment
and share campaign experience. Rest spots restore available companions;
suppliers sell medicine and gear, and later training offers permanent
improvements. Cleared battles and one-time rewards cannot be farmed.

See [Equipment and party management](docs/character-inventory.md) for details.

## Saves

Browser storage holds an autosave and three manual slots. Checkpoints occur at
story events, travel and before battles; reloading during a battle returns to
its preceding checkpoint. Use **Save** to manage slots or export/import a JSON
save. Export a copy before changing browser, device or site address; browser
storage belongs to that site's origin.

The supported campaign format is **version 11**, campaign `imperial-debt`.
Older formats are rejected rather than migrated. The save-format number is
independent of the game's release version. Chapter crossings keep the actual
formation, health, equipment and supplies; a destination is committed only
after its artwork loads successfully.

## Development

The Vite-only [workshop](docs/development-workshop.md) reviews character builds,
equipment, combat, music, sprites, animation, maps, bosses and cinematics.
Open `/?dev=workshop` or choose **Workshop** on the development title screen.
Canonical chapter starts and battle tools are for testing; workshop builds
and storage are separate from campaign saves.

```sh
npm run check
npx playwright install chromium
npm run test:e2e:ci
npm run test:e2e:ci:production
```

`check` runs rule/content tests, TypeScript and the production build. The two
browser commands reproduce the default development/production CI gates.
The broader browser journeys, audio renders and headless route matrix are
opt-in; see [Working on Borrowed Tomorrow](docs/development.md) and
[Headless play](docs/headless.md). They cover different things: simulated wins
do not establish that the rendered adventure is ready to release.

`window.borrowedTomorrow.inspect()` and `window.borrowedTomorrowPixels.inspect()`
provide read-only diagnostics. They do not change progress or bypass combat.

## Build, release and source

`npm run build` creates the static `dist/` directory. Serve the complete output
on a static host; relative asset paths support subdirectory hosting. Configure
HTTP compression on the host. `npm run build:size` reports startup, deferred
JavaScript and total distribution sizes; see [Production bundles](docs/production-build.md).

- [Release procedure and playthrough checks](docs/releasing.md)
- [Unpublished release-notes draft](docs/release-notes.md)
- [Source map and local workflows](docs/development.md)
- [Vector art direction](docs/art-direction.md) and [tile maps](docs/tile-maps.md)
- [Music direction](docs/music-direction.md) and [room audio](docs/room-audio.md)
- [Story canon](docs/story/canon.md) and [full outline](docs/story/grand-outline.md) — spoilers

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).
For a stuck checkpoint, include what you were doing and an exported save if
possible; for presentation issues, include a screenshot and browser/device.

A game by **GPT-6.1 Sol**, directed by **Lumi Pakkanen**. The in-game credits
include Lumi's game design, combat direction, story concepts, art direction,
playtesting and additional musical passages. Development uses Phaser, Vite and
TypeScript; repository writing guidance adapts Stephen D. Turner's
[deslop](https://github.com/stephenturner/skill-deslop).

[MIT licensed](LICENSE). Copyright © 2026 Lumi Pakkanen.
