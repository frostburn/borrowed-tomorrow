# Silent Chapter Two people

Four roles—dock worker, traveler, parent/child and ward patient—plus five clothing
variants populate Chapter Two without names, dialogue or portraits.

The campaign now uses the approved Pixel Art Fixer reconstructions of the
retained pixel-art sources. No new artwork was generated for this integration.
All base PNGs preserve the Rust CLI output byte for byte. The nine PNGs retain
128–137px source dimensions and binary transparency; none is resized on export.

`src/content/civilians.ts` registers each source's opaque bounds. A single uniform
scale maps its standing height to 63 game pixels. Origins use the actual sole
line and silhouette center, keeping feet grounded and aspect ratios consistent
through exploration, camera changes and background appearances in cutscenes.
The Canvas renderer permits filtered fractional scaling. UI image composition
also respects authored CSS dimensions. Existing bitmap UI/layout is retained.

`civilians.json` records the native reconstruction paths/hashes, opaque bounds,
standing height and variant masks. Variant masks are authored in 80px review
coordinates, then projected onto native texels without resizing. Protected
face/hand/prop regions and alpha remain intact. Only garment hues change.
Regenerate all nine committed sprites from the small reconstructed inputs with:

```bash
python assets/characters/export-civilians.py
```

Use `--output-dir /path/outside/repository` to verify a fresh export. Each file
must remain below 128 KB. The four base exports remain identical to the fixer
output; variants preserve their dimensions and alpha. No Rust/tool dependency is
needed for normal game builds. Full conversion from retained large sources,
detection caveats and the pinned Rust build are in [pixel-fixer.md](pixel-fixer.md).

The Sprites workshop shows the in-game fit next to the raw recovered grid,
using the same campaign PNG for both presentations. Raw-grid comparisons keep integer zoom
and nearest-neighbor filtering so reconstruction details remain inspectable.
