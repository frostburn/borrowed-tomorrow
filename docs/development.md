# Working on Borrowed Tomorrow

Start with the file that owns the behavior. The Phaser scene connects the systems; chapter content owns the adventure and rules modules own state changes. The current-format save is version 11. Chapter Six’s shared opening, Namar, Iria, Skeld and allied capital landing are playable; the capital assault, Emperor and Lightbearer outcomes are playable; Chapter Seven now completes the campaign through the domain, guardian sequence, three divine forms and real seaside epilogue.

## Find the right place

| Change | Start here |
| --- | --- |
| Chapter entry, scene group, completion panel or story routing | `src/content/chapters.ts` |
| Services story scripts can request from the game | `src/content/story-host.ts` |
| Dialogue, staging, objectives or journal text | `src/content/chapter-*/scenes.ts`, `story.ts`, `interactions.ts`; Chapter One stages through `src/content/scenes.ts` |
| Register an encounter | The chapter's `encounters.ts`, then `src/content/encounters.ts` for a new chapter |
| Combat resolution, targeting, movement or enemy choices | `src/rules/combat.ts`, `hex.ts`, `footprint.ts`; boss rules have their own modules |
| Character state, recruitment, recovery or chapter transition | `src/rules/state.ts`; illness/availability lives in `availability.ts` |
| Supply counters, purchases, spare-gear sales or consumable effects | `rules/supplies.ts`, `consumables.ts`, `game/shop.ts`; see `economy.md` |
| Save format, accepted checkpoints or import validation | `src/rules/save.ts` |
| Headless campaign routes, tactical agent and earned checkpoints | `src/headless/`; see `headless.md` |
| IndexedDB, pending checkpoints or JSON export | `src/game/saves.ts` |
| Region scenery loading and SVG texture preparation | `src/game/region-assets.ts` |
| World/battle rendering, input or scene orchestration | `src/game/adventure.ts` and its presentation helpers |
| Map layout, interactions, arrivals or initial casts | The chapter's `maps/*.json`, registered in its `maps.ts` |
| Collision, world routing or scenery visibility | `src/content/tilemaps.ts`, `maps.ts`, `scene-art.ts`; drawing in `src/game/tilemap.ts` |
| Music, tuning or instruments | `src/game/score-*.ts`, `tuning.ts`, `synth.ts`; see `music-direction.md` |
| Vector authoring | `assets/vector/`, `assets/characters/vector/`, `assets/bosses/`; each has source notes |
| Canon, continuation or a new story plan | `docs/story/` and `.agents/skills/write-game-prose/SKILL.md` |

`src/content/story.ts` exposes the aggregate journal and dispatches through the chapter catalogue. It does not keep a separate chain of chapter conditions. Chapter map lists come from their registered map objects, so scene loading and restored-save loading share those lists. `RegionAssets` loads exploration scenery, associated tactical pages, cinematic poses and boss assets before a caller commits the destination.

`src/rules/state.ts` contains the in-memory model and ordinary mutations. `src/rules/save.ts` decodes untrusted JSON and checks campaign consistency. Import `decodeSave` from the latter; there is no second decoder or compatibility export. Encounter definitions similarly come from `src/content/encounters.ts`, while their `Encounter` contract stays with the combat rules.

## Local workflow

```sh
npm ci
npm run dev
```

Use `npm run dev:workshop` instead to open the existing Vite-only tools directly. Direct review URLs include `/?dev=maps`, `/?dev=music`, `/?dev=sprites`, `/?dev=animation` and `/?dev=boss`. The dev title also has canonical starts through Chapter Seven. These tools use their own fixtures/storage; preserve their production exclusion.

To play through shared rules without a browser, run `npm run simulate:early`, then `npm run simulate:middle -- --from /tmp/borrowed-tomorrow-headless.json`. The latter carries the earned resources through Chapters Three/Four and writes a separate report/checkpoint. `npm run test:headless` exercises the longer route matrix outside default CI. See [headless.md](headless.md) for routes, results and limitations.

For a focused change:

```sh
npm run typecheck
npm run test:watch -- tests/tuning.test.ts
npm test -- tests/chapter-five-finale.test.ts
```

Before publishing, run `npm run check` for rule/content tests, TypeScript and the production build. Use existing Playwright regressions for changed rendered behavior, especially scene loading and save restoration. The normal browser gates remain `npm run test:e2e:ci` and `npm run test:e2e:ci:production` (the latter uses the built app). New detailed regressions do not need an `@ci` tag. Full journeys and long audio renders stay in the manually dispatched full run. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when using an existing browser installation.

CI reports **Tests and build** and **Browser checks** separately. A tiny final **check** job requires both to pass, including when an upstream failure skips the browser job. The fast job runs `npm run check` and uploads its exact `dist/` output; the browser job downloads it and runs in the official Playwright Noble container, matching `playwright-core` in `package-lock.json`. Chromium and OS libraries are preinstalled, so there is no per-run apt/browser installation or browser-cache restore. Node remains version 24 in both jobs. Keep the final `check` job ID/status and its `always()` condition so the existing required check cannot pass through a skipped dependency. Normal browser runs have an eight-minute backstop; the manual full run keeps twenty minutes and its expanded selection. Dependency-image pulls and npm installation still require network access.

Art exports have matching commands: `npm run art:one` through `npm run art:seven`. They invoke the existing reproducible SVG exporters; inspect their diff before staging. Run `npm run check:art-upload` on the staged assets. Keep screenshots, traces and temporary scripts outside the repository; `BT_QA_SCREENSHOTS` selects an external capture directory.

## Release preparation

Use [releasing.md](releasing.md) for the production playthrough, persistence,
hosting and publication checks. [release-notes.md](release-notes.md) is an
unpublished draft for the completed game. Preparing those documents does not
bump the package version, change save format 11, create a tag or publish a
release. Preserve actual playthrough evidence separately from historical
headless audit results.

## Rendering performance

Chapter One–Five's lit maps blend consecutive static planes below depth −900 into native Canvas textures when `drawTileMap` builds the world. Actors, ground shadows, sorted props, markers and effects remain live. The texture belongs to that world container and is released on destruction. Story refreshes, battle redraws and restarts rebuild from the current visible pieces, so collector shutdown and other flag changes cannot reuse stale light. A Tiled layer marked `live` remains an independent image between its cached neighbors; Chapter Three's feed-light shutdown and Chapter Five's survey takeoff and flagship destruction use this. Later chapters keep their existing renderer. No raster assets are written to disk.

`world-light.ts` rejects lights outside the transformed frame bounds before visiting pixels. Bounds include flips, rotation, scale and beam apertures; surviving lights share their distance calculation between attenuation and surface response. The exhaustive-lighting regression compares exact pixels at beam/radius edges and under transformed poses.

To profile, record a Chromium CPU profile while walking right for 2.2 seconds and left for 2.2 seconds with Nell/Orrin/Kit in each Chapter Two map. Keep viewport, checkpoint, motion settings and sample interval the same. In headless Chromium at 1280 × 800 with 500µs sampling, these changes reduced sampled busy time from 75% to 24% in the harbor, 51% to 25% in the ward and 89% to 24% in Cinderbank. Both runs already met the environment's 60Hz frame cadence; the improvement is CPU headroom, not a claimed frame-rate multiplier. Native scene/actor checks, collector visibility and the boarding animation should accompany performance changes. Detailed profiling stays outside default CI.

### Walking and framebuffer cost (#133)

`PixelDisplay` samples the stable lower/upper UI planes once per UI rebuild,
then composites the live scene directly on the shared 2px raster. When only the
scene changes, it redraws and presents the world rectangle; controls and
letterboxing retain their previous pixels. UI mutations, image loads, focus,
scrolling, overlays and resize still invalidate the complete presentation. This
removes the per-frame full-size UI/world/UI composite and its final downsample,
without changing the display cadence, input timing or movement/footstep rules.

Actor lighting takes an ambient-only path outside all lamp bounds. Lit actors
reuse transform signs and use a direct three-component distance calculation.
The exhaustive lighting oracle still compares exact bytes at lamp/beam edges,
including mirrored/rotated frames and distant ambient-only poses. The browser
compositor oracle compares the displayed output with the former full-size
pipeline while walking, opening/closing Equipment and resizing, on desktop and
phone at fractional DPR. Keep these detailed checks outside normal CI.

For repeatable profiles, use an installed Chromium and run:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run profile:walking -- /tmp/bt-walk-after 4
```

The CPU-throttling argument defaults to 1. The command also accepts a map group: `early` (the default) or `three`, for example
`npm run profile:walking -- /tmp/bt-walk-three 1 three`.
The CPU-throttling argument precedes the map group. The command
starts its own Vite server and clean browser contexts, imports authored test
checkpoints through Save, enables sound, then walks right and left for 2.2s each
at 1280 × 800. The early group covers Larkspur, Iron Coast and Cinderbank;
`three` covers Northglass, the relay hall and the conduit. It writes CPU profiles,
frame/footstep intervals, long tasks and presentation timings to the selected
directory. No output is included in the game build. With no directory it creates
a temporary one. Use the same script/settings on each revision, run profiles
without concurrent builds/tests, and compare several runs before drawing timing
conclusions.

An isolated before/after comparison in headless Chromium with 4× CPU throttling
and 500µs profiler sampling gave these median display-paint costs:

| Map | Before | After |
| --- | ---: | ---: |
| Larkspur | 10.6ms | 8.3ms |
| Iron Coast | 10.4ms | 8.3ms |
| Cinderbank | 11.3ms | 9.4ms |

This is about 17–22% less presentation time in that run, reducing main-thread
work that can delay walking callbacks. It is not a universal frame-rate or
footstep-jitter guarantee; CPU throttling, warmup, browser and device affect
results. The profiling command records those timings for further investigation.

Animated presentation now follows a fixed 30Hz clock using Phaser's original
browser-frame timestamp. Deadlines retain their phase after late frames, with
a small tolerance for rounded timestamps, rather than waiting another full
interval after drawing finishes. Missed slots are skipped without catch-up
bursts. Films retain their uncapped presentation. UI changes and the final
stationary pose remain immediate; ambient changes during motion are retained
for the next scheduled frame. Idle scenery still redraws only when it changes.
Movement keeps its 130ms tile tween, distance-based poses and existing footsteps;
camera scroll stays on the shared two-pixel grid.

The profiler excludes deliberate idle gaps between walking runs, while retaining
late frames within each run. It reports actual presentation FPS/intervals separately from native
requestAnimationFrame intervals and paint cost. Before this change, normal-speed
Chapter Three interior profiles produced about 16–17 visible updates per second
despite a 60Hz game loop: the old 50ms gate often waited four native frames.
Water could bypass that gate in coastal maps. Compare the same checkpoints,
browser and CPU setting when evaluating pacing; the 30Hz target is not a promise
that an overloaded device can render at that rate.

In normal-speed headless Chromium at 1280 × 800, the relay hall and conduit
improved from roughly 16–17 visible updates/s to 30.2 and 30.3. Median intervals
became 33.2/33.3ms, with 95th-percentile intervals of 35.5/36ms. The corresponding
95th-percentile footstep interval stayed about 151ms. These are isolated profiles,
not hardware-independent guarantees. At 4× CPU throttling the same regions were
CPU-limited to roughly 24–29 visible updates/s; missed deadlines are dropped
rather than replayed.

Review the opt-in movement, compositor, camera, reduced-motion and overlay checks:

```sh
npx playwright test walking-cadence.spec.ts render-performance.spec.ts raster-scroll.spec.ts
BT_PRODUCTION=1 npx playwright test --grep 'production walking cadence'
```

These do not add to the default browser gate.

## Adding the next chapter

1. Add chapter-local scenes, interactions, journals/objectives, encounters, Tiled maps and vector source. Keep map IDs and story checkpoints deliberate; use named arrivals/casts rather than copying world coordinates into new scenes.
2. Extend the current model and transition in `rules/state.ts` and the checkpoint checks in `rules/save.ts`. Preserve earlier resources, actual formation and save IDs. Do not add migrations or automatically grant missing progress.
3. Register the chapter's maps/battlefields in the aggregate map registries, encounters in `content/encounters.ts`, and its hooks/entry/ending in `content/chapters.ts`. The catalogue supplies both transition loading and restore loading. There are no asset-pack availability switches.
4. Add region/boss/cinematic art to its proper manifest or presentation module. `RegionAssets` must finish successfully before entry mutates the state; a failed load must leave the old checkpoint usable for retry.
5. Add a Vite-only canonical fixture when the chapter is playable, update the exact story handoff and author guide, and run the relevant rule/browser paths. A chapter plan alone must not enable a campaign entry button.

The catalogue tests check that every exploration map has one owner and that departures use the intended transition without losing resources. Existing chapter tests exercise their story checkpoints; browser tests cover real loading, missing-asset retries, menus and saved departures.


Chapter Six keeps its smaller expedition modules under `content/chapter-six/jungle/` and `north/`. The shared interactions coordinate ship reports and opening the landing after both independent seals; neither a cure nor a region alone grants a chapter boundary. `rules/winter-dragon.ts` owns pulls and separate `winterIce`, with movement/cold damage resolved by the ordinary combat rules. The matching presentation is shared with the Vite boss preview. Northern music is authored in `score-north.ts`.


The Chapter Six capital finale is playable: free Stillwater Avenue, clear the palace, face the Emperor and reach either the recovered departure or the explicitly committed uncured Lightbearer ending. Recovered Nell alone receives the playable Larkspur morning. Dev canonical Capital/Final preparations starts and both boss previews are available. Chapter Seven is playable from the recovered departure; see `docs/story/chapter-seven-continuation.md`. See `docs/story/chapter-six-continuation.md` (from the repository root) for checkpoints.

### Battle hex raster

`rules/hex.ts` defines a near-regular 60 x 72 pointy hex with 54px row
spacing, instead of irrational regular-hex spacing. Centers and vertices
(including border insets) sit on the 2px display lattice. The shared
`hexVertices` shape supplies `game/hex-grid.ts`, which collects the 266
unique battlefield edges. Draw this network after cell fills, batching
same-style segments into paths so shared edges and joins do not accumulate
alpha. Tactical priority resolves contested edge colors independently of
cell order. Stroke phase and even widths preserve complete chunky columns,
with the same weight at the board boundary. `fromPixel` checks those same polygon edges after its
axial estimate. Combat adjacency, distance and footprints stay axial.

When changing this lattice, check all arena floors and boss anchors. The
ward's authored circular paving follows its combat base; regenerate it
with `python assets/vector/chapter-five.py`. Keep detailed fractional-DPR
rendering and movement checks outside the default CI selection.

## Scripted lantern light and pending sound

`Shot.omen: 'shard'` plays the small lens glint in `game/lantern-glint.ts`.
It follows Nell’s independently drawn facings and walking hand positions from
`content/actor-motion.ts`, and redraws on scene time through `Cutscene.animating`.
Use it only for explicit lantern reactions, not every machine’s resonance cue.
The next dialogue line or scene close/skip stops it; reduced motion keeps a
steady small light. No state, sprites or story flags are changed by the effect.

Remembered sound starts only after a trusted first gesture. While waiting, the
button reads **Sound on next input**; a slow start reads **Starting sound**. Both
can be cancelled from that button. These phases describe the saved intent and
loading state separately from audible playback, without opening an AudioContext
on page load or changing workshop transport controls.


### Loading during combat

Save remains available during campaign battles for loading an existing slot or
importing a current-format JSON file. Combat does not write manual slots or
export a mid-battle snapshot. Restore keeps the active battle until the target
assets have loaded, then discards its presentation and callbacks through the
existing battle-identity guards. Invalid files and failed scenery loads leave
the current battle playable. A separate load guard serializes restore requests
without borrowing the combat animation/turn busy flag. JSON import also works
when IndexedDB is unavailable. The battle-loading browser regressions exercise
slots, imports during animations, stale callbacks, failed-load recovery and
storage failure in both development and production. These detailed flows remain
opt-in, outside the small default CI browser gate.


## Battle commands and field confirmation

The single command grid contains the contextual **Move / Strike** action, all
learned solo/team skills, Items, Defend and Wait. Shortcut 1 selects the basic
command; the remaining numbered shortcuts follow the displayed skill buttons.
A living enemy contact (including multi-hex bosses) or strikeable fixture selects
a Strike preview. Ground selects movement. The existing legality checks still
reject out-of-range attacks, occupied destinations and spent actions; no automatic
move-and-attack is performed. A projected boss body is identified before choosing
the basic action, so an out-of-range body tap stays a rejected Strike. A fixture’s
Move here button selects movement onto its otherwise walkable cell. Team helpers retain their movement-only allowance.

Confirmation is a separate field overlay, outside both the command scroller and
`UI.sceneLayer`, so it does not block targeting as a story panel. It stays in the
top-right corner below the toolbar; upward boss fights use the bottom-right
corner above development tools to keep the boss visible. Neither layout follows
the cursor or selected target. A fixed-size card and
fixed button row prevent jumps between hints, warnings and confirmation, including
while hovering or panning. Predictions scroll inside the card. Cancel spends
nothing. Log (L) opens the complete current battle history in the shared modal;
it no longer reserves a desktop column. Clear/restore removes the field overlay.
Phones use a compact character header and three-column grid, with the full skill
description in the field preview. Development tools remain outside the command
grid and out of the production build. Skills retain rank badges; team buttons use
a blue border and inspectable gray unavailable states.

Review the focused browser checks:

```sh
npx playwright test battle-menu.spec.ts rich-combat.spec.ts team-skills.spec.ts
BT_PRODUCTION=1 npx playwright test --grep 'production field confirmation'
```

The max-level layout cases cover all five characters and desktop, fractional-DPR
phone and 320px phone layouts. Detailed menu cases remain outside the default
browser CI selection.
