# Chapter Seven scenery

`npm run art:seven` authors the nine world maps and nine tactical entries as native SVG plus real 24px Tiled navigation. `chapter-seven.py` owns casts, entrances, story-bound props and the epilogue reuse. `chapter_seven_style.py` owns the crooked outer polygons, their floor cells, material painting, fixtures and colored cutaways. Small surfaces reuse the pure material helpers from Chapter Six; the domain's architecture and lighting remain independent.

- The crossing has Alda's actual survey ship with a connected gangway, a suspended sea and an inverted sailboat. The temporary Benefactor keeps its original reveal and withdrawal anchors.
- The taken platform recalls the angular station house, lit windows, short timber joints, sleepers and rails. Its house has a physical footprint, clear of the porter and the approach.
- The first harvest uses earth, furrows, headed wheat and snow. The large carrier stands at its real interaction, and disappears at victory.
- The hospice has a skewed masonry facade, opal work lights, small glazed floor inlays and connected cots. Its patient remains in front of the western bed. Indoor actor shadows are very faint.
- The city joins actual ice facets, terracotta and the bamboo courier stair. Its river wall sits at the return approach, and the cut rope is visible beside the snow.
- The refuge uses repaired timber, woven mats, a canopy, supplies and a connected resting bed. The throne uses broad stone facets converging on the god's mounting.
- Larkspur reuses the accepted Chapter One station and its matching visible lamp/window emitters. The real sea reuses Chapter Six's coast and daylight fill. Neither epilogue resurrects Ansel.

`src/content/chapter-seven/lighting.json` registers every world and arena. It is shared by Maps, campaign actor planes/shadows and the compiler's floor-clipped spill. Lights bound to the Benefactor follow the same visibility flags as the figure. Its withdrawal/three form props and their spill remain `live` so static-floor caching cannot swallow cinematic effects. The rest classification is preserved from the authored Tiled files during regeneration.

The six reprise battle floors use their exploration region's materials, a shared angled footprint and opal fixtures. Custom collector/carrier/ward/dragon presentations declare that exact silhouette for actor shadows. The accepted final god domain and all boss bodies, poses, contact hexes and combat rules are retained; its three forms gain celestial actor fill on the original platform mask.

Reproduce and validate:

```sh
npm run art:seven
npm run check
# Stage intended sources, SVGs, maps and lighting, then check image sizes.
npm run check:art-upload
```

A second export must be identical. Review all eighteen entries with Maps → Chapter 7, including the god's visibility flags. Detailed Playwright checks cover fractional-DPR desktop/phone actor pixels and movement, the complete route/ending, retreat between forms, parked-cursor withdrawal and skip/reload behavior. They remain outside the small default browser gate. No production dependencies, raster inputs or changed save format are needed. Keep generated SVGs below 128 KiB and QA screenshots outside the repository.

Review corrections: the crossing’s western opal stands clear of both Alda positions. The original hospice engine uses the full 256 × 240 shared ward model and a matching clickable control area, hidden at victory. Camps sort at their actual lowest canvas hem (114px), so the porter at the refuge’s front corner draws in front of the tent.
