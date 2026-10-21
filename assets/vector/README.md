# Chapter-one SVG scenery

`chapter-one.py` draws the complete chapter-one kit with reusable vector primitives. It covers all four exploration maps (Larkspur station, Orrin's yard, Rillbridge and the eastern pass) and their four battlefields. The flat shapes, dark outlines and warm railway colors match the vector cast; the palette is an extensible style guide rather than a hardware limit.

```sh
python3 assets/vector/chapter-one.py
# Or rebuild scenery and cast together:
node scripts/export-chapter-one-art.mjs
```

The scenery exporter uses Python's standard library only. It reads existing tile definitions and `assets/tiles/scenery.json` **for names, dimensions and placement metadata only**; it never opens their old images. The 25 reusable models include station/workshop/bakery/shelter buildings, three train types, two trees, bridge deck and separate near railing, viaduct, collectors before/after release, market, lamp, mural and small props. Ground and cavern surfaces are also vector-authored. Broad rock faces span several cells, avoiding a repeated contour on every tile. Transparent faceted path joins expose the neighboring terrain.

Each of the eight Tiled maps declares `artStyle: vector`. `src/content/tilemaps.ts` resolves its existing tile IDs to small SVG pages under `public/art/vector/tiles/`, with a generated page registry in `src/content/vector-tiles.json`. Each page is at most 192 x 192 and 128 KB. Shared `<defs>` and local `<use>` references retain one drawing of a module within each page. Runtime loads these self-contained SVGs as native 24px sprite sheets and caches their decoded native surfaces in memory once; it does not load a PNG/WebP version of chapter-one scenery. Both Phaser and the Maps workshop resolve the same IDs and URLs.

The standard Tiled JSON remains the layout, interaction, scene-cast and collision source. No floor, route, arrival, tactical cell or checkpoint ID is changed. Story-flag layers still remove festival decorations/the prison coach and replace the collector and suspended drops. Sorted prop pieces retain their common ground anchor, with the bridge deck beneath actors and the near railing in front. Tiled itself retains the shared original atlas thumbnails; `?dev=maps` previews the authored SVG appearance. The original atlas also remains in use by Chapters Two and Three, whose scenery loads on demand together with their local battle pages.

Run `npm run check`, the chapter-one journey, tilemap and sprite browser scenarios, then stage and run `npm run check:art-upload`. The guard applies the same 128 KB budget to SVGs, rejects embedded rasters and external references, and checks the exact staged files. Regeneration should leave no diff. Inspect characters at their grounding and verify the bridge, cave recesses and staged Alban movements on desktop and phone. Detailed browser checks stay outside the default CI set.
