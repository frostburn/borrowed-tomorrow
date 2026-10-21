# The Benefactor: vector preview

The Bosses workshop (`?dev=boss`) now uses whole SVG artwork in the same broad polygonal direction as the party and Chapters One–Two. Its ivory porcelain, antique gold, indigo recesses and turquoise heart interpret the approved design at `8b21977:src/dev/art/benefactor-{0..2}-{0..1}.webp`. The heavy connected hands, layered mantle, short solar rays, broken halo and completely empty face aperture remain its identifying features. Fine painted ornament is deliberately replaced with broad lighting planes.

Edit these originals directly:

- `src/dev/art/benefactor.svg`: transparent 360 × 288 actor, at the original placement and scale.
- `src/dev/art/benefactor-domain.svg`: 1024 × 480 domain, retaining the accepted platform coordinates and framing.

Both files are self-contained vectors. There are no embedded bitmaps, external resources, panel seams, raster replacements or production dependencies. The native SVG decode is cached once for Phaser's canvas renderer; the final shared 2px raster treats boss, party, portraits and text alike. The same decoded boss supplies its alpha hit mask. Its nineteen-hex footprint, phases, warnings, targeting, defensive effects and rewards are unchanged.

```sh
# Derive the face/chest portrait from the boss's vector geometry:
python3 assets/bosses/export-benefactor.py
# Reproduce Celia's four independent native 80px actor views:
node scripts/export-celia-art.mjs
```

The boss exporter writes only `benefactor-portrait.svg`, using `viewBox="116 20 128 128"` at 128 × 128. It does not overwrite either primary SVG. Celia's separate portrait is also an editable original, using the established female construction with mature facial planes and spectacles. She retains her silver bob, green physician's coat, left-hand medical book, static direction views and sole anchor (40,68).

Retired boss WebP panels and Celia PNGs remain available in history at `8b21977`; they are not runtime fallbacks. `benefactor-prompt.json` is the archived raster-generation brief. The current vector workflow takes no bitmap input and performs no image reduction.

Check the Sprites and Bosses tabs on desktop and phone at fractional DPR, including phase presets, painted-body targeting, support targets, restart/outcomes, native chest sampling through the common display raster and campaign-save isolation. Run `npm run check`, `tests/e2e/boss-preview.spec.ts`, `tests/e2e/sprites.spec.ts` and the production CI smoke cases. Boss assets stay under `src/dev/` and must be absent from production; Celia is shared with her Chapter Four campaign appearance. After staging, run `npm run check:art-upload` before publishing. Whole SVGs are allowed while each file remains below 128 KiB.
