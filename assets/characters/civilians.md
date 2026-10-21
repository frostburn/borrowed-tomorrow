# Silent Chapter Two people

Four reusable civilian assets are separate from named characters. Dock workers
carry parcels, travelers hold luggage, parents wait with children, and ward
patients warm their hands on cups. They have no names, portraits or dialogue.
All four roles and their five clothing color variants are also available in the dev Sprites workshop's NPC collection.

Generated with the built-in imagegen tool as smooth cartoon illustrations,
with continuous ink contours, broad cel shading and simplified facial features.
Bram supplied proportion guidance for the worker; the smooth worker supplied
rendering guidance for the other roles. No pixel grid, enlarged logical pixels
or faux pixel texture is requested. All figures face forward with a slight
overhead camera, full body and boots on transparency, without scenery or shadows.
Subjects:

- Dock worker: navy work cap, blue rolled sleeves, ochre work apron, broad brown
  trousers and boots, holding a wooden parcel in both arms.
- Traveler: older man with thinning silver hair, plum coat, olive scarf,
  brown valise and sturdy shoes.
- Family: mother in a moss-green skirt and cream blouse holding hands with her
  daughter in a rust-red coat, navy skirt and boots.
- Patient: woman with short dark hair, blue-gray tunic/trousers, cream shawl,
  forearm bandage, brown slippers and a ceramic cup held in both hands.

`civilian-prompts.json` records the exact prompts and export geometry. The
requested 1280 x 1280 canvas returned as 1254 x 1254. Export adds transparent
margins at (133, 133) to make 1520 x 1520, then filters once at 19:1 to 80 x 80
with Lanczos. Filtering averages fine source detail rather than selecting one
source pixel. There is no source grid to preserve or compete with the final
native grid. No opaque-bounds fit or separate face sampling is used. Only after
filtering is the silhouette translated, without resizing, to the ground anchor.

`civilians.json` records exact source hashes, source dimensions, integer reduction
factors, protected face/hand/prop regions and bounded clothing recolor rules.
Clothing variants change material hues only
inside the specified garment regions, preserving their shade values and alpha.
Skin, hair, parcels, luggage, cups and bandages keep their colors. Nearby copies
use different palettes; Cinderbank families retain theirs when they board. Reproduce with:

```
python assets/characters/export-civilians.py /path/to/generated_images
```

Exports filter smooth RGBA artwork, then make alpha binary at 128 and remove
detached fragments. Native colors are preserved during encoding and runtime.
Each output is one connected silhouette inside an
80 x 80 frame, centered at column 40 with the final boot pixels on row 67 and the
shared ground guide at row 68. Only the nine individual small PNGs belong in the repository. Large originals remain outside it. No palette reduction, whole-sprite tint or runtime resizing is applied.
