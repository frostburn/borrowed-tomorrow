# Production bundles

Run `npm run build`, then `npm run build:size`. The size report reads Vite's manifest, follows static imports to identify startup chunks, and measures both file bytes and Node's default gzip output. Gzip is an HTTP transfer estimate: the static host still needs to serve compression. The report also totals the complete distribution, including artwork.

## Size baseline

Measured against main at `c801663` with the pinned dependencies, in decimal MB/kB:

| JavaScript | Before | After |
| --- | ---: | ---: |
| Total raw | 6.54 MB | 3.10 MB |
| Total gzip | 741 kB | 549 kB |
| Startup raw | 6.54 MB | 3.00 MB |
| Largest game chunk | 5.16 MB | 442 kB |
| Phaser raw | 1.37 MB | 838 kB |

This is about 53% less raw JavaScript and 26% less gzip transfer. The complete output is about 12.35 MB; public artwork is unchanged. These numbers are a baseline, not a permanent content budget. `build:size` gives current measurements.

## Lossless map packing

`scripts/build/tiled.ts` changes build output only. All editable Tiled JSON and tile definitions stay in their native form for the exporters, tests and development workshop.

- Tile-layer arrays use runs of repeated **deltas**, written in base 36. Each token is `delta` or `delta.count`, separated by commas. Accumulating those deltas restores the exact numeric tile IDs, including unsigned Tiled flip bits. Arrays that would get larger retain their ordinary representation.
- Tile catalogue pages intern repeated property lists. A null entry in a property profile represents the tile's repeated `name` property; all other property fields and their array order are retained. Runtime expansion gives each tile its own property objects.
- The small `tile-runs.ts` and `tile-catalog.ts` decoders run before maps or tile definitions are used. No HTTP fetch, browser decompression API or new dependency is required. Save files are unchanged.

`tests/build-maps.test.ts` reconstructs every campaign exploration/battle map and the complete editor tile catalogue, then compares every field against the originals. It also covers decreasing IDs, long runs and unsigned flip bits. A build watcher registers every catalogue JSON dependency.

## Chunk boundaries

- **Phaser** is a separately cached engine chunk. Production compiles the installed package's maintained `src/phaser-no-physics.js` entry with its own Canvas flag enabled and WebGL, sound and debug flags disabled. `scripts/build/phaser.ts` replaces Phaser's intentional `typeof FLAG` expressions only inside Phaser source. It maps the source entry's `global.Phaser` assignment to the browser's `globalThis`. The game already uses Canvas and its own Web Audio synth; neither physics nor Phaser sound is needed. Vite development retains the standard package build.
- **Chapter maps** group each chapter's packed grids, scenery manifests and lighting data. These pure data chunks depend on the shared tile decoder, avoiding a dependency back into the game entry.
- **Tile data** holds the compact catalogue and grid decoders, isolated from frequently changing game logic.
- **Story** holds authored dialogue, separate from rules and rendering. It is still eagerly imported, as are chapter maps: the synchronous story catalogue, save validation and cross-chapter arrivals require them. These boundaries improve caching; they do not claim chapter-by-chapter network deferral.
- **Music runtime** is a genuine dynamic import. The silent title and game do not request score code. The first sound request starts AudioContext resume during the user gesture and awaits both resume and score loading before scheduling. Pause/new playback generation checks discard stale completions. Subsequent toggles reuse the module. Score notes, tuning, room profiles and synth behavior are unchanged.

Keep `chunkSizeWarningLimit` at its normal value. Phaser remains over 500 kB and produces the one expected warning; splitting its tightly connected CommonJS internals merely to hide that warning would add requests without reducing engine weight. Every application/data chunk is below 500 kB. No dependency version, art guard or CI job was changed.

## Validation

Run the normal `npm run check` and critical development/production browser commands from the README. Detailed production coverage in `tests/e2e/production.spec.ts` checks all seven chapter starts, native rendering, save/reload and first-use/repeated audio on desktop and a phone at DPR 1.25. Use `--grep 'packed chapter data'` to select it. It remains outside the small default `@ci` set. Existing production guardian routes also exercise the custom engine in combat.

Browser plugin not available in the task environment; local browser QA uses the repository's Playwright setup. Capture screenshots outside the repository with `BT_QA_SCREENSHOTS`.
