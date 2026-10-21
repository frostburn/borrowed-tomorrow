# Civilian grid reconstruction

Converted the retained pixel-art sources from the first civilian regeneration;
no new images were generated. Smooth sources are comparison references only.

Tool: https://github.com/Retro-Diffusion/pixel-art-fixer (MIT).
Revision: `ef376e57e1c272633ca2dbf5f29ec3fcf6596465`.
Rust CLI: `process INPUT OUTPUT full`, default `two_stage_pack`. No palette snap,
dark-stroke option, resize, alpha preprocessing or post-reconstruction filtering.
Each output pixel is one recovered cell. Output alpha is binary and transparent;
the committed PNGs are the CLI's exact bytes.

## Findings

| Role | Full grid | Fast grid | Source periods X/Y | Opaque height | Decision |
| --- | --- | --- | --- | --- | --- |
| Dock worker | 128 x 128 | 128 x 128 | 9.7969 / 9.7969 | 104 | Approved with runtime scaling |
| Traveler | 137 x 133 | 132 x 133 | 9.1440 / 9.4423 | 99 | Approved after visual review; runtime scaling |
| Parent/child | 136 x 127 | 136 x 126 | 9.2091 / 9.8896 | 102 | Approved after visual review; runtime scaling |
| Ward patient | 128 x 128 | 128 x 128 | 9.7969 / 9.7969 | 100 | Approved with runtime scaling |

Strong agreement is not a calibrated probability. Worker/patient full mode
reports `rl+ss+fu`, fast mode `rl+ss`. Both other fast results explicitly report
`lowconf`, with full-mode arbitration. Their axis periods differ; reconstructed
square pixels may change proportions. Do not force them to 128 x 128.

Worker eyes, cap brim, hands, parcel straps and boots survive; rim shading
simplifies. Patient eyes, cup, bandage and separate slippers remain readable.
Traveler/family retain the main faces and props, but coat/skirt spacing and the
child's small face need user review. Exact source/output hashes, detector counts
and review decisions: `pixel-fixer-civilians.json`.

The intended 16-pixel source blocks were actually around 9–10 source pixels,
explaining why the former 16:1 sampler discarded real cells. The original older
sources were also checked: grids 90 x 141, 131 x 119, 146 x 131, 139 x 132; all
arbitrated, with opaque heights 111, 98, 109, 116. None solves the size mismatch.

**The user approved all four fixed versions and relaxed strict canvas pixels.**
The campaign ships their native PNGs and five clothing variants, without an
extra authoring downscale. `civilianPresentation` computes a uniform scale of
63 / opaque height and anchors each actor at its real soles. Thus the 99–104px
source figures fit the other cast at 63 game pixels, preserving proportions.
The renderer uses filtered fractional scaling rather than enforcing exact
source-to-canvas pixels. Detector disagreements remain documented as provenance,
not unresolved campaign holds.

Export the campaign files from the committed native reconstructions with
`python assets/characters/export-civilians.py`. This copies each base PNG exactly
and recolors native texels for variants. `--output-dir` supports independent
reproduction. Nothing in this exporter calls an image resize operation.

## In-game review

Vite-only Sprites (`?dev=sprites`) → NPCs → select a base civilian role → scroll
to Pixel Art Fixer review. Compare the filtered campaign fit and untouched
recovered grid, both using the same canonical campaign PNG. Raw grids retain labeled native
dimensions and 1x/2x/3x nearest-neighbor zoom. Wider comparisons scroll. No saves
change. Review controls remain dev-only. The four fixed PNGs ship only under
`public/art`, together with five native-color variants. Rejected smooth/point
samples and duplicate reconstruction files have been removed.
Other characters were not batch-replaced.

## Reproduction outside game dependencies

Rust was installed in the task directory, not into production dependencies.
`pixel-fixer-linux.patch` gates the Windows memory-telemetry function and reports
zero on other platforms. It does not change any image algorithm or encoding.

```bash
task_root=/absolute/path/to/task-tools
game_root=/absolute/path/to/borrowed-tomorrow
mkdir -p "$task_root"
git clone https://github.com/Retro-Diffusion/pixel-art-fixer.git "$task_root/pixel-art-fixer"
git -C "$task_root/pixel-art-fixer" checkout ef376e57e1c272633ca2dbf5f29ec3fcf6596465
git -C "$task_root/pixel-art-fixer" apply --unidiff-zero "$game_root/assets/characters/pixel-fixer-linux.patch"

# Only if Rust is absent:
curl -fL https://sh.rustup.rs -o "$task_root/rustup-init.sh"
export CARGO_HOME="$task_root/cargo"
export RUSTUP_HOME="$task_root/rustup"
sh "$task_root/rustup-init.sh" -y --profile minimal --no-modify-path --default-toolchain 1.99.1
export PATH="$CARGO_HOME/bin:$PATH"

cargo build --release --locked --manifest-path "$task_root/pixel-art-fixer/rust/Cargo.toml"
cd "$game_root"
python assets/characters/reconstruct-civilians.py /path/to/retained/generated_images \
  --fixer-root "$task_root/pixel-art-fixer" --output-dir "$task_root/reproduced"
```

The Python wrapper requires authoring-only Pillow (already available in this
task). It invokes Rust, not an ordinary downscaler. It validates tool revision,
source hashes, both detection counts/consensus, binary alpha, native dimensions,
output hashes and upload size before writing any image. Its default destination
is the four canonical campaign base PNGs under `public/art`; the separate
exporter validates those masters and builds native-resolution clothing variants.
An independent export matched all four files byte for byte. No network or fixer
installation runs in the game, build or CI. Large sources remain outside git;
reproduction requires their recorded names/hashes, while normal game use does not.
