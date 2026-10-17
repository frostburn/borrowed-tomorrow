# Character workshop

Run `npm run dev`, then choose **Workshop** on the title screen, or open `/?dev=workshop`. The former `/?dev=inventory` link opens the Equipment tab. The workshop exists only in Vite's dev server. `npm run build` and `npm run preview` keep the campaign; neither query parameter enables the workshop there.

Choose Nell, Orrin, Kit, Celia or Petra, then **Character** or **Equipment**. Each character has an independent level, build and loadout. **Add to party** and **Remove from party** edit the practice lineup: at least one and at most three companions may fight. Selecting a portrait edits that character without changing party membership. Reserves keep their builds and equipment; reloading preserves the selected lineup. The portrait column shows effective stats, including equipped bonuses.

## Future companions

The workshop previews companions planned for later story chapters. Kit is a fast Iron Coast boy courier who gets flustered around Nell; Celia is an older physician; Petra is an imperial knight whose defection develops across Chapters Two and Three. Recruitment plans and the constraints on Kit’s unresolved puppy-love gag live in `docs/story/characters.md`. Kit has new matching artwork; Celia and Petra use the unused art library. Each has an 80 × 80 actor and 128 × 128 portrait.

| Companion | Default HP / Attack / Armor / Speed / Move | Level 1 | Level 2 | Level 3 | Level 5 |
| --- | --- | --- | --- | --- | --- |
| Kit | 38 / 10 / 0 / 9 / 4 | Strike, Quick shot, Bandage | Piercing bolt | Feint | Volley |
| Celia | 40 / 8 / 0 / 6 / 3 | Strike, Holy bolt, Mend, Bandage | Rally | Beacon | Sanctuary |
| Petra | 62 / 14 / 1 / 4 / 3 | Strike, Shield bash, Bandage | Cover | Saber sweep | Crushing blow |

Holy bolt is available at level 1: a single enemy within five hexes, 1 focus, blocked by rocks. It uses Celia’s Attack bonus. Rally restores another ally’s focus, up to six. Sanctuary grants an area barrier only to allies and preserves stronger barriers. Shield bash is an optional extra action once per turn, before Petra’s main action. It costs 1 focus, uses the existing clear-hex push rules and preserves her movement and main action. Its button disables after use, and waiting is unavailable after a bash. A bash that defeats the final enemy ends combat immediately. Saber sweep previews immediately on selection, excludes Petra and can hit neighboring allies. The courier sight, medic clasp and balanced saber hilt fit their respective owners; coats fit all five companions.

## Levels and base stats

Levels range from 1 to 10. Changing level restores that level's base stats and recomputes learned abilities; equipment stays equipped. Each level adds 6 max HP and 2 attack. Speed, armor, movement and starting focus keep their character defaults. Petra’s default movement is three. Existing saved stat edits stay intact; use Level defaults to apply updated defaults to an existing build.

Edit Max HP (1–999), Attack (1–199), Armor (0–99), Speed (1–30), Movement (1–10), or Starting focus (0–6), then choose **Apply base stats**. Plus and minus buttons edit the same fields. Only whole numbers in the shown ranges are accepted; an invalid field prevents the entire build from being applied. **Level defaults** restores the selected character's base stats without changing their level or equipment.

Starting focus is the value before normal turn regeneration. A character gains one focus at the start of their turn, up to six. Higher speed acts earlier; armor reduces damage; movement determines reachable hexes. Base Attack is Strike's damage before armor, defense and equipment. Other attacks use the same bonus relative to their own power. Healing and support strength do not scale with Attack.

| Level | Nell | Orrin |
| --- | --- | --- |
| 1 | Strike, Lantern burst, Bandage | Strike, Steam lance, Bandage |
| 2 | Mend: heal one ally | Rivet shot: ranged attack ignoring 2 armor |
| 3 | Dazzle: the enemy's next three attacks deal 40% less damage, including retaliations | Safety guard: a 10-point barrier for one ally |
| 5 | Beacon: heal allies in a seven-hex area | Pressure wave: damage neighboring units and push survivors one clear hex |

The Abilities panel shows every unlock and whether it is known. Lowering level removes abilities above that level. Combat buttons and number shortcuts include every learned ability. Beacon can aim at an empty center and never heals enemies. Guard lasts until absorbed and does not stack; reapplying it restores at most 10 points. Dazzle tracks attacks rather than turns: retaliation consumes one, an area attack consumes one for its whole area, and moving, defending, waiting, healing or granting guard consumes none. The remaining attack count appears on the unit. Pressure wave previews all affected hexes immediately when selected; only confirmation is required. It hits allies as well as enemies, excludes Orrin, and cannot push into a rock, an occupied hex or off the board. Its preview marks clear landing hexes.

## Equipment

Select an item in the shared bag, compare Attack / Armor / Speed, then equip it. Each character has a tool-fitting slot and a coat slot. Their basic tools remain part of the character. The brass reflector fits Nell's lantern; the pressure nozzle fits Orrin's lance. Coats fit all five characters, but each copy protects only its wearer. The heavy coat trades speed for protection.

Receiving equipment adds copies to the bag without equipping them. Equipping consumes one spare copy and returns the old item to the bag. Unequip a shared item before giving that copy to the other character. The initial stock includes one heavy coat and one of each fitting. New workshops have three reinforced coats, enough for a full party. Existing inventory is preserved during migration.

## Practice and persistence

**Test battle** runs the existing hex engine with the selected party’s builds, learned abilities and equipped items. **Workshop** or Escape returns to the workshop. Completing or abandoning practice gives no campaign rewards and never writes campaign saves. Re-entering practice restores HP, starting focus and bandages.

Equipment retains the existing local-storage key `borrowed-tomorrow:inventory-workshop:v1`, preserving previous workshop loadouts. Character settings use `borrowed-tomorrow:character-workshop:v1`. Both use version-2 records under their existing keys, migrate version-1 two-character records without losing edits or equipment, and validate stored data before use. **Reset workshop** restores all five characters to level 1, selects Nell and Orrin, and returns the equipment stock to the bag. Campaign IndexedDB saves and their version-5 data are unchanged.

## Implementation boundary

- `src/rules/characters.ts` owns level defaults, stat ranges, learned abilities and validated character settings. Abilities are derived from level rather than trusted from storage.
- `src/rules/inventory.ts` owns item definitions, spare-copy counts, character loadouts, validation and manual equip/unequip rules.
- `createBattle` accepts optional equipment bonuses, character profiles and an explicit party of one to three distinct companions. Three-person parties spawn on separate hexes. The chapter-one save schema stays limited to its two recruited characters. Without these arguments, it retains the campaign's current gear, stats and fixed abilities. Both imports are type-only, so the prototype progression table and item catalog are not in production bundles.
- `src/dev/workshop.ts` is imported only behind `import.meta.env.DEV`. Its styles, controls and fixture stock are excluded from builds.
- `Adventure` supplies an isolated practice host around the existing renderer and controls. It skips campaign loading, autosaves and victory rewards. Delayed battle callbacks discard work belonging to an abandoned encounter.

Integrating recruitment, reserves, character inventories, level progression, loot, shops and save migration into the story is a separate task.

## Checks

`npm run check` covers progression, validation, equipment conservation and actual combat effects. `npm run test:e2e:smoke` exercises character builds, ability controls and equipment on desktop and phone alongside the campaign checks. After building, `npm run test:e2e:production` verifies that both development routes, workshop controls, progression table and item catalog are absent from production. `npm run test:e2e:journeys` also completes an equipped practice battle and checks that it gives no campaign rewards.
