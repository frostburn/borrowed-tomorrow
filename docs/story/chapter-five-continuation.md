# Chapter Five after Acts I–II — Windmere and the fleet

The shared airfield, survey ship, Hammerplain and Dawnwatch are playable. Hammerplain and Dawnwatch can be completed in either order, left unfinished and revisited. The first-victory fleet sighting and second-victory Emperor offer are implemented. Windmere and the flagship campaign finale remain author plans in [chapter-five-plan.md](chapter-five-plan.md). The dev flagship battle is still isolated; its outcome is never campaign history.

## Current ending and supported saves

Version **10**, campaign `imperial-debt`, chapter `chapter-five`, boundary **null**. There is no Chapter Five completion flag or departure. Old version-10 Act I saves restore their actual state unchanged; no migration or default Dawnwatch completion is added.

The chart marks each completed anchor independently. `fleetSighted` follows the first completed region on returning aboard, using its contribution in the dialogue. With both current regional completions, the objective and Alda point to the aft observation cabin. The player enters `observation`, completes `five-emperor-offer`, returns to `airship` `(32,26)`, and tells the full roster in `five-emperor-told`. The ending remains a revisitable ship with Windmere explicitly unavailable. All active formations, individual HP/focus, bag/loadouts, bandages, marks, XP, playtime and earlier flags persist.

## Shared opening and Hammerplain checkpoints

Opening: `airfieldSeen`, `airfieldGuardWon`, `airshipOwned`, `firstFlightSeen`.

Hammerplain: `hammerplainSeen`, `coolingSeen`, `forgeRouteSet`, `forgeApproachWon`, `coolingOpened`, `forgeGantrySeen`, `furnaceConfronted`, `furnaceWon`, `hammerplainFreed`, `hammerplainComplete`.

Preserve boolean `forgeFlooded`: false is the dry freight lift with crows; true is the shallow race with hounds. Either battle awards the same `forgeApproachWon` once. `forgeStoresWon` remains optional, including on return visits. Prior `worksFlooded`, `pressureRoute` and train choices are unchanged. Hammerplain completion does not imply any Dawnwatch progress.

## Dawnwatch checkpoints

`dawnwatchSeen`, `shelterOpened`, `watchGunsSeen` open the lower-town shelter and barracks route. Residents wait safely; there is no timer.

`mortarConfronted` → `mortarWon` and `repeaterConfronted` → `repeaterWon` can occur in either order. A lost attempt does not lock the choice. With neither position won, use the selected gun's `-first` encounter with opposite-gun spotter support. Once one is won, the other uses its `-last` encounter without support. Each position pays only once through its own flag. Both wins are required for the signal wall and optional field locker.

`aurelSeen`, `aurelConfronted`, `aurelWon`, `dawnwatchFreed`, `dawnwatchComplete` finish the confrontation, physical wheel release and return to the shelter. `watchCoatTaken` is the optional side locker; it requires both gun wins and cannot be farmed. Dawnwatch completion does not imply any Hammerplain progress.

Scene callbacks commit on completion or skip. Reload during the shelter release, anchor wheel or offer replays without granting the uncompleted flag. Travel/deep restore loads all nine exploration maps and their local arenas before replacing the prior checkpoint. Failure permits retry with state intact.

## Shared milestones

- `fleetSighted` requires at least one completed region. Its old ID is preserved, but it no longer requires Hammerplain specifically.
- `emperorOfferSeen` requires the fleet sighting and both currently playable regional completions. The observation cabin is accessible then, not after one victory. Completion returns to the ship. A reload between these callbacks preserves the offer and resumes the deck conversation.
- `emperorOfferTold` follows the completed offer. Its closer fleet layer replaces the distant hulls. It does not start a countdown, close regional landings or unlock the campaign flagship. The cabin is empty on revisiting.

When Windmere is implemented, extend the existing regional count and offer validation to **any two of all three**. Preserve existing completed offers. All three will eventually unlock the flagship, independent of order. Do not mark it ready after only Hammerplain and Dawnwatch.

## Rewards

| Victory/action | XP | Marks | Gear in the bag |
| --- | ---: | ---: | --- |
| Airfield confiscation detail | 90 | 72 | — |
| Hammerplain lift or race | 155 | 86 | — |
| Furnace carrier | 260 | 150 | Balanced expansion valve, Orrin |
| Hammerplain safety store | 75 | 45 | Foundry safety coat, anyone |
| First Dawnwatch gun position | 155 | 85 | — |
| Second Dawnwatch gun position | 125 | 75 | — |
| Commander Aurel | 225 | 145 | Dawnwatch shield brace, Petra |
| Dawnwatch field locker | — | — | Officers' field coat, anyone |

All items require manual fitting. No encounters scale by regional order. The dev start begins at 1225 XP; the shared airfield adds 90, Hammerplain adds 415 and Dawnwatch adds 505. Both main routes total **2235 XP** before the optional Hammerplain store. Level ten begins at 1490 XP and remains the cap. Dawnwatch's field coat trades one armor against Hammerplain's coat for one speed.

## Facts and knowledge to preserve

Alda's working survey ship is a home for supplies, rest, Equipment, conversations and railway messages. Hester's crew already built ordinary engines; they run Hammerplain's houses, send engines by rail, two fitters and a spare drive to the ship. Durn remains alive in their shift office for the residents. Their stopped street moves again, but previously taken days are not restored. Orrin learns to leave the running engines to their own crew.

Aurel is Petra's former commander. He orders Dawnwatch's lower town abandoned, defends the anchor with shield troops and orders fire through the occupied shelter. Enna remembers the medical coaches and has a sister in that shelter. Petra admits her own enforcement of similar orders, opens the gate with Enna and fights Aurel. Soldiers who saw the evacuation refuse his renewed firing order; others disarm and remain. Aurel receives the shelter's protection in custody, not pardon or execution. Enna releases the anchor under town control. Three pilots volunteer with two escort launches, approach charts and recognition signals. The remaining watch stays with the residents. Petra gains no restored commission.

After the second anchor the Emperor projects a repeating Larkspur morning into the cabin glass. Ansel turns the chipped rim of his cup toward himself; Tomas stands beside the platform. Nell recognizes the habit and almost asks how to reach that day. She asks whether Ansel can leave, then walks out and tells the others. Kit reads Tomas's ordinary railway message. This is **a projection, not resurrection or demonstrated death reversal**. Ansel remains dead. Tomas remains safe with Dena and Bram at the refuge, never a combatant or a new captive.

Alban remains free and alive with the inland fleet. The Emperor has made the offer but has not been defeated. The Benefactor never speaks; Nell's lantern only hums and remains unexplained. Kit's single airfield fluster is the chapter's brief unresolved joke. The active-three cap remains mechanical, without a story explanation.

## Next implementation

Implement Windmere as an independent flight-chart landing, preserving both completed and partial Acts I–II. Celia and the staff replace the hospital's dependence on its anchor before the mirrored ward engine fight. Add its useful regional loot and ship contribution. Extend the shared first/second-victory scenes by actual completion count; do not replay an offer already recorded.

Only after all three completions adapt Alban's dev flagship to actual campaign resources, retaining the accepted native vectors, whole-ship oscillation and dedicated 10/8 intro/loop. Its surrender resolves Alban's pursuit. The Emperor's defeat stays Chapter Six and the god-domain journey Chapter Seven.
