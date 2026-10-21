# Rasterized vector character pilot

Nell and Orrin are the initial experiment for the new chapter-one direction. Their actors, portraits and motion poses use original vector constructions inspired by the flat fills, black contours and wide pixels of early Sierra/AGI games. Their identity remains practical railway clothing, Nell's two braids and right-hand lantern, and Orrin's cap/goggles, beard and right-hand steam lance.

## Source and reproduction

`draw.py` is the authoring source: a shared scene graph of meaningful polygons, ellipses and polylines, a 16-color EGA palette, separate directional constructions and explicit pose parameters. It emits both inspectable SVGs and PNGs. The SVG files are generated views of those shapes; edit the model and regenerate rather than editing the SVG exports alone. No generated bitmap, pixel-grid detector, image resampling or previous sprite is an input.

```sh
# Python and Pillow are task-environment tools, not game dependencies.
node scripts/export-vector-characters.mjs
# Or export one character:
node scripts/export-nell-animation.mjs
node scripts/export-orrin-animation.mjs
```

Shapes rasterize directly at 40 x 80 for world actors and 64 x 128 for portraits. Each logical pixel is replicated into two horizontal output pixels, yielding native 80 x 80 actors and 128 x 128 portraits. This deliberate rectangular-pixel grid has no antialiasing, dithering, interpolated colors or palette reduction. PNG transparency is binary. Runtime uses native scale with nearest filtering. The SVG viewBox has the same 2:1 horizontal expansion for inspection.

World figures occupy approximately 63px in height with a shared sole anchor `(40,68)`. Nell has four idle views and three lantern attack frames, with idle translation during movement. Orrin has four idle views, six walk frames and two lance attack frames. Front/right/back/left views preserve anatomical handedness through drawing order: the left-facing right arm/tool is behind the body, while the right-facing right arm is near the camera. No profile is a mirrored bitmap. Orrin's walking support foot moves backward 28 output pixels per cycle to counter distance-based character travel.

The exporter checks binary alpha and palette membership. Individual PNGs are small; motion pages remain 160 x 160 (Nell) and 160 x 320 (Orrin). Existing game IDs, combat timing, save data, inventories and the other characters remain intact. No vector drawing runtime is shipped: the game loads only the PNGs.

## Review

Open the dev Sprites tab (`?dev=sprites`) and compare Nell/Orrin at 1x–3x against Paper, Slate and Night. Review all four directions, Attack, Play/Pause and frame stepping. Nell's Walk stays disabled; Orrin keeps six walk poses. Portraits use the same palette and shape language. The old Nell/Orrin layered skins are removed from Animation; its mannequin and Kit/Petra tools remain available.

The surrounding chapter-one art is intentionally still the existing scenery. This PR is the place to expand that scenery once the two-character visual direction is accepted. Future scenery can reuse the same vector scene graph, palette and raster grid; this pilot does not change map layout or collision.

Historical reference: [ScummVM's AGI picture implementation](https://github.com/scummvm/scummvm/blob/master/engines/agi/picture.h) documents the original engine's vector picture drawing. This project uses its own vector character source and does not claim that original AGI character views were vector resources.
