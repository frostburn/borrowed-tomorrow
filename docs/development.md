# Working on Borrowed Tomorrow

Start with the file that owns the behavior. The Phaser scene connects the systems; chapter content owns the adventure and rules modules own state changes. The current-format save is version 10. Plans under `docs/story/` describe Chapters Six–Seven, which are not yet playable.

## Find the right place

| Change | Start here |
| --- | --- |
| Chapter entry, scene group, completion panel or story routing | `src/content/chapters.ts` |
| Services story scripts can request from the game | `src/content/story-host.ts` |
| Dialogue, staging, objectives or journal text | `src/content/chapter-*/scenes.ts`, `story.ts`, `interactions.ts`; Chapter One stages through `src/content/scenes.ts` |
| Register an encounter | The chapter's `encounters.ts`, then `src/content/encounters.ts` for a new chapter |
| Combat resolution, targeting, movement or enemy choices | `src/rules/combat.ts`, `hex.ts`, `footprint.ts`; boss rules have their own modules |
| Character state, recruitment, recovery or chapter transition | `src/rules/state.ts`; illness/availability lives in `availability.ts` |
| Save format, accepted checkpoints or import validation | `src/rules/save.ts` |
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

Use `npm run dev:workshop` instead to open the existing Vite-only tools directly. Direct review URLs include `/?dev=maps`, `/?dev=music`, `/?dev=sprites`, `/?dev=animation` and `/?dev=boss`. The dev title also has canonical starts through Chapter Five Act IV. These tools use their own fixtures/storage; preserve their production exclusion.

For a focused change:

```sh
npm run typecheck
npm run test:watch -- tests/tuning.test.ts
npm test -- tests/chapter-five-finale.test.ts
```

Before publishing, run `npm run check` for rule/content tests, TypeScript and the production build. Use existing Playwright regressions for changed rendered behavior, especially scene loading and save restoration. The normal browser gates remain `npm run test:e2e:ci` and `npm run test:e2e:ci:production` (the latter uses the built app). New detailed regressions do not need an `@ci` tag. Full journeys and long audio renders stay in the manually dispatched full run. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when using an existing browser installation.

Art exports have matching commands: `npm run art:one` through `npm run art:five`. They invoke the existing reproducible SVG exporters; inspect their diff before staging. Run `npm run check:art-upload` on the staged assets. Keep screenshots, traces and temporary scripts outside the repository; `BT_QA_SCREENSHOTS` selects an external capture directory.

## Adding the next chapter

1. Add chapter-local scenes, interactions, journals/objectives, encounters, Tiled maps and vector source. Keep map IDs and story checkpoints deliberate; use named arrivals/casts rather than copying world coordinates into new scenes.
2. Extend the current model and transition in `rules/state.ts` and the checkpoint checks in `rules/save.ts`. Preserve earlier resources, actual formation and save IDs. Do not add migrations or automatically grant missing progress.
3. Register the chapter's maps/battlefields in the aggregate map registries, encounters in `content/encounters.ts`, and its hooks/entry/ending in `content/chapters.ts`. The catalogue supplies both transition loading and restore loading. There are no asset-pack availability switches.
4. Add region/boss/cinematic art to its proper manifest or presentation module. `RegionAssets` must finish successfully before entry mutates the state; a failed load must leave the old checkpoint usable for retry.
5. Add a Vite-only canonical fixture when the chapter is playable, update the exact story handoff and author guide, and run the relevant rule/browser paths. A chapter plan alone must not enable a campaign entry button.

The catalogue tests check that every exploration map has one owner and that departures use the intended transition without losing resources. Existing chapter tests exercise their story checkpoints; browser tests cover real loading, missing-asset retries, menus and saved departures.
