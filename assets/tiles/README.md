# Native tile artwork

The supplied *Atmospheric JRPG railway asset sheet-1* and *Six seamless railway terrain tiles-2* are authoring inputs, kept outside git. They contain modular scenery and material fields, not whole maps. `scenery.json` records the crop rectangles, native size budgets and physical footprints.

Run `python3 assets/tiles/import-dimensional.py /path/to/scenery.png /path/to/terrain.png` with Pillow installed to repeat the import. It trims using the visible alpha bounds, then samples original colors/alpha at the recorded native budget. It rebuilds the 24px terrain tiles and prop pieces after the 161 retained original railway/detail tiles, along with all existing terrain joins. The importer exports lossless PNG/WebP pages at most 192 × 192 pixels and 128 KB each. Full source sheets are never copied into git or uploaded. Runtime draws native pixels without scaling or recoloring.

`pages/*.json` are standard external Tiled tilesets, each referencing one small PNG or WebP in `public/art/chapter-one/`. `chapter-one.tileset.json` catalogs page ranges; `modules.json` records complete prop dimensions and ground anchors. Every sorted piece of a prop shares its ground depth. Walkable bridge decks and stairs draw as floor layers; the bridge near rail/posts use a separate sorted module, partitioned from the same original pixels by the foreground bounds in `scenery.json`. A separate map layer per overlapping module preserves transparency rather than erasing other modules. Navigation comes from physical foot tiles, never canopy bounds.

After staging, run `npm run check:art-upload` before uploading or committing. Upload each approved image independently; stop on failure. `npm run check` validates the pages and map references. Normal Vite builds consume checked-in files without Pillow or source sheets.

The supplied work-chat artwork uses full-color illustrated pixel scenery: slate pitched roofs, warm windows, cool shadows, rounded metal boilers, layered foliage and mossy rock faces. Preserve this dimensional style when adding modules. Ground materials use fine detail at character scale. Do not revert to flat diagram-like scenery.


`native_tiles.py` packs the actual tile pixels into pages and verifies that decoding every image returns identical RGBA bytes before replacing any files. It uses lossless encoding; the encoder's effort setting affects compression time, not image quality. The user approved the 128 KB file cap after the smaller limits caused automatic review to reject valid tile uploads. Large source sheets remain excluded. Normal builds do not re-encode artwork. Appending tiles preserves every existing page boundary and image name. Re-importing a sheet must retain every tile name/ID; the importer refuses dimension changes that require deliberately re-stamping modules in Tiled.

Material joins feather only the edge of a terrain tile over the underlying material. Native paving uses smaller stones than the source preview to match the actors' scale. Ground anchors and physical foot rows remain separate from roof/canopy extents. Keep separate map layers for overlapping scenery, and leave tactical fighting floors clear.
