# Raster actor skin

The raster skin covers the party, their four independent directional walks and
attacks, Petra's shield bash, every NPC/civilian/enemy recolor, special story poses
and the articulated boss presentations. Original SVGs remain bundled and
selectable in production. Portraits are unchanged.

Use **Help → Vector actors / Raster actors** to switch during idle exploration
or at the title. The whole replacement loads before the visible actors change;
failure retains the previous skin. This presentation preference is independent
of campaign saves, formation, equipment and the map-art preference.
**Workshop → Sprites → Actor skin preview** compares the actual shipped files
without changing any saved preference. Walk, Attack, Bash and Emperor poses use
the campaign frames.

## Sources and reproduction

`paint/` contains the small reviewed/registered paintings, not full generator
sheets. The five built-in ImageGen sheets use the existing SVG cast as identity,
pose and handedness references, with the approved Station painting as the style
reference. `prompts.json` records the prompts (the party entry is a normalized
specification). `generation.json` records each original sheet SHA-256, crop and
registration. The final source panels are 80×80, except the existing 104×80 hug
and 128×80 hand-holding frames. No source sheet is required to rebuild the game.

Authoring dependencies are **task-environment tools**, with no production package:

```sh
python3 -m venv /tmp/borrowed-tomorrow-art
/tmp/borrowed-tomorrow-art/bin/pip install -r assets/raster-actors/requirements.txt
# Activate the environment so python3 below resolves these tools.
. /tmp/borrowed-tomorrow-art/bin/activate
npm ci
npx playwright install chromium
npm run art:raster-actors
# Optional: use an existing Chromium instead of Playwright's download.
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run art:raster-actors
```

The exporter decodes the editable SVGs in Chromium, then processes the committed
paintings offline. It reconstructs walks from ordered vector material patches,
using similarity transforms and nearest sampling; it does not bend weapons with
a whole-image deformation. Local joints receive colored underpaint, with export
stopping for any disconnected material gap larger than five native pixels.
Attacks and story poses have separate painted sources, keeping faces and tools
coherent during more substantial gestures. Common enemy and civilian variants
carry the existing authored palette deltas onto their new base painting.

Large boss bodies retain their accepted designs and mechanical/breathing poses,
baked through the same raster grid and shared palette. Their frame rectangles,
animation clocks, footprint and picking coordinates remain unchanged. Raster
hit masks are rebuilt when switching skin.

All exports have one shared 255-color palette plus a transparent entry. Palette
indexing compresses files; live lighting still uses unrestricted RGB, highlight
planes and multiple shadows. Native ordinary sprites are **40×40**, restored to
the existing **80×80** logical frame with exactly **2× nearest expansion** before
animation cropping and lighting. This also keeps features on the shared chunky
pixel grid. Indexed export uses no dithering; alpha is binary. AI paintings are
registered and sampled, not claimed to be recovered authentic source pixels.

`conversion.json` audits each output's logical/native dimensions, method, byte
count and SHA-256. Runtime output is under `public/art/raster-actors/`; the
manifest in `src/content/raster-actors.json` is the only routing table. Every
file stays below the ordinary **128 KiB** art guard, with no guard changes.

If an exact reviewed generator sheet is available, recover its registered
panels with `python3 assets/raster-actors/register.py /path/to/master.png`.
The helper refuses a source with an unrecorded SHA. Full sheets remain outside
the repository. Keep modifications to `paint/` intentional, then rerun the
export and compare every affected direction and motion in Sprites.

## Review

Compare both skins at 1×/2×/3×, every direction, all six walking phases, all
attack phases and shield bash. Check the right-hand grips, Celia's left-arm
book, Petra's left shield, spectacles, foot anchors and connected joints.
Review cinematic carry/rest/hug/hand poses and the Emperor's four escape poses.
The corrected Samira and Edric panels supersede the first NPC-sheet versions.

Browser coverage checks native frame expansion, six distinct walking poses,
skin switching/persistence and campaign preservation on desktop and fractional
DPR phones. Original vector checks continue separately. Detailed sprite and
motion checks remain outside the small default CI suite.
