# Inventory workshop

Run `npm run dev`, then choose **Inventory workshop** on the title screen, or open `/?dev=inventory`. This entry exists only in Vite's dev server. `npm run build` and `npm run preview` keep the campaign; the query parameter cannot enable the workshop there.

Select Nell or Orrin, select an item in the shared bag, compare Attack / Armor / Speed, then equip it. Each character has a tool-fitting slot and a coat slot. Their basic lantern and lance remain part of the character. The brass reflector fits Nell's lantern; the pressure nozzle fits Orrin's lance. Coats fit either character, but each copy protects only its wearer. The heavy coat trades speed for protection.

Receiving equipment adds copies to the bag without equipping them. Equipping consumes one spare copy and returns the old item to the bag. Unequip a shared item before giving that copy to the other character. The initial stock includes two reinforced coats, one heavy coat and one of each fitting.

**Test battle** runs the existing hex engine with both characters and the chosen loadouts. Attack, armor and initiative come from equipped items. Inventory or Escape returns to equipment. Completing or abandoning practice gives no campaign rewards and never writes campaign saves. Re-entering practice restores HP, focus and bandages.

Workshop equipment persists under the local-storage key `borrowed-tomorrow:inventory-workshop:v1`. Reset restores the starting stock. Campaign IndexedDB saves and their version-5 `gear` field are unchanged.

## Implementation boundary

- `src/rules/inventory.ts` owns item definitions, spare-copy counts, character loadouts, validation and manual equip/unequip rules.
- `createBattle` accepts explicit equipment bonuses. Without that argument, it retains the campaign's legacy gear behavior. The inventory import is type-only, so the prototype catalog is not in production bundles.
- `src/dev/inventory-workshop.ts` is imported only behind `import.meta.env.DEV`. Its styles and fixture items are excluded from builds.
- `Adventure` supplies an isolated practice host around the existing renderer and controls. It skips campaign loading, autosaves and victory rewards. Delayed battle callbacks discard work belonging to an abandoned encounter.

The workshop is the first step toward replacing auto-equip. Integrating loot, shops, character inventories and save migration into the story is a separate task.

## Checks

`npm run check` covers inventory conservation, compatibility, save validation and actual combat bonuses. `npm run test:e2e:smoke` exercises the workshop on desktop and phone alongside the campaign checks. After building, `npm run test:e2e:production` verifies that the development route and inventory catalog are absent from production. `npm run test:e2e:journeys` also completes an equipped practice battle and checks that it gives no campaign rewards.
