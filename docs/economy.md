# Early campaign economy — issue #106

Chapters One and Two have useful purchases and a shared spare-gear trade counter. Stronger medicine enters shops in Chapter Four. Later chapters offer the medical counter through their existing rest interactions; further equipment progression remains follow-up work on #106.

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
