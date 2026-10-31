# Chapter Six — exact playable continuation

Implemented: the sealed-capital opening, Namar and Skeld seal expeditions, optional Iria treatment and allied capital quay. The two foreign routes work in either order, with Nell ill or recovered. The capital finale, Emperor and optional Lightbearer bad ending are now playable; The recovered route continues into the playable Chapter Seven; the untreated ending remains terminal.

## Entry and resources

The incoming save remains Chapter Five with `chapterFiveComplete`, journal `fiveDeparture` and boundary `chapter-six:capital-approach`. All three anchors, the Emperor offer, flagship victory, divine destruction and retaliation victory must already be complete. Load `outermooring`, `namar`, `sunpalace`, `skywalk`, `observatory`, `riverhaven`, `canopy` and `rainhouse`, plus `bellharbor`, `frostwatch`, `glacier`, `wintershrine`, `capitalquay`, all eleven tactical floors, Nell’s berth pose and both native boss kits before calling `beginChapterSix`. Failure leaves the Chapter Five departure intact for retry.

Entry changes only chapter, boundary and location: Chapter Six, null boundary, `outermooring` (32,29). Preserve the actual recruited roster, legal formation, HP/focus, inventory, XP, marks, bandages, journal and playtime. Nell stays ill and equipped; there is no automatic cure or formation reset. The Vite canonical start is authored from the actual prior chapter completion at 3270 XP, with twelve bandages and Kit/Orrin/Petra active. Manual save slots remain separate.

The mooring supply crew retains the earned Hammerplain, Dawnwatch and Windmere specialties under **Training → Specialist improvements**, using the allied crews’ fittings and drill notes. Prices and purchase flags are shared with the original specialists. These services continue at the allied quay and Chapter Seven training counters; neither ordinary training nor purchasing a specialty cures Nell.

## Incoming cinematic

The earned Chapter Five departure plays The long approach before the original
`six-sealed` arrival: the survey ship passes the fleet's smoke, Kit and Celia stay
beside ill Nell's cot, and Orrin/Petra watch the marble capital draw closer.
The city remains airborne. The bridge's unfolding, the Emperor's pact wall and
`capitalSealed` still belong to the playable Chapter Six opening. The cinematic
adds no reply from Nell, cure, flag, resource change or formation reset. It holds
the saved boundary for the same asset-checked entry, including missing-art retry,
return/export and replay. The Vite canonical Chapter Six start bypasses this
presentation of the prior chapter's departure.

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

`desertSealBroken` is the western seal. A western seal alone grants no `chapterSixComplete`, Emperor victory or Chapter Seven boundary. Those now belong to the capital finale below. Do not infer them from the regional payoff. The city, palace, terraces, observatory and safe ship remain revisitable. The post harness, optional focus and encounter items are once-only bag rewards, never auto-equipped.

## Iria checkpoints and recovery order

| Flag | Completion and continuation |
| --- | --- |
| `riverSeen` | Finish/skip `six-river-arrival` at `riverhaven`; Ines/Tavi prepare the medical launch. |
| `riverCrossingSeen` | First `canopy` arrival completes `six-river-crossing`. |
| `riverPatrolConfronted`, `riverPatrolWon` | Choose and win the lower crossing; 160 XP, 100 marks, reedweave coat. |
| `riverChainOpen` | Physically wind the capstan; `six-river-chain` completes and hides both chain art and collision. |
| `riverCacheWon` | Optional survey locker guarded by two separated crows and a patrolling hound; 90 XP, 75 marks, river range sight. |
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
| `capitalQuaySeen` | Cross to `capitalquay`; finish/skip `six-capital-quay`. The inner city continues through `capital-inner` once this arrival finishes. |

The winter dragon occupies only its two foot contacts as one anchored/flying unit. It inhales/pulls one legal hex, shatters west, breathes centrally and shatters east. Announcements are fixed by round. Taunt changes the actual fired shape and ice left behind. Loose ice is a separate passable terrain list, costing two movement and six cold HP at round end for grounded units; it clears on victory. No falling/stranding rule exists. The shared presentation preserves native alpha targeting, scene-clock breathing, distinct attack poses and reduced motion. Ordinary solo/two/three-companion entries are legal.

**Begin Skeld (canonical)** starts before the harbor arrival at 3270 XP ill or 3810 recovered; **Begin winter dragon (canonical)** includes the two main approach fights, leaving boss victory and both seals unset, at 3690/4230 XP. Both offer the authored condition in a modal. Recovered presets use Nell/Kit/Celia; ill presets use Kit/Orrin/Petra. Equipment remains in the bag unless explicitly authored in earlier canonical saves. Neither reads live campaign/workshop settings. `?dev=boss&boss=dragon` uses a separate level-12 preset with no campaign rewards.

The first region leaves the other seal available. Reports and objectives read both actual states. A mid-route cure does not replay discoveries or battles, restore other companions or change their loadouts/formation. All map entries, stage positions, rewards and release checkpoints remain ordinary current-version saves. Earlier Namar/Iria saves need no migration.

## Next work

Continue from the open allied landing into the Emperor’s preserved capital. Both pact seals are already released; do not invent another barrier or repeat the northern/desert journeys. People repeat ordinary work while the allied crews hold the quay. The Emperor remains undefeated, Chapter Six has no completion flag/boundary, the shard is intact and the god-domain departure stays Chapter Seven. Nell can be ill or permanently recovered; Iria must remain optional and accessible.


## Capital finale — implemented checkpoints

`capitalquay` → `stillcity` → `lastpalace` → (`lastmorning` → `lastshore` → palace awakening, only if recovered) → `crown`. The uncured outcome ends at `laststation`; the recovered outcome returns to `capitalquay`.

| Checkpoint | Completion and continuation |
| --- | --- |
| `capitalStreetSeen` | Avenue arrival; no fight/release granted. |
| `capitalProcessionConfronted` / `capitalProcessionWon` | Required patrol and once-only ceremonial coat reward. |
| `capitalStreetFreed` | Physical bronze return after victory; scenery/collision gate opens and residents leave. |
| `capitalPalaceSeen` | Living service ward contrasted with the remembered private household. |
| `capitalCommandConfronted` / `capitalCommandWon` | Palace commandant battle; pressure-crown nozzle reward. |
| `capitalHallOpened` | Attendants lift the cordon and the commandant carries a stretcher. |
| `capitalHuntersWon` / `capitalFocusTaken` | Independent optional cloister sight / service-locker medical focus; bag rewards, never auto-equipped. |
| `capitalAudienceSeen` | Recovered-only doorway scene. Ill Nell receives no offer, scene or remote dialogue. |
| `capitalMorningSeen` / `capitalMorningQuestion` / `capitalMorningLeft` | Drawn into the station, travel to the coast with Tomas, remember collection, then wake and refuse in the palace. The stable `capitalMorningQuestion` checkpoint now records completing the coast; `capitalMorningLeft` records the palace refusal. An interrupted coast or awakening replays its own scene. Both vision maps visually lead with Nell while preserving formation. |
| `capitalWarningSeen` | Celia’s report precedes the final choice. The uncured route offers Iria directly. Rest and ordinary visits never cure Nell. |
| `capitalAssaultCommitted` + `capitalRiskAccepted` | Successfully save slot `capital-return`, then atomically record the commitment and whether Nell is untreated. Failure leaves the stair uncommitted. The slot holds the exact earlier resources, loadouts, formation and progress. |
| `emperorSeen` / `emperorConfronted` / `emperorWon` | Crown arrival, battle commitment, actual victory and once-only guard reward. |
| `emperorFallen` | Crown-break scene with a dead, motionless Emperor and the unlit sun insignia. No Emperor dialogue. Interrupted scenes replay; completion/skip shares one callback. |
| `capitalReleased` / `capitalLandingSeen` | Recovered branch only; descend to the allied landing and show the wider collection. |
| `chapterSixComplete` | Explicit final-crossing choice at Alda; boundary `chapter-seven:hollow-sun`, still Chapter Six. No Chapter Seven entry exists yet. Allies/supplies remain revisitable. |
| `lightbearerSeen` / `lightbearerConfronted` / `lightbearerWon` | Untreated branch only; manifestation, second battle and victory. Nell does not speak and the Benefactor’s true body is unseen. |
| `nellLost` | Mantle-fall completion sets Nell’s HP to zero and the historical loss together, then travels to Larkspur’s aftermath. No rest or treatment can undo the committed route. |
| `emptySeatSeen` / `lightbearerEnding` | Playable aftermath and final train interaction. Terminal Chapter Six save, null boundary, no hopeful completion. Reload reopens the ending; its return button loads `capital-return`. |

The two final bosses share campaign/workshop rules and native assets. The Emperor has a seven-contact core and two passive three-contact supports. Both broken supports expose it; a later fourth-round coronation rebuilds vacant supports at half strength after at least two exposed rounds. A hero on a mounting prevents its revival. Core death ends the supports. The fourth attack is a pause. The Lightbearer’s fourth round instead shows Nell closing the shutter, zero attack and zero armor; the pause does not spend a Dazzle charge. Warnings are fixed per round except exact Taunt redirection. Areas hit each component once.

Vite starts **Capital** and **Final preparations** offer ill/recovered Nell. The former replays the quay before either city battle; the latter has the avenue/commandant cleared and the remembered morning authored complete only on its recovered variant. Neither grants Emperor rewards or final commitment. Both regional seals are already broken. Boss previews use `?dev=boss&boss=emperor` / `lightbearer` and never write campaign saves.

Nell and Kit’s revised affection follows [their arc notes](nell-kit-arc.md), including the recovery gate and real-sea payoff.

Petra’s accountability continues through [her arc notes](petra-arc.md): a Cinderbank passenger declines her help, she sends Dena her own account after Alban’s death, and she commits to answer the families in person after the sea trip. Neither her service nor the final victory grants a pardon.

Celia’s [personal arc](celia-arc.md) follows her uncertainty as a teacher through Sera’s support after Windmere, trusting Ines with Nell’s treatment, and accepting company and rest herself. Sera is a former pupil; Celia never knew the omitted pledge before the sanctuary discovery.

The Emperor’s [breakfast-window thread](emperor-arc.md) connects his Chapter Three memory of his wife, the bounded promise to Nell and the repeated household in the final palace. His private grief does not excuse the collection or revive his family; he remains dead and silent after vessel victory.

Orrin’s [crew-trust thread](orrin-arc.md) pays off Hammerplain at the capital patient hoist: he leaves Hester’s fitters to complete their own repair, sees it support the evacuation, and later hands the gate watch to the porter. The sea trip lets him rest while someone else runs the train.

The party’s [relationships while traveling](party-relationships.md) develop through shared work, disagreements, mutual care and a seaside card game. The optional deck talks adapt to regional progress; existing individual arcs and Nell’s recovery gates remain intact.

## Optional paid improvements

After treatment and `riverRestSeen`, Tavi offers Kit river-courier footing training in Iria; the desert's completion/order is irrelevant. Nell's cure and personal scenes remain free. Once the capital opens, recovered Nell can buy reinforced lantern housing from Orrin at the allied quay or palace preparation rests. Ill/deceased Nell cannot train. Airship training continues through the outer mooring and allied quay; see [economy.md](../economy.md).


The final train interaction saves the Lightbearer outcome before a single
continuous vector shot. It starts at Nell's folded coat on the empty bench,
pulls back to reveal the surviving companions and finally the broken lantern
beside Orrin, then lets the train depart as clouds flash and rain begins. It uses the good
ending's complete credits and retains **Borrowed Tomorrow** as its title.
**Cure Nell for additional story content.** is shown after the roll and in the
ending panel. There is no Nell actor, recovery or victory over the Benefactor.
Skip/finish and reload return to the existing ending panel; replay is optional
and the pre-assault checkpoint is retained. Workshop → Cinematics previews both
endings without campaign writes.


## Final crossing presentation

After Alda's **Prepare the final crossing** choice saves the recovered
`chapter-seven:hollow-sun` departure, a sixteen-second wordless vector film
carries the companions above the landed capital, through the broken sun and
onto a pier beneath the suspended sea. **Stay** still permits allies, training,
supplies and equipment before commitment. Return, export, reload and retry
preserve that actual departure; Chapter Seven begins only after its complete
native kit loads. Its original god reveal, warning and withdrawal follow the
film. Canonical Chapter Seven starts and the terminal Lightbearer ending retain
their existing behavior. See [the next handoff](chapter-seven-continuation.md).
