# Palace scenery modules

Built-in Image Gen supplied three independent transparent prop sources in this work chat. The user has authorized publishing artwork generated here. The large sources stay outside git; only their small native tile pages are published. No whole-map painting was sliced into tiles.

The sources share the approved railway art's slightly elevated orthographic front view, level horizontal edges, slate/ivory architecture, rounded green iron, warm brass and fine painted pixel detail. This is dimensional illustrated scenery rather than flat diagram tiles. The existing native railway, cave and paving pixels remain unchanged.

## Production briefs

- **Palace gate:** one isolated compact imperial railway entrance facade, ivory limestone, blue slate roof, three tall arches with glazed central double doors, a modest brass sun emblem, warm wall lamps and a low stone doorstep. Slightly elevated orthographic front view, shallow visible roof/sill depth, no isometric diamond perspective. Rich fine pixel texture; no people, ground island, labels, grid or detached particles. Complete silhouette and transparent margins. Native budget: 336 x 216.
- **Instrument bank:** one continuous low green-enamel brass/iron console, five round ivory pressure gauges with black pointers, valve wheels, short softly cyan glass feed tubes and a worn base. Slightly elevated orthographic front view shows the tabletop and legs. Rounded metal, restrained highlights and cool shadows match the locomotives. No room, floor island, people, labels, numbers, fog or rays. Transparent background. Native budget: 192 x 96.
- **Restrained vessel:** one faceless milky-crystal obelisk held by dark iron ribs, chains and a circular brass/green boiler base, with paired short feed pipes. Faint cool light; no face, humanoid, deity or monster anatomy. Slightly elevated orthographic front view, rounded detailed machinery and restrained highlights. No chamber, floor island, people, labels, loose particles, cloud or rays. Complete silhouette on transparency. Native budget: 240 x 312.

## Native export

Run `python3 assets/tiles/import-chapter-three.py GATE.png CONTROLS.png VESSEL.png`. `chapter-three-scenery.json` records input order, budgets and physical footprints. The importer trims the largest opaque silhouette, removes detached alpha specks, samples once with nearest-neighbor interpolation and preserves selected source RGB. The resulting modules are 14 x 9, 8 x 3 and 9 x 13 tiles. Their 24px pieces join the shared catalog without repacking existing pages or changing earlier IDs.

The native page writer verifies decoded RGBA equality, dimensions no greater than 192 x 192 and a 128 KB cap for every image before replacing files. The terrain-edge baker appends reusable joins. Gameplay reads only these lossless PNG/WebP pages, ordinary Tiled JSON and tile properties; no source art, image conversion, recoloring or resizing runs in the browser.

Sorted pieces use one ground anchor per module. The gate's front step, instrument-bank base and vessel's lower footprint block movement; their overhead pixels do not create rectangular invisible walls. Doors and consoles have map-owned clickable rectangles with reachable approaches. Stage the actors in clear space beside the props, and leave every tactical hex clear.

## Imperial exterior

Built-in Image Gen supplied independent exterior modules. `palace.json` records their native export budgets. The production briefs were:

- **Central portico:** monumental ivory limestone imperial entrance, tall glazed doors, substantial Corinthian columns, sculpted pediment and a blue slate domed cupola with a gilded sun finial. Slightly elevated orthographic front view, level cornices, shallow roof depth, cool recesses, brass lamps and fine dimensional painted pixel detail. Complete silhouette on genuine transparency; no people, landscape, ground island, lettering or particles. Native budget: 384 x 312.
- **Wing bay:** repeatable two-story limestone facade with three arched windows per story, engaged edge pilasters, sculpted string courses, blue mansard roof and roof balustrade. The same camera, materials, lighting and detailed pixel style as the portico. Straight joining edges and horizontal base, complete silhouette on transparency; no perspective sidewalls, ground, people or text. Native budget: 192 x 240.
Run `python3 assets/tiles/import-palace.py PORTICO.png WING.png`. It keeps fixed module extents, samples once without palette reduction and removes detached alpha fragments before and after sampling. The portico is 16 x 13 tiles and each wing is 8 x 10. Northglass joins the portico to three wings, with the earlier gate serving as its medical receiving pavilion. The portico projects one tile forward; its two foot rows block the wall while the stair floor opens the central approach. Opening and departure shots frame the complete dome and finial below the cinematic title strip.

## Vessel-derived engine works

The relayhall and conduit are working facilities behind the imperial exterior. The accepted vessel supplied the reference image for all five new sources through built-in Image Gen. Their exact prompts are in `engine-works-prompts.json`; `engine-works.json` records native budgets and pipe registrations. No new room painting was sliced into tiles.

- **Factory wall:** gray masonry, a broad arched iron factory window, rounded green enamel supports and brass feed pipes. Orthographic front view, shallow dimensional relief and warm upper-left highlights. The fixed native module is 192 x 168, aligned at its lower edge. Its steel base supplies cutaway strips.
- **Masonry floor:** a seamless medium-value warm-gray quarry-stone field with broad worn surfaces and restrained joints. Opaque top-down 192 x 192; no white checker pattern, marble veins or decorative inlays.
- **Steel deck:** a seamless 192 x 192 field of long muted green-gray steel plates, recessed seams and sparing brass bolts. Broad matte centers and restrained wear keep dark-clothed actors readable.
- **Metal stairs:** four gray-green iron treads, brass nosing, thick low side stringers and a top landing. Transparent front view from above; fixed 144 x 96 native module, drawn below actors as walkable floor.
- **Pipe fittings:** eight independent transparent pieces: horizontal, vertical, four elbows, a south-facing T and a cross. The same rounded enamel and brass as the vessel. Each exports to 24 x 24 with connection centers registered at cell-edge midpoints, using selected source RGB without procedural repainting.

Run `python3 assets/tiles/import-engine-works.py WALL.png STONE.png DECK.png STAIRS.png PIPES.png`. The importer cleans alpha before and after sampling, replaces only the rejected marble wall/cutaway/floor slots (3601–3724), and appends steel, stairs and fittings. Rejected marble definitions and pixels are removed. All other old tile IDs and decoded pixels, including the imperial exterior, remain intact. Page boundaries stay stable; every exported image is lossless, no greater than 192 x 192 and no larger than 128 KB. Large sources stay outside git.

The gallery has masonry floors and steel service walks between its stair, workbench and instrument banks. Its intake manifold descends into the central control table. The cavern chamber has steel servicing decks; a joined feed connects the vessel to the right-hand console, with a pressure branch and a pipe beneath the auxiliary governor. Feed lights follow the actual pipe run and hide after shutdown. Gallery/store battle floors share the masonry and factory wall bays; both regulator floors use steel with cavern framing. The outdoor arrest remains on courtyard paving. All approaches, casts and tactical cells remain on connected floor.
