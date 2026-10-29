# Act IV — the light above the bridge

Playable from the flight chart after all three regional completions, `allAnchorsSeen` and `emperorOfferTold`. Any regional order works. Rest, Equipment and regional visits stay available before the approach. The party defeats Alban's flagship itself; the Benefactor intervenes only after that victory.

## Checkpoints and exact handoff

| Checkpoint | Saved location and continuation |
| --- | --- |
| `flagshipApproachSeen` | Survey ship; the three crews have brought it under the bow. The chart retries combat without replaying the approach. |
| `flagshipConfronted` | Survey ship; normal pre-battle autosave. No reward yet. |
| `flagshipWon` | Resume loads `flagship:start` `(28,28)` and replays the unfinished confrontation/intervention. |
| `benefactorClaimSeen` | Committed together with `flagshipDestroyed`, `albanDestroyed` and `nellIll`. Nell leaves the active formation. Resume returns to `airship:flagship` `(32,26)` and stages the hunters' arrival. |
| `retaliationSeen` | Survey ship; Nell rests on the berth, divine minions hold the forward rail. Equipment and rest are available. The rail or chart opens the encounter. |
| `retaliationWon` | Once-only minion victory. Resume stages the conversation beside Nell's berth. |
| `chapterFiveComplete` | Chapter `chapter-five`, boundary `chapter-six:capital-approach`, journal `fiveDeparture`; committed together. Nell remains ill and unavailable. |

All scenes commit only on completion or Skip. Reloading an unfinished intervention leaves the ship, Alban and Nell's old formation intact until it completes. Reloading after the intervention never fights the flagship again. An interrupted hunters/departure scene replays. The boundary is exportable and restorable; the playable Chapter Six continues after the airship approach cinematic. No save-version change or migration is introduced.

## Story

The marines return to the flagship with their weapons lowered. Petra confronts Alban, and Nell names Ansel. Before an arrest can occur, the lantern jerks in her hand and a seam of light opens above the bridge. The Benefactor speaks for the first time, accusing them of breaking its anchors. Alban invokes the Emperor; the god calls the ships its gift and takes them back.

Nell collapses while the companions run for the western gangway. Kit pulls her across and Celia supports her. Light destroys Alban, his men and the hull. None is captured or evacuated; none later returns. Petra had intended a reckoning before the people he hurt. The god's violence denies that reckoning and treats its own servants as disposable.

The Benefactor has no visible body, portrait, silhouette or final-form cutaway. `ClaimCinematic` draws only the seam, destructive light and disappearing hull/crew on scene time. Reduced motion settles immediately; close/skip removes effects and listeners. The existing final boss artwork remains dev-only.

Glasswings and a pale sun herald arrive at the survey ship, moving toward Nell's hatch. The remaining companions defend it in a playable encounter. Celia identifies Nell's heartbeat following the shard's pulse; moving the lantern does not break their connection. This establishes the harmful connection without explaining every power of the fragment.

Kit takes Celia's notes for Sera and stays beside Nell while she is awake. His concern grows through practical work, without a confession or a resolved romance. Alda holds for the capital's outer mooring. The Emperor remains undefeated. Ansel stays dead; Tomas and the medical passengers stay safe. Chapters Six and Seven remain separate climaxes; see [the Chapter Six plan](chapter-six-plan.md).

## Combat, availability and rewards

`alban-flagship` keeps its accepted upward-facing battle, independent batteries, bridge shield, fixed-round warning shapes and shared 10/8 score. The campaign uses actual builds, resources and chosen formation. It awards **360 XP, 240 marks and one fleet range sight for Kit**, placed in the bag for manual fitting.

`benefactor-retaliation` pits the remaining party against one sun herald and two flying glasswings on the survey deck. The herald's Severing light travels down a line; wings use ranged splinters. Ordinary area previews and enemy attack animation show affected hexes. This encounter awards **170 XP and 90 marks** once. Its original cue **The Sky Answers** uses exposed descending bell calls and string answers in 4/4, distinct from Alban's march.

`nellIll` is a story condition, separate from defeat/HP. Nell stays recruited with her equipment; the formation preserves its size and existing companions, adds Kit if necessary, then fills a remaining space from reserve. It never exceeds three. Her HP/focus become 1/0. Ordinary rest, victory recovery and reload do not cure her. Equipment can inspect and refit her but cannot set her active; the combat factory rejects her. Kit usually leads; otherwise the first selected fighter leads. Equipment changes repaint the leader immediately. The last active fighter cannot be removed.

`nellRecovered` belongs to Chapter Six's optional Iria quest: it unlocks Nell without forcing a formation swap. This chapter provides no recovery shortcut. Regional revisits remain possible after the final conversation, with Nell staying aboard.

## The long approach

The earned `chapter-six:capital-approach` departure now plays a sixteen-second
wordless journey instead of the completion card. The survey ship leaves the
fleet's last smoke and scattered metal behind. Kit keeps watch beside Nell's
complete cot while Celia remains with her; the lantern is still separated from
the patient. Orrin and Petra watch the airborne white-marble capital from the
foredeck. Nell remains ill, with no cure, new response, or remote conversation.
There is no surviving Alban, intact flagship, god body or repeated intervention.

The landing bridge has not unfolded and no pact wall appears during the film.
The existing `six-sealed` opening owns those events after the complete Chapter
Six kit loads. Skip and automatic arrival use that same entry. Missing art keeps
the final shot, departure and resources intact with Retry crossing, return and
export. Pause/reload and reduced-motion stills use the shared player; no saved
flag, healing or formation change is introduced. Canonical Chapter Six starts
still open its original arrival directly.

Review **Cinematics → Chapter Five → Six**
(`?dev=cinematics&film=mooring-crossing`). The long approach is a quiet half-time,
octave-lowered arrangement of Above the Railway's opening, scored for strings,
piano and soft bass without percussion. Music/Soundtrack → Ch 5 reviews it.
The original airship score and Two Seals at the Gate remain unchanged.

## Canonical review and reproduction

Vite title → **Begin Chapter Five · Act IV (canonical)**: fresh authored Acts I–III completion at 2740 XP, five recruits, Nell/Orrin/Petra active, full resources, main-route gear and twelve paid-for bandages. Both offer callbacks and the alliance are recorded; no Act IV flags are set. Manual slots stay intact; factory/button are absent from production.

`node scripts/export-chapter-five-art.mjs` reproduces the Tiled/SVG scenery, minion actors/portraits and Nell's illness poses. The latter reuse her existing vector body. No raster generation or new production dependency is used. Run rule/content checks, build, focused desktop/phone and production journeys, and the staged art-upload guard. Full journeys remain outside the default CI set.
