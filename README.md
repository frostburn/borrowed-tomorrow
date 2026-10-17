# Borrowed Tomorrow

A browser JRPG about a train from a town lost forty years ago. A child arrives carrying Nell’s signature on a receipt she has not written; an inspector wants it back. Explore the railway, meet its passengers, and fight battles where a careless blast can hit your own party.

**Disk A: The Wrong Platform** includes Larkspur station, the old signal yard, Rillbridge tunnel, two party members, three story battles, one optional encounter, supplies, equipment, a travel journal, and a saved **Insert Disk B** arrival.

**Disk B: A Town Expecting Rain** continues that arrival through Rillbridge and its upstream sluice: find Mira’s father, prove the flood danger, prepare an evacuation, and choose which outfall to open. Three battles introduce shallow water and a narrow crossing. The chapter resolves the rescue at Larkspur and records an **Insert Disk C** departure.

**Disk C: The Last Ambulance Train** continues the supplied Disk B departure through Cinderbank and Bellwether infirmary. Secure fourteen beds, repair the ambulance service, register its attendants, and bring every patient to staffed care. Two battles add round-end steam vents; the heating decision changes the danger lanes and the hospital’s accommodation. The chapter ends at a saved **Insert Disk D** letter collection.

**Disk D: The Unsent Letter** brings Orrin to Northglass signal works. Collect his father’s letter, protect six workers, isolate a faulty return feed, and send a reply. Its intercepted answer opens **Insert Disk E: The Dead Man’s Reply**.

Thirteen staged cutscenes connect the chapters: actor movement, camera cuts and pans, native document inserts, full speaker portraits, quiet musical mixes and distinct mechanical/bell cues. Advance at your own pace or use **Skip scene / Escape**. Skipping a choice scene leaves the choice to you. Reduced-motion settings use cuts.

## Run

Use Node 24 and npm:

```sh
npm ci
npm run dev
```

`npm run build` produces a static `dist/` directory. Serve it on any static host; relative asset paths support hosting in a subdirectory. The Phaser runtime has its own bundle. No server account, API key, or live story-generation service is needed.

## Controls

| Action | Input |
| --- | --- |
| Walk | WASD / arrows, or click a destination |
| Talk / inspect | E / Enter / Space, or click a marked object |
| Journal | J |
| Close menu / cancel target | Escape |
| Battle movement | 1, then choose a blue hex |
| Battle abilities | 2–5, then choose a target |
| Confirm battle plan | Confirmation button or Enter |
| Defend / wait | F / W |

Pointer input works for exploration and battles. Small screens also show a directional pad and battlefield pan buttons. Sound begins only when enabled with the Sound button. Disks A and B have sixteen-bar themes with distinct location arrangements. Disk C adds an independent E-minor siding melody, a C-major infirmary melody, and a faster repair-battle arrangement; combat actions and movement use material-specific effects.

## Combat

The battlefield is an 11 × 7 pointy-hex grid using axial coordinates. Each combatant is an individual character. Initiative orders turns; movement leaves one action available. Occupied hexes and rocks block walking. Rocks block ranged sight and steam rays. Nell's lantern hits a hex and its six neighbors; Orrin's steam lance hits a four-hex ray. **Both can hit allies.** Preview and resolution share the same geometry.

In Disk B, shallow water costs two movement points per hex; dry ground costs one. Wave marks identify water. Flying crows ignore its extra cost. The preview and committed move use the same cheapest route. Opening the orchard channel drains the keeper’s arena and floods the fruit trees; the millrace spares the orchard and leaves the arena wet.

In Disk C, orange vents discharge after the last turn of each round, dealing six HP to every ground unit standing on them. Crows fly above them. Heating the train opens two outer discharge lanes; heating Bellwether’s north ward opens the central lane. Move away, wait for a safer approach, and keep your ally out of a steam-lance line. Healing previews use **Confirm healing** for both Mend and Bandage.

Melee triggers one retaliation per defender per round. Defend reduces incoming damage until the defender's next turn. Wait delays a turn to the end of the round and is only available before moving. Enemy AI evaluates reachable firing positions and the same AoE shapes as the player.

## Display

The desktop layout is 1024 × 768 native pixels. Scenery renders at 1:1 through a scrolling 1008 × 480 viewport; portraits retain all 128 × 128 pixels, and actors retain all 80 × 80 pixels. Original asset colors pass through unchanged. Bitmap text, menus, and scenery share one pixel grid, enlarged by a whole number of physical pixels even at fractional device-pixel ratios.

Narrow screens use a layout up to 384 × 768 with a cropped, scrolling camera and battle pan controls. The art keeps the same pixel density instead of shrinking to fit.

## Saves

IndexedDB stores one autosave and three manual slots. Autosaves occur at story checkpoints and before encounters. Manual saves are available outside battles. The Save menu imports and exports versioned JSON files; use an export to move between browsers or keep a durable backup. A reload during combat restores the pre-battle checkpoint. Browser storage belongs to the site's origin.

Version 4 imports original version-1, version-2 and version-3 saves without resetting progress. At `disk-b:rillbridge-arrival`, choose **Begin Disk B**; at `disk-c:ambulance-siding`, choose **Begin Disk C**. Both destination maps load before an arrival is consumed, and a failed download leaves the pending save intact. At `disk-d:signal-works`, choose **Begin Disk D**. Disk D records `disk-e:brinewick-parcel`; earlier areas remain visitable. New receipt/reply discoveries are optional flags, so old saves remain valid. An interrupted fresh opening replays from its checkpoint.

## Project layout

- `src/rules/`: framework-independent hex geometry, combat, and save schema.
- `src/content/disk-a/`, `src/content/disk-b/`, `src/content/disk-c/`, and `src/content/disk-d/`: chapter text, interactions, encounters, and Tiled maps.
- `src/content/scenes.ts`: cutscene dialogue and staging; `src/game/cutscene.ts`: temporary actors, camera and audio direction.
- `.agents/skills/write-game-prose/`: repository-local writing guidance adapted from Stephen D. Turner’s MIT-licensed [deslop](https://github.com/stephenturner/skill-deslop).
- `src/game/`: Phaser scene, pixel framebuffer, bitmap UI, procedural score/instruments, and IndexedDB storage.
- `public/art/`: runtime scenery and transparent actor assets. The Disk B and C maps are reconstructed from verified source chunks in `assets/maps/` automatically before dev/build.
- `docs/art-direction.md` and `docs/audio-direction.md`: the visual and musical rules for later disks.
- `docs/story/`: canon, character knowledge, unresolved questions, and the exact next chapter handoff. **Contains spoilers.**

Tiled JSON files define each map's scenery and collision rectangles. Actor positions and story interaction IDs are in `maps.ts`. Grid positions are 24 pixels apart. Keep collision data aligned with visible walls and preserve stable story IDs when revising maps.

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e:smoke
npm run test:e2e:journeys
# All checks, with full musical loops rather than four-bar browser samples:
BT_FULL_QA=1 npm run test:e2e
```

Normal PR/main CI runs Node 24 rule tests, a production build, and Chromium smoke checks. Smoke coverage includes the fresh opening and interrupted resume, receipt payoff for new/legacy saves, unselected choices on skip, a durable lamp-room reply, gate/entrance navigation, phone healing controls, unique portraits, native pixels at fractional DPR, and all fifteen arrangements plus fourteen effects. Complete phrase variation is also covered by the score unit tests.

Slower `@journey` tests play Disks A–D and the alternative Northglass outcome through actual controls, importing the original version-1 arrival and supplied version-2/3 departures. They also recover the supplied boiler checkpoint through victory and crew registration. They remain available locally and through **Check → Run workflow → full_journey**. Regular CI no longer replays every combat round across all disks for each follow-up. The manual full run also renders complete 16/32-bar loops through Web Audio.

`window.borrowedTomorrow.inspect()` provides a read-only snapshot for diagnostics. It does not mutate progress or bypass battles. `window.borrowedTomorrowPixels.inspect()` exposes the framebuffer size, physical scale, and palette for display diagnostics.

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).

MIT licensed. The original repository license is preserved.
