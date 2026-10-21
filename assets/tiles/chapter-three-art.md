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

## Grand palace and marble kit

Four further built-in Image Gen sources provide independent reusable assets, rather than a whole exterior or room painting. `palace.json` records their native export budgets. The production briefs were:

- **Central portico:** monumental ivory limestone imperial entrance, tall glazed doors, substantial Corinthian columns, sculpted pediment and a blue slate domed cupola with a gilded sun finial. Slightly elevated orthographic front view, level cornices, shallow roof depth, cool recesses, brass lamps and fine dimensional painted pixel detail. Complete silhouette on genuine transparency; no people, landscape, ground island, lettering or particles. Native budget: 384 x 312.
- **Wing bay:** repeatable two-story limestone facade with three arched windows per story, engaged edge pilasters, sculpted string courses, blue mansard roof and roof balustrade. The same camera, materials, lighting and detailed pixel style as the portico. Straight joining edges and horizontal base, complete silhouette on transparency; no perspective sidewalls, ground, people or text. Native budget: 192 x 240.
- **Marble wall bay:** interior ivory/blue-gray veined marble, arched blue glass window, rounded engaged Corinthian columns, brass capitals, sculpted cornice and dark marble dado. Front orthographic view with shallow relief; complete silhouette on transparency and no floor, furniture, people or lettering. Native budget: 192 x 168.
- **Marble field:** seamless opaque top-down square texture, four slabs across and down, alternating warm ivory and pale blue-gray marble with subtle veins, thin joints and restrained brass corner inlays. Calm broad surfaces, gentle reflected light, no perspective, border, cast shadows, props or vignette. Native budget: 192 x 192; each slab spans 2 x 2 gameplay tiles.

Run `python3 assets/tiles/import-palace.py PORTICO.png WING.png WALL.png FLOOR.png`. It appends stable IDs, keeps fixed module extents, samples once without palette reduction and removes detached alpha fragments before and after sampling. The wall's native lower dado also supplies cutaway pieces. Exported module dimensions are 16 x 13, 8 x 10 and 8 x 7 tiles; the marble field is 8 x 8. Only bounded lossless tile pages enter git.

Northglass joins the portico to three wing placements, with the earlier gate serving as the medical receiving pavilion. The portico projects one tile forward of the wings; its two foot rows block the wall while the stair floor opens the central approach. The opening and departure shots frame the complete dome and finial below the cinematic title strip. The control gallery uses marble floors, window bays and a low marble cutaway; both gallery encounter floors and both vessel encounter floors share its dedicated marble material. The underground service deck retains exposed cavern stone around its edges. The outdoor arrest floor remains courtyard paving. Existing interaction destinations, casts, console approaches and tactical cells stay on open connected floor.

`npm run check:art-upload` must pass after staging and before publication. Upload each approved page separately. Source images, overview renders and browser screenshots stay outside the repository.
