# Sound of the railway

The score follows a sixteen-bar D-minor theme: an opening phrase, an answering variation, a contrasting bridge, and a resolving return. Rests and sustained notes give the melody space. Each location shares the motif so exploration feels continuous; arrangements change at bar boundaries and retain their decay tails.

| Scene | Tempo | Arrangement |
| --- | --- | --- |
| Larkspur | 82 BPM | Warm reed melody, soft keys, strings, occasional bell replies |
| Signal yard | 94 BPM | Plucked melody, syncopated keys, bass, light rail-like percussion |
| Tunnel | 68 BPM | Lower bell melody, sustained strings, sparse accompaniment |
| Battle | 128 BPM | Reed lead, repeating keys, active bass, kick/snare/hat accents and fills |
| Inspector | 136 BPM | String lead, stronger rhythm and bell accents |
| Disk boundary | 78 BPM | Bells, fuller strings, an octave-lifted final phrase |

Disk B uses a second sixteen-bar G-minor tune in `score-b.ts`, with four phrases, space between melody entries, and short string answers in the bridge. Its three arrangements follow the same bar scheduling and instruments:

| Scene | Tempo | Arrangement |
| --- | --- | --- |
| Rillbridge | 88 BPM | Repeated two-bar reed motif within one octave, close chord voicings, steady bass and occasional bell answers |
| Sluice | 76 BPM | Lower bells, sustained strings, no percussion |
| Flood battles | 124 BPM | Reed lead, eighth-note keys, syncopated bass, drums with phrase-ending fills |

Rillbridge footsteps use stone; sluice movement uses the gravel/stone work-yard effect. Combat retains the distinct steam, lantern, melee, and healing sounds.

`score.ts` owns composition and arrangement. `synth.ts` supplies filtered reed, plucked keys, detuned strings, FM bells, bass, and percussion; it works in live and offline Web Audio contexts. A shared short stereo room tail, gentle compression, and separate music/effect gains keep the mix together. Timing uses look-ahead scheduling rather than render frames. Muting fades the master and cancels scheduled voices; reenabling starts one arrangement, avoiding overlapping sequencers.

Effects have their own envelopes and materials: a strike combines a low impact with irregular metal partials; lantern shutters click before a rising flare and glass chime; the inspector's projector gives a descending signal alarm; steam uses swept hiss and low pressure; mend uses staggered bells; a bandage uses cloth noise; crows have wing noise and a sharp peck. Defend sets a short metal brace. Footsteps change between station stone, yard gravel, and tunnel stone, alternate, and are rate-limited. Menus use a quiet short tick; victory has a longer bell-and-string cadence.

No external samples or audio downloads are required. Sound starts only after the player enables it. Browser regression tests render the real instruments with `OfflineAudioContext`, checking non-silent output, distinct arrangements and effects, and headroom. The tests verify output numerically; subjective listening and composition can continue to evolve with future disks.

Rillbridge uses an A–A′–B–return form with explicit G-minor, E-flat, C-minor, B-flat and D-major cadences. Sustained melody downbeats belong to the current chord; passing notes are brief. Its accompaniment stays below the lead, and each location change restarts the score at its first phrase. String replies in the other Disk B arrangements use the actual chord third.


Disk C adds two independent melodies in `score-c.ts`; neither is a transposition of the earlier disks. Cinderbank uses a repeated E-minor call and answering descent, a contrasting bridge, and a B-major-to-E-minor cadence. Bellwether uses a slower C-major piano melody with its own rhythm and F–G–C resolution. Close accompaniment stays below the lead, passing notes are short, and phrase endings leave space.

| Scene | Tempo | Arrangement |
| --- | --- | --- |
| Cinderbank | 84 BPM | E-minor reed melody, restrained keys, steady bass, sparse bell replies |
| Bellwether infirmary | 66 BPM | Independent C-major piano melody, low broken support, quiet sustained strings, occasional bell responses |
| Cinderbank repairs | 118 BPM | Siding motif with moving bass, short key figures and a restrained drum pulse |

Location changes restart at the first phrase while preserving existing decay tails. Returning to an area restores its own theme; a world refresh in the same area does not restart it. Unit checks verify distinct melodic content, chord-supported downbeats, monophonic phrasing and full cadences. Browser checks render all sixteen bars of each new score and verify non-silence, distinct output and headroom.
