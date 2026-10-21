# The Benefactor: vector preview

The Bosses workshop (`?dev=boss`) now uses whole SVG artwork in the same broad polygonal direction as the party and Chapters One–Two. Its ivory porcelain, antique gold, indigo recesses and turquoise heart interpret the approved design at `8b21977:src/dev/art/benefactor-{0..2}-{0..1}.webp`. The heavy connected hands, serrated mantle, protruding ivory shoulder spikes, short solar rays, broken halo and completely empty face aperture define its silhouette. Fine painted ornament is deliberately replaced with broad lighting planes.

Edit these originals directly:

- `src/dev/art/benefactor.svg`: transparent 360 × 288 actor, at the original placement and scale.
- `src/dev/art/benefactor-domain.svg`: 1024 × 480 domain, retaining the accepted platform coordinates and framing.

Both files are self-contained vectors. There are no embedded bitmaps, external resources, panel seams, raster replacements or production dependencies. The native SVG decode is cached once for Phaser's canvas renderer; the final shared 2px raster treats boss, party, portraits and text alike. The same decoded motion atlas supplies an alpha hit mask for each pose. Its nineteen-hex footprint, phases, warnings, targeting, defensive effects and rewards are unchanged.

```sh
# Derive the face/chest portrait from the boss's vector geometry:
python3 assets/bosses/export-benefactor.py
# Reproduce Celia's four independent native 80px actor views:
node scripts/export-celia-art.mjs
```

The boss exporter writes `benefactor-portrait.svg`, using `viewBox="116 20 128 128"` at 128 × 128, and `benefactor-motion.svg`, a 720 × 1728 page of twelve native 360 × 288 poses. The atlas defines the eleven source parts once and references them through internal SVG `use` elements; there are no raster panels. It does not overwrite either primary SVG. Keep the source group IDs when editing geometry. Celia's separate portrait is also an editable original, using the established female construction with mature facial planes and spectacles. She retains her silver bob, green physician's coat, left-hand medical book, six-pose directional walks, a swaying coat, steady left book arm and sole anchor (40,68). Her four 160 × 240 walk pages use a 24px distance-based stride; spell actions retain her idle poses.

Retired boss WebP panels and Celia PNGs remain available in history at `8b21977`; they are not runtime fallbacks. `benefactor-prompt.json` is the archived raster-generation brief. The current vector workflow takes no bitmap input and performs no image reduction.

Check the Sprites and Bosses tabs on desktop and phone at fractional DPR, including phase presets, painted-body targeting, support targets, restart/outcomes, native chest sampling through the common display raster and campaign-save isolation. Run `npm run check`, `tests/e2e/boss-preview.spec.ts`, `tests/e2e/sprites.spec.ts` and the production CI smoke cases. Boss assets stay under `src/dev/` and must be absent from production; Celia is shared with her Chapter Four campaign appearance. After staging, run `npm run check:art-upload` before publishing. Whole SVGs are allowed while each file remains below 128 KiB.

The eight breathing phases form a 3.2-second inhale/exhale loop. The upper torso expands and the chest/halo rise while the mantle base stays anchored. Judgment uses poses 8–11: forearms lift inward at the elbows, gather around the heart, release and recover. Its timeline changes at 220/420/660/920ms, with hit effects and damage-number presentation at 420ms. `src/dev/boss-motion.ts` owns playback; `boss-preview.ts` adapts it through preview-only attack/timing hooks. Ordinary campaign attack timing is unchanged. Restart, outcomes and tab exit destroy the sprite's update listener, while battle-instance checks cancel delayed impacts. Reduced motion keeps the resting pose.

`BattlePreview.animating` reports passive playback to the final framebuffer compositor. This keeps breathing visible between pointer/keyboard events; frame changes in the hidden Phaser canvas alone are insufficient. The browser regression samples the visible chest pixels with a stationary pointer and checks that reduced motion keeps them still.

## Heart regulator

`/?dev=boss&boss=conduit` previews the conduit guardian facing the heroes from above. It is an expanded mechanical interpretation of `public/art/vector/boiler-keeper.svg`, using the accepted green-iron, copper, brass, pale gauge face, twin inspection lenses, furnace grille and bent side-chimney vocabulary. Its 256 × 240 frame stays at native scale. The rear contact and two front feet occupy three mutually adjacent axial hexes, `[(0,0),(-1,1),(0,1)]`, anchored at column 5, row 2. The feet stay fixed throughout the pressure/discharge poses; the boiler and cowl ride on the pistons. Its transparent bounds are separate from that tactical footprint.

Edit `src/dev/art/conduit-regulator.svg` and `conduit-chamber.svg` directly. The latter is a whole 1024 × 480 steel service platform inside the same green-iron cavern works. The restrained crystal stays offscreen. There is no divine face, voice or borrowed finale ornament. Both are self-contained original vectors with no raster source or embedded image.

```sh
python3 assets/bosses/export-conduit.py
```

This standard-library exporter leaves the originals intact, derives a 128 × 128 portrait viewBox crop (`64 34 128 128`), and builds a 512 × 1440 atlas of twelve native poses referencing nine shared part definitions. Eight pressure poses use the shared 3.2-second clock; four discharge poses open the arms and valve before the 420ms contact, recovering by 920ms. The gauge needle changes with the pressure. The same decoded atlas supplies per-pose alpha masks for body targeting. Reduced motion uses frame zero; passive motion reports through `BattlePreview.animating` to keep the visible framebuffer live without cursor input.

The developer preview offers sealed-intake and pressure-walk presets, preserving the corresponding grounding/vent concepts. Campaign encounters and 80px NPC artwork remain unchanged. `boss-display.ts` shares native SVG decode, pixel labels, occupied-body placement and legal projected-body selection with the Benefactor. Both encounters and all new assets remain under `src/dev/` and outside production. See `docs/development-workshop.md` for controls and focused checks. Stage the SVGs and pass `npm run check:art-upload` before publishing; no individual file approaches 128 KiB.
