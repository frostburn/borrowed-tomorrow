# Borrowed Tomorrow

A browser JRPG about a train from a town lost forty years ago. Explore the railway, meet its passengers, and fight battles where a careless blast can hit your own party.

**Disk A: The Wrong Platform** includes Larkspur station, the old signal yard, Rillbridge tunnel, two party members, three story battles, one optional encounter, supplies, equipment, a travel journal, and a saved **Insert Disk B** arrival.

**Disk B: A Town Expecting Rain** continues that arrival through Rillbridge and its upstream sluice: find Mira’s father, prove the flood danger, prepare an evacuation, and choose which outfall to open. Three battles introduce shallow water and a narrow crossing. The chapter resolves the rescue at Larkspur and records an **Insert Disk C** departure.

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

Pointer input works for exploration and battles. Small screens also show a directional pad and battlefield pan buttons. Sound begins only when enabled with the Sound button. Disk A and Disk B each have a sixteen-bar theme with distinct location arrangements; combat actions and movement use material-specific effects.

## Combat

The battlefield is an 11 × 7 pointy-hex grid using axial coordinates. Each combatant is an individual character. Initiative orders turns; movement leaves one action available. Occupied hexes and rocks block walking. Rocks block ranged sight and steam rays. Nell's lantern hits a hex and its six neighbors; Orrin's steam lance hits a four-hex ray. **Both can hit allies.** Preview and resolution share the same geometry.

In Disk B, shallow water costs two movement points per hex; dry ground costs one. Wave marks identify water. Flying crows ignore its extra cost. The preview and committed move use the same cheapest route. Opening the orchard channel drains the keeper’s arena and floods the fruit trees; the millrace spares the orchard and leaves the arena wet.

Melee triggers one retaliation per defender per round. Defend reduces incoming damage until the defender's next turn. Wait delays a turn to the end of the round and is only available before moving. Enemy AI evaluates reachable firing positions and the same AoE shapes as the player.

## Display

The desktop layout is 1024 × 768 native pixels. Scenery renders at 1:1 through a scrolling 1008 × 480 viewport; portraits retain all 128 × 128 pixels, and actors retain all 80 × 80 pixels. Original asset colors pass through unchanged. Bitmap text, menus, and scenery share one pixel grid, enlarged by a whole number of physical pixels even at fractional device-pixel ratios.

Narrow screens use a layout up to 384 × 768 with a cropped, scrolling camera and battle pan controls. The art keeps the same pixel density instead of shrinking to fit.

## Saves

IndexedDB stores one autosave and three manual slots. Autosaves occur at story checkpoints and before encounters. Manual saves are available outside battles. The Save menu imports and exports versioned JSON files; use an export to move between browsers or keep a durable backup. A reload during combat restores the pre-battle checkpoint. Browser storage belongs to the site's origin.

Version 2 imports original version-1 saves without resetting progress. At `disk-b:rillbridge-arrival`, choose **Begin Disk B**. The new art loads before the arrival is consumed. The Disk B ending records `disk-c:ambulance-siding`; returning to earlier areas preserves it. Disk C is a saved continuation point, not yet a playable chapter.

## Project layout

- `src/rules/`: framework-independent hex geometry, combat, and save schema.
- `src/content/disk-a/` and `src/content/disk-b/`: chapter text, interactions, encounters, and Tiled maps.
- `.agents/skills/write-game-prose/`: repository-local writing guidance adapted from Stephen D. Turner’s MIT-licensed [deslop](https://github.com/stephenturner/skill-deslop).
- `src/game/`: Phaser scene, pixel framebuffer, bitmap UI, procedural score/instruments, and IndexedDB storage.
- `public/art/`: generated environment and transparent actor assets.
- `docs/art-direction.md` and `docs/audio-direction.md`: the visual and musical rules for later disks.
- `docs/story/`: canon, character knowledge, unresolved questions, and the exact next chapter handoff. **Contains spoilers.**

Tiled JSON files define each map's scenery and collision rectangles. Actor positions and story interaction IDs are in `maps.ts`. Grid positions are 24 pixels apart. Keep collision data aligned with visible walls and preserve stable story IDs when revising maps.

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

CI uses one Node version and one Chromium run. Rule tests cover hex geometry, friendly fire, cover, movement, retaliation, waiting, enemy actions, saves, and map reachability. Browser tests play both disks through the actual controls, import the original version-1 arrival, recover from failed chapter downloads, verify both outfall choices and return exploration, and check fractional-DPR pixel scaling, native asset pixel/color preservation, and offline audio output.

`window.borrowedTomorrow.inspect()` provides a read-only snapshot for diagnostics. It does not mutate progress or bypass battles. `window.borrowedTomorrowPixels.inspect()` exposes the framebuffer size, physical scale, and palette for display diagnostics.

Report bugs and feature requests at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues).

MIT licensed. The original repository license is preserved.
