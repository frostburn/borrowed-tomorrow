# Campaign character inventory

Open **Equipment** from the game menu, or press **I** while exploring. Choose a recruited character, select an item, compare Attack / Armor / Speed and equip it. Each character has a tool-fitting slot and a coat slot. Unequipping returns that copy to the shared bag; swapping returns the previous item. Equipment changes save automatically.

Buying or finding equipment never equips it automatically. One copy protects one wearer. The shared bag lists spare copies and current wearers. Bandages remain a shared combat resource. Nell and Orrin join in Chapter One; only Kit joins in Chapter Two; Celia is saved for later. The workshop’s build editors and storage stay separate.

Iona sells bandages (8 marks), a brass reflector (30), a pressure nozzle (30, once Orrin joins), reinforced work coats (15 each) and a heavy work coat (25). Fittings are sold once per owned type; coats can be bought for individual wearers. A full bag or insufficient funds never consumes money. The optional shed battle awards a brass reflector to the bag once.

Battles use the saved loadouts. The reflector and nozzle add 3 Attack to their owner. A reinforced coat adds 1 Armor. A heavy coat adds 2 Armor and subtracts 2 Speed. Equipment can be changed while exploring or from a campaign victory panel, before continuing. It cannot be changed during an ongoing battle.

Chapter Two travels with Nell, Orrin and Kit. Celia joins during Chapter Four, after her introduction on the sanctuary road. All recruited travelers appear in Equipment, including reserves. Use **Move to reserve** and **Set active** to choose up to three active fighters; Nell leads the party. A full formation requires freeing a place before adding someone. Equipment remains on its wearer when their formation changes, and reserves gain the shared campaign experience. Version-10 saves preserve the recruited roster, active formation and a temporary reunion formation separately.

## Existing saves

Version 10 stores the shared inventory and active formation. Only the current save format is supported; previous campaign versions are not migrated. Continue, manual slots and JSON imports all validate the same current-format data.

- `brass-lantern` becomes one brass reflector, equipped on Nell.
- `work-coats` becomes two reinforced coats, equipped on Nell and Orrin. Orrin’s copy stays reserved if he has not joined yet.

The dev workshop retains its own local storage and cannot grant campaign items or bonuses.

## Chapter Three loot

| Reward | Wearer | Source |
| --- | --- | --- |
| Baffled pressure nozzle | Orrin | Maintenance chest in the capital square |
| Balanced saber hilt | Petra | Her permanent recruitment |
| Silver reflector | Nell | Engine warden victory |
| Ratchet sight | Kit | Optional sealed-stores patrol |
| Insulated work coat | Any companion | Either heart-regulator route |

Each reward enters the shared bag once. Compare and equip it manually in Equipment, including from the victory panel. Chapter Three recruits Petra into the roster; the active formation remains Nell plus at most two companions. Existing equipment remains on its wearer during formation changes.


## Chapter Four equipment and temporary groups

Version 10 adds `reunionParty`, preserving the player's formation while the separated companions lead their own stretches. The inventory opens on the current leader and retains every recruit's loadout. Absent characters can have equipment managed but cannot join that local group. Reunion restores the previous formation, clears `reunionParty`, and makes Celia available in the five-person roster. Three fighters remain the maximum.

| Reward | Wearer | Source | Bonuses |
| --- | --- | --- | --- |
| Counterweighted return valve | Orrin | Either works approach | Attack +5, armor +1 |
| Folding range sight | Kit | Survey-cart patrol | Attack +5, speed +1 |
| Braced rescue coat | Any companion | Protecting the sanctuary-road patients | Armor +3 |
| Silver field clasp | Celia | Right-arch field chest | Attack +3, armor +1, speed +1 |
| Guardian prism | Nell | Sanctuary warden | Attack +5, armor +2 |

Each goes to the bag once; nothing automatically replaces a fitted item. Current-format departures retain their equipment and resources.
