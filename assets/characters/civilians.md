# Silent Chapter Two people

Four reusable civilian assets are separate from named characters. Dock workers
carry parcels, travelers hold luggage, parents wait with children, and ward
patients warm their hands on cups. They have no names, portraits or dialogue.
All four roles and their five clothing color variants are also available in the dev Sprites workshop's NPC collection.

Generated with the built-in imagegen tool. Style references were the native
`bram.png`, `dena.png` and `tilda.png` actors, used only for style and proportions.
The common prompt requested a compact, slightly top-down, front-facing JRPG
civilian on transparency, clean pixel clusters, dark brown outlines, restrained
shading, full body and boots, no ground/shadow/text or alternate views. Subjects:

- Dock worker: navy work cap, blue rolled sleeves, ochre vest, broad brown
  trousers and boots, holding a wooden parcel in both arms.
- Traveler: older man with thinning silver hair, plum coat, olive scarf,
  brown valise and sturdy shoes.
- Family: mother in a moss-green skirt and cream blouse holding hands with her
  daughter in a rust-red coat, navy skirt and boots.
- Patient: woman with short dark hair, blue-gray tunic/trousers, cream shawl,
  forearm bandage, brown slippers and a ceramic cup held in both hands.

The four roles were regenerated with larger, clearer facial features and broad
pixel clusters, using the previous actors for identity and Bram for proportions
and rendering. `civilian-prompts.json` records the exact built-in Image Gen
prompts. They requested a 1024 x 1024 canvas representing a 64 x 64 drawing
enlarged 16 times. The tool supplied 1254 x 1254 files; export adds transparent
margins at (13, 13) to make 1280 x 1280, then reduces exactly 16:1 to 80 x 80.
Prompted pixel-grid alignment is approximate; the native exports are the review
target. No opaque-bounds fit or separate face sampling is used. Only after
sampling is the silhouette translated, without resizing, to the ground anchor.

`civilians.json` records exact source hashes, source dimensions, integer reduction
factors, protected face/hand/prop regions and bounded clothing recolor rules.
Clothing variants change material hues only
inside the specified garment regions, preserving their shade values and alpha.
Skin, hair, parcels, luggage, cups and bandages keep their colors. Nearby copies
use different palettes; Cinderbank families retain theirs when they board. Reproduce with:

```
python assets/characters/export-civilians.py /path/to/generated_images
```

Exports use nearest-neighbor sampling with source RGB unchanged and binary alpha
(sampled alpha at least 128). Detached fragments are removed after sampling.
Each output is one connected silhouette inside an
80 x 80 frame, centered at column 40 with the final boot pixels on row 67 and the
shared ground guide at row 68. Only the nine individual small PNGs belong in the repository. Large originals remain outside it. No palette reduction, whole-sprite tint or runtime resizing is applied.
