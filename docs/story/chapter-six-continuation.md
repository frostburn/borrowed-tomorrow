# Chapter Six — exact playable continuation

Implemented: the sealed-capital opening, complete Namar desert expedition and optional Iria treatment journey. The northern expedition and Emperor climax in `chapter-six-plan.md` remain upcoming content. The two foreign routes are still intended to work in either order when both ship.

## Entry and resources

The incoming save remains Chapter Five with `chapterFiveComplete`, journal `fiveDeparture` and boundary `chapter-six:capital-approach`. All three anchors, the Emperor offer, flagship victory, divine destruction and retaliation victory must already be complete. Load `outermooring`, `namar`, `sunpalace`, `skywalk`, `observatory`, `riverhaven`, `canopy` and `rainhouse`, their seven tactical floors, Nell’s berth pose and the serpent’s native kit before calling `beginChapterSix`. Failure leaves the Chapter Five departure intact for retry.

Entry changes only chapter, boundary and location: Chapter Six, null boundary, `outermooring` (32,29). Preserve the actual recruited roster, legal formation, HP/focus, inventory, XP, marks, bandages, journal and playtime. Nell stays ill and equipped; there is no automatic cure or formation reset. The Vite canonical start is authored from the actual prior chapter completion at 3270 XP, with twelve bandages and Kit/Orrin/Petra active. Manual save slots remain separate.

## Checkpoints

| Flag | Completion and continuation |
| --- | --- |
| `capitalSealed` | Finish/skip `six-sealed`; the capital barrier appears and the crew discusses foreign returns. The opening replays if interrupted. |
| `sixRoutesKnown`, `jungleLeadKnown` | Finish/skip `six-briefing`; record both pact destinations and Sera’s river referral. Iria and Namar are playable immediately; only the northern button states it is not yet playable. |
| `desertSeen` | First Namar arrival, `six-namar`; Amal forwards post and directs the party to Samira without a delivery requirement. |
| `desertMailSent` | Optional post conversation completes; one canal courier harness enters the bag. |
| `palaceCoup` | Audience `six-court` completes; Sahir wakes the guardian and bars the southern gate. |
| `palaceRouteChosen`, `palaceWaterRoute` | Choose gallery (false) or service channel (true); save before entering the corresponding battle. |
| `palaceEscapeWon` | Either escape victory; one shared 180 XP / 110 marks / sunmesh coat reward. |
| `palaceEscaped` | Complete `six-escape`, resume at the `escape` arrival; Amal’s western postal stair is open. |
| `desertAscentSeen` | First `skywalk` arrival completes `six-roofs`. |
| `desertAscentWon` | Clear `desert-ascent`: 220 XP, 120 marks and fine expansion ring. The observatory stair opens. |
| `desertFocusTaken` | Optional instrument case conversation completes; one sunstone examination lens enters the bag. |
| `sunSerpentSeen` | First observatory arrival completes `six-serpent`. Supplies remain under the southern arch. |
| `sunSerpentConfronted` | Explicitly choose “Face the sun serpent.” |
| `sunSerpentWon` | Win the actual boss: 380 XP, 210 marks and solar saber guard. The release remains a physical interaction. |
| `desertReleaseReady` | Complete `six-release`; Samira lifts the bronze band and the party returns to Namar’s `return` arrival. |
| `desertSealBroken` | Complete `six-public`; Samira breaks the band before the city. Namar commits navigators and evacuation barges. Interrupted public scenes replay with the lifted band intact. |
| `desertReported` | Return to the mooring and complete `six-home`; Nell receives the news if ill, or reviews the route at the chart if recovered. If recovery occurs after the public break but before this report, `six-river-home` also records it. |

The public exchange and berth report read `desertMailSent` without changing it. Skipping the optional post leaves the letter with Kit; those scenes ask him to take it to the sorting table rather than claiming dispatch. Posting remains available on return. Nell's later berth conversation uses the same saved distinction. The optional earlier berth visit lets her add her own words; no extra flag or delivery gate is required.

`desertSealBroken` is the western seal. There is no `chapterSixComplete`, northern-seal victory, Emperor victory or Chapter Seven boundary in this implementation. Do not infer them from the regional payoff. The city, palace, terraces, observatory and safe ship remain revisitable. The post harness, optional focus and encounter items are once-only bag rewards, never auto-equipped.

## Iria checkpoints and recovery order

| Flag | Completion and continuation |
| --- | --- |
| `riverSeen` | Finish/skip `six-river-arrival` at `riverhaven`; Ines/Tavi prepare the medical launch. |
| `riverCrossingSeen` | First `canopy` arrival completes `six-river-crossing`. |
| `riverPatrolConfronted`, `riverPatrolWon` | Choose and win the lower crossing; 160 XP, 100 marks, reedweave coat. |
| `riverChainOpen` | Physically wind the capstan; `six-river-chain` completes and hides both chain art and collision. |
| `riverCacheWon` | Optional two-crow survey locker; 90 XP, 75 marks, river range sight. |
| `rainhouseSeen` | First rain-house arrival completes `six-rainhouse`; patients remain below the bend. |
| `rainhouseConfronted`, `rainhouseWon` | Choose and win the treatment terrace; 260 XP, 140 marks, rainhouse field focus. |
| `riverCareArrived`, `nellRecovered` | One atomic completion of `six-river-treatment`. 120 XP, riverglass reflector, only Nell restored to current-level HP/6 focus; selected formation and equipped items unchanged. |
| `riverRestSeen` | Finish/skip Nell and Kit’s `six-river-rest`. Reload after cure replays this scene if unfinished, without repeating treatment/reward. |
| `riverThanksSeen` | Returning to `riverhaven` completes `six-river-thanks`. |
| `riverReported` | Returning to `outermooring` completes `six-river-home`; Nell is at the chart. |

Nell remains on the ship until the explicit treatment choice after the terrace victory. There is no persistent “Nell left aboard / arrived at clinic but untreated” checkpoint. Interrupted treatment replays from the preceding safe state; skip commits both care-arrival and cure together. Validation requires both flags together and the full jungle prerequisite chain. Ordinary rests and victories cannot cure her. `nellIll` remains historical, and availability uses `nellIll && !nellRecovered`.

Recovery preserves every desert flag, reward and current optional letter state. Revisit the flight chart to continue Namar from its actual progress. All future desert scenes include recovered Nell, regardless of active/reserve status. The old ill berth is hidden and a separate chart-side conversation becomes available. Neither curing her nor breaking Namar’s seal completes Chapter Six.

The dev title has **Begin Iria (canonical)** (shared briefing complete, Namar unvisited, arrival unreplayed, 3270 XP) and **Begin Namar · Nell recovered (canonical)** (two jungle fights and treatment complete, 3810 XP, Nell/Kit/Celia active, new jungle loot in the bag, Namar untouched). Both are fresh authored saves and preserve manual slots.

## Boss and save rules

The head is an anchored three-contact unit, with two separate passive coils. Its armor is 7/4/1 as two/one/no coils survive. The head always takes damage. Living coils alternate vulnerability at each announcement; a single surviving coil remains vulnerable. Breaking a coil stops its reflected lanes immediately. Destroying the head removes both coils and ends the fight.

The fixed west/east/central breath sequence leaves glass from the actual fired cells. Only the next announcement reflects that glass, and its full affected shape is marked before the turn. Glass never deals a hidden round-end hit or blocks movement. Taunt redirects the complete breath, including reflections; Dazzle consumes attacks normally; areas hit the three-contact head once. Every legal available formation can enter without Nell.

Current-format saves accept the new maps only in Chapter Six and reject premature routes, missing palace choice booleans and fabricated checkpoint chains. Deep restores preload the entire kit. Earlier chapter saves and departures retain their IDs and resource rules. Levels eleven/twelve begin at 3500/4000 XP; the main desert route reaches 4050 from the canonical entry.

## Next work

Implement the northern journey from `chapter-six-plan.md`, retaining Namar’s progress. Keep Namar and Iria’s chart choices open without imposing a new order or adding a fever timer. Once the second seal exists, let both releases open the capital and proceed to the Emperor. Keep the god-domain departure separate. The optional cure must not gate the capital or the eventual hopeful ending.
