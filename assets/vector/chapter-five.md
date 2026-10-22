# Chapter Five Act I — vector source

```sh
node scripts/export-chapter-five-art.mjs
```

`assets/vector/chapter-five.py` reproduces five 1536 × 1008 exploration maps, five 1008 × 624 arenas, native whole SVG layers and their scene manifest. It uses Python's standard library. `assets/characters/vector/chapter-five.py` uses the existing Drawing/Pillow authoring helper to reproduce Alda, Hester and Durn. Their individual 128px portraits are editable originals: the exporter seeds missing portraits and never overwrites existing ones. The carrier's 80px actor, 128px portrait and 224 × 168 battle body use the same geometry in the scenery exporter. No bitmap input, resampling or new production dependency is involved.

The new cast follows the accepted broad polygonal models, 80 × 80 frames and (40,68) ground anchor. Alda has a blue pilot coat, pale scarf, gray hair and cap; Hester wears a russet headwrap and rolled sleeves with a brown apron; Durn has a narrow face, green uniform and requisition board. The women have distinct female face construction. Forge enemy recolors preserve their base geometry and are reproduced with `node scripts/export-enemy-variants.mjs`.

Tiled owns navigation, interaction rectangles/approaches, safe arrivals, civilian states and scene casts. Continuous floor unions avoid rectangle seams. Whole architecture sits at ground depths; sky, ship, decks and gangway surfaces remain behind the cast. The wheel, chart, gangway and anchor can be selected through their painted areas. `coolingOpened`, `hammerplainFreed`, `hammerplainComplete` and `fleetSighted` change water, families, crew and horizon layers in the game and Maps workshop.

The boarding scene sends the five companions and Alda into the cabin in a staggered procession, then hides them inside. The takeoff moves the whole survey ship and its boarded cast together on scene time. It reports passive animation to the shared framebuffer; reduced motion settles immediately. Skip/close removes the update listener and restores temporary transforms. All campaign writes stay in scene completion. The carrier uses legal whole-footprint movement, temporary hot tracks and actual fixed-round attack patterns; custom actor placement follows the path and whole-body alpha picking follows its current base. It has mechanical recoil, not breathing.

Runtime SVGs load with all five regions and local arenas before departure/deep restore. Missing assets retain the prior checkpoint and allow retry. Every SVG is self-contained and below 128 KiB; the common final 2px raster keeps art and text consistent. Maps, Sprites and Music review actual campaign assets. The flagship remains dev-only.

Run `npm run check`, `tests/e2e/chapter-five.spec.ts` and the focused Chapter Five production checks. Detailed journeys/device/audio checks remain outside the default CI gate. Stage explicit owned files and run `npm run check:art-upload` before publication. Screenshots/traces belong outside the repository.
