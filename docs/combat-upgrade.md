# Combat and skill progression

Issue #105 shares the campaign resolver with **Workshop → Combat** (`?dev=combat`). Movement and actions remain separate. Equipment, deployment and victory rules keep their existing behavior.

## Upgrade choices

Each character level after the first grants **one upgrade point per companion**, including reserves, until that companion has earned enough to buy every rank (11 points; 10 for Celia, who starts with two free skills). Points are derived from this capped level allowance minus purchased ranks, so they can be saved, cannot be awarded twice on reload, and are available to later recruits. Each skill has its own rank and a character-level gate for each upgrade. Learning a new skill also costs one point; level-one starting skills are free.

Choose **Upgrade skills** on the victory panel, the spendable-points button while exploring, or **Equipment → Skills**. Each character has separate points and saved choices. The cards show current/next effects, skill rank, character-level requirement and why an upgrade is unavailable. Combat buttons have compact rank badges; preview, legality, damage and animation all resolve the chosen rank. Raising the character level does not silently buy skills.

| Character | Compact skill lines |
| --- | --- |
| Nell | Lantern burst, Mend, Dazzle, Horizon light |
| Orrin | Steam lance, Rivet shot, Safety guard, Pressure wave |
| Kit | Quick shot, Feint, Ricochet, Pinning shot |
| Celia | Celestial bolt, Heal, Rallying cry, Sanctuary |
| Petra | Shield bash, Taunt, Saber sweep, Crushing blow |

Strike and Items stay separate from skill upgrades. Items opens one shared bag menu for bandages, field bandages and focus tonics, with quantities and effects; each uses a main action after targeting and confirmation. See [economy.md](economy.md) for the early supply counters. Solo skills have three ranks; team moves have no separate rank or point cost. The longest character command list has eight entries, with team commands omitted when their partner is absent. `rules/skills.ts` is the source for all rank effects and level gates.

The exploration/victory shortcut appears only when an available companion can buy an upgrade now; its count excludes points waiting behind level gates. Equipment → Skills remains available for review. The shared campaign/workshop cards distinguish banked points, show the next character level that permits an upgrade, and replace surplus counts with **All skills mastered** when finished. Character tabs mark banked points and mastery too. Opening the shortcut selects a companion who can spend; opening Skills from Equipment preserves the selected character.

Current-format saves retain all purchased ranks. Point balances are derived, not stored, so no migration/reset is needed. Canonical builds still spend their available points and may bank one point ahead of a late gate; that is distinct from permanent surplus after mastery.

| Skill | Previous character-level gates | Current gates |
| --- | --- | --- |
| Kit — Feint | 2 / 3 / 10 | 2 / 3 / 6 |
| Kit — Ricochet | 5 / 8 / 12 | 5 / 8 / 11 |
| Celia — Celestial bolt | 1 / 6 / 11 | 1 / 4 / 7 |
| Celia — Sanctuary | 5 / 9 / 12 | 5 / 8 / 12 |

These earlier upgrades fill the long blocked stretches without adding ranks or changing their effects. First-learning gates, team unlocks, level-ten revival/party Rally, and level-thirteen Pinning shot remain unchanged. Kit can spend every earned point through level eleven; Celia through level eight. Short waits for later upgrades are still explicit, with banked points preserved.

Kit can learn Feint at character level two and upgrade it to its one-focus second rank at level three. This gives his two earned points an eligible purchase when he joins at the canonical Chapter Two start; Ricochet, Pinning shot and team-move learning gates retain their later levels.

The themed merges are functional: Nell’s Mend and Celia’s Heal each gain area healing; Celia’s final Heal includes revival. Dimming halo becomes area Dazzle. Steam lance retains its original contiguous four-hex ray at every rank, with increasing damage; Field bracing becomes upgraded Safety guard. Piercing bolt becomes upgraded Quick shot; Volley gives way to the Ricochet line. Driving blow becomes final Crushing blow, while Hold the line becomes final Taunt’s party barrier.

### Lantern burst

| Skill rank | Character level required | Base power | Footprint | Friendly damage |
| --- | ---: | ---: | --- | --- |
| 1 | 1 | 8 | Four touching hexes in a down-right slanted square | Full |
| 2 | 2 | 12 | Target plus six neighbors | Full |
| 3 | 6 | 17 | Target plus six neighbors | Half |

All three cost two focus and aim within five hexes. The first footprint is `aim`, `aim + (1,0)`, `aim + (0,1)`, `aim + (1,1)` in axial coordinates, clipped to the board. Friendly reduction applies after attack, armor, Defend and Dazzle calculations, before barrier absorption. The preview uses the same rounded damage as resolution.

## Team moves

The output tradeoff from #136 applies to damaging teams on **both sides**, including enemy relays, and to Daybreak’s healing and barriers. Each solo contribution still resolves its own armor, piercing, defense and Dazzle; only then is their total multiplied by 9/10 and rounded down. Guard absorbs that reduced total once. Friendly fire and fixture damage use the same reduction. Healing is reduced before missing-HP capping; barriers never overwrite stronger protection. Caps or full absorption can make observed outcomes tie. Costs, learning gates, range, footprints and the helper’s remaining movement are unchanged.

The pairings form **Nell → Orrin → Celia → Petra → Kit → Nell**. Every companion has exactly two partners, and every three-character formation contains at least one pairing.

| Move | Partners | Solo skills | Effect |
| --- | --- | --- | --- |
| Prism lance | Nell + Orrin | Horizon light + Steam lance | Full horizontal prismatic steam lance |
| Falling stars | Orrin + Celia | Rivet shot + Celestial bolt | Stars fall onto a full down-left axis |
| Daybreak | Celia + Petra | Heal + Taunt | Party healing while Petra draws enemy attacks and applies Taunt’s current barriers |
| Crossfire | Petra + Kit | Crushing blow + Ricochet | Shot and saber strike, bouncing to a second enemy |
| Lantern volley | Kit + Nell | Pinning shot + Lantern burst | Enemy-only volley, growing from 7 to 10 to 12 hexes with Pinning shot |

Team moves are derived from their solo skills, never purchased or upgraded separately. Both corresponding solo skills must be learned; rank one suffices. Upgrading either solo improves its contribution. Prism lance first becomes possible when Nell learns Horizon light (character level seven); Lantern volley waits for Kit’s Pinning shot (also level seven). These are the solo skills’ existing learning gates, with no extra team rank or character-level requirement. Either partner may initiate. Both must be alive in the current battle, have an unspent main action and have three focus. **There is no distance or line-of-sight requirement between teammates.** The attack itself still follows its targeting rules. Confirmation spends both main actions and three focus each. The initiator finishes their turn as usual. An assisting partner with unused movement stays at their original initiative position for a movement-only turn: move once (which ends that turn), or End turn (F). Someone who already moved, is anchored or has no movement gets no extra move. No further attack, Shield bash, Wait, Defend bonus or focus refill is granted. Pin still limits the remaining move and clears when it finishes; old defense/Taunt ends when the shared action is spent. A newly applied Daybreak Taunt lasts through this movement continuation and ends at Petra’s next normal main turn. Waiting before teaming preserves eligibility; a spent main action does not, even when its owner is still queued for movement.

Team damage takes **90% of the two actual solo attack contributions, rounded down**, before barrier absorption (#136). Separate actions therefore deliver about 11% more output when they can hit the same targets. Teaming buys immediate access to the partner’s action and its shared footprint; it can still win on total damage by hitting more targets. Each contribution retains its own ranked power, attack bonus, armor piercing, Dazzle, friendly-fire reduction, defense calculation and rounding; the target's barrier absorbs the total once. Solo targeting restrictions and bonus effects do not become additional team requirements or effects. Daybreak uses 90% of Celia’s Heal strength at her own rank and character level, and Petra’s actual Taunt: every living enemy targets Petra until her next turn. Taunt rank one has no barrier; rank two wards Petra; rank three wards the living party. Daybreak barriers take 90% of the level-scaled solo Taunt ward, rounded down, and preserve stronger existing wards. Daybreak can be useful at full HP because of Taunt/guard; it does not revive. Lantern volley takes 90% of both solo damage contributions but targets enemies only; it does not inherit Pinning shot’s pin effect. Its screen-facing footprint follows **Kit’s Pinning shot rank**, regardless of who initiates: rank one is a seven-hex ball; rank two adds `(2,-1) (2,0) (1,1)` relative to the aim for ten contacts; rank three adds `(-1,2) (0,2)` for twelve. Nell’s Burst rank improves her damage contribution without enlarging the volley. The final footprint retains the accepted staggered 3/4/3/2 rows on either row parity. Only board edges clip it. `hex.lanternVolley` supplies preview, targets, fixture damage and effects, using the actual contributors even after their shared action is spent. Crossfire inherits Kit's current Ricochet range and bounce reach for either initiator. Preview and resolution share these calculations.

Full-width attacks exclude both operators, can hit another ally and damage multi-contact enemies once. Team commands disappear when a same-side partner is absent. Commands remain gray and inspectable when a partner has acted, is down, lacks focus or has not learned their required solo skill. Selecting one names the unavailable fighter and reason in the fixed confirmation area, where it stays visible even with a scrolled menu; it never offers confirmation. Shortcuts follow the filtered list. The skill-upgrade screen only describes combinations with **already recruited** characters, so later party members remain unspoiled.

A shared wind-up and both actors' attack poses show cooperation. `game/battle-team-effects.ts` gives each move its own effect on the actual affected footprint: Falling stars descends from above into landing flares; Prism lance uses separated prismatic planes and steam; Crossfire combines bolt bounces with crossing saber strokes; Daybreak spreads dawn light while Petra raises her shield, showing barriers only where her Taunt rank grants them; Lantern volley sends lantern-lit bolts into the selected ranked area. Enemy relays fire arcing shots from both operators. Shared animation timings align the HP/terrain reveal with contact. The effect container survives the impact redraw, is cleaned up with the battle and respects reduced motion. Falling stars has its own falling/landing sound.

## Other geometry and support

Steam lance is a contiguous four-hex ray from Orrin in one of six directions at every rank; it stops before cover and can hit allies. Its powers are 16/21/28 at character-level gates 1/4/9. Caster-originating straight rays remain valid solo attacks. Nell’s Horizon light follows spaced hex diagonals between those axes: center contacts are two steps apart, starting at a vertex adjoining her hex and stopping at the first cover contact. That contact can damage breakable cover. Full-width axes through freely selected distant rows remain exclusive to teams.

Ricochets select the nearest distinct visible second enemy; ties resolve by enemy ID. Rank controls reach and power. They never bounce into another part of the same boss. Pinning shot limits mobile enemies to one movement for their next main action; anchored bosses resist pin. Shield bash stays a zero-damage optional extra action, once per turn. Its later ranks remove the focus cost and then push all adjacent enemies. Dazzle remains a three-attack effect and is never refreshed while active.

Healing adds `2 × (character level − 1)` to ranked base power. Barriers add `floor(1.5 × (character level − 1))`. Weapon damage never inflates support. Barriers keep the strongest value instead of stacking. Bandages remain fixed at 24 HP; Rallying cry increases normal turn-start focus regeneration instead of restoring focus immediately.

Celia’s rank-three Heal requires character level ten. It heals living allies in the area, clears Dazzle/pin, and can restore **one fallen ally at the clear center** to 35% maximum HP. The revived character acts next round and cannot retaliate immediately. A blocked or occupied center cannot revive anyone. This affects only units already in that battle, never reserves, story illness or permanent story deaths. Nell’s Mend does not revive. Heal has its own skill ID and level gates (1/3/10), distinct from Nell’s Mend (2/5/10). Final Taunt combines enemy targeting with level-scaled party barriers.

## Battlefield objects and enemy teams

Timber barricades block movement and sight until broken. Pressure drums explode when destroyed, damage either side, respect armor/Defend/barriers/sealed bodies, and can trigger other drums. Multi-contact enemies are hit once per explosion. Props do not affect victory conditions.

Brass valves start closed. Strike or shoot one with an ordinary damaging attack to open its connected steam vents and immediately deal six damage to each grounded occupant, on either side. Multiple body contacts take one hit per valve. The next hit closes and resets the valve without a burst; it can then be opened again. Active vents also retain their six damage at round end. Like floor heat, bursts ignore armour, Defend and barriers, while flyers and the furnace carrier remain immune. Area attacks trigger each valve once per cast. There is no separate valve command. The resilient wheel takes no damage. Support and zero-damage Shield bash do not toggle it. Confirmation names the burst or reset; orange outlines mark opening vents and mint outlines mark a reset. The wheel and connected vents animate at impact.

The Chapter One shed introduces cover; Chapter Two’s loading gate has a valve; Hammerplain’s freight lift/store add pressure drums and more terrain. The freight lift and Windmere water lift also contain coordinated enemies. One guardian/crow pair warns for an entire odd round before firing its shared barrage on the even round, using 90% of the sum of Steam lance and Cinder peck damage (rounded down) and spending both pending actions and two focus each. The assisting machine may then reposition on its initiative, without another attack or Defend/focus bonus. **Enemy teams also have no spacing or sight requirement between partners.** Defeating either operator interrupts the barrage. Ordinary boss patterns remain independent.

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


## Rallying cry and skill balance pass

Rallying cry costs three focus and one main action at every rank. Rank I (level 2) covers the six hexes around Celia, excluding her. Rank II (level 6) includes Celia. Rank III (level 10) covers the entire active party. The field follows its living source; check eligibility when each fighter's normal turn begins. It grants **+1 focus regeneration**, capped at six, with no immediate refill. Wait resumes and movement-only team continuations never grant another tick.

The cry lasts three combat rounds **including the casting round**: cast in round R, expire before any turn in R+3. This keeps duration independent of initiative, waiting and borrowed actions; Celia's own first boosted regeneration is on a later normal turn. Recasting after a round has elapsed refreshes the duration, without stacking. A full-duration cry cannot be refreshed. Celia's fall removes it permanently; revival does not restore the field. It is battle-local and affects no reserve or unavailable character. The blue-violet field, shared grid boundary, regeneration status and round counter use the same eligibility rules. Selecting the self-centered command previews its field and asks only for confirmation, including when no ally is currently in the ring but one could move into it.

| Skill | Previous ranked power / cost | New ranked power / cost | Purpose |
| --- | --- | --- | --- |
| Lantern burst | 8 / 13 / 19; 2 focus | 8 / 12 / 17; 2 focus | Trim the broadly useful area attack without changing its footprint/friendly-fire progression. |
| Horizon light | 12 / 17 / 24; 3 / 4 / 4 focus | 22 / 28 / 35; 3 focus | A more powerful narrow ray at each of its level 7/10/13 gates. |
| Pressure wave | 8 / 13 / 19; 3 focus | 10 / 16 / 23; 2 focus | Pay for positioning and push without overpricing its weaker individual contact. |
| Quick shot | 10 / 14 / 19; pierces 0 / 2 / 4 | 10 / 13 / 17; pierces 0 / 1 / 2 | Free sustained fire leaves room for Kit's paid skills. |
| Pinning shot | 8 / 14 / 21; 2 focus | 11 / 17 / 24; 2 focus | A smaller early damage sacrifice for control, then a late damage advantage over Quick shot. |
| Feint III | Free; range 4 | 1 focus; range 6 | Improve safe reach instead of making boss control free. |
| Taunt III | Base party ward 12; 3 focus | Base party ward 10; 4 focus | Preserve Taunt while giving dedicated protection a clearer advantage. Daybreak inherits the weaker ward at its existing 90% output. |

Learning gates, purchased ranks and current save formats are unchanged. The same solo contributions feed team damage at 90%, so these changes also update the appropriate combinations. Heal/Mend, Steam lance, Rivet shot, Celestial bolt, Sanctuary and Shield bash retain their established roles. This balance pass did not add ranks; the later point-cap and prompt correction is documented under Upgrade choices above.

Workshop → Combat adds dedicated **Rallying cry I / II / III** practices with low-focus allies. The headless players shortlist useful placements and value the incremental future focus of a refresh; the cooperative forecast resolves the actual future regeneration. The controlled utility probe suppresses the new aura alongside other support abilities. No forecast grants an immediate refill.

The sealed Chapter Three regulator has 155 HP rather than 170. The reduced Burst otherwise added two rounds to the feed-grounding route compared with pressure walk. Across matched offensive/support and prepared/frugal inputs, grounding now takes three–four rounds versus three for pressure walk, with less HP lost in each pair. Plates, shield release, enemy power and rewards are unchanged.

## Celia's protection (#135)

Sanctuary's base barrier is **8 / 24 / 32** (previously 8 / 16 / 20). It retains its level 5/9/12 gates, three/three/four focus costs and existing coverage: an aimed seven-hex area for ranks I/II, then every living party member at rank III. Barriers still add `floor(1.5 × (level − 1))`, preserve stronger existing protection and never stack.

At level nine, Sanctuary II grants 36 barrier per target instead of 28; at level twelve, Sanctuary III grants 48 instead of 36. Orrin's top Safety guard grants 41 at level twelve and costs three focus, but requires nearby allies. Celia's stronger global protection rewards her dedicated support slot. Heal, Rallying cry, Celestial bolt and the team moves retain their current behavior.

`node scripts/compare-party-balance.mjs --output /tmp/party-after.json` exercises all ten three-character formations against four authored boss inputs at levels 9/10/13/15. Pass `--root <baseline-checkout>` to compare earlier rules against the same fixtures. It preserves each formation's preset ranks, worn gear, stock and deployment; it does not reset builds, reassign equipment or claim an earned campaign. The defensive controller may undervalue setup skills, so formation results are evidence about those fights rather than a universal character ranking. This comparison remains outside default CI.

[The matched comparison](headless/celia-protection.json) records 40 victories without knockouts on each version. Six of Celia's 24 cases improve; the remaining eighteen and all sixteen cases without her are identical. Celia's cohort loses 4,819 rather than 5,061 HP and uses 44 rather than 47 bandages across the independent fixtures. Sanctuary casts rise from three to six. Fight lengths do not change. This is a modest protection benefit, not proof that every party choice is equally strong; the controller still does not use Rallying cry. The existing earned campaign checkpoints retain their prior source hashes.

## Final Benefactor summons

The hollow sun and exposed heart call the Benefactor’s divine minions on the source's turn in rounds 1, 3, 5, and so on. At most two summoned enemies can be alive at once. Both forms call a Sun herald and a Glass wing, replacing whichever role is missing on a later wave. These use the existing divine-hunter vectors and the domain patrol’s fixed profiles (herald: 205 HP / +15 attack; glass wing: 100 HP / +13 attack), with no player-level scaling or extra reward.

A wave accompanies the source's ordinary turn; its direct Claimed light and marked Judgment remain intact. Arrivals appear through short light tears at the attack's contact, join initiative next round, and cannot retaliate during their arrival round. Active Taunt carries onto arrivals; their later attacks use normal movement, targeting, Dazzle, barriers and Defend. Summoning does not heal the source. The source's fourth-round attack respite remains; surviving minions still take their own turns.

The side arrival points try nearby clear cells when occupied. They never overlap the source's footprint, living units, fallen allies awaiting revival, obstacles or intact fixtures. A blocked wave is skipped safely. Destroying the source disperses every remaining summon and resolves the phase immediately. The first mantle form is unchanged. Campaign and dev previews use these same rules; preview restarts discard all arrivals.

`rules/enemies.ts` builds both encounter enemies and summons from the same fixed catalogue. No new art assets or production dependencies are needed. The detailed desktop/phone arrival, reduced-motion, restart and training-purchase browser checks remain outside the default `@ci` set.
