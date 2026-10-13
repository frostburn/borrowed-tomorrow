# Art and interface

## Direction: a railway folktale on a handheld console

Use one thirty-two-color palette across scenery, characters, text, menus, and tactical geometry. Navy ink and pine greens carry the shadows; weathered brass marks interactive objects; cream makes text readable; warm amber belongs to windows and lanterns. Nell's red coat and Orrin's blue-grey work clothes distinguish the party. Keep silhouettes readable against the ballast. Avoid gradients, soft panel shadows, rounded cards, and smooth type.

The whole visible screen is a single framebuffer: 640 × 400 on wide screens, 320 × 640 on narrow screens. Authored 5 × 7 bitmap lettering uses the same logical grid as panel borders, buttons, portraits, health bars, and the battlefield. Large headings enlarge those same glyphs. Phaser's scene is sampled into this framebuffer with nearest-neighbor filtering; the final image is quantized to the shared palette.

Enlarge that complete image by a whole number of **physical display pixels**, accounting for device-pixel ratio. Enlarge within a second canvas whose backing size equals the physical viewport size, placing the console at integer coordinates inside that bitmap; CSS sizing alone can smooth the image at fractional device scales. Center it with letterboxing. At fractional browser zoom or device scale, each logical pixel must still occupy an equally sized square. Never independently scale the UI or fit the visible screen with a fractional physical scale. The invisible semantic DOM provides keyboard focus, screen-reader labels, pointer hit targets, and file selection; it is measured into the bitmap rather than displayed beside it.

`pixel-font.ts` contains the original masks. `switchyard.woff` gives the DOM matching layout metrics and is bundled with the app. To rebuild it, run `python scripts/build-font.py` with FontTools installed; the build and CI use the committed font and do not require Python. The visible glyphs are painted from the masks, not rasterized from a vector font.

## Composition

The battle view has a title/location bar, an initiative strip, the hex field, and an active-character/actions/log strip. Keep the exact target geometry separate from the terrain image. Blue shows reachable movement; brass outlines the chosen cell; the affected area and per-unit damage preview must agree with combat resolution. On small screens the log collapses, the identity pane simplifies, and exploration gains a directional pad. Confirmation takes the description's space so it remains available without scrolling past the battlefield.

Generated environment textures provide the railway's detail, but rendering supplies its final pixel density and palette. The scenes should feel like the same place at different distances, with lantern light as a recurring accent. The battle clearing stays visually quiet at its center.

## Asset provenance and production prompts

Original scenery and actors were generated with the built-in Image Gen tool. Assets are committed under `public/art/`; runtime never depends on generated image URLs. Existing images are sampled through the same framebuffer as the interface.

- **Battle terrain (`yard.webp`):** empty, spacious grass/ballast clearing in a misty abandoned Victorian rail yard; distant pine hills and viaduct; railway hut left and rusted train right; clear central playable area; no actors, hexes, UI, or text; pine/slate/brass palette.
- **Station (`station.webp`):** strict top-down map of Larkspur at blue hour; station building upper-left; horizontal track across upper third; steam train upper-right; open cobbled lower square, fountain, crates, kiosk, central stairs, western dirt exit; no characters, UI, or labels.
- **Tunnel (`tunnel.webp`):** strict top-down abandoned railway tunnel; wide horizontal passage with rails; upper maintenance chamber with brass relay; lower storage recess; amber lamps, navy rock, slate ballast; dawn through right exit; no actors, labels, or UI.
- **Actors:** separated transparent sprites: Nell in a red porter coat and cap with an amber lantern; Orrin in blue-grey work clothes carrying a hammer; Mira, Ansel, Iona, rust-pelt mechanical hounds, ash crows, the inspector, guardian, and rocks. No baked grid, labels, or backgrounds. Existing extracted frames are 80 × 80 PNGs; portraits are separate images.

Maps use generated scenery and editable Tiled collision data. Four directional actor frames animate between grid positions. Hexes, path indicators, interaction marks, damage numbers, and HP bars are code-drawn and must remain aligned to the final pixel grid.
