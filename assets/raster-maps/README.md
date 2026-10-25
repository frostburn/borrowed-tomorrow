# Raster map art pilot

The user authorized new raster map art for Chapter One `station` and Chapter Six
`stillcity`. Both original vector maps remain bundled in the release. Help → Vector maps /
Raster maps switches the two skins, remembers the preference separately from
campaign saves, and refreshes an idle exploration scene without changing progress.
Switching is disabled during battles, movement and cutscenes. The Maps workshop
has the same Vector / Raster controls. Raster is the initial preference.
Other maps, actors and portraits retain their vector artwork.
Palette indexing is a PNG compression measure. Live actor lighting, highlight
planes, colored light and multiple shadows still run in unrestricted RGB.

## Curated sources

The four `painting-x-y.png` panels in each of `station/` and `stillcity/`
are the curated native-size sources (504 × 312 and 768 × 504 when assembled).
Panel names record exact native-pixel offsets; they share one palette per map. Both use 255 opaque palette entries;
exports reserve a further entry for transparency. `station/prison-coach.png`
is the independently generated departing coach, fitted to its existing frame.
They were made with the built-in image-generation tool; complete prompts and
source hashes are in `generation.json`. Large generation outputs stay outside
Git. The small native source panels, rather than a fresh nondeterministic generation, are
the reproducible input to exports.

The generator repainted the existing map composites. Stillcity references the
accepted Station painting for style; its central approach was then corrected
into visible stair treads. No actors or interaction icons are baked in.
Native reduction uses nearest-neighbor sampling, then Pillow median-cut to
255 colors with no dithering. The result is cropped into four source panels
without any further sampling or color changes. There is no second display downsample: every
native map pixel expands to the game's existing 2 × 2 logical-pixel grid.
Runtime layers above 96 KiB or 384 × 252 native pixels are split at exact pixel
boundaries so GitHub
connector uploads stay modest. Panels are independent pieces of the same layer,
with matching positions and depth, rather than repeating terrain tiles.
The selected resolution is an art direction choice, not a claim that the
original generated marks followed an exact pixel grid.

## Export

Authoring dependencies: Node, the project's Playwright/Chromium and Python
Pillow. No new game dependency. Use a normal Playwright Chromium installation,
or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an available Chromium binary.

```sh
npm run art:raster-maps
npm run check
# After staging:
npm run check:art-upload
```

The exporter decodes existing SVG geometry offline as masks. `maps.json` gives
painted foreground silhouettes, frame adjustments and sorting anchors. It
partitions each native painting into disjoint ground/prop regions, keeping all
painted pixels and the original Tiled layer IDs. Static prop silhouettes have
transparent space behind them in the floor; their art remains in separate
sorted fragments. The moving Stillcity cart has paving sampled from adjacent
floor beneath it, so its release animation cannot expose a hole. Layer
isolation therefore does not expose a baked duplicate.
Conditional art is excluded from the painting and exported independently: the
prison coach and arrest aftermath at Station, the removable bronze return at
Stillcity. The bronze return/aftermath retain their existing vector design,
rasterized at the common map scale. Preserve the `city-return` key substring
used by the imperial cinematic.

Outputs are indexed PNGs under `public/art/raster-maps/` and the generated
`src/content/raster-map-art.json`. The shared scene registry overrides exactly
the two requested maps. Vector chapter exporters do not overwrite these
paintings or their runtime selection; later Larkspur visits remain independent.
Changed source layouts/masks require rerunning `art:raster-maps`.

The upload budget is **256 KiB per PNG only in these two raster pilot folders**
(including their native authoring sources). Other images retain 128 KiB. Never
upload the large generation output or encode it in a text file. Runtime layers
currently total less than 500 KiB across both maps. The
largest actual file is below 96 KiB. No atlas packing or huge file upload is
needed; the larger per-file allowance is unused by the curated results.

## Review

- `?dev=maps&map=station` and `?dev=maps&map=stillcity` show the actual runtime
  art with lit actors, foreground sorting, flags, collision and layer isolation.
- Inspect the coach before/after `raidSeen` and the return before/after
  `capitalStreetFreed`. Keep the festival lanterns after the arrest.
- Review at native scale and 2x. Check doorway/actor scale, rail continuity,
  stairs, lamp bases, thin poles, plant silhouettes and foreground occlusion.
- The browser reconstruction check compares every static pixel of each map
  to its native painting at both workshop zooms. Campaign checks cover actor
  lighting, moving shadows, supplies and capital release/travel.
