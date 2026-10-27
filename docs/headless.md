# Headless campaign simulation

These commands use Vite’s existing TypeScript module loader in Node, without a browser, canvas, audio or Phaser scene. No new dependencies are required, and none of the runner is imported by the shipped game.

```sh
npm run simulate:early
npm run simulate:middle -- --from /tmp/borrowed-tomorrow-headless.json
```

The second command continues through Chapters Three and Four from the actual save earned by the first. If that report already exists, reuse it directly. It preserves the party, injuries, skills, equipment, money and supplies; it does not load a canonical fixture or grant resources. Default output is `/tmp/borrowed-tomorrow-middle.json`, leaving the input intact.

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

The adapter checks visible interactions, access flags and real map paths, completes story callbacks and uses the shared combat, enemy AI, rewards, shopping, inventory and formation APIs. It accounts for multihex enemies, dangerous telegraphs/vents, simultaneous earth plates, team costs and a helper’s remaining movement. It never forces victories or retries defeats. The policy ignores some tactical possibilities (notably proactive Taunt, Shield bash and Wait), and its greedy healing is not optimized for conserving supplies.

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
