# Headless early campaign

Run `npm run simulate:early`. This uses Vite’s existing TypeScript module loader in Node, without a browser, canvas, audio or Phaser scene. No new dependencies are required.

The scripted route starts with `newGame()`, walks map paths to visible interactions, executes the real story callbacks and chapter transition, and fights every encounter with the shared combat rules and enemy AI. It clears the optional shed and takes the loading-gate approach. It stops at the Chapter Three departure; no canonical checkpoints, forced victories or resource grants are used.

The deterministic tactical policy scores legal attacks and healing across reachable positions, penalizes friendly fire and approaches enemies when it cannot attack. It buys nothing, allocates earned skills in a fixed priority order and equips obtained loot through the inventory API. These are agent decisions, not changes to campaign auto-equipping. It explicitly rests in the tunnel and at the coastal engine; recruitment, village release, ward treatment and evacuation retain their normal scripted recovery.

Output includes each interaction’s walking distance and resource balance, plus battle rounds, actions, starting/ending HP and bandages consumed. `BT_HEADLESS_REPORT=/absolute/path/report.json npm run simulate:early` writes the complete report and final current-format save; the default is `/tmp/borrowed-tomorrow-headless.json`. Failure also writes the partial report and exits unsuccessfully. Combat has a 600-action limit to catch stalls. This command is separate from default CI.

This is an initial scripted-route baseline, not an exhaustive balance verdict or a general interactive agent protocol. It does not test rendering, pointer hit areas or animation, and currently has no shopping strategy, alternative route matrix or retries. Navigation uses the existing map collision/pathfinder and adjacent interaction cells; later chapters with automatic proximity triggers will require their trigger handling before being supported.

## Baseline result

Both chapters completed with no defeats or gameplay blockers on this route. No balance changes were needed to achieve completion. The party ended at level 5 with 250 marks. No purchases means this run establishes earned income and supply consumption, not whether shop prices are appropriate.

| Battle | Rounds | Bandages consumed |
| --- | ---: | ---: |
| pursuit | 2 | 0 |
| workshop | 4 | 1 |
| collector | 3 | 1 |
| captain | 4 | 1 |
| coast-loading | 4 | 1 |
| coast-collector | 3 | 1 |
| coast-recapture | 4 | 1 |
