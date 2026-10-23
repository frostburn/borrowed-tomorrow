# Chapter Five after Acts I–III — the capital crossing

The shared airfield, survey ship, Hammerplain, Dawnwatch and Windmere are playable. The three regions can be completed in any order, left unfinished and revisited. The first-victory fleet sighting and second-victory Emperor offer are implemented. Act IV now opens the capital crossing through the campaign flagship, divine intervention and hunters’ defense. The dev battle remains an isolated harness and never writes campaign history. See [chapter-five-act-four.md](chapter-five-act-four.md).

## Current ending and supported saves

Version **10**, campaign `imperial-debt`, chapter `chapter-five`. Acts I–III and partial Act IV have boundary **null**; completing the final deck scene records `chapterFiveComplete` and boundary **`chapter-six:capital-approach`** together. Existing version-10 Acts I–II saves restore their actual state unchanged; no migration or default regional completion is added.

The chart marks each completed anchor independently. `fleetSighted` follows the first completed region on returning aboard, using its contribution in the dialogue. With any two regional completions, the objective and Alda point to the aft observation cabin. The player enters `observation`, completes `five-emperor-offer`, returns to `airship` `(32,26)`, and tells the full roster in `five-emperor-told`. After all three, `five-alliance` stages Alban’s capital blockade and the three crews’ contributions. The ship and regional landings remain revisitable; the chart’s capital approach opens after the alliance and completed Emperor-offer callbacks. All active formations, individual HP/focus, bag/loadouts, bandages, marks, XP, playtime and earlier flags persist.

## Shared opening and Hammerplain checkpoints

Opening: `airfieldSeen`, `airfieldGuardWon`, `airshipOwned`, `firstFlightSeen`.

Hammerplain: `hammerplainSeen`, `coolingSeen`, `forgeRouteSet`, `forgeApproachWon`, `coolingOpened`, `forgeGantrySeen`, `furnaceConfronted`, `furnaceWon`, `hammerplainFreed`, `hammerplainComplete`.

The survey ship is visibly moored at Hammerplain’s western boarding gangway. The lower anchor gantry’s `forge-supply` bench offers free HP/focus restoration for all five recruits, including reserves, and the ordinary eight-mark bandages. Rest saves normally and writes no progress flags.

Preserve boolean `forgeFlooded`: false is the dry freight lift with crows; true is the shallow race with hounds. Either battle awards the same `forgeApproachWon` once. `forgeStoresWon` remains optional, including on return visits. Prior `worksFlooded`, `pressureRoute` and train choices are unchanged. Hammerplain completion does not imply any Dawnwatch progress.

## Dawnwatch checkpoints

`dawnwatchSeen`, `shelterOpened`, `watchGunsSeen` open the lower-town shelter and barracks route. Residents wait safely; there is no timer.

`mortarConfronted` → `mortarWon` and `repeaterConfronted` → `repeaterWon` can occur in either order. A lost attempt does not lock the choice. With neither position won, use the selected gun's `-first` encounter with opposite-gun spotter support. Once one is won, the other uses its `-last` encounter without support. Each position pays only once through its own flag. Both wins are required for the signal wall and optional field locker.

`aurelSeen`, `aurelConfronted`, `aurelWon`, `dawnwatchFreed`, `dawnwatchComplete` finish the confrontation, physical wheel release and return to the shelter. `watchCoatTaken` is the optional side locker; it requires both gun wins and cannot be farmed. Dawnwatch completion does not imply any Hammerplain progress.

Scene callbacks commit on completion or skip. Reload during the shelter release, anchor wheel or offer replays without granting the uncompleted flag. Travel/deep restore loads all twelve exploration maps and their local arenas before replacing the prior checkpoint. Failure permits retry with state intact.

## Windmere checkpoints

`windmereSeen` → `dispensarySeen` → `windLiftConfronted` → `windLiftWon` → `waterLiftOpened` → `patientsTransferred` → `mirrorWardSeen` → `windGalleryWon` → `wardEngineConfronted` → `wardEngineWon` → `windmereFreed` → `windmereComplete`.

The brake and gallery wins do not open the lift or disconnect the anchor themselves. Physical wheel, bypass-valve and support-release scenes commit separately. `windReflectorTaken` is an optional once-only lamp cabinet after the lift opens. Every interrupted scene remains replayable; skip completes its normal callback. Partial progress and all real resources persist across ship visits. The hospital, dispensary and gallery are `windmere`, `dispensary` and `mirrorward`; ship return is `(32,26)`.

## Shared milestones

- `fleetSighted` requires at least one completed region. Its old ID is preserved, but it no longer requires Hammerplain specifically.
- `emperorOfferSeen` requires the fleet sighting and any two of Hammerplain, Dawnwatch and Windmere. The observation cabin is accessible then, not after one victory. Completion returns to the ship. A reload between these callbacks preserves the offer and resumes the deck conversation.
- `emperorOfferTold` follows the completed offer. Its closer fleet layer replaces the distant hulls. It does not start a countdown, close regional landings or bypass the third anchor and alliance setup. The cabin is empty on revisiting.

`allAnchorsSeen` requires all three regional completions and records the ship’s alliance/blockade scene. The campaign flagship requires this setup and `emperorOfferTold`. Previously completed offers never replay. The offer can still be visited after the third anchor if the player deferred it.

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
| Windmere lift brake | 140 | 80 | — |
| Windmere gallery bridge | 135 | 75 | — |
| Mirrored ward engine | 230 | 150 | Windmere medical focus, Celia |
| Old lamp cabinet | — | — | Opal lantern reflector, Nell |

All items require manual fitting. No encounters scale by regional order. The dev start begins at 1225 XP; the shared airfield adds 90, Hammerplain adds 415, Dawnwatch adds 505 and Windmere adds 505. All three main routes total **2740 XP** before the optional Hammerplain store. Level ten begins at 1490 XP and remains the cap. Dawnwatch's field coat trades one armor against Hammerplain's coat for one speed.

## Facts and knowledge to preserve

Alda's working survey ship is a home for supplies, rest, Equipment, conversations and railway messages. Hester's crew already built ordinary engines; they run Hammerplain's houses, send engines by rail, two fitters and a spare drive to the ship. Durn remains alive in their shift office for the residents. Their stopped street moves again, but previously taken days are not restored. Orrin learns to leave the running engines to their own crew.

Aurel is Petra's former commander. He orders Dawnwatch's lower town abandoned, defends the anchor with shield troops and orders fire through the occupied shelter. Enna remembers the medical coaches and has a sister in that shelter. Petra admits her own enforcement of similar orders, opens the gate with Enna and fights Aurel. Soldiers who saw the evacuation refuse his renewed firing order; others disarm and remain. Aurel receives the shelter's protection in custody, not pardon or execution. Enna releases the anchor under town control. Three pilots volunteer with two escort launches, approach charts and recognition signals. The remaining watch stays with the residents. Petra gains no restored commission.

Windmere’s hospital really healed Teren’s leg. Director Iven knowingly concealed the return clause and its village losses. Sera and the railway volunteers reopen the water lift, bring up existing equipment and establish ordinary support before shutdown. Iven releases the mirrored engine; after it falls, staff isolate treatment before opening the upward contact. He opens the full ledger under supervision. The villages stop losing days locally, but past losses are not repaid. Celia stays for the first ordinary night shift; Sera contributes medical crews and a tested support-release order. Some patients still require continuing care. The hospital records confirm the hospice diagram without opening a route to the source.

After the second anchor the Emperor projects a repeating Larkspur morning into the cabin glass. Ansel turns the chipped rim of his cup toward himself; Tomas stands beside the platform. Nell recognizes the habit and almost asks how to reach that day. She asks whether Ansel can leave, then walks out and tells the others. Kit reads Tomas's ordinary railway message. This is **a projection, not resurrection or demonstrated death reversal**. Ansel remains dead. Tomas remains safe with Dena and Bram at the refuge, never a combatant or a new captive.

Before Act IV, Alban remains free with the inland fleet. The party defeats his flagship, then the Benefactor destroys Alban, his men and the hull during the command-deck confrontation. The god speaks through light with no visible body. Nell collapses and remains too ill to fight; Kit and Celia get her aboard. Divine minions attack the medical hatch in retaliation for the disconnected anchors. The remaining companions defeat them before the final berth conversation. Tomas stays safe and Ansel remains dead. The cap of three remains mechanical.

## Act IV and the next implementation

`flagshipApproachSeen` → `flagshipConfronted` → `flagshipWon` → the atomic intervention (`benefactorClaimSeen`, `flagshipDestroyed`, `albanDestroyed`, `nellIll`) → `retaliationSeen` → `retaliationWon` → `chapterFiveComplete`. See [Act IV](chapter-five-act-four.md) for exact locations, callbacks, rewards and canonical start. No prior save is granted these flags automatically.

The handoff keeps the actual equipment/resources and all five roster entries, with Nell unavailable and her place filled without exceeding three. Rest and victory cannot remove her illness. Kit takes Celia's notes for Sera. Implement Chapter Six from this outer-mooring departure with an attempted approach blocked by the Emperor’s two seals. Travel to the desert and northern allied capitals in either order to break them; an optional jungle quest through Sera’s referral and Kit/Celia’s work restores Nell independently; see [chapter-six-plan.md](chapter-six-plan.md). The Emperor's defeat stays Chapter Six, the separate god-domain journey stays Chapter Seven. Neither main path requires curing Nell. The final god form has not appeared in the campaign.
