# Portrait direction

The thirty human portraits in `public/art/vector/portrait-*.svg` are editable 128 × 128 originals. Edit their paths directly. Actor exporters retain them; their one-time seeds are not the portrait authoring source. No face builder, gender template, palette swap or raster replacement owns these drawings.

## Shared treatment

Edric and Samira are the style anchors. Match their broad face scale, modest turn, substantial features and connected material facets. The earlier small, strongly turned faces and Celia's higher, finer facial construction are retired. A common background alone does not establish the style.

- Use the slate `#182e3b` background and the restrained upper-left `#294550` plane. Keep the background quieter than the person. Celia also has this opaque background; do not depend on the enclosing menu's color.
- Frame a head and shoulders. Leave room for caps, crowns and hair near the top, place eyes around rows 48–56, use roughly 48–60px-wide facial silhouettes, and begin the shoulders around rows 90–105. Allow pose, age, build and headwear to vary within that envelope.
- Light the forehead and near cheek from above-left. Use broad, connected base/light/shadow planes for skin, hair and clothing. Preserve each person's complexion and material colors; the palette is not a fixed retro limit.
- Construct eyes from an eyelid plane, pale ivory sclera and a substantial pupil. Judge the pupil and brow after the shared 2px display sampling. Fine cosmetic lines must not carry an expression on their own. Glasses have actual rims; a dark eye socket is not a substitute.
- Draw a bridge, tip and underside for the nose. Avoid the old single triangular nose stamp. Fit them to the head's turn and the person's face. Mouth corners, lower lip and chin should support the expression without an outlined cartoon mouth.
- Use the same detail density, not the same anatomy. Keep differently shaped cheeks, foreheads, noses, jaws, eyelids and mouths, asymmetry, age and direction of gaze. Don't smooth every adult into a youthful face or give every man the same square jaw.
- Group hair into a few connected clumps and facets. Side-lock and braid roots overlap their scalp masses by several native pixels, so a single missed 2px sample cannot leave a floating lock. Short-haired clean-shaven characters expose skin along the jaw; rear hair must not continue as a dark ring beneath the chin. Braids use a continuous zigzag silhouette; curls are broader locks rather than rings of tiny outlined cells. Preserve recognisable hairstyles without changing the portrait’s detail scale.
- Large shapes are filled polygons. Sparse 2px contours can describe brows, spectacles or costume trim. No gradients, filters, embedded images or external resources. The runtime's common coarse raster supplies the pixel weight.

## Individual likenesses

Costumes and established hair remain consistent with the actors. Features to preserve when revising:

| Character | Likeness and expression |
| --- | --- |
| Nell | Young rounded cheek, open eyes, two braids, red railway cap/jacket. |
| Orrin | Broad bearded engineer, an open sidelong gaze and continuous warm beard facets around a closed mouth; brass goggles on navy cap. |
| Kit | Round youthful chin, tousled hair, open gaze, ochre courier scarf. |
| Petra | Angular lower face, level brows and tight mouth; green armor and gold shoulder plates. |
| Celia | Long mature cheeks, silver bob, round spectacles, patient expression and medical book. |
| Tomas | Longer cheek and stronger jaw than Nell/Kit, tousled hair and rust scarf. |
| Ansel | Swept white hair, weathered cheek and broad moustache. |
| Iona | Brown bob, rounded jaw, brass spectacles, low station cap and clipboard. |
| Tilda | Full cheeks, wide smile, copper curls and cream headscarf. |
| Elspeth | Elderly long face, silver waves, fine spectacles, plum cardigan and chair. |
| Alban | Turned face, swept black hair, projecting nose and hard thin mouth. |
| Emperor | Silver mane, hollow cheeks, pointed white beard and sun diadem. |
| Dena | Fuller cheek, gentle smile, one braid, cream apron and nurse cap. |
| Bram | Wide straw hat, weathered cheeks, grey beard and easy sidelong smile. |
| Alda | Silver hair under navy cap; narrower profile, alert eyes and long cheek. |
| Hester | Copper scarf, tied brown hair, full working face and firm, slightly amused mouth. |
| Durn | Slick dark hair, narrow face, heavy lower lids and pinched mouth. |
| Aurel | Silver crop, heavy brows, blunt nose and broad square jaw. |
| Enna | Close brown bob, broad cheek and bright steady gaze. |
| Iven | High temples, round brass spectacles, full white beard and guarded glance. |
| Sera | Cream ward cap, dark bob, tired lower lids and small determined smile. |
| Teren | Broad work-worn jaw, short dark hair, crooked nose and uneven brow. |
| Samira | Long copper face, high cheekbones, level gaze, gold crown and turquoise throat jewel. |
| Sahir | Narrow bearded profile, arched brows, measured smile and cream wrapped cap. |
| Amal | Practical cap, braid, strong curved nose and brisk sidelong smile. |
| Ines | Silver braid, warm brown skin, deeply lined cheeks and attentive gaze. |
| Tavi | Wavy dark hair, short beard, broad grin and turned shoulder. |
| Edric | Low square crown, swept silver hair, close beard and weary level stare. |
| Signe | Long braid, angular cheek and watchful three-quarter gaze. |
| Egil | Wool cap, wind-reddened nose, long cream beard and kind tired eyes. |

## Review

Use `?dev=sprites` → Party / NPCs to compare the real portrait files with their corresponding world actors. Check a mixed group across chapters, not just one regional cast. Review native 128px and through the game's coarse raster; dialogue and Equipment use these same files. On a compact phone at fractional DPR, verify eyes, glasses and mouth corners still survive and that no portrait is stretched or cropped. Keep review screenshots/contact sheets outside the repository.

Run the existing character/content checks, native portrait presentation and desktop/phone sprite-workshop checks. Stage the SVGs and run `npm run check:art-upload` before publishing. Each image retains the 128 KiB budget. No gameplay, save, animation, source texture dimensions or display filtering change is needed for portrait edits.

Keep a visible neck between the jaw and collar. Individual shoulder/neck groups sit lower where the old collar met the chin; head size, facial landmarks and the 128px crop stay fixed. Iven’s receding hair lies over a complete bald scalp plane. Tomas has fuller lower cheeks, a blunt nose and a relaxed uneven smile; Alban has a longer angular jaw, more turned projecting nose and a narrow far eye. Orrin’s beard highlights join across the lower face so the mouth cannot read as a dark hole; his open eye expression is retained.

Rear hair stays behind the neck: explicit foreground neck-root planes overlap the rear hair under the jaw before the face is drawn. Lowering a collar alone does not fix a hair silhouette covering the throat. Match those root planes to each face’s skin, keeping the collar rim visible. Tomas has dark green irises with distinct pupils; Alban’s far eye retains a visible sclera at the shared 2px raster. The Engine Warden and Heart regulator use copper/brass-colored edge shadows instead of heavy navy borders, retaining dark interior apertures.

Portrait paint order is rear hair → neck and neck root → clothing/collar → face and foreground hair. Both neck groups sit below the entire clothing group, including apron edges, lapels and scarves; never paint a throat plane over a collar to bridge the jaw.
The shoulder fabric has a vector neckline cutout; collars and lapels paint above that opening without the cutout. This preserves their authored edges while the throat remains connected beneath them.

Samira uses the same rear-hair → neck → clothing order: her dark rear hair no longer covers the throat. Alban’s pupils are equal 4×4 native rectangles aligned to the two-pixel grid; render checks count four sampled pixels per pupil at all four sampling phases. Spectacle frames must contrast with skin: Celia uses deep teal and cool rim light, Iona dark bronze and gold, Elspeth plum and lavender, and Iven blue with gold accents. Keep the lens openings clear so the eyes remain readable.

The eye pass for #182 keeps all human pupils square and paired through every
phase of the final two-pixel raster. Neutral originals retain individual eye
positions and head turns; expression exports use 4 × 4 pupil blocks and more
open happy eyelids. Sclera colors are pale ivory rather than skin-like ochre.
Bram’s brim sits four pixels higher to expose his far eye, and Iona’s far pupil
sits inside its lens opening. The original SVGs remain the neutral sources;
regenerate expressions with `python3 assets/vector/portrait-expressions.py`.
