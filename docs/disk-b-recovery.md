# Disk B recovery checkpoint — 13 October 2026

This commit preserves the writing skill and a recovery record after the execution environment stopped connecting. **It does not contain the playable Disk B implementation.** Those changes were uncommitted in the local workspace when the connection failed. Do not merge this checkpoint as a completed chapter.

## Workspace and last verified result

Repository: /workspace/scratch/069fbf56953d/borrowed-tomorrow
Local branch: codex/disk-b-rillbridge
Starting main commit: c8117b200d81d290ca28021386342577e63aba19

The last successful local checks were **18 passing rule tests** and a successful **TypeScript/Vite production build**. The first Disk B Playwright run stopped before registering tests because Node required a JSON import attribute. No full Disk B browser playthrough, visual QA, remote implementation commit, or PR was completed. The final documentation-write / image-blob-upload call was interrupted; inspect files and remote objects before assuming it finished.

First recovery steps:
1. Reconnect the original workspace and run git status. Preserve all local edits.
2. Fetch this remote checkpoint branch. The local branch began at main, so integrate this preservation commit without discarding local changes.
3. Fix JSON loading in Playwright: disk-b.spec.ts imports the original JSON fixture, and its map module imports Tiled JSON. Use supported JSON import attributes (or a Node-compatible test fixture loader), then rerun build and tests.
4. Run Disk B desktop and phone Playwright tests, inspect screenshots, fix issues, then run the complete suite.
5. Complete the story/art/audio documentation, remove this temporary recovery note, publish all implementation files and native artwork, and open the Disk B PR. Check CI before reporting completion.

## Files already written locally

- .agents/skills/write-game-prose/{SKILL.md,LICENSE,agents/openai.yaml}, and AGENTS.md skill instruction.
- public/art/rillbridge.webp and public/art/sluice.webp.
- src/content/disk-b/{story.ts,interactions.ts,maps.ts,encounters.ts,maps/rillbridge.json,maps/sluice.json}.
- src/content/maps.ts combines both chapters; src/content/disk-a/maps.ts supports actual image dimensions and required object flags.
- src/content/disk-a/interactions.ts supports returning to Rillbridge after Disk B starts.
- src/rules/state.ts adds version-1 migration to version 2, Disk B maps, levels 4–5, validation, and the pure enterDiskB transition.
- src/rules/hex.ts adds weighted Dijkstra movement; src/rules/combat.ts adds shallow water and Disk B encounters.
- src/game/adventure.ts integrates lazy artwork loading, chapter transition/retry, B dialogue, native map scrolling, water preview/commit, chapter boundaries, journal and return visits.
- src/game/{score-b.ts,score.ts,audio.ts} adds three G-minor Disk B arrangements.
- src/vite-env.d.ts adds moving diagnostics and serialized water arrays.
- tests/disk-b.test.ts adds six continuity/terrain tests; existing twelve rule tests remain.
- tests/e2e/controls.ts extracts the actual-control battle driver.
- tests/e2e/disk-b.spec.ts adds a version-1 import, deliberate asset-load failure/retry, whole chapter playthrough, saved return visits, and phone orchard-choice test.
- tests/e2e/adventure.spec.ts uses the shared driver and hydrates battle water.
- tests/e2e/presentation.spec.ts tests all nine audio modes.
- playwright.config.ts removes forced ANGLE/SwiftShader arguments for the local Chromium override; those flags previously caused poor local performance and changed decoded color comparisons.

The final interrupted command attempted updates to README.md, docs/art-direction.md, docs/audio-direction.md, docs/story/{canon.md,characters.md,open-threads.md,disk-b-handoff.md,disk-c-handoff.md}. Check whether /tmp/update-b-docs.py ran.

## Implemented chapter direction

Disk B: **A Town Expecting Rain**. Returned Rillbridge begins on **13 October**, one day before the historical flood. Mira immediately finds her father **Bram**, who is repairing a blue door and has packed her suitcase for tomorrow. He does not remember their separation. She stays with him after their conversation and never enters combat.

**Tilda**, the baker, cancels the festival when Orrin brings a broken high-water gauge plate. **Elspeth**, a retired teacher with mobility limitations, needs the recovered maintenance trolley. The schoolhouse sequence explicitly advances through packing overnight to before dawn on **14 October**; there is no real-time countdown.

The carriage opens for Mira's ticket and shuts against Bram's foot: additional passenger refused, no substitutions. The solution is a physical maintenance crossing into Larkspur's goods yard, without boarding the service.

Playable route:
Bram → sluice overflow battle → damaged gauge → Tilda → carriage refusal → trolley battle → schoolhouse → outfall wheel choice → keeper battle → bridge evacuation → Ansel coda → dispatch.

All **31 residents** survive. The orchard channel floods the trees and gives a dry keeper arena. The millrace spares the orchard but leaves shallow water costing **2 movement points per hex**. Dry ground costs 1; flying crows ignore the water surcharge. Rocks create a narrow center crossing, and the preview uses the same cheapest path as committed movement.

An optional maintenance work sheet has Orrin's father's handwriting and shifts a week apart between passenger arrivals both dated 14 October. His recognition responds to scrapCleared. Ada Fenwick remains private author knowledge.

At Larkspur, Ansel responds to promisedHome / askedForTruth, Tilda acknowledges the orchard outcome, and Mira and Bram remain together after midnight. Next dispatch: **Cinderbank siding**, an ambulance train with two carriages of wounded soldiers and no medical staff listed, departing before dawn.

Outgoing saved boundary: **disk-c:ambulance-siding**, chapter disk-b. Disk C title: **The Last Ambulance Train**. Earlier regions remain visitable and do not erase this boundary.

Important flags:
diskBStarted, bFatherFound, bOverflowCleared, bFloodEvidence, bTownWarned, bRegistryRefused, bTrolleyFreed, bNeighborsReady, bWorksheetRead, bOrchardChannel, bMillraceChannel, bKeeperStopped, bEvacuated, bLarkspurReceived, diskBComplete.
Journal IDs: b-arrival, b-family, b-evidence, b-warning, b-registry, b-trolley, b-rescue, b-maintenance, b-orchard, b-millrace, b-crossing, b-evacuation, b-coda, b-departure.
Keep original Disk A IDs and the v1 fixture unchanged.

## Artwork and QA

Original generated images:
- /workspace/scratch/069fbf56953d/generated_images/exec-9eacb66c-d956-4f0a-ad65-ff024fb489db.png
- /workspace/scratch/069fbf56953d/generated_images/exec-2ac3ae3f-be7f-4035-acf9-4f723ef0fdb1.png

Rillbridge: **1595 × 986**, lossless WebP **2,587,004 bytes**.
Sluice: **1591 × 988**, lossless WebP **2,856,570 bytes**.
Original RGBA values and dimensions were verified after encoding. Never resample these assets. They scroll through the existing native 1008 × 480 scene viewport; the complete desktop UI remains 1024 × 768. Actors remain 80 × 80; portraits 128 × 128. Map collision grids are 66 × 41 at 24 pixels. Sluice battles use the same native map with offset (-290,-350), not a shrunken full image.

Local browser: /workspace/scratch/069fbf56953d/qa-browser/chromium
QA output: /workspace/scratch/069fbf56953d/qa-disk-b
Suggested environment variables:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/workspace/scratch/069fbf56953d/qa-browser/chromium
BT_QA_SCREENSHOTS=/workspace/scratch/069fbf56953d/qa-disk-b
BT_QA_SAVE_OUTPUT=/workspace/scratch/069fbf56953d/qa-disk-b/finished.json

The skill passed quick_validate.py. A separate forward test revised the outfall dialogue to remove an unsupported winter-stores claim; those prose fixes were applied. The test originally saw water mechanics before the concurrent implementation finished; water costs and encounters were subsequently implemented and covered by passing rules.

Publishing had planned GitHub Git-data API calls because CLI push previously lacked auth. Large base64 command output is silently shortened near 1 MiB: read binary chunks of 393,216 bytes (524,288 base64 characters) and concatenate internally. The previous in-memory base64 buffers were lost on reconnection; re-read files if needed. Verify uploaded blob SHAs against local git hash-object, then create a tree/commit/ref and PR. Do not publish a partial playable chapter without its artwork.
