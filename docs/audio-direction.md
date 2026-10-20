# Audio direction

Keep music procedural and asset-light. Original melodies need recognizable phrases, rests, answers, a contrasting bridge and a varied return. Let bass and percussion change occasionally; avoid mechanical instrument alternation. Accompaniment should support rather than bury the melody. Preserve the Japanese game/anime harmonic references in [music-direction.md](music-direction.md).

## Chapter One cues

| Situation | Retained arrangement | Purpose |
| --- | --- | --- |
| Festival and title | `station` | Gentle reed-led home theme |
| Larkspur after the raid | `tunnel` | Sparse low bell/string treatment, room for grief |
| Orrin's workshop | `yard` | Moving keys and restrained rhythm |
| Rillbridge stopped | `tunnel` | Quiet, suspended atmosphere |
| Rillbridge freed | `rillbridge` | Full original village melody returns |
| Mountain pass | `tunnel` | Tension before the crossing |
| Ordinary battles | `battle` | Faster home motif with active bass and percussion |
| Captain Alban | `inspector` | The existing intense officer-battle arrangement; the key is not a surviving story identity |
| Saved departure | `ending` | Bell-led resolution |

Chapter Two uses its own regional variations: `coast-battle` for both prison-train approaches, `shunting` for the Cinderbank boarding defense, and `petra-battle` for the crossing. Railway Ward (`infirmary`) is a three-beat piano waltz. Chapter Three uses `switching`; Chapter Four uses `four-battle` and `four-warden`. Encounter content declares the cue, including workshop practice. Retained unused arrangements stay in the review Library; their prior plots have been discarded.

Each arrangement declares its number of quarter-note beats per bar. Scheduling, seeking and the playback position must use that meter; a ward bar lasts three beats, and the other current cues last four. Music changes at the outgoing cue’s bar boundary. Release the outgoing voices over 60 ms at that boundary, including sanctuary pedals that span two bars, so the old harmony cannot linger beneath a different battle cue. Cutscenes lower the mix or briefly silence it without disrupting progression. Use distinct material sounds for movement, steam, a blade, lantern burst, healing and menu interaction. The lantern's unexplained hum uses `resonance`: quiet, closely spaced tones that beat against each other. Bell/return-call and punch remain station and captain cues. Never autoplay sound before the player enables it.

Rule tests cover musical phrase variation and range. Browser checks render the actual Web Audio instruments and effects, compare distinct arrangements and verify signal levels. Normal smoke checks sample four bars; the optional full run renders complete retained phrases.
