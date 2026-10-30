# Ambient map motion

`content/map-life.ts` owns deterministic scenery poses and the location palette
registry. `game/map-life.ts` applies them in the campaign; Maps uses the same
poses and Canvas painters with **Scenery motion** enabled. These are cosmetic
changes, with no navigation, collision, saved-state or story progression writes.
Foliage pivots at its planted base with at most three native pixels of canopy
displacement. Two differently phased wind components avoid synchronized swaying;
`canopy.svg` is foliage, while `canopy-house.svg` stays rigid.

| Location | Motion |
| --- | --- |
| Chapters One–Three | Planted foliage; light exhaust from locomotives and ward stoves; slow harbor boats, clouds and water outside |
| Chapter Four | Coastal clouds and water after the warden's defeat; ferries bob at their existing berths |
| Chapter Five | Slow clouds above outdoor regions, foundry chimney steam, released cooling water, gently hovering distant fleet formations |
| Chapter Six | River and harbor water, moored launches, desert and capital clouds, sparse snow in Skeld, sea shimmer in the remembered holiday |
| Chapter Seven | Suspended boats resume after the taken passengers are freed; the winter street stays still until its own release; the overhead sea and real seaside shimmer |

`ScenePiece.motion` marks a boat as `sail`, `moored` or `hover`, with an optional
horizontal distance and prerequisite flag. Sail offsets stay within their
authored open-water corridor; moored boats only bob by at most two native pixels.
Boardable survey ships, gangways, walkable decks and cinematic mechanisms stay
anchored. The Chapter Five blockade sky and Chapter Seven winter relief are
separate static planes, so moving a craft never drags the sky or covers mountains.
The regional SVG exporters reproduce the separated planes and motion metadata.

Clouds and water use masks built once from exact background colours and the
Tiled navigation floor. Clouds use the native two-pixel edge grid; water uses
conservative eight-pixel blocks. Effects remain behind foreground scenery.
Indoor cutaways have no sea or clouds. Steam is small, dispersing exhaust tied
to an existing chimney, rather than a screen-wide haze.

The shared 120 ms scenery clock pauses for menus, dialogue, cinematics and
battle transitions. Long frame gaps advance it by at most 120 ms. Reduced
motion restores the authored boat/tree pose and suppresses clouds, water,
snow and steam, including when the preference changes with a menu open.
Closing a map destroys its effect surfaces; there are no ambient tweens,
particles, timers or event listeners to outlive it. Passive redraws use the
existing scenery-dirty channel, preserving the walking frame cadence.

Collection remains visible as stillness at Rillbridge, Cinderbank, the arrested
coast, Stillwater Avenue and each unreleased Chapter Seven region. Story flags
also control visibility of ferries and fleet formations on restored saves.
Maps exposes motion prerequisite flags alongside its other story controls. Its
Scenery motion control is off by default, included as `mapMotion=1` in copied
review links, and stops when leaving the panel. Add palettes only after reviewing
the actual scene; unsupported surfaces retain their authored appearance.

Validation: `npm run check`, `npm run check:art-upload`, and the optional
`tests/e2e/map-life.spec.ts` browser checks. Keep the detailed browser cases
outside the small default CI gate.
