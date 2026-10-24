# Chapter Two vector artwork

The Iron Coast, railway ward and Cinderbank use Chapter One's crooked, faceted SVG vocabulary and live actor lighting. The harbor has blue-hour paving, sparse sea reflections, steel cranes and warm carriage windows. The ward has connected slanted wall runs, warmer stone, arched window beams, linen beds and stove light. Cinderbank's tilted cottages and coal shed sit above a continuous, uneven rock terrace, with cold mountain silhouettes behind the railway. Its engine remains at the accepted capital crossing, leaving Alban visible when he retreats behind Petra.

Seven Tiled layouts compile to continuous SVG ground/detail layers. Editable originals in `public/art/vector/scenery/` supply the crane, coal shed, miners' cottage, ward furniture, trains, lights and crates. `assets/vector/chapter_two_style.py` derives the Chapter Two variants under `public/art/vector/chapter-two-kit/`; shared originals and other chapters remain independent. Position-specific ward walls and retaining faces meet at shared world-coordinate vertices. The terrace has broad unequal geological planes instead of repeated rock teeth. Large native SVG canvases are allowed; no raster replacements are shipped.

```sh
# Compile the seven maps and all Chapter Two world actors/motion pages:
node scripts/export-chapter-two-art.mjs
# Only the actor models:
python3 assets/characters/vector/chapter-two.py
# Only the maps:
python3 assets/vector/chapter-one.py --chapter two
```

Python/Pillow are task-environment authoring tools, not production dependencies. `chapter-two.py` uses the shared vector drawing primitives for Kit, Petra, Dena, Inspector and nine civilian clothing variants. Kit has six walking poses and two crossbow poses in each independently drawn direction. Petra adds two shield-bash poses; her saber stays right-handed, shield left-handed, and blade pitch stays fixed during walking. Native actors are 80 × 80 with sole anchor (40,68). All civilians now use those same dimensions and anchor, removing runtime reconstruction scaling and its former inspection panel. Replaced public PNGs are retired. The Animation tab retains the earlier raster rig studies as authoring references; Sprites displays the actual current SVG artwork.

Kit carries his crossbow pointed down in idle and all six walk frames, retaining the right trigger hand and left fore-stock support. His firing poses still raise it to aim. Lower-body geometry, satchel side, stride and 80px frame bounds remain unchanged.

`src/content/chapter-two/lighting.json` is the shared compiler/campaign/Maps registry for ambient light, cool reflected fill, lamps, engine headlights, carriage windows, ward windows, stove and collector core. Floor spill is clipped to authored ground and inherits the emitter's story layer; collector victory removes its glow. Actors, civilians, temporary scene casts and ordinary battle units use `sceneLight` with the same material highlight planes and bounded overlapping shadows as Chapter One. Tactical markers/text remain above ground lighting. Maps uses the same shader and shadow painter, including layer isolation and story flags. Chapters Three onward keep their current lighting until explicitly extended.

The twelve portrait SVGs are editable originals, separate from the body exporters. Kit, Petra, Dena and Inspector reference the original portraits at `babe8ca`; Chapter One portraits reference `ec894d8`. The six female portraits (Nell, Iona, Tilda, Elspeth, Dena and Petra) use a separate construction with a tapering lower face, shallow chin, compact nasal tip and finer eye/brow shapes. Individual outlines, age planes, hair, expressions and costumes remain distinct: Tilda has fuller cheeks and a broad smile, Elspeth a longer mature face, and Petra a restrained, stern mouth. Inspect the SVG metadata and edit those originals directly. Exports never overwrite portraits.

`src/content/chapter-two/scene-art.json` registers art against the original Tiled layer IDs. Navigation, coach door hit area, arrivals, casts, silent people and checkpoint flags stay unchanged. Barrier removal, recovered medicine, working/broken collector and boarding supplies use the same story layers. Chapter Two SVG scenery and local battlefield assets load on demand and must finish before a chapter boundary or travel is consumed. Failed loads retain the original checkpoint and can be retried.

Review with `?dev=maps&map=coast`, `?dev=maps&map=infirmary`, `?dev=maps&map=cinderbank` and `?dev=sprites`. Check the chapter's four battle maps, layer isolation, scene casts, story flags and both desktop/phone viewports. The shared final 2px raster continues to cover artwork and text. Stage explicit files and run `npm run check:art-upload` before publishing; self-contained SVGs retain the 128 KiB per-file byte budget.

The original generated paintings are composition/lighting references from history, not runtime fallbacks. Chapter Four now uses its own vector ward apron; the old painting is retired. Shared legacy tile pages remain for Tiled thumbnails and collision definitions; Chapters One–Four now render SVG scenes.
