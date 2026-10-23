# Chapter Six — exact playable continuation

Implemented: the sealed-capital opening, Namar and Skeld seal expeditions, optional Iria treatment and allied capital quay. The two foreign routes work in either order, with Nell ill or recovered. The inner capital and Emperor climax remain upcoming content.

## Entry and resources

The incoming save remains Chapter Five with `chapterFiveComplete`, journal `fiveDeparture` and boundary `chapter-six:capital-approach`. All three anchors, the Emperor offer, flagship victory, divine destruction and retaliation victory must already be complete. Load `outermooring`, `namar`, `sunpalace`, `skywalk`, `observatory`, `riverhaven`, `canopy` and `rainhouse`, plus `bellharbor`, `frostwatch`, `glacier`, `wintershrine`, `capitalquay`, all eleven tactical floors, Nell’s berth pose and both native boss kits before calling `beginChapterSix`. Failure leaves the Chapter Five departure intact for retry.

Entry changes only chapter, boundary and location: Chapter Six, null boundary, `outermooring` (32,29). Preserve the actual recruited roster, legal formation, HP/focus, inventory, XP, marks, bandages, journal and playtime. Nell stays ill and equipped; there is no automatic cure or formation reset. The Vite canonical start is authored from the actual prior chapter completion at 3270 XP, with twelve bandages and Kit/Orrin/Petra active. Manual save slots remain separate.

## Checkpoints

| Flag | Completion and continuation |
| --- | --- |
| `capitalSealed` | Finish/skip `six-sealed`; the capital barrier appears and the crew discusses foreign returns. The opening replays if interrupted. |
| `sixRoutesKnown`, `jungleLeadKnown` | Finish/skip `six-briefing`; record both pact destinations and Sera’s river referral. Iria, Namar and Skeld are playable immediately. |
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

`desertSealBroken` is the western seal. There is no `chapterSixComplete`, Emperor victory or Chapter Seven boundary in this implementation. Do not infer them from the regional payoff. The city, palace, terraces, observatory and safe ship remain revisitable. The post harness, optional focus and encounter items are once-only bag rewards, never auto-equipped.

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

Recovery preserves every northern/desert flag, reward and current optional letter state. Revisit the flight chart to continue Namar from its actual progress. All future foreign-expedition scenes include recovered Nell, regardless of active/reserve status. The old ill berth is hidden and a separate chart-side conversation becomes available. Neither curing her nor breaking Namar’s seal completes Chapter Six.

The dev title has **Begin Iria (canonical)** (shared briefing complete, Namar unvisited, arrival unreplayed, 3270 XP) and **Begin Namar · Nell recovered (canonical)** (two jungle fights and treatment complete, 3810 XP, Nell/Kit/Celia active, new jungle loot in the bag, Namar untouched). Both are fresh authored saves and preserve manual slots.

## Boss and save rules

The head is an anchored three-contact unit, with two separate passive coils. Its armor is 7/4/1 as two/one/no coils survive. The head always takes damage. Living coils alternate vulnerability at each announcement; a single surviving coil remains vulnerable. Breaking a coil stops its reflected lanes immediately. Destroying the head removes both coils and ends the fight.

The fixed west/east/central breath sequence leaves glass from the actual fired cells. Only the next announcement reflects that glass, and its full affected shape is marked before the turn. Glass never deals a hidden round-end hit or blocks movement. Taunt redirects the complete breath, including reflections; Dazzle consumes attacks normally; areas hit the three-contact head once. Every legal available formation can enter without Nell.

Current-format saves accept the new maps only in Chapter Six and reject premature routes, missing palace choice booleans and fabricated checkpoint chains. Deep restores preload the entire kit. Earlier chapter saves and departures retain their IDs and resource rules. Levels eleven/twelve begin at 3500/4000 XP; the main desert route reaches 4050 from the canonical entry.

## Skeld checkpoints and both-seal landing

| Flag | Completion and continuation |
| --- | --- |
| `northSeen` | Finish/skip `six-north-arrival` in `bellharbor`; Edric has already ordered withdrawal and Signe carries his commission. |
| `northWatchSeen` | First `frostwatch` arrival completes `six-north-watch`. |
| `northWatchConfronted`, `northWatchWon` | Choose/win winter patrol: 180 XP, 110 marks, storm-lined coat. |
| `northPassOpened` | Physically lift the windlass gate; `six-north-gate` removes matching visible/collision layers. |
| `northLogRead` | Open the main-route dispatch cabin in `glacier`; Egil recognizes the White Finch and Signe keeps the cut-tow orders. |
| `northHuntersConfronted`, `northHuntersWon` | Clear upper shelf: 240 XP, 130 marks, cold-weather expansion valve. |
| `northCacheConfronted`, `northCacheWon` | Optional stores: 100 XP, 80 marks, winter range sight. |
| `winterShrineSeen` | First `wintershrine` arrival completes `six-north-shrine`. Camp rest remains available. |
| `winterDragonConfronted`, `winterDragonWon` | Choose/win the dragon: 430 XP, 230 marks, sanctuary saber guard. |
| `northSealBroken` | Finish/skip `six-north-release` at the bell mounting; interrupted scenes leave the seal intact for retry. |
| `northReturned` | Return to `bellharbor`; complete `six-north-return`, opening both original log and surviving orders publicly. |
| `northReported` | Return to `outermooring`; complete `six-north-home` with the appropriate Nell state. |
| `capitalOpened` | With both `desertSealBroken` and `northSealBroken`, finish/skip `six-capital-open` at the mooring. Barrier art disappears and the landing interaction becomes an exit. |
| `capitalQuaySeen` | Cross to `capitalquay`; finish/skip `six-capital-quay`. The inner city remains the next adventure. |

The winter dragon occupies eleven valid contacts as one anchored/flying unit. It inhales/pulls one legal hex, shatters west, breathes centrally and shatters east. Announcements are fixed by round. Taunt changes the actual fired shape and ice left behind. Loose ice is a separate passable terrain list, costing two movement and six cold HP at round end for grounded units; it clears on victory. No falling/stranding rule exists. The shared presentation preserves native alpha targeting, scene-clock breathing, distinct attack poses and reduced motion. Ordinary solo/two/three-companion entries are legal.

**Begin Skeld (canonical)** starts before the harbor arrival at 3270 XP ill or 3810 recovered; **Begin winter dragon (canonical)** includes the two main approach fights, leaving boss victory and both seals unset, at 3690/4230 XP. Both offer the authored condition in a modal. Recovered presets use Nell/Kit/Celia; ill presets use Kit/Orrin/Petra. Equipment remains in the bag unless explicitly authored in earlier canonical saves. Neither reads live campaign/workshop settings. `?dev=boss&boss=dragon` uses a separate level-12 preset with no campaign rewards.

The first region leaves the other seal available. Reports and objectives read both actual states. A mid-route cure does not replay discoveries or battles, restore other companions or change their loadouts/formation. All map entries, stage positions, rewards and release checkpoints remain ordinary current-version saves. Earlier Namar/Iria saves need no migration.

## Next work

Continue from the open allied landing into the Emperor’s preserved capital. Both pact seals are already released; do not invent another barrier or repeat the northern/desert journeys. People repeat ordinary work while the allied crews hold the quay. The Emperor remains undefeated, Chapter Six has no completion flag/boundary, the shard is intact and the god-domain departure stays Chapter Seven. Nell can be ill or permanently recovered; Iria must remain optional and accessible.
