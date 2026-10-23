# Audio direction

Keep music procedural and asset-light. Original melodies need recognizable phrases, rests, answers, a contrasting bridge and a varied return. Let bass and percussion change occasionally; avoid mechanical instrument alternation. Accompaniment should support rather than bury the melody. Preserve the Japanese game/anime harmonic references in [music-direction.md](music-direction.md).

## Chapter One cues

| Situation | Retained arrangement | Purpose |
| --- | --- | --- |
| Festival and title | `station` | Nell’s retained festival theme |
| Larkspur after the raid | `tunnel` | Sparse low bell/string treatment, room for grief |
| Orrin's workshop | `yard` | Orrin’s hammer phrases trade with Nell’s festival song |
| Rillbridge stopped | `tunnel` | Quiet, suspended atmosphere |
| Rillbridge freed | `rillbridge` | Full original village melody returns |
| Mountain pass | `tunnel` | Tension before the crossing |
| Ordinary battles | `battle` | Faster home motif with active bass and percussion |
| Captain Alban | `inspector` | The familiar opening; the original sixteen bars lead to eight added bars foreshadowing Alban’s flagship contour in 4/4 |
| Saved departure | `ending` | Bell-led resolution |

Chapter Two uses its own regional variations: `coast-battle` for both prison-train approaches, `shunting` for the Cinderbank boarding defense, and `petra-battle` for the crossing. Railway Ward (`infirmary`) is a three-beat piano waltz. Chapter Three uses `switching`; Chapter Four uses `four-battle` and `four-warden`. Encounter content declares the cue, including workshop practice. Retained unused arrangements stay in the review Library; their prior plots have been discarded.

Each arrangement declares its number of quarter-note beats per bar. Scheduling, seeking and the playback position must use that meter; the Railway Ward, Windmere and dispensary waltzes have three beats, the flagship has five quarter-note beats (10/8), and other current cues have four. Rubato cues use the shared performed clock rather than a fixed bar duration. Music changes at the outgoing cue’s bar boundary. Release the outgoing voices over 60 ms at that boundary, including sanctuary pedals that span two bars, so the old harmony cannot linger beneath a different battle cue. Cutscenes lower the mix or briefly silence it without disrupting progression. Use distinct material sounds for movement, steam, a blade, lantern burst, healing and menu interaction. The lantern's unexplained hum uses `resonance`: quiet, closely spaced tones that beat against each other. Bell/return-call and punch remain station and captain cues. Never autoplay sound before the player enables it.

Rule tests cover musical phrase variation and range. Browser checks render the actual Web Audio instruments and effects, compare distinct arrangements and verify signal levels. Normal smoke checks sample four bars; the optional full run renders complete retained phrases.

Voice envelopes start at true zero. Exponential note releases finish with a 5 ms linear tail to zero before their sources stop; explicit stops also fade over at least 5 ms. Arrangement changes cancel and hold each existing envelope, then ramp to zero over 60 ms. Do not release cancelled future voices toward a fixed nonzero floor: that can sound notes that should never have started. New voices scheduled after the release belong to the incoming arrangement and remain audible.

Clamp overdue onsets to the audio clock before creating the voice, so a delayed main-thread scheduler still plays a fresh attack instead of jumping into the middle of an envelope. Keep the authored pitches, durations and on-time scheduling intact. `tests/e2e/audio-envelope.spec.ts` renders the real rack to check cancelled queued voices, new-arrangement survival, zero-valued endings/stops at 44.1/48 kHz and overdue attacks. These detailed regressions remain outside the default CI browser set.

Character assignments and cue-specific expression are documented in [music-direction.md](music-direction.md). The synth supports additive cents bends, controlled vibrato, phrase dynamics and optional note release times. The quieter conduit/sanctuary bells have pp piano anticipations and longer releases; the outer bell-tail envelope still fades to exact zero. Review the actual campaign performance with the dev Music panel’s Expression and, where authored, Rubato comparisons.
