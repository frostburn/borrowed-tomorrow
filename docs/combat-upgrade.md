# Rich combat

Issue #105 now shares one rule set between campaign battles and **Workshop → Combat** (`?dev=combat`). The four fixed practice presets show new skills without editing saved character builds, inventory or campaign progress. **Practice current workshop party** uses your actual workshop settings. All commands still use the existing move-then-act flow. Equipment remains numerical; deployment and victory conditions are unchanged.

## Team abilities

| Move | Partners | Unlock | Effect |
| --- | --- | ---: | --- |
| Prism lance | Nell + Orrin | 8, both | Full horizontal axial line, power 32 |
| Crossfire | Kit + Petra | 8, both | Power 28 shot, then a bounce to a second enemy |
| Daybreak | Nell + Celia | 13, both | Heal all living allies and grant barriers |

Either partner may initiate. Both must be alive in the active formation, know the move, have an unspent turn in this round, stand within three hexes with a clear link, and have three focus. Confirmation spends both main turns and three focus from each. A partner may have moved or waited, but cannot already have spent their main action. There is no extra partner turn or focus regeneration for the consumed turn. Normal initiative resumes afterward; both return normally next round. Existing Taunt and pin on the partner expire as their consumed turn ends.

Offensive team power adds the participants' average attack bonus. Dazzle weakens each participant's half of the attack; one Dazzle attack is consumed from each affected participant, regardless of targets hit. Barriers, armor and defense remain normal. Prism excludes its two operators but can hit the third ally. Crossfire hits only enemies. The preview reports both costs, names, exact targets and damage. Both actors perform their native attack poses; a linked wind-up and a dedicated effect/sound accompany the result.

## Later levels

| Character | Level 7 | Level 10 | Additional team unlocks |
| --- | --- | --- | --- |
| Nell | Horizon light | Dimming halo | Prism lance 8; Daybreak 13 |
| Orrin | Pressure seam | Field bracing | Prism lance 8 |
| Kit | Ricochet | Pinning shot | Crossfire 8 |
| Celia | Falling stars | Revive | Daybreak 13 |
| Petra | Driving blow | Hold the line | Crossfire 8 |

Horizon light covers a whole constant-r row; Pressure seam covers constant q (down-right); Falling stars covers constant q+r (down-left). Select a hex to choose the line. All three ignore rocks, hit other allies, exclude their caster, and hit a multi-contact boss once. Their costs are four, four and three focus respectively.

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

Brass valves are passable props. Any party member can select **Turn valve**, stand within one hex, and spend their main action to toggle its marked steam vents. Operating does not itself damage anyone. Active vents use the existing six-damage round-end rule for both sides and retain its flying immunity. The props use native runtime vector geometry and the shared chunky framebuffer.

The Chapter One engine shed has a breakable timber barricade. Chapter Two's loading-gate route has a working steam valve. Hammerplain's freight lift and safety store introduce pressure drums and more terrain; the freight lift and Windmere's water-lift battle also have coordinated enemies.

A coordinated encounter links one ordinary guardian and one crow. On odd rounds they lock and display one shared blast area for the next even round, giving every party member a full turn to respond before even a fast crow can fire. They can spend both pending turns and two focus each to fire it, provided their link remains clear within four hexes. Kill either machine, separate them, or break sight to interrupt it; they then use their ordinary AI. Taunt redirects the affected operator's blast, and Dazzle weakens both contributions. Boss pattern rules remain independent. The Combat practice yard demonstrates the link alongside all three fixture types. The Revive preset starts with Orrin fallen on a clear hex; the other presets show linked attacks and Daybreak.

## Implementation and checks

`rules/abilities.ts` owns metadata; `rules/combat.ts` retains the public exports and turn resolver. `combat-tactics.ts` owns geometry, readiness, support power, relay warnings and scenery effects. Battle-only additions do not change save versions or equipment formats. New ability commands without a single-digit shortcut remain clickable; the command list scrolls while confirmation stays visible.

Unit tests cover atomic costs and queue changes, waiting and last-turn pairs, Dazzle, all axial lines, ricochet and multi-contact deduplication, revival, scaling, enemy link interruption, breakable sight, valves and chain reactions. Detailed desktop/phone Playwright cases in `rich-combat.spec.ts` exercise the real workshop, confirmations, poses, terrain and saved-build isolation, outside the small default CI gate. Browser plugin not available in the task environment; local QA uses Playwright.
