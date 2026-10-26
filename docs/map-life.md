# Ambient map motion

`content/map-life.ts` owns restrained foliage poses, water palettes, outdoor
cloud locations and collection-release conditions. `game/map-life.ts` owns one
scene-time listener, disposed with the campaign map. Poses update every 120 ms;
only visible artwork moves, never navigation, interactions or actor positions.
Foliage pivots at its planted base, with at most three native pixels of canopy
displacement. The broadleaf tree asset `canopy.svg` is included explicitly;
building assets such as `canopy-house.svg` remain rigid. Two slow, differently
phased wind components keep neighboring trees from swinging in lockstep. The
title, opening scenes and exploration share the same breeze. Buildings, bridges and the suspended coastal wave are static.

Water uses exact authored water colors and conservative eight-pixel interior
blocks, excluding walkable navigation cells. The mask is built once from the
visible static terrain; no per-frame texture reads are needed. Pale dashes are
clipped inside that mask. Airship clouds are clipped outside the walkable deck.
Unsupported maps retain their authored appearance rather than guessing which
areas contain water. Add a palette/location only after inspecting it in context.

Rillbridge stays arrested until `villageFreed`, Cinderbank until
`coastCollectorWon`, and the Chapter Four coast until `sanctuaryWardenWon`.
Reduced-motion preference returns all foliage to neutral and removes overlays.
Actor illumination and existing native mechanism animation remain independent.

**Workshop → Maps → Scenery motion** previews the same poses and painter.
It is off by default, respects the selected story flags and reduced motion,
stops when leaving Maps, and is included as `mapMotion=1` in a copied review link.
Detailed browser checks are outside the small default CI selection.
