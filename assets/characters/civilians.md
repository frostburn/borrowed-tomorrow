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

`civilians.json` records exact source hashes, crop rectangles, native sizes,
placement offsets, head sampling phases and bounded clothing recolor rules.
Heads are sampled separately from bodies, including independent mother/child
phases, to retain eyes and mouths while leaving the accepted silhouettes below
the neck and ground anchors intact. Clothing variants change material hues only
inside the specified garment regions, preserving their shade values and alpha.
Skin, hair, parcels, luggage, cups and bandages keep their colors. Nearby copies
use different palettes; Cinderbank families retain theirs when they board. Reproduce with:

```
python assets/characters/export-civilians.py /path/to/generated_images
```

Exports use nearest-neighbor sampling with source RGB unchanged and binary alpha
(source alpha at least 200). Each output is one connected silhouette inside an
80 x 80 frame, centered at column 40 with the final boot pixels on row 67 and the
shared ground guide at row 68. Only the nine individual small PNGs belong in the repository. Large originals remain outside it. No palette reduction, whole-sprite tint or runtime resizing is applied.

Pixel Art Fixer reconstructions of the retained first-regeneration sources are
available for comparison in the dev Sprites workshop. They are not campaign
replacements: their true grids exceed the actor budget, and two require grid
review. See [pixel-fixer.md](pixel-fixer.md) for the pinned Rust conversion,
source hashes, detection results and reproduction steps.
