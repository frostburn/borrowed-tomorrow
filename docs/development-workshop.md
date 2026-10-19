# Character workshop

Run `npm run dev`, then choose **Workshop** on the title screen, or open `/?dev=workshop`. The former `/?dev=inventory` link opens the Equipment tab. The workshop exists only in Vite's dev server. `npm run build` and `npm run preview` include the campaign inventory; neither query parameter enables the workshop there.

Choose Nell, Orrin, Kit, Celia or Petra, then **Character** or **Equipment**. Each character has an independent level, build and loadout. **Add to party** and **Remove from party** edit the practice lineup: at least one and at most three companions may fight. Selecting a portrait edits that character without changing party membership. Reserves keep their builds and equipment; reloading preserves the selected lineup. The portrait column shows effective stats, including equipped bonuses.

## Future companions

The workshop previews companions planned for later story chapters. Kit is a fast Iron Coast boy courier who gets flustered around Nell; Celia is an older physician; Petra is an imperial knight whose defection develops across Chapters Two and Three. Recruitment plans and the constraints on Kit’s unresolved puppy-love gag live in `docs/story/characters.md`. Kit has new matching artwork; Celia and Petra use the unused art library. Each has an 80 × 80 actor and 128 × 128 portrait.

| Companion | Default HP / Attack / Armor / Speed / Move | Level 1 | Level 2 | Level 3 | Level 5 |
| --- | --- | --- | --- | --- | --- |
| Kit | 38 / 10 / 0 / 9 / 4 | Strike, Quick shot, Bandage | Piercing bolt | Feint | Volley |
| Celia | 40 / 8 / 0 / 6 / 3 | Strike, Celestial bolt, Mend, Bandage | Rally | Beacon | Sanctuary |
| Petra | 62 / 14 / 1 / 4 / 3 | Strike, Shield bash, Bandage | Taunt | Saber sweep | Crushing blow |

Celestial bolt is available at level 1: a weak attack on any enemy, 1 focus, ignoring distance and obstacles. It uses Celia’s Attack bonus. Rally restores another ally’s focus, up to six. Sanctuary grants an area barrier only to allies and preserves stronger barriers. Shield bash is an optional extra action once per turn, before Petra’s main action. It deals no damage, leaves barriers and Dazzle counters unchanged, costs 1 focus, uses the existing clear-hex push rules and preserves her movement and main action. Its button disables after use, and waiting is unavailable after a bash. Taunt replaces Cover at level 2. Select it to preview all affected enemies, then confirm without aiming. For 2 focus, every enemy targets Petra until her next turn; enemies that cannot reach her approach her instead of attacking someone else. Area attacks can still catch other units. Taunt ends early if Petra falls. Saber sweep previews immediately on selection, excludes Petra and can hit neighboring allies. The courier sight, medic clasp and balanced saber hilt fit their respective owners; coats fit all five companions.

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

### Battle testing tools

Every battle on the Vite dev server, including campaign encounters, has a **DEV** strip above the normal commands:

| Control | Effect |
| --- | --- |
| Win battle | Defeat all enemies and open the normal victory panel with one click. Campaign battles award their usual rewards, journal entries and progress; Continue the journey resumes the story and saves normally. Practice gives no rewards. |
| Lose battle | Down the party and open the normal defeat panel, allowing campaign retry testing without awarding progress. |
| Refill party | Restore every party member to full HP and 6 focus, including downed companions. Keep positions, turn order, actions already used, enemy resources and shared bandages. |
| Restart battle | Restore the encounter’s exact starting snapshot: formation, builds, HP/focus, bandages, round and turn order. Workshop edits and campaign state stay intact. |

Tools work during enemy turns and animations. Each action replaces the battle object and discards pending callbacks from the previous one. Finished battles disable the controls; returning to exploration or the workshop removes them. These controls, their styles and their implementation are absent from production builds.

**Test battle** runs the existing hex engine with the selected party’s builds, learned abilities and equipped items. **Workshop** or Escape returns to the workshop. Completing or abandoning practice gives no campaign rewards and never writes campaign saves. Re-entering practice restores HP, starting focus and bandages.

Equipment retains the existing local-storage key `borrowed-tomorrow:inventory-workshop:v1`, preserving previous workshop loadouts. Character settings use `borrowed-tomorrow:character-workshop:v1`. Both use version-2 records under their existing keys, migrate version-1 two-character records without losing edits or equipment, and validate stored data before use. **Reset workshop** restores all five characters to level 1, selects Nell and Orrin, and returns the equipment stock to the bag. Campaign version-9 saves carry a separate inventory and active formation, with version-5/6/7/8 migration. Workshop storage never feeds campaign equipment.

## Implementation boundary

- `src/rules/characters.ts` owns editable level defaults, stat ranges and validated workshop settings. `src/rules/progression.ts` shares read-only base stats and learned abilities with the campaign. Abilities are derived from level rather than trusted from storage.
- `src/rules/inventory.ts` owns item definitions, spare-copy counts, character loadouts, validation and manual equip/unequip rules.
- `createBattle` accepts optional equipment bonuses, character profiles and an explicit party of one to three distinct companions. Three-person parties spawn on separate hexes. Chapter One remains limited to Nell and Orrin. Chapter Two recruits only Kit; Celia remains available in the workshop for later story development. Campaign saves retain the active formation separately. Without explicit workshop arguments, combat uses campaign HP/focus, equipment and level abilities. Nell retains her original early Mend. The item catalog, read-only progression and inventory rules are shared with production; stat editing remains dev-only.
- `src/dev/workshop.ts` is imported only behind `import.meta.env.DEV`. Its styles, controls and fixture stock are excluded from builds.
- `Adventure` supplies an isolated practice host around the existing renderer and controls. It skips campaign loading, autosaves and victory rewards. Delayed battle callbacks discard work belonging to an abandoned encounter.

Character inventory, equipment loot, shops and save migration are integrated into the campaign. Only Kit joins in Chapter Two; Petra joins in Chapter Three; Celia’s introduction is deferred. Equipment retains the formation controls for later recruits. The workshop’s arbitrary levels and stat edits remain isolated.

## Checks

`npm run check` covers progression, validation, equipment conservation and actual combat effects. `npm run test:e2e:smoke` exercises character builds, ability controls and equipment on desktop and phone alongside the campaign checks. After building, `npm run test:e2e:production` verifies that both development routes, workshop controls and editable build settings are absent from production, while campaign equipment remains available. `npm run test:e2e:journeys` also completes an equipped practice battle and checks that it gives no campaign rewards.
