# Art and interface

## Direction: a railway folktale on an early PC

Choose **1024 × 768** as the desktop layout. The existing artwork contains small-pixel detail; respect its native resolution instead of squeezing it into a handheld-sized display. Navy panels, weathered brass borders, cream lettering, red coats, and amber lanterns unify the interface with the railway scenery. Avoid gradients, soft panel shadows, rounded cards, and smooth type.

Disk A scenery is 1008 × 624. Disk B’s Rillbridge is 1595 × 986 and the sluice is 1591 × 988. All render at 1:1 through a 1008 × 480 scrolling viewport; map dimensions set the camera bounds. Larger maps scroll along both axes. Portraits render at their full 128 × 128 size. Actors render at their full 80 × 80 size in the scene and HUD. Transparent margins belong to each asset's native canvas. Never downsample, posterize, quantize colors, or squeeze an image into a differently sized content box. Keep borders outside image content boxes. Initiative uses names rather than shrunken actor thumbnails.

The complete visible screen is a single native-resolution framebuffer. Authored 5 × 7 bitmap lettering uses its grid for panel borders, buttons, health bars, and tactical geometry. Body text uses 2 × glyphs; compact labels use 1 × glyphs; headings use 4 × glyphs. UI colors are curated, while asset colors pass through unchanged.

Narrow screens use a layout up to 384 × 768. A phone's scene viewport is up to 368 × 456. Crop and pan the camera, preserving the same native pixel density and full-size portraits. Follow the player in exploration; reveal the active combatant and provide explicit battlefield pan controls. Convert pointer coordinates through the camera scroll before hex lookup.

Enlarge that complete image by a whole number of **physical display pixels**, accounting for device-pixel ratio. Enlarge within a second canvas whose backing size equals the physical viewport size, placing the console at integer coordinates inside that bitmap; CSS sizing alone can smooth the image at fractional device scales. Center it with letterboxing. At fractional browser zoom or device scale, each logical pixel must still occupy an equally sized square. Never independently scale the UI or fit the visible screen with a fractional physical scale. The invisible semantic DOM provides keyboard focus, screen-reader labels, pointer hit targets, and file selection; it is measured into the bitmap rather than displayed beside it.

`pixel-font.ts` contains the original masks. `switchyard.woff` gives the DOM matching layout metrics and is bundled with the app. To rebuild it, run `python scripts/build-font.py` with FontTools installed; the build and CI use the committed font and do not require Python. The visible glyphs are painted from the masks, not rasterized from a vector font.

## Composition

The battle view has a title/location bar, an initiative strip, the hex field, and an active-character/actions/log strip. Keep the exact target geometry separate from the terrain image. Blue shows reachable movement; brass outlines the chosen cell; the affected area and per-unit damage preview must agree with combat resolution. On small screens the log collapses, the identity pane simplifies, and exploration gains a directional pad. Confirmation takes the description's space so it remains available without scrolling past the battlefield.

Generated environment textures provide the railway's detail at their native pixel density and colors. The scenes should feel like the same place at different distances, with lantern light as a recurring accent. The battle clearing stays visually quiet at its center.

## Asset provenance and production prompts

Original scenery and actors were generated with the built-in Image Gen tool. Assets are committed under `public/art/`; runtime never depends on generated image URLs. Existing images pass through the same framebuffer as the interface without resampling.

- **Battle terrain (`yard.webp`):** empty, spacious grass/ballast clearing in a misty abandoned Victorian rail yard; distant pine hills and viaduct; railway hut left and rusted train right; clear central playable area; no actors, hexes, UI, or text; pine/slate/brass palette.
- **Station (`station.webp`):** strict top-down map of Larkspur at blue hour; station building upper-left; horizontal track across upper third; steam train upper-right; open cobbled lower square, fountain, crates, kiosk, central stairs, western dirt exit; no characters, UI, or labels.
- **Tunnel (`tunnel.webp`):** strict top-down abandoned railway tunnel; wide horizontal passage with rails; upper maintenance chamber with brass relay; lower storage recess; amber lamps, navy rock, slate ballast; dawn through right exit; no actors, labels, or UI.
- **Rillbridge (`rillbridge.webp`):** autumn morning on the returned town’s last ordinary day; western river and stone bridge, blue-fronted house beside the bridge, bakery and festival cloths above the square, railway carriage at the eastern platform, schoolhouse to the southeast, upstream steps leading to the sluice. No people, UI, hex grid, or labels.
- **Sluice (`sluice.webp`):** top-down stone flood-control works with upper spillway and iron gates, maintenance shed, flat trolley on the western rail, and a broad wet control apron. Keep central and lower stonework open for actors. No people, UI, or labels. Battles use a native 1008 × 480 camera crop from this same artwork, never a resized full-map image. Water costs, waves, rocks, and hexes are drawn separately.
- **Actors:** separated transparent sprites: Nell in a red porter coat and cap with an amber lantern; Orrin in blue-grey work clothes carrying a hammer; Mira, Ansel, Iona, rust-pelt mechanical hounds, ash crows, the inspector, guardian, and rocks. No baked grid, labels, or backgrounds. Existing extracted frames are 80 × 80 PNGs; portraits are separate images.

Disk B images were generated with the built-in Image Gen tool and encoded to lossless WebP. Their original dimensions and RGBA pixels are preserved; no resizing or palette conversion was applied.

Maps use generated scenery and editable Tiled collision data. Four directional actor frames animate between grid positions. Hexes, path indicators, interaction marks, damage numbers, and HP bars are code-drawn and must remain aligned to the final pixel grid.

Disk B’s lossless WebP sources are stored as small base64 chunks in `assets/maps/` so they can be transferred through the repository connector. `scripts/restore-map-art.mjs` reconstructs the exact native files before `npm run dev` and `npm run build`, verifying their byte length and SHA-256. No colors or dimensions change. The built site contains the ordinary WebP files.

The schoolhouse courtyard is enclosed by collision along all four sides. Its southern gate has a saved open state; both pathfinding and keyboard movement use it. Opening the gate reveals a 1:1 patch of native paving beneath the bars and swings the leaf against the fence. Elspeth’s interaction requires the gate to be open.

Disk C adds two native **1536 × 1024** maps, generated with the built-in Image Gen tool and encoded losslessly. Original RGBA pixels and dimensions were checked against the WebP files. Both use the existing verified source-chunk restoration process and the same 1:1 scrolling camera.

- **Cinderbank:** winter ambulance siding before dawn; dark green medical carriages along the upper platform, brick dispatch office to the left, copper-piped boiler shed to the right, stretchers and supply crates at the lower left, broad connected cobbled loading apron. Cold slate-blue snow and warm amber lamps; no people, text, UI, or grid. Native combat terrain is a crop of the loading apron.
- **Bellwether infirmary:** cream-stone receiving hall beneath a glowing glass roof, wide central ramp, boiler house at the left, second ward and admissions porch at the right, clear paved courtyard, empty siding entering at the lower left, frosty herb beds and laundry at the far edge. Warm honey light contrasts with the siding. No people, labels, UI, or grid.

Both production prompts requested a downward three-quarter JRPG view, detailed early-PC scenery, architecture at the edges, broad unobstructed walking surfaces, no black margins, and a full-canvas scene designed for native display rather than shrinking.

## Named character art

`src/content/characters.ts` assigns every named on-screen character a distinct sprite and portrait. The original `master` and `clerk` assets identify Ansel and Iona only. Bram, Tilda, Elspeth, Dena, Ivo and Celia have their own matching pairs; Elspeth's world sprite includes her wheelchair. The sluice keeper and boiler keeper have separate sprites and portraits while retaining the guardian combat archetype. The inspector has a full portrait matching his existing appearance.

The new character designs were generated with the built-in Image Gen tool as production reference sheets, then prepared offline into the final **80 × 80 actor** and **128 × 128 portrait** PNGs. Reference-sheet layouts are not runtime atlases. The exported PNGs are the native game assets; the renderer displays every pixel without resizing or palette conversion. Portrait transparency is composited over the existing panel color. Bright background-key residue was removed during export.

Production prompts specified matching portrait/world views and separate identities: Bram's blue work shirt, beard and leather apron; Tilda's red hair, cream kerchief and green baker's dress; Elspeth's silver bun, spectacles, plum shawl, blue register and wooden wheelchair; Dena's dark curls, ivory apron, teal dress and satchel; Ivo's shaved head, maroon waistcoat and folded blanket; Celia's grey bob, green cardigan, high collar and clipboard. The machines use a patinated handwheel and blue eye slot for the sluice keeper, a pressure gauge and copper chimney for the boiler keeper, and a peaked cap and red signal projector for the inspector.

`SAY` selects portraits by speaker identity, including legacy Ansel/Iona aliases. Narration, signs and documents keep the ticket mark. Character tests check unique image contents, native dimensions, map assignments, portrait resolution and keeper appearances. Browser playthroughs verify named speakers as their dialogue advances; focused desktop/phone checks compare all pixels of the new portraits with their source PNGs.
