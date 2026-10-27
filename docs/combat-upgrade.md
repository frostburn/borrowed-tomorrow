# Combat and skill progression

Issue #105 shares the campaign resolver with **Workshop → Combat** (`?dev=combat`). Movement and actions remain separate. Equipment, deployment and victory rules keep their existing behavior.

## Upgrade choices

Each character level after the first grants **one upgrade point per companion**, including reserves. Points are derived from earned level minus purchased ranks, so they can be saved, cannot be awarded twice on reload, and are available to later recruits. Each skill has its own rank and a character-level gate for each upgrade. Learning a new skill also costs one point; level-one starting skills are free.

Choose **Upgrade skills** on the victory panel, the available-points button while exploring, or **Equipment → Skills**. Each character has separate points and saved choices. The cards show current/next effects, skill rank, character-level requirement and why an upgrade is unavailable. Combat buttons have compact rank badges; preview, legality, damage and animation all resolve the chosen rank. Raising the character level does not silently buy skills.

| Character | Compact skill lines |
| --- | --- |
| Nell | Lantern burst, Mend, Dazzle, Horizon light |
| Orrin | Steam lance, Rivet shot, Safety guard, Pressure wave |
| Kit | Quick shot, Feint, Ricochet, Pinning shot |
| Celia | Celestial bolt, Heal, Rally, Sanctuary |
| Petra | Shield bash, Taunt, Saber sweep, Crushing blow |

Strike and Items stay separate from skill upgrades. Items opens one shared bag menu for bandages, field bandages and focus tonics, with quantities and effects; each uses a main action after targeting and confirmation. See [economy.md](economy.md) for the early supply counters. Solo skills have three ranks; team moves have no separate rank or point cost. The longest character command list has eight entries, with team commands omitted when their partner is absent. `rules/skills.ts` is the source for all rank effects and level gates.

Kit can learn Feint at character level two and upgrade it to its one-focus second rank at level three. This gives his two earned points an eligible purchase when he joins at the canonical Chapter Two start; Ricochet, Pinning shot and team-move learning gates retain their later levels.

The themed merges are functional: Nell’s Mend and Celia’s Heal each gain area healing; Celia’s final Heal includes revival. Dimming halo becomes area Dazzle. Steam lance retains its original contiguous four-hex ray at every rank, with increasing damage; Field bracing becomes upgraded Safety guard. Piercing bolt becomes upgraded Quick shot; Volley gives way to the Ricochet line. Driving blow becomes final Crushing blow, while Hold the line becomes final Taunt’s party barrier.

### Lantern burst

| Skill rank | Character level required | Base power | Footprint | Friendly damage |
| --- | ---: | ---: | --- | --- |
| 1 | 1 | 8 | Four touching hexes in a down-right slanted square | Full |
| 2 | 2 | 13 | Target plus six neighbors | Full |
| 3 | 6 | 19 | Target plus six neighbors | Half |

All three cost two focus and aim within five hexes. The first footprint is `aim`, `aim + (1,0)`, `aim + (0,1)`, `aim + (1,1)` in axial coordinates, clipped to the board. Friendly reduction applies after attack, armor, Defend and Dazzle calculations, before barrier absorption. The preview uses the same rounded damage as resolution.

## Team moves

The pairings form **Nell → Orrin → Celia → Petra → Kit → Nell**. Every companion has exactly two partners, and every three-character formation contains at least one pairing.

| Move | Partners | Solo skills | Effect |
| --- | --- | --- | --- |
| Prism lance | Nell + Orrin | Horizon light + Steam lance | Full horizontal prismatic steam lance |
| Falling stars | Orrin + Celia | Rivet shot + Celestial bolt | Stars fall onto a full down-left axis |
| Daybreak | Celia + Petra | Heal + Taunt | Party healing while Petra draws enemy attacks and applies Taunt’s current barriers |
| Crossfire | Petra + Kit | Crushing blow + Ricochet | Shot and saber strike, bouncing to a second enemy |
| Lantern volley | Kit + Nell | Pinning shot + Lantern burst | Enemy-only volley, growing from 7 to 10 to 12 hexes with Pinning shot |

Team moves are derived from their solo skills, never purchased or upgraded separately. Both corresponding solo skills must be learned; rank one suffices. Upgrading either solo improves its contribution. Prism lance first becomes possible when Nell learns Horizon light (character level seven); Lantern volley waits for Kit’s Pinning shot (also level seven). These are the solo skills’ existing learning gates, with no extra team rank or character-level requirement. Either partner may initiate. Both must be alive in the current battle, have an unspent main action and have three focus. **There is no distance or line-of-sight requirement between teammates.** The attack itself still follows its targeting rules. Confirmation spends both main actions and three focus each. The initiator finishes their turn as usual. An assisting partner with unused movement stays at their original initiative position for a movement-only turn: move once (which ends that turn), or End turn (F). Someone who already moved, is anchored or has no movement gets no extra move. No further attack, Shield bash, Wait, Defend bonus or focus refill is granted. Pin still limits the remaining move and clears when it finishes; old defense/Taunt ends when the shared action is spent. A newly applied Daybreak Taunt lasts through this movement continuation and ends at Petra’s next normal main turn. Waiting before teaming preserves eligibility; a spent main action does not, even when its owner is still queued for movement.

Team damage sums the actual solo attack contributions. Each contribution retains its own ranked power, attack bonus, armor piercing, Dazzle, friendly-fire reduction, defense calculation and rounding; the target's barrier absorbs the total once. Solo targeting restrictions and bonus effects do not become additional team requirements or effects. Daybreak uses Celia’s Heal strength at her own rank and character level, and Petra’s actual Taunt: every living enemy targets Petra until her next turn. Taunt rank one has no barrier; rank two wards Petra; rank three wards the living party. Barriers scale with Petra’s level and preserve stronger existing wards. Daybreak can be useful at full HP because of Taunt/guard; it does not revive. Lantern volley adds both solo damage contributions but targets enemies only; it does not inherit Pinning shot’s pin effect. Its screen-facing footprint follows **Kit’s Pinning shot rank**, regardless of who initiates: rank one is a seven-hex ball; rank two adds `(2,-1) (2,0) (1,1)` relative to the aim for ten contacts; rank three adds `(-1,2) (0,2)` for twelve. Nell’s Burst rank improves her damage contribution without enlarging the volley. The final footprint retains the accepted staggered 3/4/3/2 rows on either row parity. Only board edges clip it. `hex.lanternVolley` supplies preview, targets, fixture damage and effects, using the actual contributors even after their shared action is spent. Crossfire inherits Kit's current Ricochet range and bounce reach for either initiator. Preview and resolution share these calculations.

Full-width attacks exclude both operators, can hit another ally and damage multi-contact enemies once. Team commands disappear when a same-side partner is absent. Commands remain gray and inspectable when a partner has acted, is down, lacks focus or has not learned their required solo skill. Selecting one names the unavailable fighter and reason in the fixed confirmation area, where it stays visible even with a scrolled menu; it never offers confirmation. Shortcuts follow the filtered list. The skill-upgrade screen only describes combinations with **already recruited** characters, so later party members remain unspoiled.

A shared wind-up and both actors' attack poses show cooperation. `game/battle-team-effects.ts` gives each move its own effect on the actual affected footprint: Falling stars descends from above into landing flares; Prism lance uses separated prismatic planes and steam; Crossfire combines bolt bounces with crossing saber strokes; Daybreak spreads dawn light while Petra raises her shield, showing barriers only where her Taunt rank grants them; Lantern volley sends lantern-lit bolts into the selected ranked area. Enemy relays fire arcing shots from both operators. Shared animation timings align the HP/terrain reveal with contact. The effect container survives the impact redraw, is cleaned up with the battle and respects reduced motion. Falling stars has its own falling/landing sound.

## Other geometry and support

Steam lance is a contiguous four-hex ray from Orrin in one of six directions at every rank; it stops before cover and can hit allies. Its powers are 16/21/28 at character-level gates 1/4/9. Caster-originating straight rays remain valid solo attacks. Nell’s Horizon light follows spaced hex diagonals between those axes: center contacts are two steps apart, starting at a vertex adjoining her hex and stopping at the first cover contact. That contact can damage breakable cover. Full-width axes through freely selected distant rows remain exclusive to teams.

Ricochets select the nearest distinct visible second enemy; ties resolve by enemy ID. Rank controls reach and power. They never bounce into another part of the same boss. Pinning shot limits mobile enemies to one movement for their next main action; anchored bosses resist pin. Shield bash stays a zero-damage optional extra action, once per turn. Its later ranks remove the focus cost and then push all adjacent enemies. Dazzle remains a three-attack effect and is never refreshed while active.

Healing adds `2 × (character level − 1)` to ranked base power. Barriers add `floor(1.5 × (character level − 1))`. Weapon damage never inflates support. Barriers keep the strongest value instead of stacking. Bandages remain fixed at 24 HP; ranked Rally restores focus only to other allies.

Celia’s rank-three Heal requires character level ten. It heals living allies in the area, clears Dazzle/pin, and can restore **one fallen ally at the clear center** to 35% maximum HP. The revived character acts next round and cannot retaliate immediately. A blocked or occupied center cannot revive anyone. This affects only units already in that battle, never reserves, story illness or permanent story deaths. Nell’s Mend does not revive. Heal has its own skill ID and level gates (1/3/10), distinct from Nell’s Mend (2/5/10). Final Taunt combines enemy targeting with level-scaled party barriers.

## Battlefield objects and enemy teams

Timber barricades block movement and sight until broken. Pressure drums explode when destroyed, damage either side, respect armor/Defend/barriers/sealed bodies, and can trigger other drums. Multi-contact enemies are hit once per explosion. Props do not affect victory conditions.

Strike or shoot a brass valve with an ordinary damaging attack to toggle its connected steam vents. Area attacks trigger it once per cast. There is no separate valve command. The resilient wheel remains usable for later hits. Support and zero-damage Shield bash do not toggle it. Confirmation names the change, mint outlines mark connected vents separately from the orange damage footprint, and the wheel animates at impact. Toggling does not itself damage distant vent occupants. Existing round-end vent damage and flying immunity remain.

The Chapter One shed introduces cover; Chapter Two’s loading gate has a valve; Hammerplain’s freight lift/store add pressure drums and more terrain. The freight lift and Windmere water lift also contain coordinated enemies. One guardian/crow pair warns for an entire odd round before firing its shared barrage on the even round, using the sum of Steam lance and Cinder peck damage and spending both pending actions and two focus each. The assisting machine may then reposition on its initiative, without another attack or Defend/focus bonus. **Enemy teams also have no spacing or sight requirement between partners.** Defeating either operator interrupts the barrage. Ordinary boss patterns remain independent.

## Persistence and review

Campaign saves are now **version 11**, storing every character’s skill ranks. Workshop character records are **version 3**, under `borrowed-tomorrow:character-workshop:v3`; inventory records remain version 2. Only current formats are read, in accordance with the repository policy. Version-10 campaign saves and previous workshop character records are not migrated. Canonical dev starts contain validated authored skill allocations; they never read a workshop build.

Changing a workshop character’s level installs a balanced authored build. **Reset skill choices** retains level, stats and equipment while returning that character’s points for manual allocation. Practice never changes campaign choices. Combat presets exercise the shared rules; **Practice Revive** demonstrates Celia’s final Heal. Lantern volley presets at character levels 7 / 10 / 13 demonstrate Pinning shot ranks 1 / 2 / 3 and coverage of 7 / 10 / 12 hexes. Detailed desktop/phone journeys and skill checks remain outside the small default CI gate. Browser plugin not available in the task environment; local QA uses Playwright.

## Chapter Five boss pressure

Windmere's ward engine has two ordinary Slag crow guards in staggered lanes. Its lit projection still cancels the current beam and exposes the core; projections remain passive, and destroying the core stops the guards too. Once both projections are gone, the weaker crossbeam sights a living hero at the next round boundary and crosses two hex axes. The Chapter Seven reprise keeps its separate pattern; `wardTracking` is explicit encounter data.

Alban's two boarders have 98 HP, matching the earlier shield troops, and start on different rows. Each battery sights its nearest living hero when announcing the next raking axis or bombardment. The bridge rotates its target; after both batteries fall its broadside crosses two axes through that target. All announced cells remain fixed until the next round. Gun destruction stays permanent, and bridge destruction ends boarding.

The cores/batteries, their attack power, rewards and party abilities are unchanged. Ordinary Taunt, Dazzle, guard, movement and healing remain counters; Taunt still concentrates a warning on Petra rather than being bypassed by the targeting change.

## Later bosses: direct attacks (#137)

From Chapter Five onward, the large patterned bosses also fire one lighter single-target attack before their marked main attack. Only the flagship's bridge gets the extra shot; its batteries and boarding marines keep their existing actions. Chapter Seven's four machine/dragon reprises and all three Benefactor forms share the same rule. Earlier chapters and passive components keep their existing actions.

The direct attack chooses a living fighter at firing time, rotating in party order each round rather than seeking the lowest HP. It reaches its target regardless of movement or cover. The movement hint names the expected target and shot; Taunt overrides that choice. Dodging still avoids the heavier area attack. Defend, barriers, Dazzle, healing and Taunt answer the lighter shot. Each shot and main attack independently uses armor, absorbs guard and consumes one of Dazzle's three attacks.

| Boss | Direct attack | Base power, before the boss's existing bonus and defenses |
| --- | --- | ---: |
| Furnace carrier / harvest keeper | Slag shot | 9 |
| Ward engines | Needle ray | 10 |
| Flagship bridge | Covering shot | 11 |
| Sun serpent | Sun shard | 10 |
| Winter dragons | Ice shard | 12 |
| Imperial vessel | Crown bolt | 12 |
| Lightbearer | Lantern splinter | 11 |
| First collector | Pressure bolt | 9 |
| Benefactor, all forms | Claimed light | 14 |

The extra cast uses the existing once-per-turn bonus allowance and leaves the same fighter queued for its main action, with separate animations and one affected hex. It never replaces, re-aims or widens a fixed warning, or creates glass, ice or hot-metal floor damage. The carrier still follows its legal movement path before pouring. Breaking the ward's lit projection interrupts **both** attacks without spending Dazzle. Imperial/Lightbearer/Benefactor fourth-round pauses stay completely quiet. Boss death and normal victory conditions remain unchanged.

`rules/boss-direct.ts` owns assignment, rotating targets and the bonus turn. `game/boss-direct-effect.ts` draws small aimed projectiles and the lens ray, separately from the main area effect. The opt-in `scripts/compare-late-bosses.mjs` compares authored late-game fixtures and three consecutive final forms using ordinary combat/victory recovery; these probes do not claim an earned Chapter Six/Seven playthrough.
