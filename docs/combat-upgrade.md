# Rich combat

Issue #105 now shares one rule set between campaign battles and **Workshop → Combat** (`?dev=combat`). The five fixed practice presets show new skills without editing saved character builds, inventory or campaign progress. **Practice current workshop party** uses your actual workshop settings. All commands still use the existing move-then-act flow. Equipment remains numerical; deployment and victory conditions are unchanged.

## Team abilities

| Move | Partners | Unlock | Effect |
| --- | --- | ---: | --- |
| Prism lance | Nell + Orrin | 8, both | Full horizontal axial line, power 32 |
| Falling stars | Celia + Orrin | 7, both | Full down-left axial line, power 28 |
| Crossfire | Kit + Petra | 8, both | Power 28 shot, then a bounce to a second enemy |
| Daybreak | Nell + Celia | 13, both | Heal all living allies and grant barriers |

Either partner may initiate. Both must be alive in the active formation, know the move, have an unspent turn in this round, stand within three hexes with a clear link, and have three focus. Confirmation spends both main turns and three focus from each. A partner may have moved or waited, but cannot already have spent their main action. There is no extra partner turn or focus regeneration for the consumed turn. Normal initiative resumes afterward; both return normally next round. Existing Taunt and pin on the partner expire as their consumed turn ends. Team commands are omitted when the other character is absent from this battle; fallen, distant or spent partners remain listed with the appropriate readiness explanation. Keyboard shortcuts use the same filtered command order.

Offensive team power adds the participants' average attack bonus. Dazzle weakens each participant's half of the attack; one Dazzle attack is consumed from each affected participant, regardless of targets hit. Barriers, armor and defense remain normal. Full-width attacks are reserved for teams: Prism lance and Falling stars ignore cover and exclude both operators, but can hit the third ally. Crossfire hits only enemies. The preview reports both costs, names, exact targets and damage. Both actors perform their native attack poses; a linked wind-up and a dedicated effect/sound accompany the result.

## Later levels

| Character | Level 7 | Level 10 | Additional team unlocks |
| --- | --- | --- | --- |
| Nell | Horizon light | Dimming halo | Prism lance 8; Daybreak 13 |
| Orrin | Pressure seam | Field bracing | Falling stars 7; Prism lance 8 |
| Kit | Ricochet | Pinning shot | Crossfire 8 |
| Celia | Falling stars (team) | Revive | Falling stars 7; Daybreak 13 |
| Petra | Driving blow | Hold the line | Crossfire 8 |

Horizon light and Pressure seam are short, caster-originating **hex-diagonal rays**. Aim snaps to one of six directions between the ordinary hex axes. The ray leaves a vertex of the caster's hex, runs along the adjoining edges, and hits up to three center cells two hex-steps apart (range six). This creates the spaced-cell pattern instead of painting a whole row. It stops at its first cover contact, including that contact so breakable cover can be struck. Adjacent cells beside the ray are not hit. Both moves cost four focus, can hit allies, and hit a multi-contact enemy once. Preview and animation use the same origin and contact cells. Celia keeps her weak unrestricted Celestial bolt; Falling stars is now a team move with Orrin, not another solo attack.

Ricochet costs three focus and aims within five hexes with normal sight. The second target is the nearest distinct living enemy within three hexes of the first, with a clear path. Ties resolve by enemy ID; the exact bounce is shown before confirming. It cannot bounce back into another contact of the same boss. Crossfire uses this same geometry.

Pinning shot costs two focus and limits a mobile enemy to one movement until its next main turn ends; it does not prevent attacking, defending or waiting. Anchored bosses resist the movement effect. Driving blow combines damage and a normal one-hex push. Dimming halo applies three-attack Dazzle to enemies in a blast and never refreshes existing Dazzle. Field bracing protects Orrin and adjacent allies; Hold the line protects the living formation wherever they stand. Both keep the strongest existing barrier.

Revive costs four focus, has range four and restores one fallen ally to 35% max HP. The original hex must be clear and visible, with no obstacle or living footprint on it. A revived ally rejoins initiative next round and cannot immediately retaliate. It affects only the battle's party, so it cannot cure story illness, reach reserves or undo a story death.

## Support scaling

Growth is based only on caster level, with level one as the baseline. Attack edits and equipment attack bonuses do not inflate support.

- Mend: `18 + 2 × (level − 1)` HP.
- Beacon: `14 + 2 × (level − 1)` HP per ally.
- Safety guard / Sanctuary: `10 / 8 + floor(1.5 × (level − 1))` guard.
- Field bracing / Hold the line: `16 / 12 + floor(1.5 × (level − 1))` guard.
- Daybreak: `38 + 2 × (level − 1)` HP and `8 + floor(1.5 × (level − 1))` guard per ally.

Healing clamps to maximum HP; barriers never stack. Bandages retain their fixed 24 HP and shared consumable cost. Rally retains its focus transfer.

## Battlefield objects and enemy relay

Encounters opt into authored `fixtures`; there is no random placement or change to map/story IDs. Timber barricades occupy a real obstacle and block sight until broken. Pressure drums occupy a hex and explode when destroyed, damaging nearby units on either side and potentially triggering adjacent drums. Explosions respect armor, defense, barriers, sealed bodies and single-hit footprints. Surviving scenery does not prevent victory. The same attack footprint damages units and breakable scenery, including enemy attacks.

Brass valves are resilient, passable attack targets. Strike or shoot one with an ordinary damaging attack to flip its marked steam vents; area attacks can also trigger it once per cast. There is no separate valve command, focus cost or operating step. The wheel stays intact for later hits. Healing, protection, Dazzle and the zero-damage shield bash cannot toggle it. Confirmation states whether steam will turn on or off, with connected vents marked in mint separately from the orange damage footprint; a wheel spin and mechanical sound accompany the hit. Toggling does not directly damage distant vent occupants. Active vents use the existing six-damage round-end rule for both sides and retain its flying immunity. The props use native runtime vector geometry and the shared chunky framebuffer.

The Chapter One engine shed has a breakable timber barricade. Chapter Two's loading-gate route has a working steam valve. Hammerplain's freight lift and safety store introduce pressure drums and more terrain; the freight lift and Windmere's water-lift battle also have coordinated enemies.

A coordinated encounter links one ordinary guardian and one crow. On odd rounds they lock and display one shared blast area for the next even round, giving every party member a full turn to respond before even a fast crow can fire. They can spend both pending turns and two focus each to fire it, provided their link remains clear within four hexes. Kill either machine, separate them, or break sight to interrupt it; they then use their ordinary AI. Taunt redirects the affected operator's blast, and Dazzle weakens both contributions. Boss pattern rules remain independent. The Combat practice yard demonstrates the link alongside all three fixture types. The Revive preset starts with Orrin fallen on a clear hex; the other presets show Prism lance, Crossfire, Falling stars and Daybreak.

## Implementation and checks

`rules/abilities.ts` owns metadata; `rules/combat.ts` retains the public exports and turn resolver. `combat-tactics.ts` owns geometry, readiness, support power, relay warnings and scenery effects. Battle-only additions do not change save versions or equipment formats. New ability commands without a single-digit shortcut remain clickable; the command list scrolls while confirmation stays visible.

Unit tests cover atomic costs and queue changes, partner visibility, waiting and last-turn pairs, Dazzle, team axes, all six spaced-ray directions from every board cell, ricochet and multi-contact deduplication, revival, scaling, enemy link interruption, breakable sight, strikeable valves and chain reactions. Detailed desktop/phone Playwright cases in `rich-combat.spec.ts` exercise the real workshop, confirmations, poses, terrain and saved-build isolation, outside the small default CI gate. Browser plugin not available in the task environment; local QA uses Playwright.
