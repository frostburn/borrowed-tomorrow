# Enemy progression

Enemies take a legal attack that reaches an opposing unit before considering Defend. Retaliation, cover, friendly fire, steam vents and travel cost still rank the available attacks. A losing exchange does not make a hound idle beside its target. With no reachable attack, enemies approach and Defend; Taunt and Petra's support actions keep their existing rules. Empty ordinary area attacks do not count as reaching a target. Bosses retain their announced patterns, including empty-ground strikes.

Common machines have fixed chapter variants. Their colors and profiles are authored together in `src/content/enemy-variants.json`; they do not scale with the party's level. The original Chapter One enemies and the workshop's basic practice retain their profiles. Named keepers, Petra and the Heart regulator retain their own art and stats.

| Chapter | Hound | Crow | Guardian |
| --- | --- | --- | --- |
| Two | Steel: 40 HP, 11 strike, 0 armor, 5 speed, 3 move | Copper: 32 HP, 9 peck, 0 armor, 6 speed, 3 move | Iron: 98 HP, 14 steam, 2 armor, 3 speed, 2 move |
| Three | Gilded: 58 HP, 15 strike, 1 armor, 6 speed, 4 move | Gilded: 46 HP, 12 peck, 0 armor, 7 speed, 3 move | Gilded: 132 HP, 18 steam, 3 armor, 3 speed, 2 move |
| Four | Dusk: 72 HP, 19 strike, 1 armor, 6 speed, 4 move | Dusk: 60 HP, 15 peck, 1 armor, 8 speed, 3 move | Dusk: 162 HP, 23 steam, 4 armor, 4 speed, 2 move |
| Five | Furnace: 82 HP, 21 strike, 2 armor, 6 speed, 4 move | Slag: 68 HP, 17 peck, 1 armor, 8 speed, 3 move | Forge: 184 HP, 25 steam, 4 armor, 4 speed, 2 move |

Damage columns show power before target armor, Guard, Defend or Dazzle. Later hounds close faster, crows pressure the turn order and guardians gain staying power. Encounter IDs, flags, rewards, formations and manual equipment remain intact. Common map actors and the battle identity card use the same local recolor. Review all twelve variants in the Sprites workshop's Enemies collection.

## Reproduce the art

```sh
node scripts/export-enemy-variants.mjs
```

The exporter replaces only literal color values in the accepted base SVGs. It preserves all geometry, transparency, 80 × 80 frames, contour widths and the row-68 ground anchor. No raster resampling, filters, generated imagery or extra dependency is involved. `node scripts/export-chapter-one-art.mjs` also refreshes the recolors after exporting their base models. Keep each SVG under the existing 128 KiB upload budget.

`tests/enemy-progression.test.ts` covers reachable attacks despite lethal retaliation or barriers, unreachable pursuit, fixed profiles, role compatibility and tier progression. The detailed Sprites/device checks stay outside the default CI browser gate. Use canonical chapter starts for combat review with the expected party and earned equipment.

Opt-in guardian–crow links in Hammerplain/Windmere add an announced, disruptible shared-turn blast. Authoring and interruption rules are in [Rich combat](combat-upgrade.md#battlefield-objects-and-enemy-relay); the fixed recolor profiles remain unchanged.
