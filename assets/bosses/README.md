# Native vector bosses

Campaign encounters and the Vite Bosses workshop use the same SVG artwork, native decode, animation and body-picking masks. All bosses share the party's polygonal visual language: connected silhouettes, broad lighting planes, readable material detail and the final common 2px framebuffer. Each keeps its own shape, palette and scale.

## Material treatment

Light comes from above and screen-left. Shade metal, porcelain, scales and cloth within their own color families. Use distinct top, front and side planes instead of tracing every piece in near-black. Use selective dark edges and cast shadows beneath wing ribs, coils, armor overlaps, elbows and suspended hulls. Keep upper-facing planes lit: consistency must retain depth, not flatten the models. The deepest colors also belong in actual openings, mouth cavities, furnace recesses and eyes. Small mechanical fittings and restrained highlights provide detail without painted noise or grids of tiny rivets.

The furnace carrier's folded armor, heat ports and wheel hubs and the ward engine's glass facets, brass hinges and service plate share their complete battle/world/portrait geometry. Their models live in `assets/vector/anchor_engines.py`; Chapter Five's scenery exporter imports these same functions. The focused exporter also rebuilds the ward's scene prop without rewriting any chapter maps.

The sun serpent retains warm ochre scales and pale spines; the winter dragon retains cool blue membranes, icy plates and its broad wings. The imperial vessel keeps royal ivory armor, gold hands and the embossed sun. Its recessed human face and the defeated sun remain legible. The far shoulder, collar underside, elbow recesses and throne base carry stronger shadow than the sky-lit armor. The Lightbearer's mortal body and lantern stay distinct inside the mantle and broken halo. A dark cap lip, cream collar, jacket folds and independently shaded sleeves separate her face, torso and arms. The flagship retains imperial green iron, its independent batteries and bridge, with separate armor planes and open gun bores.

The Benefactor's accepted body, hollow aperture, heart, connected hands, jagged shoulders and halo remain intact. Only the eight finger-edge shadow planes were softened from indigo to porcelain blue-gray. Preserve the primary part IDs, dimensions and geometry when editing: every motion pose refers to those same parts.

## Sources and reproduction

| Boss | Authored source | Focused export |
| --- | --- | --- |
| Benefactor body | `public/art/vector/benefactor/benefactor.svg` | `python3 assets/bosses/export-benefactor.py` |
| Benefactor sun / heart | `assets/bosses/export-benefactor-forms.py` | `python3 assets/bosses/export-benefactor-forms.py` |
| Heart regulator | `public/art/vector/bosses/conduit-regulator.svg` | `python3 assets/bosses/export-conduit.py` |
| Furnace carrier / ward engine | `assets/vector/anchor_engines.py` | `python3 assets/vector/anchor_engines.py` |
| Flagship | `assets/bosses/export-flagship.py` | `python3 assets/bosses/export-flagship.py` |
| Sun serpent | `assets/bosses/export-sun-serpent.py` | `python3 assets/bosses/export-sun-serpent.py` |
| Winter dragon | `assets/bosses/export-winter-dragon.py` | `python3 assets/bosses/export-winter-dragon.py` |
| Emperor / Lightbearer | `assets/bosses/export-imperial.py` | `python3 assets/bosses/export-imperial.py` |

The Benefactor and conduit regulator SVGs are editable primary artwork; their exporters derive native atlases and 128px viewBox portraits without overwriting those originals. The Benefactor's eleven parts supply eight breathing and four judgment poses in a 720 × 1728 atlas. The regulator's fifteen parts supply eight mechanical and four discharge poses in a 512 × 1440 atlas. Internal SVG `use` elements share the geometry; no raster panels are involved.

The serpent and flagship portraits and the two anchor-engine portraits are derived geometry. The registered Benefactor portrait and the dragon, Emperor and Lightbearer portrait SVGs are editable originals, seeded only when absent. Edit their matching material planes directly when updating a model; preserve their framing, backgrounds and individual details. Normal exports leave them untouched.

All exporters use Python's standard library, with no production authoring dependency. Keep transparent native sizes and viewBoxes, part IDs and existing placement anchors. Do not bake the common display raster into replacement PNGs, introduce gradients or resample existing art. Each staged SVG must remain self-contained and below 128 KiB.

## Motion and interaction

The Benefactor breathes on the scene clock over 3.2 seconds, with its base anchored. Judgment gathers, releases and recovers through the shared 220/420/660/920ms timeline. Its sun/heart manifestations retain their separate campaign rules and 19/19/7-contact footprints.

The regulator is rigid machinery. Its 1.6-second shoulder crank drives a horizontal side compressor with a fixed-length rod; the needle ticks and exhaust dissipates. The cowl, dial housing, boiler, feet and lower chassis stay fixed. Four discharge poses open its arms and valve. Keep the source groups and solved linkage geometry intact.

The flagship's whole craft sways by at most ±2px horizontally and ±3px vertically on slow scene-clock cycles. Turret recoil leaves mountings fixed. The winter dragon and serpent keep their own inhale, breath and strike poses; the imperial sun goes dark after victory. Every pose retains native alpha picking. Reduced motion settles to the resting pose, and restart/exit must cancel pending callbacks and remove update listeners.

## Review

Use `?dev=boss` for the Benefactor; `&boss=conduit`, `flagship`, `serpent`, `dragon`, `emperor` and `lightbearer` select the other upward-facing encounters. Furnace and ward-engine campaign/practice battles load the same anchor-engine SVGs. Sprites reviews their 80px world actors and native portraits.

Inspect native and chunky display sizes, desktop and fractional-DPR phone layouts, painted-body selection, occupied contacts, passive animation, attack/recovery and reduced motion. Campaign progress, rewards, combat footprints, targeting and warnings are independent of this art pass. Keep detailed browser/device checks outside the small default CI gate.

Run the focused exports, `npm run check`, and relevant boss-preview checks. Stage explicit outputs, run `npm run check:art-upload` before publishing, and confirm repeated focused exports produce no diff. Source paintings and old bitmap panels remain historical references, never runtime fallbacks.
