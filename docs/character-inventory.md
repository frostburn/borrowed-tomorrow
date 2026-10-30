# Equipment and party management

Open **Equipment** from the game menu, or press **I** while exploring. Choose a recruited character, select an item, compare Attack / Armor / Speed and equip it. Each character has a tool-fitting slot and a coat slot. Unequipping returns that copy to the shared bag; swapping returns the previous item. Equipment changes save automatically.

Buying or finding equipment never equips it automatically. One copy protects one wearer. The shared bag lists spare copies and current wearers. Medicine is shared through the battle Items menu. The workshop’s build editors and storage stay separate.

Iona sells bandages (8 marks), a brass reflector (30), a pressure nozzle (30, once Orrin joins), reinforced work coats (15 each) and a heavy work coat (25). Chapter Two’s engine, ward and medical-coach counters add coastal fittings and lined travel coats. Field bandages (48 HP, 18 marks) and focus tonics (3 focus, 14 marks) enter shops in Chapter Four. **Sell spare gear** trades one bag copy after confirmation; worn gear stays equipped. See [economy.md](economy.md) for prices and the spending curve. Fittings are sold once per owned type; coats can be bought for individual wearers. A full bag or insufficient funds never consumes money. The optional shed battle awards a brass reflector to the bag once.

Battles use the saved loadouts. The reflector and nozzle add 3 Attack to their owner. A reinforced coat adds 1 Armor. A heavy coat adds 2 Armor and subtracts 2 Speed. Equipment can be changed while exploring or from a campaign victory panel, before continuing. It cannot be changed during an ongoing battle.

Chapter Two travels with Nell, Orrin and Kit. Celia joins during Chapter Four, after her introduction at the Breakwater pump house. All recruited travelers appear in Equipment, including reserves. Use **Move to reserve** and **Set active** to manage one to three available fighters. Before her Chapter Five illness, Nell must remain active and leads the party; afterward the first active fighter leads if she is absent. A full formation requires freeing a place before adding someone. Equipment remains on its wearer when their formation changes, and reserves gain the shared campaign experience. Version-11 saves preserve the recruited roster and active formation separately.

## Skills and permanent training

**Skills** in Equipment shows current effects and the next automatic milestone.
Characters learn and improve skills as they level up, including reserves and later
recruits. Victory results name new skills and rank improvements. There are no
upgrade points to spend. Team moves derive from two learned solo skills.
See [combat-upgrade.md](combat-upgrade.md) for the progression table.

Later supply clerks offer generic training and quest-unlocked specialist
improvements. Each course is a once-only purchase, independent of equipment.
A barbell marks training providers; completing both generic courses dims the
character's name. Travelling counters carry unlocked specialties through the
last chapter. See [economy.md](economy.md) for providers and prices.

## Existing saves

Version 11 stores the shared inventory, active formation and automatic skill snapshots (recalculated from level on load). Field-bandage and tonic stacks are validated bag entries; basic bandages retain their separate counter. Only the current save format is supported; previous campaign versions are not migrated. Continue, manual slots and JSON imports all validate the same current-format data.

The dev workshop retains its own local storage and cannot grant campaign items or bonuses.

## Campaign reward examples — spoilers

### Chapter Three loot

| Reward | Wearer | Source |
| --- | --- | --- |
| Baffled pressure nozzle | Orrin | Northglass maintenance chest |
| Balanced saber hilt | Petra | Her permanent recruitment |
| Silver reflector | Nell | Engine warden victory |
| Ratchet sight | Kit | Optional sealed-stores patrol |
| Insulated work coat | Any companion | Either heart-regulator route |

Each reward enters the shared bag once. Compare and equip it manually in Equipment, including from the victory panel. Chapter Three recruits Petra into the roster; the active formation is Nell plus at most two companions until her Chapter Five Act IV illness. While she is ill, choose one to three of the other companions; Nell keeps her equipment and can be inspected/refitted, but cannot be set active. Rest and victory do not cure her. The optional Chapter Six Iria quest restores her availability. Recovery preserves the current formation rather than forcing her back into it. Existing equipment remains on its wearer during formation changes.


### Chapter Four equipment and formation

The rewritten Chapter Four keeps the four-person roster and the player's active formation from Chapter Three. Celia joins at the harbor, initially in reserve when three are active. Normal Equipment swaps remain available throughout. No temporary groups or reunion formation is stored; Nell continues to lead. The three-fighter cap is a game mechanic.

Once-only bag rewards are Orrin's return valve (either gate route), Kit's folding sight (survey cart), a rescue coat (sanctuary bridge), Celia's field clasp (hospice chest) and Nell's guardian prism (warden). Skipping the cart/chest never blocks progress. Existing individual HP, focus and loadouts persist into the chapter and its anchor departure. Reserves retain their equipment and share growth/recovery.

## Reward feedback

Tool fittings show their character’s name in rewards, shops and the bag instead
of copy counts. Shared coats and consumables keep their counts. Reward icons
name the loot; victory prose focuses on the scene and next objective.

The first new piece of gear that an available recruited companion can equip
shows **Equip gear to use its bonuses** with **Equip now**. This opens Equipment
with that companion and item selected; fitting is still manual. Battles offer it inline; shops show a separate post-purchase dialog with
Equip now and Keep shopping; exploration finds wait until dialogue/cutscenes finish.
The current save’s `equipmentHintSeen` flag prevents repeats after later loot or
reloads. Consumables, failed/capped rewards, equipment transfers and gear for
unavailable/unrecruited characters do not consume the hint. Loading a bag alone
does not trigger it. Workshop storage stays separate.
