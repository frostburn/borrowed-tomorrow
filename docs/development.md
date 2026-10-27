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

Art exports have matching commands: `npm run art:one` through `npm run art:seven`. They invoke the existing reproducible SVG exporters; inspect their diff before staging. Run `npm run check:art-upload` on the staged assets. Keep screenshots, traces and temporary scripts outside the repository; `BT_QA_SCREENSHOTS` selects an external capture directory.

## Rendering performance

Chapter One–Five's lit maps blend consecutive static planes below depth −900 into native Canvas textures when `drawTileMap` builds the world. Actors, ground shadows, sorted props, markers and effects remain live. The texture belongs to that world container and is released on destruction. Story refreshes, battle redraws and restarts rebuild from the current visible pieces, so collector shutdown and other flag changes cannot reuse stale light. A Tiled layer marked `live` remains an independent image between its cached neighbors; Chapter Three's feed-light shutdown and Chapter Five's survey takeoff and flagship destruction use this. Later chapters keep their existing renderer. No raster assets are written to disk.

`world-light.ts` rejects lights outside the transformed frame bounds before visiting pixels. Bounds include flips, rotation, scale and beam apertures; surviving lights share their distance calculation between attenuation and surface response. The exhaustive-lighting regression compares exact pixels at beam/radius edges and under transformed poses.

To profile, record a Chromium CPU profile while walking right for 2.2 seconds and left for 2.2 seconds with Nell/Orrin/Kit in each Chapter Two map. Keep viewport, checkpoint, motion settings and sample interval the same. In headless Chromium at 1280 × 800 with 500µs sampling, these changes reduced sampled busy time from 75% to 24% in the harbor, 51% to 25% in the ward and 89% to 24% in Cinderbank. Both runs already met the environment's 60Hz frame cadence; the improvement is CPU headroom, not a claimed frame-rate multiplier. Native scene/actor checks, collector visibility and the boarding animation should accompany performance changes. Detailed profiling stays outside default CI.

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
