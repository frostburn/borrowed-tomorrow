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

`src/headless/campaign.ts` is the story/rules adapter; `tactics.ts` chooses legal moves and actions; `middle.ts` and `five.ts` contain the routes and deliberate player choices; `continue.ts` owns the CLI/report file. `run.ts` keeps the original early policy stable and exposes `playEarly` so route tests can earn their starting state from `newGame()`.

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

These runs do not test rendering, hit areas, animation, asset loading or audio. The scripted routes currently stop after Chapter Five. Chapter Six onward needs its own route and checkpoint-prompt handling before it is supported; a successful run is not evidence about those later chapters. The earned Chapter Five checkpoint records the actual Chapter Six departure.

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

### Controlled encounter findings

The exact-start support/prepared probes give these **HP lost / rounds** results (zero knockouts in all twelve fights):

| Encounter | Defensive | Cooperative | Without utilities | Without teams |
| --- | ---: | ---: | ---: | ---: |
| Capital arrest | 55 / 3 | 77 / 3 | 77 / 3 | 77 / 3 |
| Dry harbor | 148 / 5 | 153 / 5 | 151 / 4 | 151 / 4 |
| Sanctuary Warden | 174 / 6 | 102 / 4 | 132 / 5 | 102 / 4 |

At the warden, the cooperative agent applies Dazzle once and wins in four rounds. Suppressing utilities removes that cast and costs thirty more HP and a fifth round; suppressing team commands has no effect because the agent does not use them there. At the harbor, the cooperative agent uses Rally twice and Daybreak once, but this does not dominate the alternatives: without teams it wins a round sooner at a lower minimum HP (38 versus 46) and uses a field bandage. Different healing and remaining supplies matter alongside total HP lost. The arrest is a counterexample where the faster defensive agent does better. The longer forecast is a useful additional probe, not a universally stronger player.

The deliberate lane fixtures also check that Rally enables a three-target Steam lance after the normal focus tick, Dazzle is not refreshed, a cheap immediate kill beats waiting/teaming, and a spent helper cannot attack again. Another fixture checks the real main-action followup after bonus Bash. Forecasts share the same ending-round boundary even when a candidate starts the next round. Completed real turns remain in failure reports if a later planning action throws.

These results justify withdrawing the inference that unused support implies weak support. No ability/enemy/item stats, prices, rewards, free rests or campaign formations are changed. Better allied continuation policies, Wait and broader formation/build searches remain possible future probes, not reasons to rebalance from this sample.

### Fresh route comparison

A fresh `newGame()` run reproduces the earned Chapter Two input (SHA-256 `25bb12165861d1157e4e68c8b46eafa2855ba2ffb89d33ef813abdb57b100560`). All ten route policies then reach the Chapter Five departure without defeats or knockouts. The original six controls reproduce their previous results exactly. Paired HP-loss totals are:

| Build / spending | Defensive | Cooperative |
| --- | ---: | ---: |
| Offense / prepared | 450 | 515 |
| Support / prepared | 643 | 571 |
| Offense / frugal | 524 | 503 |
| Support / frugal | 811 | 734 |

Cooperative prepared support uses Rally four times and spends 356 rather than 364 marks; cooperative prepared offense uses Dazzle once and several different teams. Frugal cooperative offense also uses Feint and Rally. Support remains a viable, slower formation rather than universally matching the offensive formation. The new policy performs worse on prepared offense, which is another reason to retain the defensive default and compare multiple policies.

[support-comparison.json](headless/support-comparison.json) records all ten route summaries, twelve controlled results, remaining supplies, source hashes and reproduction commands. Full turn traces are generated in the temporary directory printed by `simulate:compare`; they now include Dazzle, pin, Taunt and team-action state. The current earned continuation checkpoint remains [chapter-four-engaged-warden.json](headless/chapter-four-engaged-warden.json), since the default policy and gameplay are unchanged. All 704 unit tests, eight opt-in route checks, TypeScript and production build pass. Only the focused tactical tests join the small default test gate; the longer comparisons are opt-in.

## Conduit route balance

The sealed feeds regulator now has **170 HP instead of 210**. Cutting its supply earns a shorter cleanup after occupying the two earth plates. The pressure route is unchanged at 190 HP: no shield setup, two crows and live vents. Damage bonuses, warnings, plate positions, enemy counts, rewards, prices and route requirements are unchanged. Both routes still award 135 XP, 80 marks and the insulated coat; pressure still supports solo formations.

The original offensive comparison favored pressure in both time and HP lost. Support formations already found pressure more dangerous, so strengthening that route would overcorrect. Reducing only the sealed core preserves a useful choice: take the exposed approach for speed and freedom of deployment, or solve the plates for a weaker core and safer fight.

`node scripts/compare-conduit.mjs --from /tmp/early.json --output /tmp/conduit.json` earns both Chapter Three branches from the same early checkpoint for defensive offense/support × prepared/frugal policies. Each pair enters with identical hero HP, focus, skills and equipment bonuses. It uses actual campaign turns, normal rewards and no retries or granted resources. The detailed comparison stays outside default CI.

| Build / spending | Feeds before → after (rounds / HP lost) | Pressure unchanged (rounds / HP lost) |
| --- | ---: | ---: |
| Offense / prepared | 5 / 46 → 4 / 16 | 3 / 26 |
| Offense / frugal | 5 / 36 → 4 / 17 | 3 / 28 |
| Support / prepared | 4 / 29 → 3 / 29 | 3 / 65 |
| Support / frugal | 4 / 32 → 4 / 32 | 3 / 76 |

All eight routes complete without knockouts. [conduit-routes.json](headless/conduit-routes.json) records before/after metrics, initial builds and source hashes. These are bounded agent comparisons, not claims that a human will solve the plates immediately. The opt-in regression requires the prepared offensive plate route to take at most one extra round while losing less HP than pressure. Existing tests preserve the normal plate release, three-contact targeting, fixed warnings, solo pressure option and once-only rewards.

The default full run still wins all fifteen battles through Chapter Four and produces **exactly the same final save** as [chapter-four-engaged-warden.json](headless/chapter-four-engaged-warden.json); that remains the current earned continuation checkpoint. Older audits and support-comparison records describe the former 210-HP sealed core and remain historical evidence.

## Chapter Five continuation

`npm run simulate:five -- --from <earned-chapter-four-report-or-save.json> --output /tmp/five.json` continues the actual Chapter Four departure through the airfield, three anchor regions, flagship, divine intervention and hunters' defense to `chapter-six:capital-approach`. It keeps real skills, gear, HP/focus, money and medical stocks. Shops, rests, formation changes, manual fitting, pathfinding, choices, boss aftermaths and combat all use the shared campaign rules; no canonical start, forced victory, retry or resource grant is used.

The default visits Hammerplain → Dawnwatch → Windmere, takes the freight lift and western mortar first, and collects the optional safety-store/field-coat/reflector loot. `--order windmere,dawnwatch,hammerplain`, `--forge race`, `--first-gun repeater` and `--skip-optional` exercise alternatives. Existing `--tactics`, `--build` and `--spending` policies remain available. Supplies are bought through the actual field counters. The agent rests there when an available companion needs HP/focus, including reserves; illness never counts as something ordinary rest can cure.

`--through regions` stops at the earned pre-finale ship checkpoint. The report's `state` can be passed back to the same command to finish; named regional checkpoints and `five-regions` are also recorded. Restoring uses the normal story dispatcher. Only the Chapter Four departure and ship checkpoints between completed regions/before flagship victory are accepted; partial regional routes and post-flagship scenes are not resumable through this command. `--through regions` is not a completed-chapter claim. Failed reports still cannot resume.

The first complete run clears all twelve fights without knockouts. Nell becomes ill through the normal story callback, leaves the formation, and stays at 1 HP/0 focus despite resting before the hunters. The remaining three fight and reach the real Chapter Six boundary. The longer Chapter Five route checks remain opt-in; no complete journeys are added to normal CI.

### Initial Chapter Five audit (before boss pressure changes)

A fresh `newGame()` → early → middle → five run wins **27 battles** through the end of Chapter Five, without defeats, knockouts, retries or granted resources. Its newly earned Chapter Four state exactly matches the recorded input. All six regional orders pass the opt-in route suite. Both the Hammerplain return and pre-finale checkpoints resume to the same final save without replaying rewards. A focused regression also covers completing all three regions before visiting the Emperor's cabin.

| Chapter Five run | Battles | HP lost | Marks spent | Final marks | Rests | Knockouts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Default offense / prepared | 12 | 528 | 120 | 1,575 | 6 | 0 |
| Reverse order / race / repeater / no optional loot | 11 | 474 | 86 | 1,564 | 6 | 0 |
| Support / frugal | 12 | 606 | 70 | 1,625 | 5 | 0 |
| Offense / frugal | 12 | 517 | 32 | 1,663 | 6 | 0 |

The default finishes at **level 10 / 3,475 XP**, with three bandages, two field bandages and one focus tonic. Kit/Orrin/Celia are active for the hunters; Nell remains recruited, equipped and unavailable at 1 HP/0 focus. The new coat, valve, shield brace, reflector, medical focus and fleet sight are earned and manually fitted, including Kit's new sight before the final defense. Alternate policies inherit the checkpoint's earlier skill purchases; they do not reset ranks or constitute a fresh support build from level one.

- [chapter-five-earned.json](headless/chapter-five-earned.json) is the **current earned continuation checkpoint**, at the real `chapter-six:capital-approach` boundary.
- [chapter-five-regions-earned.json](headless/chapter-five-regions-earned.json) records Acts I–III and the Emperor offer/alliance, before entering Alban's cordon. Continue it with `npm run simulate:five -- --from docs/headless/chapter-five-regions-earned.json --output /tmp/finale.json`.
- [chapter-five-audit.json](headless/chapter-five-audit.json) records source/report hashes, the fresh prefix, four detailed policy/route summaries and reproduction commands. Full turn traces stay outside the repository.

No blocking campaign issue was observed. The deferred-offer resume problem was in the new headless adapter and is corrected; it does not require changing campaign story code. No combat, equipment, reward, price, save-format or map rule changes were needed.

Potential follow-ups:

1. **Late bosses permit low-pressure wins.** Default ward-engine and flagship losses are six and zero HP respectively; the alternate recorded runs lose zero–sixteen on the ward and up to twenty-two on the flagship. The engine's projection interruption and fixed, avoidable cannon warnings are working. Before changing them, compare formations and human-style play: this agent forecasts actual enemy decisions, so these figures do not establish human difficulty.
2. **Useful spending falls further behind income.** The default earns 1,293 marks and spends 120, entirely on medicine. The field counters offer no equipment upgrade that this prepared party buys; regional loot supplies its upgrades. Six useful free rests and victory/level-up recovery limit attrition. Later useful stock is a stronger candidate than charging for rest or indiscriminately reducing rewards. No selling policy is used.
3. **Skill progression pauses through most of the chapter.** The default reaches level ten after the optional safety store, then stays there for the remaining ten fights. It ends only 25 XP short of level eleven. The three regions still award equipment, but the long skill-point plateau may merit an XP-threshold review.

All **708 unit tests**, **17 opt-in headless route checks**, TypeScript and production build pass. Detailed route permutations remain outside default CI. These runs do not cover rendering, animations, audio, other early-campaign choices, selling, exhaustive builds or any Chapter Six expedition.

## Chapter Five boss pressure correction (before direct attacks)

The exposed ward lens previously covered only row four; the flagship's exposed bridge covered only row five. Once the early threats were removed, a party could park closer to either core and attack from permanently safe cells. Those low-pressure wins were reproducible across several formations, not evidence that every late-game fight is easy.

Windmere now has two staggered, ordinary Slag crows. Breaking the lit projection still interrupts that round's beam, and stopping the core also shuts down its screen. With both projections gone, the weaker crossbeam sights a living hero at each round announcement and crosses two axes. The separate Chapter Seven ward profile retains its old pattern.

Flagship batteries sight the nearest living hero when announcing their raking axis/bombardment. The bridge rotates its target; its exposed broadside crosses two axes through that round's sighted position. The two marines start on different rows and have 98 rather than 58 HP, matching Dawnwatch's shield troops. The guns and cores keep their existing HP and damage. Warnings remain fixed during the round, with the existing Taunt redirect; Dazzle, barriers, healing, single-hit boss contacts and permanent component destruction retain their normal rules. Both crow guards are present from the start; stopping the core or bridge ends the fight as before.

| Same earned state / formation | Before (rounds / HP lost) | After (rounds / HP lost) |
| --- | ---: | ---: |
| Default ward · Nell/Orrin/Celia | 4 / 6 | 6 / 108 |
| Default flagship · Nell/Orrin/Celia | 5 / 0 | 5 / 76 |

All sixteen matched scenarios still win without knockouts. Ward losses range from 14–115 HP and flagship losses from 32–106, across offensive/support parties, prepared/frugal inputs and Windmere-first equipment. The default lens itself now causes 38 HP of damage and the flagship bridge 47; pressure persists after the guard/gun opening. A second, greedy controller also wins all sixteen replays without knockouts. Fast Kit/Petra formations clear the ward screen efficiently and still win with little damage. These are bounded agent comparisons, not a human difficulty score.

[chapter-five-boss-inputs.json](headless/chapter-five-boss-inputs.json) contains six actual pre-battle saves captured from three complete runs on base `26661a9e6d1aee6b2a123d8d516d2060a88569c5`. Replays change formation through the normal rules and preserve each input's HP, focus, learned ranks, worn gear and stock. [chapter-five-boss-pressure.json](headless/chapter-five-boss-pressure.json) records matched input hashes, before/after metrics, enemy damage, greedy replays, source hashes and the fresh full run. Reproduce the comparison, including the original rules, with:

```sh
git worktree add --detach /tmp/bt-before 26661a9e6d1aee6b2a123d8d516d2060a88569c5
node scripts/compare-chapter-five-bosses.mjs --root /tmp/bt-before --output /tmp/before.json
node scripts/compare-chapter-five-bosses.mjs --output /tmp/after.json
node scripts/compare-chapter-five-bosses.mjs --tactics legacy --output /tmp/greedy.json
```

A fresh run from zero still wins all 27 battles through Chapter Five without knockouts. Chapter Five now loses 706 HP, spends 146 marks and ends with **1,549 marks**, the same three bandages/two field bandages/one tonic, and seven useful rests. XP, rewards, Nell's illness and the Chapter Six boundary are unchanged. Both [chapter-five-earned.json](headless/chapter-five-earned.json) and [chapter-five-regions-earned.json](headless/chapter-five-regions-earned.json) are regenerated from this run; they are the current continuation/finale-review inputs. The initial Chapter Five audit above remains historical.

All 715 unit tests, seventeen opt-in route checks and build pass. Focused rule tests prove that standing in the old upper safe rows takes damage, legal movement escapes an announced warning, moving does not make it home in, and the next round re-sights. Desktop 1280×800 and phone 390×844 Playwright checks cover both encounters, the visible guard/warning layouts, panning, Defend and initiative; no framework overlays or app console errors were seen. The Browser plugin was unavailable, so local Chromium was used. Full chapter journeys remain outside the default CI gate.

## Direct attacks from later bosses (#137, before team-output adjustment)

Large bosses from Chapter Five onward now fire one lighter direct shot before their marked main attack. Only the flagship bridge gets the extra action. Targets rotate between living fighters and obey Taunt; armor, Defend, barriers and Dazzle apply normally. A broken lit ward projection cancels both attacks without consuming Dazzle, and the vessel/Lightbearer/Benefactor fourth-round pauses remain completely quiet. See [combat-upgrade.md](combat-upgrade.md#later-bosses-direct-attacks-137) for the attacks and counters.

[boss-direct-pressure.json](headless/boss-direct-pressure.json) records **16 matched earned Chapter Five cases**, **42 authored late-boss cases before/after**, **42 additional current-rule greedy replays**, source/input hashes and reproduction commands. The defensive controller wins all 58 current cases without knockouts. The greedy controller also wins all 42, with one knockout against the domain furnace in the Nell/Celia/Petra fixture. Three parties play all final forms consecutively, carrying actual HP, focus and supplies forward with normal victory recovery and no intervening refill or rest.

These Chapter Six/Seven probes use **authored canonical inputs**; they do not claim an earned playthrough of those chapters. The regional fixtures exercise ill and recovered Nell. Domain reprises start from the authored Chapter Seven opening, before the intervening rewards. Isolated cases and each party's first final form have identical before/after input hashes; the later forms' starts can differ because they carry forward the earlier fight's results.

| Canonical Nell/Orrin/Celia | Before (rounds / HP lost) | After (rounds / HP lost) |
| --- | ---: | ---: |
| Imperial vessel | 11 / 86 | 11 / 174 |
| Domain furnace | 7 / 196 | 7 / 294 |
| Benefactor body | 7 / 132 | 7 / 206 |
| Hollow sun, continuing from the body | 6 / 88 | 7 / 208 |
| Exposed heart, continuing from the sun | 4 / 11 | 4 / 46 |

Support remains an effective answer. Losses do not rise in every composition: in the matched earned default flagship, the controller spends an action on Sanctuary and loses only **3 HP**, versus 76 before. The added shot does not bypass that investment. Across all late canonical defensive cases, observed loss rises from 4,136 to 6,466 HP, with no current-rule knockouts; these are controller outcomes, not a human difficulty score. Party powers, boss HP, rewards and prices are unchanged.

Reproduce the comparisons from the same working tree with:

```sh
git worktree add --detach /tmp/bt-before-direct 14afa1126e614a1575c171b3637e1deb65585a9d
node scripts/compare-late-bosses.mjs --root /tmp/bt-before-direct --output /tmp/late-before.json
node scripts/compare-late-bosses.mjs --output /tmp/late-after.json
node scripts/compare-late-bosses.mjs --tactics legacy --output /tmp/late-greedy.json
node scripts/compare-chapter-five-bosses.mjs --root /tmp/bt-before-direct --output /tmp/five-before.json
node scripts/compare-chapter-five-bosses.mjs --output /tmp/five-after.json
```

A fresh run from zero still wins all **27 battles through Chapter Five**, without knockouts, retries or granted resources. The Chapter Four checkpoint matches the existing earned record exactly. Chapter Five loses **691 HP**, spends **156 marks**, uses six useful rests and ends with **1,539 marks**, three bandages, two field bandages and one tonic. Nell's illness, 3,475 XP and the real Chapter Six boundary are preserved. The two earned Chapter Five save artifacts are refreshed from this run; the earlier audit sections remain historical. The surplus stock/spending and level-ten plateau concerns remain open.

All **740 unit tests**, **17 opt-in headless checks**, TypeScript and build pass. Six local browser flows cover Benefactor/serpent/flagship shots on desktop 1280×800 and phone 390×844 at DPR 1/1.25, using real Defend commands. Each verifies one aimed hex, retained boss initiative and the unchanged marked main attack. The phone's compact target cue stays in the fixed confirmation area. Screenshots were inspected; there were no framework overlays or app console errors. The Browser plugin was unavailable, so installed Playwright/Chromium was used. No detailed journeys were added to default CI.


## Team timing/output tradeoff (#136)

Team damage previously equalled the two actual solo contributions while also bringing a partner’s action forward and sharing broader coverage. It now retains 90% of their total, rounded down before barriers, for both party attacks and enemy relays. Daybreak retains 90% of Heal and the level-scaled Taunt wards while keeping party coverage and Taunt. Separate actions gain roughly 11% output when the same targets are reachable; teams still reward early kills, reaching distant targets and catching more enemies. A focused regression proves that a team can remove an enemy before the borrowed partner’s initiative while the first solo leaves it alive to act.

A new zero-start early → middle → five replay still clears all **27 fights without knockouts**, at the actual Chapter Six boundary. The middle route remains at 1,355 XP / 402 marks. Chapter Five loses 892 HP, spends 148 marks and uses eight useful rests; it finishes at 3,475 XP with 1,547 marks, three bandages, two field bandages and one tonic. The two earned Chapter Five artifacts are refreshed; previous audit tables and raw comparison JSON retain their historical rules/hashes. The existing late-boss script also wins all **42 canonical fixture cases without knockouts**, including consecutive final forms; these remain authored probes, not an earned Chapter Six/Seven journey.

Validation: 741 unit tests, TypeScript/build and desktop/phone team animation checks pass. The latter exercise all five team moves through confirmation, contact and the next turn, with no application console errors. Reproduce with `npm run check`, `npm run test:headless`, `node scripts/compare-late-bosses.mjs --output /tmp/teams-late.json`, and the early/middle/five commands above. Route checks remain opt-in.

## Rallying cry and skill output at unlock levels

Celia's Rally is now a moving focus-regeneration field, with no immediate refill. See [combat-upgrade.md](combat-upgrade.md#rallying-cry-and-skill-balance-pass) for its three-round duration, coverage ranks and the accompanying buffs to Horizon light, Pressure wave and Pinning shot, plus reductions to Burst, free Quick shot, final Feint and final Taunt. Learning gates and existing purchased ranks remain valid.

A fresh zero-start run clears all **27 fights through Chapter Five without knockouts or retries**. Chapters One–Two finish at 420 XP / 250 marks with no bandages; the weaker Burst costs one more bandage than the previous run. Chapters Three–Four finish at 1,355 XP / **386 marks**, losing 571 HP, spending 372 marks and taking four useful rests. Chapter Five loses **798 HP**, spends **192 marks** and takes eight useful rests. It reaches the actual Chapter Six boundary at 3,475 XP / **1,487 marks**, with three bandages, two field bandages and one focus tonic. Both earned Chapter Five checkpoints are refreshed. Resuming the pre-finale checkpoint produces the same final state as the uninterrupted run.

The weaker Burst initially made the sealed regulator take five rounds against pressure walk's three. Reducing only the sealed core from 170 to 155 HP restores the existing route-pacing bound. Eight matched offense/support × prepared/frugal comparisons now win without knockouts: feeds takes three–four rounds, pressure takes three, and feeds loses less HP in every pair. The money-conservation test now includes bandages purchased through dialogue choices as well as shop transactions; it retains the exact income-minus-spending assertion.

[skill-balance-audit.json](headless/skill-balance-audit.json) records current source hashes, reproduction commands, the earned middle/five summaries, conduit comparisons and the late-fixture aggregate. All **42 authored late-boss cases** win without knockouts, including ill/recovered Nell and three consecutive final forms. These are canonical fixtures, not an earned Chapter Six/Seven journey. The default campaign controller does not cast Rallying cry in this run; dedicated rules and desktop/phone practices verify its real regeneration, moving coverage, expiry and action timing. These results therefore do not establish how often a human should use the cry.

The surplus of upgrade points after mastery, limited late spending and complete earned Chapter Six/Seven journeys remain follow-ups. Historical tables and comparison files above retain their original rules and hashes.
