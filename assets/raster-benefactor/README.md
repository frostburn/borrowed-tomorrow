# Painted Benefactor battles

The optional raster skin repaints the Benefactor's body, hollow sun, exposed
heart and shared battle platform. The vector originals and portraits remain
available. **Help → Vector actors / Raster actors** selects the models;
**Vector maps / Raster maps** independently selects the arena. Campaign and
**Workshop → Bosses** use the same assets, including all three Campaign presets.

## Reviewed sources

`paint/` contains the original five transparent **180×144** rest/attack poses,
five dedicated body breathing paintings and two indexed **256×240** arena
halves. Built-in ImageGen painted these using the existing
models/arena as geometry references and the approved raster cast as the style
reference. `prompts.json` records the exact prompts; `generation.json` records
master hashes, explicit crops, alpha bounds and registration. Full generated
sheets are deliberately excluded from git and uploads.

The body's open palms extend across the nominal sheet column boundary. The
registered crops retain both hands rather than blindly dividing equal cells.
Its three painted poses share head/base anchors. Sun and heart attacks derive
from their resting paintings to retain a stable design. The hollow apertures
stay opaque and dark; surrounding space is transparent. The arena's row
registration aligns its front walking edge with the existing combat floor,
keeping the front row on top of the platform. Central inlays are solid flooring.

## Offline reproduction

Install authoring dependencies in a task environment, not the game:

```sh
python3 -m venv /tmp/borrowed-tomorrow-art
/tmp/borrowed-tomorrow-art/bin/pip install -r assets/raster-actors/requirements.txt
. /tmp/borrowed-tomorrow-art/bin/activate
npm ci
npm run art:raster-benefactor
```

This focused command needs no browser, network or image API. The complete
`npm run art:raster-actors` command also runs this exporter after rebuilding
the ordinary cast. Repeated exports must be byte-identical. Optional recovery
from the exact recorded master images uses:

```sh
python3 assets/raster-benefactor/register.py /path/to/boss-sheet.png /path/to/arena.png
```

Registration samples the painted master once with area averaging. These are
new painted sources, not a claim of recovered authentic pixel grids. Committed
sources are then animated with exact pixel blits, indexed without dithering and
given binary transparency. Runtime uses exact **2× nearest expansion**, before
frame cropping or lighting. A boss-local 255-color palette avoids changing the
reviewed ordinary cast when rebuilding this kit. `palette.json` freezes the
reviewed boss palette, so the new breathing paintings do not recolor the
existing attack poses or other forms. Arena halves share their own
palette. Dynamic lighting remains unrestricted RGB.

Each model retains **360×288 logical frames**, eight idle phases over 3.2s and
four attack phases at the existing 220/420/660/920ms boundaries. Three small
**360×288 native PNG pages** carry four frames each. Runtime assembles these
into the existing **720×1728 logical atlas** once, before frame crops and alpha
picking. This preserves footprints, placement and targeting. The two map
panels reconstruct **1024×480** world pixels. No combat or story data changes.

The body uses **five separately painted breathing poses**, not a deformation
of the resting painting. The chest fills, cowl rises, shoulders open, mantle
panels flare and connected arms follow. `breathing.json` selects them in the
eight-phase **0,1,2,3,4,3,2,1** cycle. Every finished pose is **180×144**, with
the lower mantle point fixed at native **(90,139)**. The exporter copies their
palette indices exactly, with no second RGB quantization; there is no pose
interpolation, scaling or procedural body
motion. This replaces the earlier rigid torso with lifting cuff cutouts.

`breathing-prompts.json` records the initial generation and targeted correction
that keeps the face opening round. The vector cycle supplies the motion guide,
and the accepted painting supplies the material/identity reference. The five
reviewed panels are cropped from that corrected sheet, cleaned of outer haze,
uniformly registered once, indexed with the frozen palette, and aligned on the
native grid. Unused duplicate/uncorrected poses are excluded. Recover them only
from the exact master recorded in `breathing.json`:

```sh
python3 assets/raster-benefactor/register-breath.py /path/to/breathing-master.png
npm run art:raster-benefactor
```

`idle.py` now serves the sun and heart forms: the sun ring stays fixed while
its small crystal moves in whole pixels; the exposed heart floats rigidly.
Their existing frames and all four body attack frames remain byte-identical.

`conversion.json` audits all eleven runtime files, their dimensions, byte counts
and SHA-256 hashes. Every file remains below the ordinary **128 KiB** guard;
the largest current panel is under **46 KiB**. No upload limit was raised.

## Review

Use `/?dev=boss` and each **Campaign** form button. Check open palms, intact
shoulder spikes, opaque apertures, the crystal, grounded party feet, both arena
halves and motion with a parked pointer. Compare vector/raster models and maps
independently. Reduced motion holds frame zero; restart cancels attacks.

`tests/raster-benefactor.test.ts` audits page coverage, files and map bounds.
`tests/e2e/benefactor-raster.spec.ts` compares actual rendered boss pixels,
breathing and attack/recovery on desktop and fractional-DPR phones. Its
idle checks compare each body atlas frame against its actual source painting,
verify the fixed base and expanding shoulder/mantle silhouettes, and retain
the unchanging sun silhouette/translated heart checks. Existing
boss-preview tests retain picking, damage, restart and campaign-isolation
coverage. Detailed browser checks remain outside the small default CI gate.
