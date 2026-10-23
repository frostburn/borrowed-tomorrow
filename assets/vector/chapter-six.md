# Namar and the outer mooring — source kit

Run `npm run art:six` with Python 3 and the environment’s existing Pillow installation. No new game dependency, bitmap painting or image-generation call is involved.

- `assets/vector/chapter-six.py` authors the five 64 × 42 world layouts and four 42 × 20 arenas, continuous SVG planes/props and `src/content/chapter-six/scene-art.json`. Floors, collision, painted control hit rectangles, named arrivals, civilians and scene casts share the same 24px cells. It preserves editor-owned marker roles on export.
- `assets/characters/vector/chapter-six.py` authors Samira, Sahir and Amal at 80 × 80 with the common sole anchor. Their 128 × 128 portraits are seeded only when absent; the published SVGs are editable originals. Female faces have their own construction; Sahir has a broad jaw, brow and beard.
- `assets/bosses/export-sun-serpent.py` authors the 296 × 244 organic head/body and three breath poses, two 128 × 112 coils and a 128px portrait. Runtime masks use native SVG alpha. No raster resizing or palette reduction occurs.
- Sunmesh common enemies are fixed Chapter Six recolors in `enemy-variants.json`, reproduced with `node scripts/export-enemy-variants.mjs`.

Namar uses ochre sandstone, broad evening shadows, turquoise domes/canals, awnings and warm bronze instruments. The palace is a shaded open court rather than another imperial engine hall. Rooftops rise through the city to a bronze flood-measuring observatory. Architectural faces and floor lips stay below their walking surfaces; sorted props use actual ground anchors. The existing final 2px framebuffer gives text, actors and scenery the same weight.

The game and Maps → Chapter 6 load the same pieces. The serpent campaign and Vite-only preview share production vectors and combat presentation. Music → Ch 6 contains the regional score and battle variations. Keep every SVG below 128 KiB and run the staged art-upload guard before publishing. Re-exporting must leave the tracked outputs unchanged.
