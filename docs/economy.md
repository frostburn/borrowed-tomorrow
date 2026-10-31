# Early campaign economy — issue #106

Chapters One and Two have useful purchases and a shared spare-gear trade counter. Stronger medicine enters shops in Chapter Four. Chapter Three adds conduit counters; Chapter Four and later medical counters also stock modest protective equipment. Further late-game equipment progression remains follow-up work on #106.

## Counters and stock

Iona's counter at Larkspur sells starter equipment and ordinary bandages. Field bandages and focus tonics first appear at medical counters in Chapter Four; Chapters One–Three do not sell them. Chapter Two offers **Browse supplies and trade gear** beside Orrin's coastal engine, at Dena's ward and at the Cinderbank medical coaches before Petra's crossing. All three coastal stops share prices and inventory rules. Unattended supply stops now have an unnamed clerk; existing attendants such as Dena remain in place. Free rest remains available and never refills items. There are no repeatable encounter payouts.

| Purchase | Marks | Effect |
| --- | ---: | --- |
| Bandage | 8 | 24 HP to one living fighter |
| Focus tonic (Chapter Four onward) | 14 | 3 focus to the user or one living ally |
| Field bandage (Chapter Four onward) | 18 | 48 HP to one living fighter |
| Brass reflector / pressure nozzle | 30 each | +3 Attack to Nell / Orrin |
| Reinforced work coat | 15 | +1 Armor |
| Heavy work coat | 25 | +2 Armor, −2 Speed |
| Coastal reflector / sealed pressure nozzle | 46 each | +4 Attack to Nell / Orrin |
| Steady crossbow stock | 44 | +4 Attack to Kit |
| Lined travel coat | 32 | +1 Armor, +1 Speed |

The stronger bandage costs more per HP but restores twice as much with a single action. All medical items target within three hexes, obey cover, cost no focus and consume one main action only after confirmation. They cannot revive, cure story illness or affect reserve characters. Healing/focus caps at the target's maximum; full, fallen, hostile, blocked and unreachable targets do not consume an item. Tonic permits self-use without changing Celia's Rally restrictions.

Battle **Items** replaces the former Bandage command with one menu, showing effects and shared quantities. Selecting an item or cancelling the menu costs nothing. Supply stacks are copied into the battle; victory commits their remaining counts once. Defeat/retry restores the prebattle stock, matching existing bandage behavior. Spent team helpers cannot use items during their movement continuation.

Purchases enter the shared bag and never auto-equip. Fittings are limited to one currently owned copy of each type; coats may be bought for multiple wearers. The shop shows equipment bonuses and spare/owned quantities; Equipment compares fitted stats. Unavailable companions are not advertised. Chapter Three's silver reflector adds Armor over the coastal lens, and its baffled nozzle / ratchet sight add Speed over coastal fittings. Kit's courier sight remains a quicker alternative to the stronger stock.

## Spending curve

These are maximum earned balances **before purchases**, not grants or required savings:

| Checkpoint | Main route | With optional shed |
| --- | ---: | ---: |
| Start | 18 | 18 |
| Escape from Larkspur | 36 | 36 |
| Collector defeated | 62 | 86 |
| Chapter One complete | 102 | 126 |
| Either prison-train approach won | 134 | 158 |
| Cinderbank families boarded | 176 | 200 |
| Petra defeated / Chapter Two complete | 226 | 250 |

The free shed reflector, raid sight and collector coat stay useful loot. Starter spending reduces later balances; players choose whose fitting to improve, how many coats to fit and how much emergency medicine to carry. For example, buying Orrin's 30-mark nozzle after escape leaves six marks. Main-route rewards then fund Nell's coastal reflector at arrival, and the raid/collector payouts fund Orrin's coastal nozzle plus two ordinary bandages, leaving 38 marks before Petra. No optional fight or grinding is needed for that path.

## Selling and persistence

**Sell spare gear** lists only bag copies. Selecting a row previews the exact sale; **Confirm sale** sells one copy. Cancel changes nothing. Worn equipment must first be returned to the bag in Equipment; other wearers' copies are never removed. Bought gear sells for half its purchase price, rounded down. Other equipment returns `max(4, Attack × 4 + Armor × 4 + max(0, Speed) × 2)` marks. Selling never generates a buy/resell profit. The lantern fragment and other story objects are not equipment and cannot enter the sale list. A sold fitting can be repurchased if that counter stocks it and no other owned copy remains.

Transactions and fitting changes autosave. The current version-11 campaign and version-2 inventory retain their existing shapes: basic bandages stay in `bandages`; field-bandage/tonic counts use validated bag entries (0–99). They cannot be put in an equipment slot. No retired save migrations or aliases were added. Dev workshop resources remain isolated.

`rules/consumables.ts` owns fixed item effects and prices, `rules/supplies.ts` owns stock and atomic transactions, and `game/shop.ts` owns the shared counter. `tests/economy.test.ts` checks affordability, sales, capacities, targeting, support strength, action restrictions, save validation and retry/victory persistence. The detailed desktop/phone flow in `tests/e2e/economy-flow.ts` runs in development and production outside the small default CI selection.

## Conduit and medical counter extension

Chapter Three’s medical engine and maintenance bench offer **Browse supplies and trade gear** with the coastal fittings/coats, insulated work coats (48 marks) and balanced saber hilts (58 marks, visible only after Petra joins). The direct 8-mark purchase is correctly labeled ordinary **Bandage**; stronger medicine still starts in Chapter Four. Both counters have the established unnamed supply clerk, preserved by the map exporter.

Medical counters retain bandages, field bandages and tonics and add insulated coats (48), lined travel coats (32) and medic clasps (36, visible only after Celia joins). These are existing stat-only items; loot, manual fitting, ownership limits and free resting retain their behavior. Listed equipment sells for half its purchase price. The clerk’s list and battle costs use the same shared shop rules.

See [headless.md](headless.md) for controlled before/after comparisons: prepared policies now use several hundred marks on actual equipment, while frugal routes still complete. Prices/payouts were not globally raised or cut to force spending.

## Permanent improvements

Airship supply counters offer once-only training per recruited, available character: **+12 max HP for 300 marks**, and **+1 max focus for 450 marks**. Training remains available at the outer mooring, allied capital quay and Chapter Seven's mooring/final refuge. Capacity purchases do not heal or refill; free rest fills the new capacity. Equipment lists completed improvements separately from worn gear.

| Specialist | Unlock | Cost | Permanent effect |
| --- | --- | ---: | --- |
| Hester, Hammerplain | Replacement engines running | 500 | Orrin: movement 2 → 3 |
| Enna, Dawnwatch | Town/watch resolution | 400 | Petra: Shield bash grants 4 Guard, without stacking |
| Sera, Windmere | First night shift complete | 450 | Celia: Heal range +1, including higher ranks |
| Tavi, Iria | Nell treated and river scene complete | 450 | Kit: shallow water/broken ice movement cost 2 → 1; hazards still hurt |
| Orrin, capital preparations | Capital open and Nell recovered | 400 | Nell: 8 Guard at battle start |

Training and improvement providers carry a barbell marker while they have an unlocked, unbought improvement for the recruited roster; providers that also offer rest combine it with the house. Buying the last remaining lesson removes the barbell and training label immediately and after reload, retaining the underlying rest, story or conversation marker. Unaffordable unbought lessons keep their gym marker. Maps previews use the same purchase/quest checks without requiring a campaign roster. Purchased lessons disappear from the menus, and a character’s training choice disappears once both courses are complete. Each remaining purchase has an effect preview, exact price and separate confirmation. **You have … marks** labels the carried balance separately from lesson prices. Completing the last unlearned improvement in the current character, local specialist or crew-specialty list dismisses the dialog. Empty specialist branches and fully completed training offers disappear from supply menus, including Nell’s lantern at the palace/crown/quay and Kit’s river course. Completed benefits remain in Equipment; directly revisiting a finished specialist shows the earned effect without purchase choices. Cancellation, failed purchases and unaffordable unlearned lessons keep the list open. Treatment and quest resolutions remain free. Local services require their own completed quest; Kit's offer works before or after the desert. Nell cannot train while ill or deceased. These bonuses neither occupy equipment slots nor unlock skills.

**Training → Specialist improvements** also offers all five quest-unlocked specialties aboard the airship, at the Chapter Six outer mooring and allied capital quay, and at Chapter Seven’s mooring/final refuge. Allied crews carry the fittings and drill notes forward; the original providers remain in their communities. Each service appears only after its original quest completion and character recruitment. A local purchase and a crew purchase use the same price, bonus and once-only flag. This preserves access after the Chapter Six chart replaces the earlier landings. Kit’s river training and Nell’s lantern housing now travel with these offers too, so completing their quests preserves access after the final crossing. Their later unlocks, Nell’s recovery requirement and both original local providers remain intact.

`rules/improvements.ts` owns the catalogue and atomic transactions. Existing version-11 boolean flags persist purchases; save validation checks their character and quest prerequisites. Shared capacity/ability/movement rules apply the bonuses to targeting, regeneration, consumables, recovery and previews. Isolated workshop profiles retain their own stats.

### Earned Chapter Five check

Starting from `docs/headless/chapter-four-engaged-warden.json`, the prepared defensive route completes all twelve battles with or without improvements. Without purchases it ends with 1,537 marks. The optional purchasing policy prioritizes Orrin's counterbalance, then Celia's endurance and focus courses: 1,250 marks spent, 287 left, with medicine still stocked. The focus course becomes affordable near departure. This is one controlled route, not a claim that every party/build is equally balanced.

Reproduce with `npm run simulate:five -- --from docs/headless/chapter-four-engaged-warden.json --improvements --output /tmp/five-improvements.json`. Omit `--improvements` for the control. Default headless spending remains unchanged. `tests/improvements.simulation.ts` checks the real dialogue purchases and full route outside default CI; `tests/improvements.test.ts` checks transactions and combat rules. Desktop/phone flows are in `tests/e2e/improvements.spec.ts`.
