# Borrowed Tomorrow

Keep chapter canon and continuation notes under `docs/story/` in sync with the playable content. Preserve existing save and content IDs.

For story work, read and apply `.agents/skills/write-game-prose/SKILL.md`. It covers dialogue, narration, journals, player choices, and disk handoffs.

Register named characters in `src/content/characters.ts`. Each needs their own 80 × 80 world sprite and 128 × 128 portrait. `SAY` resolves portraits from speaker identity; narration and documents have no speaker portrait. Keep one person's appearance consistent across locations. The legacy `master` and `clerk` textures belong to Ansel and Iona, respectively; do not assign them to new residents. Named mechanical keepers also have distinct artwork, separate from their combat archetype.

Do not name characters Morrow, Vale, Rook, Sable, Voss, Mara, Dacre, Holt, or Kestrel. This list records the user's exclusions, not characters in the story. Use Ansel for the stationmaster, Iona for the supply clerk, and Ada Fenwick for the timetable's author.

The entire visible game, including text and menus, must use the same native-resolution framebuffer and integer scaling in physical pixels. A CSS pixel font or `image-rendering: pixelated` on only the world canvas is insufficient. Use a 1024 × 768 desktop layout; narrower layouts crop and pan the scene at the same pixel density. Render scenery, 128 × 128 portraits, and 80 × 80 actors at 1:1 native resolution. Preserve asset colors; never reduce the palette or fit an asset into a smaller box. Keep bitmap text and geometry aligned to the logical grid; verify at fractional device-pixel ratios as well as ordinary desktop and phone sizes.

Keep audio procedural and asset-light. Compose phrases with variation, rests, and distinct location arrangements. Sound effects must correspond to the actual action: steam, lantern, melee, healing, movement, and menu interaction have different sounds.

For new themes, read `docs/music-direction.md`. Disk D uses the supplied Evangelion progression; the Nichijou progression and non-functional Chrono Trigger-style vamps remain reserved references for later areas.
