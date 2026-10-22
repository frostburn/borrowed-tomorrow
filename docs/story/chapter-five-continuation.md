# Chapter Five after Act I — remaining anchors

The airfield opening, survey ship and Hammerplain are playable. Dawnwatch, Windmere and the flagship campaign finale remain author plans in [chapter-five-plan.md](chapter-five-plan.md). The dev flagship encounter is still isolated. Do not treat its outcome as campaign history.

## Current ending

Version 10, campaign `imperial-debt`, chapter `chapter-five`, boundary **null**. After Hammerplain's engine scene, the player returns through the cooling works to the western survey landing. Back aboard, `five-fleet` reveals Alban's distant formation. Completion leaves the party on `airship`, arrival `hammerplain` `(32,26)`. Hammerplain and the airfield remain revisitable; the chart marks Hammerplain disconnected. Dawnwatch and Windmere are explicitly unavailable in this release. Neither has a story prerequisite requiring Hammerplain when implemented.

The player may save or leave Hammerplain unfinished and return. Preserve the full five-person roster, active one-to-three formation, actual HP/focus, bandages, marks, playtime, route choices, individual gear and all earlier rescues. There is no Chapter Five completion flag, new chapter boundary, deadline, fleet battle or Emperor offer yet.

## Progress and rewards

Required Act I completion flags, in order:

`airfieldSeen`, `airfieldGuardWon`, `airshipOwned`, `firstFlightSeen`, `hammerplainSeen`, `coolingSeen`, `forgeRouteSet`, `forgeApproachWon`, `coolingOpened`, `forgeGantrySeen`, `furnaceConfronted`, `furnaceWon`, `hammerplainFreed`, `hammerplainComplete`, `fleetSighted`.

Preserve boolean `forgeFlooded`: false is the dry freight lift with crows; true is the shallow cooling race with hounds. Both award the same `forgeApproachWon` once. `forgeStoresWon` is optional and may still be earned after liberation. Prior `worksFlooded`, `pressureRoute` and train choices remain unchanged.

| Victory | XP | Marks | Gear in the bag |
| --- | ---: | ---: | --- |
| Airfield confiscation detail | 90 | 72 | — |
| Freight lift or race walk | 155 | 86 | — |
| Furnace carrier | 260 | 150 | Balanced expansion valve, Orrin |
| Safety store | 75 | 45 | Foundry safety coat, any companion |

Gear is fitted manually. The main route adds 505 XP; the Chapter Five canonical start begins at 1225, ending at 1730 before the optional store. Level ten begins at 1490 XP. The dev start is a fresh main-route coast completion with five recruits and earned gear, not the player's current save or a workshop build.

## Facts to preserve

Alda, an older survey captain, was loading Bram's ferry stores when Durn seized her working ship. The party cleared the mooring guards; she now flies their supply and anchor landings. The ship provides rest, bandages, Equipment and conversations. Kit has one brief, unresolved flustered exchange while helping Nell carry a bag.

Hester is Hammerplain's casting forewoman. Her crew already built ordinary engines for the houses. Durn diverted their output to the anchor and ordered those engines melted. Hester knows the old cooling gate better than Orrin; they open it together after the chosen approach. The party stops the mobile furnace carrier while the crew brings the starters through, then Nell physically pulls the anchor breaker. The lantern only hums against her fingers.

The street resumes. Hester starts an engine without Orrin's instruction. The crew can run the houses, sends engines by railway, and contributes two fitters and a spare drive to Alda's ship. The crew holds Durn in its shift office for the awakened residents to judge. He is alive; he does not escape with Alban. Previously taken days are not restored.

Alban's fleet is holding above the inland line, visible from the ship after Hammerplain. Alda can fly clear of it. No hidden pursuit clock starts. Alban remains free and alive. The Emperor has made no new offer. The Benefactor never speaks, Ansel remains dead, and Tomas stays safe at the railway refuge coordinating messages with Dena and Bram.

## Next implementation

Implement Dawnwatch and Windmere as independent regional routes from the existing chart. Add explicit completion marks without resetting Hammerplain or its rewards. Trigger the first fleet sighting after whichever region the player completes first, and the planned Emperor offer after any two victories; use a regional completion count rather than Hammerplain-specific prerequisites for these shared scenes. In this release `fleetSighted` is the existing once-only shared checkpoint.

All three regional victories should unlock the flagship later. Keep the Emperor's defeat in Chapter Six and the separate god-domain journey in Chapter Seven. Use the accepted dev flagship art, oscillation and dedicated 10/8 intro/loop when adapting its encounter to actual campaign resources.
