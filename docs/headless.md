# Headless campaign simulation

These commands use Vite’s existing TypeScript module loader in Node, without a browser, canvas, audio or Phaser scene. No new dependencies are required, and none of the runner is imported by the shipped game.

```sh
npm run simulate:early
npm run simulate:middle -- --from /tmp/borrowed-tomorrow-headless.json
```

The second command continues through Chapters Three and Four from the actual save earned by the first. If that report already exists, reuse it directly. It preserves the party, injuries, skills, equipment, money and supplies; it does not load a canonical fixture or grant resources. The CLI defaults to the defensive agent, offensive formation/upgrade priorities and prepared spending (see the comparison below). Default output is `/tmp/borrowed-tomorrow-middle.json`, leaving the input intact.

## Continuing and reviewing a run

`--from` accepts an early report, a completed continuation report or a normal exported version-11 save at the Chapter Two or Three departure. Invalid saves, unfinished chapters and reports marked failed are rejected. Inputs and outputs must have different paths. `--output` selects a report path; otherwise `BT_HEADLESS_REPORT` overrides the default. Keep generated reports outside the repository.

To stop at Chapter Three, then continue from that earned checkpoint:

```sh
npm run simulate:middle -- --from /tmp/borrowed-tomorrow-headless.json --through 3 --output /tmp/chapter-three.json
npm run simulate:middle -- --from /tmp/chapter-three.json --output /tmp/chapter-four.json
```

Select the alternate fights with `--conduit pressure` and `--harbor wet`; defaults are `feeds` and `dry`. `--skip-optional` skips the stores and survey patrols. Options for a chapter already completed in the input do not replay that chapter.

Continuation reports include the source file’s SHA-256, policy version, options, initial resources, final `state`, earned departure `checkpoints` and chronological `events`. Events record paths, choices, dialogue, purchases, skill upgrades, equipment/formation changes and resource snapshots. Battle traces record each decision and enemy ability, all fighters’ HP/focus/positions before and after, remaining items and the earth-plate release. Once a session begins, a failure writes its partial trace with `status: "failed"` and exits unsuccessfully. The campaign state in a failed battle remains the prebattle save; the last turn snapshots describe the failure. A 600-decision battle limit and a scene-continuation limit catch stalls.

`src/headless/campaign.ts` is the story/rules adapter; `tactics.ts` chooses legal moves and actions; `middle.ts` contains the route and deliberate player choices; `continue.ts` owns the CLI/report file. `run.ts` keeps the original early policy stable and exposes `playEarly` so route tests can earn their starting state from `newGame()`.

The original `middle-v1` behavior remains available with `--tactics legacy --build offense --spending baseline`. Programmatic sessions default to that baseline so existing route tests remain comparable.

The adapter checks visible interactions, access flags and real map paths, completes story callbacks and uses the shared combat, enemy AI, rewards, shopping, inventory and formation APIs. It accounts for multihex enemies, dangerous telegraphs/vents, simultaneous earth plates, team costs and a helper’s remaining movement. It never forces victories or retries defeats. The legacy policy ignores proactive Taunt, Shield bash and Wait. The defensive policy evaluates the former two; neither policy plans Wait.

## Early baseline

The scripted route starts with `newGame()`, walks map paths to visible interactions, executes the real story callbacks and chapter transition, and fights every encounter with the shared combat rules and enemy AI. It clears the optional shed and takes the loading-gate approach. It stops at the Chapter Three departure; no canonical checkpoints, forced victories or resource grants are used.

The deterministic tactical policy scores legal attacks and healing across reachable positions, penalizes friendly fire and approaches enemies when it cannot attack. It buys nothing, allocates earned skills in a fixed priority order and equips obtained loot through the inventory API. These are agent decisions, not changes to campaign auto-equipping. It explicitly rests in the tunnel and at the coastal engine; recruitment, village release, ward treatment and evacuation retain their normal scripted recovery.

Output includes each interaction’s walking distance and resource balance, plus battle rounds, actions, starting/ending HP and bandages consumed. `BT_HEADLESS_REPORT=/absolute/path/report.json npm run simulate:early` writes the complete report and final current-format save; the default is `/tmp/borrowed-tomorrow-headless.json`. Failure also writes the partial report and exits unsuccessfully. Combat has a 600-action limit to catch stalls. This command is separate from default CI.

Both chapters completed with no defeats or gameplay blockers on this route. No balance changes were needed to achieve completion. The party ended at level 5 with 250 marks and one bandage. No purchases means this run establishes earned income and supply consumption, not whether shop prices are appropriate.

| Battle | Rounds | Bandages consumed |
| --- | ---: | ---: |
| pursuit | 2 | 0 |
| workshop | 4 | 1 |
| collector | 3 | 1 |
| captain | 4 | 1 |
| coast-loading | 4 | 1 |
| coast-collector | 3 | 1 |
| coast-recapture | 4 | 1 |

## Chapters Three and Four baseline

All four `feeds/pressure` × `dry/wet` combinations completed from that early checkpoint, with both optional patrols, no defeats and no party knockouts. They finish at the Chapter Five departure with all five companions recruited, level 9 (1,355 XP), 692 marks and no remaining medical supplies. The Chapter Three departure is level 7 (805 XP), with 456 marks. No gameplay or balance changes were needed.

The route buys two ordinary bandages from the Chapter Three counter (16 marks), then two field bandages and one focus tonic at the refuge (50 marks). Total battle income is 508 marks: `250 + 508 - 66 = 692`. All three ordinary bandages are used in the capital arrest. The two field bandages and tonic are used later. There are four explicitly chosen rests, in addition to normal scripted recovery and victory healing.

After recruiting Petra, the agent uses Nell/Kit/Petra in the conduit; after recruiting Celia, it uses Nell/Orrin/Celia through the sanctuary road, then Nell/Celia/Petra against the warden. It allocates earned skills by a fixed per-character priority, equips better obtained bag items and exercises team attacks without stealing worn gear from reserves.

| Battle | Rounds |
| --- | ---: |
| capital-arrest | 4 |
| works-warden | 4 |
| palace-stores (optional) | 2 |
| heart-feeds / heart-pressure | 5 / 3 |
| works-survey (optional) | 1 |
| works-dry / works-wet | 3 / 3 |
| sanctuary-road | 4 |
| sanctuary-warden | 6 |

The pressure/wet run also completed without either optional patrol: six battles, level 9 (1,225 XP), 618 marks, the same purchases/rests and no knockouts. The sanctuary road took five rounds instead of four. Restarting from the earned Chapter Three departure produces exactly the same final save as the uninterrupted default route.

[chapter-four-earned.json](headless/chapter-four-earned.json) retains the default route’s earned final save, route summary and source provenance for the next continuation. It is a recorded simulation result, separate from the dev canonical starts. Regenerate it after gameplay changes; the route tests continue to earn their inputs rather than trusting this snapshot. Full turn traces are generated by the commands above.

The survey patrol is notably easy for this equipped party; the final warden takes six rounds. Income comfortably exceeds this route’s medical spending, but four free rests and scripted recovery matter. Consuming every item reflects this policy’s healing choices, not evidence that every purchase is required. These findings establish viable routes, not an exhaustive balance verdict or a complete economy model. There is no gear-buying/selling policy or formation/build search yet.

## Checks and limits

```sh
npm run test:headless
npm run check
```

The opt-in simulation suite earns the early checkpoint once, tests the four route combinations, compares split versus uninterrupted continuation and clears the route without optional rewards. Its `.simulation.ts` files stay outside the small default CI gate. Default tests cover input validation, inaccessible interactions, rejected formation changes, isolated tactical planning and team-helper turns.

These runs do not test rendering, hit areas, animation, asset loading or audio. The scripted routes currently stop after Chapter Four. Later chapters need their own route, checkpoint-prompt and trigger handling before they are supported; a successful run is not evidence about those chapters. The earned Chapter Four `state`/checkpoint is available for that next continuation.

## Defensive and spending comparison (middle-v2)

Run `npm run simulate:compare -- --from /tmp/borrowed-tomorrow-headless.json` for six policies using identical earned inputs and routes. Optional `--conduit pressure`, `--harbor wet` and `--skip-optional` select route variants. Each run writes a full trace in a new temporary directory; its `summary.json` records spending, actual HP lost (including retaliation and hazards), knockouts, ability/item use and rounds/minimum HP for each battle. Failed runs remain failures and produce a nonzero exit. The CLI reports the directory. These comparisons remain outside default CI.

`--tactics defensive` shortlists a stationary and moving target per legal ability plus reachable Defend positions, then resolves each candidate on a copy using the real cast/move rules. Retaliation, friendly fire, barriers, Dazzle, Taunt, Daybreak, bonus shoves, team costs and items therefore affect the evaluation. A bounded forecast lets pending enemies act without intervening allied attacks; ordinary movement, cover and enemy targeting now matter alongside boss telegraphs. It penalizes low HP/knockouts, focus spending and consumables. A spent helper can relocate to reduce exposure or end its movement. Earth-plate assignments keep their existing policy until the shield opens.

This is a conservative heuristic, not a complete search: the shortlist can miss a better position, the forecast omits future allied actions and later rounds, and Shield bash is evaluated without a full follow-up combo search. No planning copy is committed as a real turn.

`--build support` prioritizes healing/control upgrades and uses Nell/Orrin/Petra in Chapter Three and Nell/Petra/Celia in Chapter Four. The offensive rotation uses Nell/Kit/Petra, then Nell/Orrin/Celia; both finish with Nell/Celia/Petra. Existing purchased skill ranks are never reset. Upgrade priorities often converge at these levels, so the formation difference is the meaningful distinction in this checkpoint comparison.

`--spending frugal` tops up to two bandages and one field bandage, preserves at least 32 marks and penalizes item use more strongly. `prepared` targets three bandages, two field bandages and one tonic, and buys/equips strictly better available gear for recruited characters while retaining 80 marks for gear purchases. It visits the pump-house supplier after Celia joins. Both buy through actual open shops and respect stock/ownership; neither sells loot. The baseline policy retains the original fixed purchases.

The six policies completed both before and after the targeted stock/deployment changes, with no party knockouts. [balance-comparison.json](headless/balance-comparison.json) retains source hashes and detailed summaries. These are the feeds/dry routes with optional patrols:

| Policy | HP lost before → after | Marks spent before → after | Final marks after | Survey rounds after |
| --- | ---: | ---: | ---: | ---: |
| Legacy / offense / baseline | 644 → 643 | 66 → 66 | 692 | 2 |
| Legacy / offense / prepared | 663 → 693 | 90 → 364 | 394 | 3 |
| Defensive / offense / prepared | 514 → 445 | 90 → 356 | 402 | 2 |
| Defensive / support / prepared | 757 → 620 | 90 → 364 | 394 | 3 |
| Defensive / offense / frugal | 509 → 508 | 42 → 42 | 716 | 2 |
| Defensive / support / frugal | 731 → 751 | 42 → 42 | 716 | 2 |

Before changing the game, defensive offense reduced HP lost from 663 to 514 with the same prepared purchases/formation. This supports fixing the agent before weakening enemies. The support formation takes longer and can lose more total HP despite using protection; it is not universally stronger. The later stock/deployment changes further reduce damage for the prepared defensive runs, but not for every policy. Cumulative HP loss is not a difficulty score on its own.

The survey patrol now approaches from separated upper/lower lanes with central cover. Its two enemies and their stats/rewards are unchanged; it lasts two or three rounds across these policies. No ability range, damage, enemy targeting rule or boss statistic changed.

Conduit counters now sell coastal fittings and insulated coats; medical counters also offer coats and Celia’s medic clasp. Prepared agents spend 356–364 marks, with 394–402 left. Frugal agents still complete with only 42 marks spent. Useful spending is available without making it mandatory or removing free rest. Later equipment stock and wider party/build searches remain follow-up work.

[chapter-four-defensive.json](headless/chapter-four-defensive.json) is the new default earned checkpoint (level 9, 402 marks). The original `chapter-four-earned.json` is retained as the historical middle-v1 result, not silently relabeled as a current run.


## Fresh campaign audit — 2026-10-27

Replayed main `08ef95cfbfbd194692ba40205f6b23e19f8c2cec` from `newGame()`, then continued from that newly earned Chapter Two departure. No pre-existing or canonical save was loaded, and no victories, resources or retries were supplied. [fresh-campaign-audit.json](headless/fresh-campaign-audit.json) records source/report hashes, route and policy summaries, battle metrics, enemy idle-turn audits and reproduction commands. Full generated traces remain outside the repository.

The default route won all **15 battles** through Chapters One–Four and reached the **Chapter Five departure**, level 9 / 1,355 XP, with all five companions, **402 marks, no bandages or field bandages, and one focus tonic**. Its final save is identical to the recorded [defensive checkpoint](headless/chapter-four-defensive.json). Stopping at the newly earned Chapter Three departure and continuing through the CLI also gives the same final save.

All four feeds/pressure × dry/wet combinations completed, as did pressure/wet without either middle optional patrol. No defeats or knockouts were observed. Prepared pressure routes end with 410 marks; skipping both optional rewards ends with level 9 / 1,225 XP and 336 marks. The six-policy comparison reproduces the existing middle-v2 damage/spending results exactly, and all eight opt-in simulation checks pass. No gameplay, balance or runner changes were needed.

Potential follow-up issues, rather than confirmed blockers:

- **Boss engagement delay:** in the default sanctuary fight the guardian spends rounds 1–3 approaching and defending, then uses Steam in rounds 4–6 before falling in round 7. Taunt forces Petra as its target in rounds 2–3. Every one of the nine enemy Defends across the default middle trace was replayed against the real rules: none had a legal attack from a reachable position. This is a pacing/positioning concern, not a recurrence of choosing Defend over an available attack. Review approach distance and ways to keep pressure on the party while preserving useful Taunt.
- **Surplus spending power:** the prepared defensive route spends 356 marks and still ends with 402; frugal routes spend 42 and end with 716, also without knockouts. Four deliberate free rests and scripted/victory recovery matter. Review later useful stock and optional spending before cutting rewards or making medicine mandatory.
- **Short-lived bought fittings:** the 46-mark coastal reflector serves only the arrest and works warden before the free silver reflector replaces it. Celia's 36-mark medic clasp serves the survey and harbor approaches before the field clasp replaces it; skipping the survey shortens that to one fight. These are legitimate purchases, but their short lifetime may feel unrewarding. Sale value and the agent's refusal to sell should be included in any price review.
- **Support payoff needs a better probe:** defensive support takes 620 vs 445 observed HP loss with prepared spending, or 751 vs 508 when frugal. Dazzle and Rally are unused in all six policy runs; Burst accounts for 20–24 casts per middle run. Formation, upgrades and the heuristic's limited forecast confound these comparisons. Improve the agent's support/combo evaluation and test deliberate control strategies before treating this as evidence to buff or weaken abilities.
- **Conduit alternatives may be uneven for a prepared party:** the default feeds fight takes five rounds / 46 observed HP loss; pressure takes three / 26, with the same rewards and eight fewer marks spent on supplies across the route. Earth-plate setup explains some of the difference. Compare human puzzle difficulty and additional formations before changing either path.

This audit does not cover Chapter Five onward, the other Chapter Two approach, selling, or alternate purchases/builds from level one. The early no-purchase route is still the fixed baseline; all middle comparisons inherit its earned skills and loot. Headless success does not verify presentation or prove that a new human player will find the fights easy.


## Sanctuary Warden engagement correction

The guardian now starts in the open central lane at column 5, three columns ahead of its former rear deployment. The two crows, rocks, shallow water, movement, attacks, HP, damage bonuses, rewards and shared enemy AI are unchanged. A party holding its initial ground is within a legal first-turn Steam approach. Taunt can still force an approach turn when Petra is farther away; it does not allow the guardian to ignore her and hit a nearer target instead.

A new zero-start default run still clears all fifteen encounters and reaches the Chapter Five departure without knockouts. The guardian's opening changes from three Defends to one approach/Defend followed by Steam in rounds 2, 3 and 4. The fight takes five rounds instead of seven, with 119 observed HP lost instead of 114; earlier pressure replaces the long idle opening rather than increasing its stats. All six policy runs complete without knockouts, and all make the guardian attack by round 1 or 2. Across those policies the fight takes four to seven rounds.

[chapter-four-engaged-warden.json](headless/chapter-four-engaged-warden.json) is the **current earned continuation checkpoint**: level 9 / 1,355 XP, 402 marks, one ordinary bandage, one field bandage and one focus tonic. It includes the accepted deployment's source hash and the six before/after boss summaries. The earlier defensive checkpoint and fresh audit remain historical results for the former deployment.

All eight opt-in route simulations pass, including alternate conduit/harbor paths, optional-patrol omission and split-save continuation. The defensive earned-route tests now require a Steam attack by the second round, while a focused rule test checks opening pressure against a stationary starting party. The 695 unit tests, TypeScript and production build pass. No new CI jobs or default chapter-playthrough tests are added.

## Cooperative support probe

`--tactics cooperative` adds a bounded lookahead alongside the unchanged `legacy` and `defensive` controls. It shortlists distinct affected groups per skill, keeps a finalist for every available command, and resolves the actual initiative through the end of the following round. Allies use the fixed greedy policy; enemies use the campaign AI. Rally can enable a later ally's attack, Dazzle can reduce multiple attacks/retaliations, and bonus Shield bash receives a main-action followup. Team moves really spend both actions and focus costs; the cooperative evaluation does not apply a fixed partner discount. All planning uses disposable copies; movement and attack remain separate committed decisions.

```sh
npm run simulate:compare -- --from /tmp/borrowed-tomorrow-headless.json
npm run simulate:support -- --from /tmp/borrowed-tomorrow-headless.json --output /tmp/support-probe.json
npx vitest run tests/headless-cooperation.test.ts
```

The route comparison includes four cooperative policies paired with the existing defensive offense/support and prepared/frugal policies. Compare tactics **within the same build and spending policy**; comparing offense against support still changes the formation and skill priorities.

The support probe earns the defensive/support/prepared route once, then replays the exact starting battles for the capital arrest, dry harbor approach and Sanctuary Warden. It compares defensive, cooperative, cooperative without class utilities, and cooperative without team commands. Only commands on probe copies are suppressed: no HP, focus, equipment, learned rank, terrain, enemy or initiative changes. Utilities here mean Dazzle/Feint, barriers, Taunt, Rally, Shield bash, Pinning shot and Daybreak; healing and items remain available. Each encounter records its input hash, formation/build/stats, actual HP lost/healed, knockouts, minimum HP, rounds, command use and remaining supplies. The campaign earns victory normally; replay probes grant no rewards or retry resources.

Focused stationary-lane tests isolate sustained pressure, a focus-starved Steam formation, an immediate kill and spent helpers. They are deliberate tactical fixtures, not evidence about campaign difficulty. The lookahead is bounded, uses greedy allied continuations and does not search formations, equipment, Wait or all future control combinations. The default remains the faster defensive policy; the more expensive cooperative policy and full comparisons stay opt-in and add no CI jobs.
