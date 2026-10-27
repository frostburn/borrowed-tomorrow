# Railway vector characters

Chapter One uses original vector actors with tall adventure-game proportions, broad color planes and sparse explicit detail. The scenery and portraits now pursue the cinematic polygonal direction of Another World; automatic black polygon outlines are removed while tool, garment and face details remain. This is a stylistic reference, not an EGA recreation. Colors use a warm railway palette that can grow when a scene needs it.

## Authoring and reproduction

`draw.py` defines Nell and Orrin with polygons, ellipses, polylines and explicit poses. `supporting.py` uses the same primitives for Ansel, Iona, Tomas, Alban, Tilda and Elspeth, plus the hound, crow, guardian and tactical rocks. The models export self-contained SVGs to `public/art/vector/`. These SVGs are the **actual runtime assets**, including motion pages. World actors and animation are drawn directly from these models. Edit actor models and regenerate; their SVG outputs will be overwritten. The thirty human 128 × 128 portrait SVGs are separately hand-authored originals. Early references retain their exact commit/path metadata (`ec894d8` for Chapter One, `babe8ca` for Chapter Two); later regional portraits have individually drawn silhouettes and facial planes. The shared treatment and individual likenesses are recorded in [the portrait guide](portraits.md). Edit these SVGs directly: neither character exporter overwrites them.

```sh
# Rebuild the entire chapter, including scene layers:
node scripts/export-chapter-one-art.mjs
# Only the two leads, or a single lead:
node scripts/export-vector-characters.mjs
node scripts/export-nell-animation.mjs
node scripts/export-orrin-animation.mjs
# Only supporting cast:
python3 assets/characters/vector/supporting.py
# Celia, leaving her editable portrait untouched:
node scripts/export-celia-art.mjs
```

Python/Pillow are task-environment authoring tools, not game dependencies. Pillow validates the leads' planted attack stances and distinct walking poses; its temporary raster renders are never exported or loaded by the game. No extra runtime dependency is needed.

The SVG viewBox expands 40 x 80 logical actor coordinates into 80 x 80 frames; the hand-authored portraits use a natural square 128 x 128 viewBox. This retains the accepted wide-pixel proportions without requiring a fixed palette or a historical display mode. Browser SVG decoding supplies Phaser's native-size textures, cached once in memory to keep cropping/playback efficient, while the UI and workshops load those same SVG URLs. Phaser's Canvas renderer necessarily paints pixels internally; the repository ships vectors rather than pre-rasterized substitutes. Nearest filtering preserves the source planes; the final shared 2px display raster treats art and text alike. All files are self-contained: no embedded images, linked resources or fonts.

## Identity and motion

World actors use sole anchor `(40,68)`. Nell retains her red work jacket, two braids and anatomical right-hand lantern. Her six-pose directional walk uses a 24px distance-based stride. Each 160 x 400 motion page has walk frames 0–5, then wind-up, contact and follow-through in frames 6–8 at 0/140/220ms, restoring idle at 300ms. Orrin keeps his cap, goggles, beard, cream sleeves and right-hand steam lance. Each 160 x 320 page holds six walk poses and two attack poses. His planted foot counters the 28px distance-based stride. Left/right constructions are independent, with the far right arm/tool occluded in left profile.

The supporting cast keeps its established costume identities. Elspeth remains seated with her complete wheelchair, wheels, casters and footplate. Alban remains human and distinct from the mechanical Inspector. Shared people/enemy IDs use the same vector appearance when they recur in later chapters; Kit, Petra, Dena, Inspector and all silent civilians now use the Chapter Two vector models in `chapter-two.py`; Celia uses `celia.py` for four independent green-coat/medical-book views, six walking poses per direction and a separately authored portrait; the Emperor, Engine Warden and Heart regulator use `chapter-three.py`. Chapter Four’s Bram and Sanctuary Warden retain their current art. See [Chapter Two](../../vector/chapter-two.md).

## Review

Judge actor faces through the final 2px display raster as well as the native SVG. A small nose hook, cheek dash or dark lip can merge into an unintended moustache; prefer open skin between the eyes and a short, softer mouth. Omit redundant strokes rather than shrinking them further. Keep intentional beards, spectacles, face silhouettes and individual hair/costume shapes. Compare both x/y sampling offsets when reviewing faces, since world positions can meet any of the four phases of the display grid.

Open `?dev=sprites` for native and enlarged comparisons, independent facing views and motion playback. Nell's Walk previews all six poses; attacks retain their three separate frames. Check NPCs and Enemies as well as Party. `?dev=maps&map=station` reviews the matching environments; see [the scenery guide](../../vector/README.md). Workshop review never changes campaign saves.

The old lead rigs, PNG runtime replacements and duplicate inspection-only SVGs are retired. The Animation tab retains its mannequin and Kit/Petra tools. Campaign gameplay, save format, equipment, dialogue and progression stay unchanged.

Portrait faces are constructed individually, with different cheeks, noses, jaws, brows, age and expressions. They share lighting, material planes, framing and readable native-size features; there is no common face template. Body exporters leave these portrait originals intact. `node scripts/export-chapter-two-art.mjs` rebuilds Chapter Two actors and maps; Kit/Petra export entry points now use that vector actor source.

Celia’s 160 × 320 motion pages hold six walking poses and two casting poses. Coat hems follow the legs while her anatomical left arm holds the medical book steadily. A 24px distance stride drives exploration, cutscenes, tactical movement and Sprites playback; her Attack preview opens the book, then raises her anatomical right palm. The planted stance and left-hand book remain fixed through casting, and the atlas returns to idle at 280ms. Celestial bolt still falls from above its target. Reduced motion keeps the idle pose.

`node scripts/export-chapter-three-art.mjs` rebuilds Chapter Three scenes and supporting actors. The Emperor preserves his silver mane, ivory mantle, dark high collar and sun diadem. The Engine Warden has a faceted lantern head and red/ivory semaphore; the Heart regulator has a squat boiler, dial, furnace grille and tall chimney. All three use 80 × 80 frames and the common (40,68) sole anchor. Their separately authored 128 × 128 portrait originals reference the old PNGs at `ee63fb0`; the six superseded runtime PNGs are retired.


Chapter Five Act I adds Alda (survey captain), Hester (casting forewoman) and Durn (works superintendent) through `chapter-five.py`. They have individual 80 × 80 bodies, shared ground anchors and distinct 128px portraits; the women use separate female face construction. Their portraits are editable originals, seeded only when missing and retained by normal exports. The mobile furnace carrier shares its body/portrait geometry with `assets/vector/chapter-five.py`. Forge enemy palettes come from `src/content/enemy-variants.json` and the existing recolor exporter.

## Model consistency

Human actors share adult proportions and the (40,68) sole anchor, with individual silhouettes, costumes and head shapes. `human()` in `draw.py` retargets the later regional casts to the party’s scale while keeping tools and grips in body coordinates. Whole heads and bodies have explicit transform boundaries; small face marks retain enough height to survive the shared coarse raster. Portraits remain separate editable originals.

`Drawing.cloth()` clips broad light/shadow planes to each authored garment silhouette. `sleeve()` draws a continuous tapered polygon at the shoulder, elbow and wrist, with a shadow in the sleeve’s own material. It does not stroke a black arm tube. Hands, cuffs and tools meet at the same authored grip coordinates in idle, walks and attacks. Kit’s crossbow and hands sit behind his torso in back view; profiles keep the far arm behind the coat, with the trigger fingers and left support hand wrapped around the stock. Hound legs use filled copper planes instead of black strokes; every hound recolor supplies its own matching leg shadow. `Drawing.tube()` builds connected metal rods with broad material facets for Orrin’s steam lance and the collector/warden mechanisms, replacing black double strokes. Collector recolors include the arm highlight/shadow colors. Material families live in `MATERIALS`; don't substitute near-black blue for shadows on every coat.

Rebuild the cast with the existing character exporters, then run `node scripts/export-enemy-variants.mjs` so human troop/knight variants follow their source actors. Keep the old PNG skin studies used by Animation and the PNG tile pages used by map tools. Ivo/Mira’s unreferenced runtime sprites and portraits are removed; no retired-story raster placeholders ship in `public/art/`.

`companions.py` derives unarmed idle poses and joint hug/hand-holding poses from Nell and Kit’s accepted rigs. The bodies retain their proportions and handedness; only the sleeves are posed for contact. `art:six` and `art:seven` reproduce the four native SVGs. They load with Iria and the real seaside epilogue, with Kit’s separate actor hidden only for the joint poses. Cutscene teardown restores the world cast and never changes the selected formation.

The graphics repair pass for issues #83–#86 joins Orrin’s beard shading around a closed mouth while retaining his open gaze, removes the under-jaw rear hair from Kit and shortens Tomas’s side lock, and reinforces the side-lock/braid roots of Alda, Elspeth and Ines. Alban’s near ear meets his temple without a detached sliver. Portraits remain individually edited originals. Celia’s world lenses use opaque off-white glare (`lens` in `draw.py`) across front/profile idle, walk and casting poses; her separate portrait still shows eyes through actual spectacle rims. The Emperor’s actor uses ivory material facets, narrow gold edging and a sun clasp, with connected silver hair, a pointed beard and a shorter profile nose in all four escape poses. Reproduce the actor outputs with `node scripts/export-celia-art.mjs` and `python3 assets/characters/vector/chapter-three.py`; no raster replacements are shipped.

Profile joint corrections keep Nell, Orrin and Celia's right shoulders rooted
inside their coat/shirt silhouettes, with independently placed elbows for idle,
walk and attack/cast poses. Preserve the anatomical right-hand grips. Celia's
profile glare uses tall, narrow rectangular lenses (2 × 4 native pixels), with the temple arm joining their inner edge. Petra's rear
shield compresses its rim, face and boss together to 38% width around the left
hand, retaining full height in idle, walk, saber and bash poses. Rebuild with
`node scripts/export-vector-characters.mjs`, `node scripts/export-celia-art.mjs`
and `node scripts/export-petra-animation.mjs`.

Sprites → NPCs → The Emperor now exposes his front/left views and all four real
escape poses (side stance, both walking steps, reach). These reference existing
campaign SVGs directly; there is no separate review-only artwork or atlas.

The Emperor's escape profile draws the far sleeve before the mantle. His near
elbow bends behind the wrist in the left-facing stance/walk, then opens forward
for the reach. Regenerate all four campaign/review poses with
`python3 assets/characters/vector/chapter-three.py`. The NPC native-size lineup
wraps after ten actors, retaining the same 80px frames and 112px row spacing.

Silent civilian motion is generated by `chapter-two.py --residents-only` without rewriting any static cast or portrait. The nine `animation/civilian-*-ambient.svg` pages retain the 80 × 80 sole anchor and costume materials. Workers/travelers use six small-step poses plus two hand gestures; families retain their handhold while the child's free hand moves, and patients use stationary arm gestures. `content/people-motion.ts` controls the sparse timing and story release rules; neither the normal Sprites lineup nor reduced-motion world play uses a moving frame.
