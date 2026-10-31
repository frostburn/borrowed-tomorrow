# Combat and skill progression

Issue #105 shares the campaign resolver with **Workshop → Combat** (`?dev=combat`). Movement and actions remain separate. Equipment, deployment and victory rules keep their existing behavior.

## Automatic progression

Skills are learned and improved automatically at the following **character levels**. There are no upgrade points, purchase buttons or banked choices. The party shares experience; reserves and later recruits receive the same level-based progression. Every character learns their four skills by level seven and masters them at fifteen. Quiet levels still give normal stat growth.

| Character | Skill | Learn | Rank II | Rank III |
| --- | --- | ---: | ---: | ---: |
| Nell | Lantern burst | 1 | 3 | 10 |
| Nell | Mend | 2 | 6 | 12 |
| Nell | Dazzle | 4 | 8 | 13 |
| Nell | Horizon light | 7 | 11 | 15 |
| Orrin | Steam lance | 1 | 5 | 11 |
| Orrin | Rivet shot | 2 | 7 | 12 |
| Orrin | Safety guard | 3 | 8 | 14 |
| Orrin | Pressure wave | 6 | 10 | 15 |
| Kit | Quick shot | 1 | 4 | 10 |
| Kit | Feint | 2 | 6 | 12 |
| Kit | Ricochet | 5 | 9 | 14 |
| Kit | Pinning shot | 7 | 11 | 15 |
| Celia | Celestial bolt | 1 | 7 | 13 |
| Celia | Heal | 1 | 4 | 11 |
| Celia | Rallying cry | 2 | 6 | 12 |
| Celia | Sanctuary | 5 | 9 | 15 |
| Petra | Shield bash | 1 | 6 | 12 |
| Petra | Taunt | 2 | 8 | 14 |
| Petra | Saber sweep | 3 | 7 | 11 |
| Petra | Crushing blow | 5 | 10 | 15 |

Victory results name each new skill (for example **Nell learns Mend.**) and rank improvement, including every milestone crossed by a multi-level reward. Only recruited, available companions are named; reserves receive the same announcements. Ill/lost Nell is not announced. Story-earned XP uses the same growth rule and shows its notices alongside received rewards. Loading does not repeat level-up announcements.

**Equipment → Skills** is a read-only reference with expandable current effects, the next automatic milestone and mastery. It preserves the selected character and hides combinations until both solos are learned and both characters are recruited. The workshop uses the same cards; changing level replaces its ranks automatically. There are no exploration upgrade prompts. Victory panels retain learned-skill notifications and only the Continue action; review skills through Equipment.

Strike and Items remain separate. Items opens the shared bag for bandages, field bandages and focus tonics, with quantities and effects; each uses a main action after targeting and confirmation. See [economy.md](economy.md). Solo skills have three ranks; team moves derive from the two solos and have no separate rank or cost to learn. `rules/skills.ts` owns all milestones and unchanged rank effects. Campaign, canonical starts, workshop and headless play share that schedule; the headless `--build` policy now chooses formations only.

The themed merges are functional: Nell’s Mend and Celia’s Heal each gain area healing; Celia’s final Heal includes revival. Dimming halo becomes area Dazzle. Steam lance retains its original contiguous four-hex ray at every rank, with increasing damage; Field bracing becomes upgraded Safety guard. Piercing bolt becomes upgraded Quick shot; Volley gives way to the Ricochet line. Driving blow becomes final Crushing blow, while Hold the line becomes final Taunt’s party barrier.

### Lantern burst

| Skill rank | Character level required | Base power | Footprint | Friendly damage |
| --- | ---: | ---: | --- | --- |
| 1 | 1 | 8 | Four touching hexes in a down-right slanted square | Full |
| 2 | 3 | 12 | Target plus six neighbors | Full |
| 3 | 10 | 17 | Target plus six neighbors | Half |

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

Full-width attacks exclude both operators, can hit another ally and damage multi-contact enemies once. Team commands disappear when a same-side partner is absent. Commands are also hidden until both required solo skills are learned (#208). Learned combinations remain gray and inspectable when a partner has acted, is down or lacks focus. Selecting one names the unavailable fighter and reason in the fixed confirmation area, where it stays visible even with a scrolled menu; it never offers confirmation. Shortcuts follow the filtered list. The Skills screen only describes learned combinations with **already recruited** characters, so later party members remain unspoiled.

A shared wind-up and both actors' attack poses show cooperation. `game/battle-team-effects.ts` gives each move its own effect on the actual affected footprint: Falling stars descends from above into landing flares; Prism lance uses separated prismatic planes and steam; Crossfire combines bolt bounces with crossing saber strokes; Daybreak spreads dawn light while Petra raises her shield, showing barriers only where her Taunt rank grants them; Lantern volley sends lantern-lit bolts into the selected ranked area. Enemy relays fire arcing shots from both operators. Shared animation timings align the HP/terrain reveal with contact. The effect container survives the impact redraw, is cleaned up with the battle and respects reduced motion. Falling stars has its own falling/landing sound.

## Other geometry and support

Steam lance is a contiguous four-hex ray from Orrin in one of six directions at every rank; it stops before cover and can hit allies. Its powers are 16/21/28 at character-level gates 1/5/11. Caster-originating straight rays remain valid solo attacks. Nell’s Horizon light follows spaced hex diagonals between those axes: center contacts are two steps apart, starting at a vertex adjoining her hex and passing through obstacles. Breakable cover on those contacts still takes damage, and the ray continues behind it. Full-width axes through freely selected distant rows remain exclusive to teams.

Ricochets select the nearest distinct visible second enemy; ties resolve by enemy ID. Rank controls reach and power. They never bounce into another part of the same boss. Pinning shot limits mobile enemies to one movement for their next main action; anchored bosses resist pin. Shield bash stays a zero-damage optional extra action, once per turn. Its later ranks remove the focus cost and then push all adjacent enemies. Dazzle remains a three-attack effect and is never refreshed while active.

Healing adds `2 × (character level − 1)` to ranked base power. Barriers add `floor(1.5 × (character level − 1))`. Weapon damage never inflates support. Barriers keep the strongest value instead of stacking. Bandages remain fixed at 24 HP; Rallying cry increases normal turn-start focus regeneration instead of restoring focus immediately.

Celia’s rank-three Heal arrives at character level eleven. It heals living allies in the area, clears Dazzle/pin, and can restore **one fallen ally at the clear center** to 35% maximum HP. The revived character acts next round and cannot retaliate immediately. A blocked or occupied center cannot revive anyone. This affects only units already in that battle, never reserves, story illness or permanent story deaths. Nell’s Mend does not revive. Heal has its own skill ID and milestones (1/4/11), distinct from Nell’s Mend (2/6/12). Final Taunt combines enemy targeting with level-scaled party barriers.

## Battlefield objects and enemy teams

Timber barricades block movement and sight until broken. Pressure drums explode when destroyed, damage either side, respect armor/Defend/barriers/sealed bodies, and can trigger other drums. Multi-contact enemies are hit once per explosion. Props do not affect victory conditions.

Brass valves feed permanently active steam vents, which deal six damage to grounded occupants at round end. Upward arrows mark these hazardous hexes. Every ordinary damaging hit on a valve adds an immediate six-damage burst across its associated vents, on either side; there is no reset or off state. Multiple body contacts take one hit per valve. Like floor heat, bursts ignore armour, Defend and barriers, while flyers and the furnace carrier remain immune. Area attacks trigger each valve once per cast. The resilient wheel takes no damage. Support and zero-damage Shield bash cannot trigger it. Confirmation names the extra burst and warns that vents stay active; orange outlines mark its footprint. The wheel and connected vents animate on every hit.

The Chapter One shed introduces cover; Chapter Two’s loading gate has a valve; Hammerplain’s freight lift/store add pressure drums and more terrain. The freight lift and Windmere water lift also contain coordinated enemies. One guardian/crow pair warns for an entire odd round before firing its shared barrage on the even round, using 90% of the sum of Steam lance and Cinder peck damage (rounded down) and spending both pending actions and two focus each. The assisting machine may then reposition on its initiative, without another attack or Defend/focus bonus. **Enemy teams also have no spacing or sight requirement between partners.** Defeating either operator interrupts the barrage. Ordinary boss patterns remain independent.

## Persistence and review

Campaign saves remain **version 11**, with a structurally validated skill-book snapshot. On loading a current-format save, ranks are recalculated from character level, replacing previous manual allocations without changing any other progress or resources. Workshop character records remain **version 3**, under `borrowed-tomorrow:character-workshop:v3`; their ranks are reconstructed from each character’s own level while preserving stat edits and equipment. Inventory stays version 2. Retired formats remain unsupported.

Changing a workshop character’s level applies its automatic skills and level-default stats. Practice stays isolated from campaign saves. **Practice Revive** uses Celia’s final Heal at level eleven; Lantern volley presets at levels 7 / 11 / 15 demonstrate Pinning shot ranks 1 / 2 / 3 and coverage of 7 / 10 / 12 hexes. Daybreak’s party-ward preset uses level fourteen. Detailed desktop/phone journeys and skill checks remain outside the small default CI gate. Browser plugin not available in the task environment; local QA uses Playwright.

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

Rallying cry costs three focus and one main action at every rank. Rank I (level 2) covers the six hexes around Celia, excluding her. Rank II (level 6) includes Celia. Rank III (level 12) covers the entire active party. The field follows its living source; check eligibility when each fighter's normal turn begins. It grants **+1 focus regeneration**, capped at six, with no immediate refill. Wait resumes and movement-only team continuations never grant another tick.

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

That earlier balance pass left learning gates, purchased ranks and save formats unchanged. The automatic milestones above now supersede those learning gates and purchases. The same solo contributions feed team damage at 90%, so these changes also update the appropriate combinations. Heal/Mend, Steam lance, Rivet shot, Celestial bolt, Sanctuary and Shield bash retain their established roles. This balance pass did not add ranks; the current automatic progression is documented above.

Workshop → Combat adds dedicated **Rallying cry I / II / III** practices with low-focus allies. The headless players shortlist useful placements and value the incremental future focus of a refresh; the cooperative forecast resolves the actual future regeneration. The controlled utility probe suppresses the new aura alongside other support abilities. No forecast grants an immediate refill.

The sealed Chapter Three regulator has 155 HP rather than 170. The reduced Burst otherwise added two rounds to the feed-grounding route compared with pressure walk. Across matched offensive/support and prepared/frugal inputs, grounding now takes three–four rounds versus three for pressure walk, with less HP lost in each pair under those earlier builds. The automatic-progression follow-up in [headless.md](headless.md#automatic-skill-progression-follow-up) records the new route observations. Plates, shield release, enemy power and rewards are unchanged.

## Celia's protection (#135)

Sanctuary's base barrier is **8 / 24 / 32** (previously 8 / 16 / 20). It uses the automatic level 5/9/15 milestones, three/three/four focus costs and existing coverage: an aimed seven-hex area for ranks I/II, then every living party member at rank III. Barriers still add `floor(1.5 × (level − 1))`, preserve stronger existing protection and never stack.

At level nine, Sanctuary II grants 36 barrier per target instead of 28; at level fifteen, Sanctuary III grants 53 instead of 41. Orrin's top Safety guard grants 44 at level fourteen and costs three focus, but requires nearby allies. Celia's stronger global protection rewards her dedicated support slot. Heal, Rallying cry, Celestial bolt and the team moves retain their current behavior.

`node scripts/compare-party-balance.mjs --output /tmp/party-after.json` exercises all ten three-character formations against four authored boss inputs at levels 9/10/13/15. Pass `--root <baseline-checkout>` to compare earlier rules against the same fixtures. It preserves each formation's preset ranks, worn gear, stock and deployment; it does not reset builds, reassign equipment or claim an earned campaign. The defensive controller may undervalue setup skills, so formation results are evidence about those fights rather than a universal character ranking. This comparison remains outside default CI.

The historical [matched comparison](headless/celia-protection.json), before automatic progression, records 40 victories without knockouts on each version. Six of Celia's 24 cases improve; the remaining eighteen and all sixteen cases without her are identical. Celia's cohort loses 4,819 rather than 5,061 HP and uses 44 rather than 47 bandages across the independent fixtures. Sanctuary casts rise from three to six. Fight lengths do not change. This is a modest protection benefit, not proof that every party choice is equally strong; the controller still does not use Rallying cry. The existing earned campaign checkpoints retain their prior source hashes.

## Final Benefactor summons

The hollow sun and exposed heart call the Benefactor’s divine minions on the source's turn in rounds 1, 3, 5, and so on. At most two summoned enemies can be alive at once. Both forms call a Sun herald and a Glass wing, replacing whichever role is missing on a later wave. These use the existing divine-hunter vectors and the domain patrol’s fixed profiles (herald: 205 HP / +15 attack; glass wing: 100 HP / +13 attack), with no player-level scaling or extra reward.

A wave accompanies the source's ordinary turn; its direct Claimed light and marked Judgment remain intact. Arrivals appear through short light tears at the attack's contact, join initiative next round, and cannot retaliate during their arrival round. Active Taunt carries onto arrivals; their later attacks use normal movement, targeting, Dazzle, barriers and Defend. Summoning does not heal the source. The source's fourth-round attack respite remains; surviving minions still take their own turns.

The side arrival points try nearby clear cells when occupied. They never overlap the source's footprint, living units, fallen allies awaiting revival, obstacles or intact fixtures. A blocked wave is skipped safely. Destroying the source disperses every remaining summon and resolves the phase immediately. The first mantle form is unchanged. Campaign and dev previews use these same rules; preview restarts discard all arrivals.

`rules/enemies.ts` builds both encounter enemies and summons from the same fixed catalogue. No new art assets or production dependencies are needed. The detailed desktop/phone arrival, reduced-motion, restart and training-purchase browser checks remain outside the default `@ci` set.
