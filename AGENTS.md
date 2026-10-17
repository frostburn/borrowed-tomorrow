# Borrowed Tomorrow

The user authorized a complete story reboot. The former Disks A–D campaign has been removed. `docs/story/grand-outline.md` is the seven-chapter plan; Chapter One: Leaving Home is the playable canon. The final chapter travels into the Benefactor’s own domain and defeats the god permanently. “Borrowed Tomorrow” refers to its demand for repayment of the boons it lent the empire.

Keep canon and continuation notes under `docs/story/` in sync with playable content. Preserve the reboot’s version-5 campaign, content IDs and checkpoints in later work. Versions 1–4 belong to the previous story: retain export access, but never migrate their flags into the new campaign.

Off-story mechanics work lives in the Vite-only character workshop (`?dev=workshop`; `?dev=inventory` opens its equipment tab). Keep its UI, fixtures and storage separate from campaign saves, and its entry behind `import.meta.env.DEV`. Production retains the current story equipment and character progression until an explicit integration task. Read `docs/development-workshop.md` for character builds, level abilities, the manual equipment model and the practice harness.

For story work, read and apply `.agents/skills/write-game-prose/SKILL.md`. It covers dialogue, narration, journals, player choices, and disk handoffs.

Let scenes establish facts in sequence. Do not pre-explain nearby revelations in title copy or repeat facts such as Nell’s age. Choices can show that a fight may be declined; do not announce afterward that it was optional. Keep Chapter One’s crystal effects uncertain: use sensory clues, without a divine voice, confirmed time powers, or a final-boss cutaway.

Register named characters in `src/content/characters.ts`. Each needs their own 80 × 80 world sprite and 128 × 128 portrait. `SAY` resolves portraits from speaker identity; narration and documents have no speaker portrait. Keep one person's appearance consistent across locations. The legacy `master` and `clerk` textures belong to Ansel and Iona, respectively; do not assign them to new residents. Named mechanical keepers also have distinct artwork, separate from their combat archetype.

Do not name characters Morrow, Vale, Rook, Sable, Voss, Mara, Dacre, Holt, Kestrel, or Severin. This list records the user's exclusions, not characters in the story. Use Ansel for Nell’s stationmaster mentor and Iona for the supply clerk. Ansel dies in the Chapter One raid; return visits must not resurrect him. Tomas is Nell’s older brother; Captain Alban is the officer who arrests him.

The entire visible game, including text and menus, must use the same native-resolution framebuffer and integer scaling in physical pixels. A CSS pixel font or `image-rendering: pixelated` on only the world canvas is insufficient. Use a 1024 × 768 desktop layout; narrower layouts crop and pan the scene at the same pixel density. Render scenery, 128 × 128 portraits, and 80 × 80 actors at 1:1 native resolution. Preserve asset colors; never reduce the palette or fit an asset into a smaller box. Keep bitmap text and geometry aligned to the logical grid; verify at fractional device-pixel ratios as well as ordinary desktop and phone sizes.

Keep audio procedural and asset-light. Compose phrases with variation, rests, and distinct location arrangements. Sound effects must correspond to the actual action: steam, lantern, melee, healing, movement, and menu interaction have different sounds.

For new themes, read `docs/music-direction.md`. The retained Northglass score uses the supplied Evangelion progression. The Nichijou progression and non-functional Chrono Trigger-style vamps remain references for new themes; original melodies and clear phrase variation are required.
