# Campaign character inventory

Open **Equipment** from the game menu, or press **I** while exploring. Choose a recruited character, select an item, compare Attack / Armor / Speed and equip it. Each character has a tool-fitting slot and a coat slot. Unequipping returns that copy to the shared bag; swapping returns the previous item. Equipment changes save automatically.

Buying or finding equipment never equips it automatically. One copy protects one wearer. The shared bag lists spare copies and current wearers. Bandages remain a shared combat resource. Nell and Orrin join in Chapter One; Kit and Celia join in Chapter Two. The workshop’s build editors and storage stay separate.

Iona sells bandages (8 marks), a brass reflector (30), a pressure nozzle (30, once Orrin joins), reinforced work coats (15 each) and a heavy work coat (25). Fittings are sold once per owned type; coats can be bought for individual wearers. A full bag or insufficient funds never consumes money. The optional shed battle awards a brass reflector to the bag once.

Battles use the saved loadouts. The reflector and nozzle add 3 Attack to their owner. A reinforced coat adds 1 Armor. A heavy coat adds 2 Armor and subtracts 2 Speed. Equipment can be changed while exploring or from a campaign victory panel, before continuing. It cannot be changed during an ongoing battle.

Chapter Two recruits Kit and Celia. All recruited travelers appear in Equipment, including reserves. Use **Move to reserve** and **Set active** to choose up to three active fighters; Nell leads the party. A full formation requires freeing a place before adding someone. Equipment remains on its wearer when their formation changes, and reserves gain the shared campaign experience. Version-7 saves preserve the recruited roster and active formation separately. Version-6 imports keep their existing party active.

## Existing saves

Version 7 retains version 6’s `inventory` and adds the active formation. Version-5 and version-6 saves remain loadable through Continue, manual slots and JSON import. Their story flags, resources, HP/focus, location, journal, play time and chapter boundary are preserved.

- `brass-lantern` becomes one brass reflector, equipped on Nell.
- `work-coats` becomes two reinforced coats, equipped on Nell and Orrin. Orrin’s copy stays reserved if he has not joined yet.

Migration runs once: subsequent saves store the converted inventory, and reloading does not grant additional copies. Versions 1–4 remain previous-story saves, available to export but not load into this campaign. The dev workshop retains its own local storage and cannot grant campaign items or bonuses.
