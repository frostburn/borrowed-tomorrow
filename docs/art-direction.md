# Art and interface

The production art was generated with the built-in Image Gen tool, then resized and separated into transparent actor frames for use in Phaser. Assets are committed under `public/art/`; no generated image URL is required at runtime.

## Direction

1990s pixel-art railway folklore: pine green, navy ink, weathered brass, slate ballast, warm windows, and readable silhouettes. The interface uses navy rectangular panels, fine brass borders, cream type, serif names, and sans-serif dialogue. Terrain art must remain separate from mathematically regular hex overlays. Text, menus, health bars, targeting, and interaction markers are code-native.

The accepted battle concept uses a top title/location bar, a narrow initiative strip, a large battlefield, and a bottom active-character/actions/log strip. It shows Nell in red, Orrin in blue-grey, rust-pelt mechanical hounds, and ash crows. Final controls include healing and supplies in addition to the concept's five base actions, as required for a playable chapter. Small screens collapse the log and simplify the identity pane.

## Production prompts

- **Battle terrain (`yard.webp`):** empty, spacious grass/ballast clearing in a misty abandoned Victorian rail yard; distant pine hills and viaduct; railway hut left and rusted train right; clear central playable area; no actors, hexes, UI, or text; crisp pixel texture in pine/slate/brass.
- **Station (`station.webp`):** strict top-down JRPG map of Larkspur at blue hour; station building in upper-left; horizontal track across upper third; steam train upper-right; open cobbled lower square, fountain, crates, kiosk, central stairs, western dirt exit; no characters, UI, or labels.
- **Tunnel (`tunnel.webp`):** strict top-down abandoned railway tunnel; wide horizontal central passage with rails; upper maintenance chamber with brass relay; lower storage recess; amber lamps, navy rock, slate ballast; dawn through the right exit; no actors, labels, or UI.
- **Actors:** transparent 4 × 4 atlas with separated centered sprites; row 1 Nell facing down/left/right/up, row 2 Orrin in the same directions, row 3 Mira/Vale/Mara/hound, row 4 crow/inspector/guardian/rock. Nell wears a red porter coat and cap with an amber lantern. Orrin wears blue-grey work clothes and carries a hammer. No grid, labels, or baked backgrounds. The extracted frames are 80 × 80 PNGs.

## Intentional implementation choices

World maps use generated scenery plus editable Tiled collision data, rather than a repeating terrain tileset. Four directional actor frames animate between grid positions. The tactical scene is a separate JRPG battle view and uses the yard clearing for every encounter. Hexes, target outlines, path indicators, interaction marks, and HP bars are interface geometry. These code-drawn elements are intentionally independent of the art.
