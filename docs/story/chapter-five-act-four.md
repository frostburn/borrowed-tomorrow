# Act IV — Alban’s flagship

Playable from the flight chart after `hammerplainComplete`, `dawnwatchComplete`, `windmereComplete`, `allAnchorsSeen` and `emperorOfferTold`. Any regional order works; a deferred offer stays available through the observation hatch. Rest, Equipment and regional visits remain open. Choosing **Enter the capital crossing** commits to a staged approach and battle, with the normal defeat/retry path.

## Checkpoints and exact handoff

| Checkpoint | Saved location and continuation |
| --- | --- |
| `flagshipApproachSeen` | Survey ship; the three crews have brought it under the bow. The chart retries the encounter without replaying the approach. |
| `flagshipConfronted` | Survey ship; normal pre-battle autosave. No reward yet. |
| `flagshipWon` | Survey ship until the command deck loads. Resume travels to `flagship:start` `(28,28)` and replays the unfinished surrender. |
| `albanCaptured` | `flagship:captured` `(31,25)`. Alban is disarmed and held by Petra. Use `flagship-evacuate` at the western gangway. |
| `flagshipEvacuated` | Return to `airship:flagship` `(32,26)`. A restore on the command deck resumes this return. The final deck conversation replays until completed/skipped. |
| `chapterFiveComplete` | Chapter `chapter-five`, survey ship, boundary `chapter-six:capital-approach`, journal `fiveDeparture`. These are committed together. |

Version remains **10**, campaign `imperial-debt`. No migration, automatic regional completion, forced formation or resource reset. All scenes commit on completion or Skip; closing/reloading an unfinished scene grants nothing. The final boundary can be exported and restored. Chapter Six has no entry button until implemented. Regional revisits remain available from the flight chart after closing the completion panel.

The battle awards **360 XP, 240 marks and one fleet range sight for Kit**. The fitting enters the bag and is never automatically equipped. The campaign factory uses actual saved HP/focus, bandages, active heroes and loadouts. Ordinary post-victory recovery applies. Repeated completion cannot duplicate the reward.

## Battle and presentation

`content/chapter-five/flagship.ts` owns `alban-flagship`; `rules/flagship.ts` configures the three independent anchored components and the generic combat lifecycle announces their fixed-round warnings. Both batteries occupy three contacts. Their destruction clears their warnings permanently and drops the bridge shield when the second falls. The next round announces the emergency broadside. Bridge destruction ends the boarding even with living marines. Taunt, Dazzle, armor, guard and whole-body single-hit areas use ordinary rules.

`game/flagship-presentation.ts` shares native SVGs, recoil, whole-craft oscillation, alpha picking and the dedicated **Iron Above the Clouds** 10/8 intro/loop with the workshop. Dev presets remain in `src/dev/flagship-battle.ts` and award no campaign history. The Benefactor stays dev-only. `flagship-cinematic.ts` animates the approach on scene time; close/skip removes its listener and artwork, and reduced motion settles immediately.

The new Tiled `flagship` command deck owns its connected floor, western evacuation gangway, prisoners, silent crew, arrivals and two scene casts. Its SVG architecture stays behind the actors. The survey horizon replaces the cordon with an open lane to the suspended capital after the actual boss victory. No timer threatens evacuating crew.

## Canonical review start

Vite title → **Begin Chapter Five · Act IV (canonical)**. Fresh authored completion of Acts I–III, 2740 XP (level ten), five recruits, Nell/Orrin/Petra active, full HP/focus, all main-route rewards and optional unguarded Dawnwatch coat/Windmere reflector. Seven ordinary eight-mark purchases bring bandages to twelve. Those purchases are deducted from earned marks. Optional Hammerplain combat is uncompleted. Gear is fitted for review; live saves retain their own loadouts. The Emperor offer and alliance are recorded, while no Act IV checkpoint is set. Autosave replacement uses the existing prompt and leaves manual slots intact. The button/factory are absent from production.

## Continuation facts

Alban’s men refuse his order to fire through their own boarding party. Petra takes his rod and arrests him; Nell names Ansel without forgiveness or execution. Kit and an engineer check the lower berths, and the alliance evacuates every survivor before leaving the disabled flagship on its auxiliary lift. Alban remains a prisoner, never escapes again and never becomes a recruit.

Nell chooses the capital course while remembering the Emperor’s projection. The Emperor is not defeated here. Tomas and all medical passengers stay safe; Ansel remains dead. The lantern hum is still unexplained and the Benefactor remains silent. Chapter Six resolves the Emperor; Chapter Seven enters the god’s separate domain.

Reproduce vectors/layouts with `node scripts/export-chapter-five-art.mjs`. Run rule/content tests, production build, focused Act IV/flagship browser checks and the art-upload guard. Detailed journeys and device/motion checks stay outside default CI.
