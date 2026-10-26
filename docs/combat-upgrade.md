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
| Celia | Celestial bolt, Mend, Rally, Sanctuary |
| Petra | Shield bash, Taunt, Saber sweep, Crushing blow |

Strike and Bandage stay separate. Solo skills have three ranks; team moves have no separate rank or point cost. The longest character list has eight abilities, with team commands omitted when their partner is absent. `rules/skills.ts` is the source for all rank effects and level gates.

The themed merges are functional: Beacon becomes area Mend; Celia’s final Mend includes revival. Dimming halo becomes area Dazzle. Pressure seam becomes upgraded Steam lance; Field bracing becomes upgraded Safety guard. Piercing bolt becomes upgraded Quick shot; Volley gives way to the Ricochet line. Driving blow becomes final Crushing blow, while Hold the line becomes final Taunt’s party barrier.

### Lantern burst

| Skill rank | Character level required | Base power | Footprint | Friendly damage |
| --- | ---: | ---: | --- | --- |
| 1 | 1 | 8 | Four touching hexes in a down-right slanted square | Full |
| 2 | 2 | 13 | Target plus six neighbors | Full |
| 3 | 6 | 19 | Target plus six neighbors | Half |

All three cost two focus and aim within five hexes. The first footprint is `aim`, `aim + (1,0)`, `aim + (0,1)`, `aim + (1,1)` in axial coordinates, clipped to the board. Friendly reduction applies after attack, armor, Defend and Dazzle calculations, before barrier absorption. The preview uses the same rounded damage as resolution.

## Team moves

| Move | Partners | Solo skills | Effect |
| --- | --- | --- | --- |
| Falling stars | Celia + Orrin | Celestial bolt + Rivet shot | Stars fall onto a full down-left axis |
| Prism lance | Nell + Orrin | Lantern burst + Steam lance | Full horizontal prismatic steam lance |
| Crossfire | Kit + Petra | Ricochet + Crushing blow | Shot and saber strike, bouncing to a second enemy |
| Daybreak | Nell + Celia | Mend + Mend | Party healing and barriers |

Team moves are derived from their solo skills, never purchased or upgraded separately. Both corresponding solo skills must be learned; rank one suffices. Upgrading either solo improves its contribution. Either partner may initiate. Both must be alive in the current battle, have an unspent main action and have three focus. **There is no distance or line-of-sight requirement between teammates.** The attack itself still follows its targeting rules. Confirmation spends both turns and three focus each; waiting preserves eligibility, while an already spent turn does not. Both return normally next round. A consumed partner’s defense, pin and Taunt duration end with that turn.

Team damage sums the actual solo attack contributions. Each contribution retains its own ranked power, attack bonus, armor piercing, Dazzle, friendly-fire reduction, defense calculation and rounding; the target's barrier absorbs the total once. Solo targeting restrictions and bonus effects do not become additional team requirements or effects. Daybreak sums each caster's Mend healing at their own rank and character level, retaining its existing non-stacking party barrier; it does not revive. Crossfire inherits Kit's current Ricochet range and bounce reach for either initiator. Preview and resolution share these calculations.

Full-width attacks exclude both operators, can hit another ally and damage multi-contact enemies once. Team commands disappear when a same-side partner is absent. Commands remain gray and inspectable when a partner has acted, is down, lacks focus or has not learned their required solo skill. Selecting one names the unavailable fighter and reason; it never offers confirmation. Shortcuts follow the filtered list. The skill-upgrade screen only describes combinations with **already recruited** characters, so later party members remain unspoiled.

A shared wind-up and both actors' attack poses show cooperation. `game/battle-effects.ts` renders the actual affected footprint; team effects must retain each move's identity rather than falling through to a generic beam.

## Other geometry and support

Horizon light and upgraded Steam lance are caster-originating hex-diagonal rays, between the ordinary hex axes. Their center contacts are two hex-steps apart; the ray starts at a vertex adjoining the caster’s hex and stops at the first cover contact. That contact can damage breakable cover. Cells beside the ray are not affected. Full-width axes belong only to teams.

Ricochets select the nearest distinct visible second enemy; ties resolve by enemy ID. Rank controls reach and power. They never bounce into another part of the same boss. Pinning shot limits mobile enemies to one movement for their next main action; anchored bosses resist pin. Shield bash stays a zero-damage optional extra action, once per turn. Its later ranks remove the focus cost and then push all adjacent enemies. Dazzle remains a three-attack effect and is never refreshed while active.

Healing adds `2 × (character level − 1)` to ranked base power. Barriers add `floor(1.5 × (character level − 1))`. Weapon damage never inflates support. Barriers keep the strongest value instead of stacking. Bandages remain fixed at 24 HP; ranked Rally restores focus only to other allies.

Celia’s rank-three Mend requires character level ten. It heals living allies in the area, clears Dazzle/pin, and can restore **one fallen ally at the clear center** to 35% maximum HP. The revived character acts next round and cannot retaliate immediately. A blocked or occupied center cannot revive anyone. This affects only units already in that battle, never reserves, story illness or permanent story deaths. Nell’s Mend does not revive. Final Taunt combines enemy targeting with level-scaled party barriers.

## Battlefield objects and enemy teams

Timber barricades block movement and sight until broken. Pressure drums explode when destroyed, damage either side, respect armor/Defend/barriers/sealed bodies, and can trigger other drums. Multi-contact enemies are hit once per explosion. Props do not affect victory conditions.

Strike or shoot a brass valve with an ordinary damaging attack to toggle its connected steam vents. Area attacks trigger it once per cast. There is no separate valve command. The resilient wheel remains usable for later hits. Support and zero-damage Shield bash do not toggle it. Confirmation names the change, mint outlines mark connected vents separately from the orange damage footprint, and the wheel animates at impact. Toggling does not itself damage distant vent occupants. Existing round-end vent damage and flying immunity remain.

The Chapter One shed introduces cover; Chapter Two’s loading gate has a valve; Hammerplain’s freight lift/store add pressure drums and more terrain. The freight lift and Windmere water lift also contain coordinated enemies. One guardian/crow pair warns for an entire odd round before firing its shared barrage on the even round, using the sum of Steam lance and Cinder peck damage and consuming both pending actions and two focus each. **Enemy teams also have no spacing or sight requirement between partners.** Defeating either operator interrupts the barrage. Ordinary boss patterns remain independent.

## Persistence and review

Campaign saves are now **version 11**, storing every character’s skill ranks. Workshop character records are **version 3**, under `borrowed-tomorrow:character-workshop:v3`; inventory records remain version 2. Only current formats are read, in accordance with the repository policy. Version-10 campaign saves and previous workshop character records are not migrated. Canonical dev starts contain validated authored skill allocations; they never read a workshop build.

Changing a workshop character’s level installs a balanced authored build. **Reset skill choices** retains level, stats and equipment while returning that character’s points for manual allocation. Practice never changes campaign choices. Combat presets exercise the shared rules; **Practice Revive** demonstrates Celia’s final Mend. Detailed desktop/phone journeys and skill checks remain outside the small default CI gate. Browser plugin not available in the task environment; local QA uses Playwright.
