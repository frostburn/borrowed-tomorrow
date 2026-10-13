# Borrowed Tomorrow

Keep chapter canon and continuation notes under `docs/story/` in sync with the playable content. Preserve existing save and content IDs.

Do not name characters Morrow, Vale, Rook, Sable, Voss, Mara, Dacre, Holt, or Kestrel. This list records the user's exclusions, not characters in the story. Use Ansel for the stationmaster, Iona for the supply clerk, and Ada Fenwick for the timetable's author.

The entire visible game, including text and menus, must use the same low-resolution framebuffer and integer scaling in physical pixels. A CSS pixel font or `image-rendering: pixelated` on only the world canvas is insufficient. Keep bitmap text and geometry aligned to the logical grid; verify at fractional device-pixel ratios as well as ordinary desktop and phone sizes.

Keep audio procedural and asset-light. Compose phrases with variation, rests, and distinct location arrangements. Sound effects must correspond to the actual action: steam, lantern, melee, healing, movement, and menu interaction have different sounds.
