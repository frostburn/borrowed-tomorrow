# Next: Chapter Three — Beneath the Palace

Chapters One–Three are playable canon. This document records Chapter Three’s preserved input; see chapter-four-handoff.md for its implemented ending. Continue the successful evacuation and the specific pursuit of Tomas; do not restart the discarded campaign.

## Exact save

Version **10**, format `borrowed-tomorrow`, campaign `imperial-debt`, chapter `chapter-two`, boundary **`chapter-three:capital`**. The final scene leaves Nell at `cinderbank` `(49,26)`; later exploration can change the coordinates. Only the boundary identifies the departure.

The complete Chapter One flag chain remains set. Chapter Two requires `coastSeen`, `kitJoined`, `raidPlanned`, `raidConfronted`, `trainRaidWon`, `prisonersFreed`, `wardSeen`, `settlementSeen`, `coastCollectorWon`, `evacuationReady`, `recaptureConfronted`, `recaptureWon`, `chapterTwoComplete`. Preserve `raidDiversion` (true for signal walk, false for loading gate), optional Chapter One flags, resources, XP, HP/focus, all inventory copies and loadouts, journals and play time.

The recruited `party` contains Nell, Orrin and Kit. Celia has not appeared or joined. `activeParty` contains Nell plus zero to two selected companions. Never discard or reset reserve equipment or health. Petra and Tomas are not roster members or reserves at this departure. Load and validate new scenery before consuming the boundary; leave it intact on failure.

## Start with the capital route

Orrin’s coal engine is pulling the medical coaches. Rescued prisoners and Cinderbank families are aboard. A current medical-train clearance gives the party a southern siding below the capital. Kit knows the southern medical siding and the path to the engine works gate from his postal rounds. Show that clearance working promptly; do not withhold the known destination behind unrelated chores.

Tomas is alive in personal custody at the palace engine works. A fellow prisoner kept his transfer slip for Nell, including the note that collectors feed the engines. His sabotage should create a real opening for the rescue. Bring him home alive in this chapter and keep that accomplishment permanent.

Petra defended Alban as Chapter Two’s boss and was disarmed at the crossing. When Alban then ordered fire on the medical coaches, she refused and lost her commission. She witnessed Orrin’s coal engine carry the passengers without a crystal, then stayed to countermand the firing order among her soldiers. She has not joined Nell. In Chapter Three Alban offers to restore her commission if she seals the coaches; she refuses publicly, breaks his command rod and joins deliberately. The active formation remains capped at three after she joins. Alban survived, lost the crossing and failed to recapture the prisoners; do not return these people to captivity to recreate the same objective.

## What remains unknown

Nell, Orrin and Kit do not know the whole divine bargain, the conduit’s nature, the emperor’s private motive or the Benefactor’s domain. The lantern has only offered sensory clues. No divine voice or boss cutaway has appeared. Establish later discoveries through actions and evidence. The emperor’s order prioritized the capital’s engines over a promised evacuation; his first direct appearance belongs here.

Celia’s introduction and faith conflict begin on the Chapter Four sanctuary road. Do not invent an explanation for the three-fighter cap in this handoff. Kit’s one flustered response to Nell stays an occasional innocent, one-sided hint. Do not develop or resolve it into a romance.

The implemented chapter rescues Tomas, disables extraction and makes the emperor choose to merge with the palace conduit. That reversal does not negate the rescue or make the party’s victories part of a secret master plan. Keep the eventual journey into the god’s separate domain distinct from the emperor’s defeat.

## Tiled implementation and development start

The title’s Vite-only canonical Chapter Three start records the loading-gate route and the complete evacuation at 420 XP, with Nell/Orrin/Kit active and their earned equipment. It replays the capital arrival; Petra is not yet recruited. Regular Chapter Two departures still preserve the player’s actual raid choice, formation, resources and gear.

The three exploration maps and five battle floors use native tile layers. Interactions, arrivals and initial casts belong to their Tiled map; new layouts restore covered current-format saves onto connected floor. Dena and the same passengers continue into the medical siding. The gallery fitters leave with Tomas after the rescue. All equipment rewards, both intake approaches and the exact Chapter Four boundary remain available.

The heart regulator now uses the accepted upward-facing mechanical boss presentation in both campaign routes. Its anchored triangular base occupies three hexes; pressure attacks announce fixed red cells before firing. The feeds route keeps two simultaneous earth contacts (at least two active companions); pressure walk keeps crows and hot vents. The original encounter IDs, route flag, 135 XP, 80 marks, insulated-coat reward and feed-console/Emperor continuation are unchanged. Campaign resources come from the actual save, while workshop presets stay isolated. Whole boss SVGs load with the conduit region before travel or deep restore succeeds; missing art preserves the preceding checkpoint for retry. The mechanical encounter is unrelated to the separate final god preview.
