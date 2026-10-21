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
| Dock worker | 128 x 128 | 128 x 128 | 9.7969 / 9.7969 | 104 | Strong agreement; too tall for campaign |
| Traveler | 137 x 133 | 132 x 133 | 9.1440 / 9.4423 | 99 | Arbitration; hold for grid/size review |
| Parent/child | 136 x 127 | 136 x 126 | 9.2091 / 9.8896 | 102 | Arbitration; hold for grid/size review |
| Ward patient | 128 x 128 | 128 x 128 | 9.7969 / 9.7969 | 100 | Strong agreement; too tall for campaign |

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

**No reconstruction is approved for campaign replacement.** The existing 80 x 80
frames contain roughly 63-pixel figures. Fitting these 99–104-pixel figures
would discard recovered cells; drawing them 1:1 makes civilians oversized.
All nine campaign PNGs are restored byte for byte from the pre-PR baseline
`47f59cd946a0de2895b18839c540797ad422499b`, removing the smooth-art clash. The
baseline manifest/exporter remains the recipe for those existing campaign files.

## In-game review

Vite-only Sprites (`?dev=sprites`) → NPCs → select a base civilian role → scroll
to Pixel Art Fixer review. Compare campaign, prior point sample, smooth attempt
and untouched recovered grid. Real dimensions are labeled; zoom is 1x/2x/3x
nearest-neighbor on the shared native framebuffer. Wider comparisons scroll and
never shrink. No saves change. The twelve comparison PNGs live in `src/dev/art`
and remain absent from production. Other characters were not batch-replaced.

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
is the four workshop reconstructions; it cannot overwrite campaign art.
An independent export matched all four files byte for byte. No network or fixer
installation runs in the game, build or CI. Large sources remain outside git;
reproduction requires their recorded names/hashes, while normal game use does not.
