# Chapter-one vector characters

Chapter One uses original vector actors with tall adventure-game proportions, broad color planes and sparse explicit detail. The scenery and portraits now pursue the cinematic polygonal direction of Another World; automatic black polygon outlines are removed while tool, garment and face details remain. This is a stylistic reference, not an EGA recreation. Colors use a warm railway palette that can grow when a scene needs it.

## Authoring and reproduction

`draw.py` defines Nell and Orrin with polygons, ellipses, polylines and explicit poses. `supporting.py` uses the same primitives for Ansel, Iona, Tomas, Alban, Tilda and Elspeth, plus the hound, crow, guardian and tactical rocks. The models export self-contained SVGs to `public/art/vector/`. These SVGs are the **actual runtime assets**, including motion pages. World actors and animation are drawn directly from these models. Edit actor models and regenerate; their SVG outputs will be overwritten. The eight 128 × 128 portrait SVGs are separately hand-authored originals traced from `ec894d8:public/art/portrait-{name}.png`; their embedded metadata records the reference. Edit these SVGs directly: neither character exporter overwrites them.

```sh
# Rebuild the entire chapter, including scene layers:
node scripts/export-chapter-one-art.mjs
# Only the two leads, or a single lead:
node scripts/export-vector-characters.mjs
node scripts/export-nell-animation.mjs
node scripts/export-orrin-animation.mjs
# Only supporting cast:
python3 assets/characters/vector/supporting.py
```

Python/Pillow are task-environment authoring tools, not game dependencies. Pillow validates the leads' planted attack stances and distinct walking poses; its temporary raster renders are never exported or loaded by the game. No extra runtime dependency is needed.

The SVG viewBox expands 40 x 80 logical actor coordinates into 80 x 80 frames; the hand-authored portraits use a natural square 128 x 128 viewBox. This retains the accepted wide-pixel proportions without requiring a fixed palette or a historical display mode. Browser SVG decoding supplies Phaser's native-size textures, cached once in memory to keep cropping/playback efficient, while the UI and workshops load those same SVG URLs. Phaser's Canvas renderer necessarily paints pixels internally; the repository ships vectors rather than pre-rasterized substitutes. Nearest filtering preserves the source planes; the final shared 2px display raster treats art and text alike. All files are self-contained: no embedded images, linked resources or fonts.

## Identity and motion

World actors use sole anchor `(40,68)`. Nell retains her red work jacket, two braids and anatomical right-hand lantern. She translates her four directional idle poses during movement. Each 160 x 160 attack page has wind-up, contact and follow-through in frames 0–2 at 0/140/220ms, restoring idle at 300ms. Orrin keeps his cap, goggles, beard, cream sleeves and right-hand steam lance. Each 160 x 320 page holds six walk poses and two attack poses. His planted foot counters the 28px distance-based stride. Left/right constructions are independent, with the far right arm/tool occluded in left profile.

The supporting cast keeps its established costume identities. Elspeth remains seated with her complete wheelchair, wheels, casters and footplate. Alban remains human and distinct from the mechanical Inspector. Shared people/enemy IDs use the same vector appearance when they recur in later chapters; Kit, Celia, Petra and later-only supporting actors retain their existing art.

## Review

Open `?dev=sprites` for native and enlarged comparisons, independent facing views and motion playback. Nell's Walk remains disabled. Check NPCs and Enemies as well as Party. `?dev=maps&map=station` reviews the matching environments; see [the scenery guide](../../vector/README.md). Workshop review never changes campaign saves.

The old lead rigs, PNG runtime replacements and duplicate inspection-only SVGs are retired. The Animation tab retains its mannequin and Kit/Petra tools. No gameplay, save format, equipment, dialogue, combat timing or progression changes accompany this art pass.
