# Sound of the railway

The score follows a sixteen-bar D-minor theme: an opening phrase, an answering variation, a contrasting bridge, and a resolving return. Rests and sustained notes give the melody space. Each location shares the motif so exploration feels continuous; arrangements change at bar boundaries and retain their decay tails.

| Scene | Tempo | Arrangement |
| --- | --- | --- |
| Larkspur | 82 BPM | Warm reed melody, soft keys, strings, occasional bell replies |
| Signal yard | 94 BPM | Plucked melody, syncopated keys, bass, light rail-like percussion |
| Tunnel | 68 BPM | Lower bell melody, sustained strings, sparse accompaniment |
| Battle | 128 BPM | Reed lead, repeating keys, active bass, kick/snare/hat accents and fills |
| Inspector | 136 BPM | String lead, stronger rhythm and bell accents |
| Disk B arrival | 78 BPM | Bells, fuller strings, an octave-lifted final phrase |

`score.ts` owns composition and arrangement. `synth.ts` supplies filtered reed, plucked keys, detuned strings, FM bells, bass, and percussion; it works in live and offline Web Audio contexts. A shared short stereo room tail, gentle compression, and separate music/effect gains keep the mix together. Timing uses look-ahead scheduling rather than render frames. Muting fades the master and cancels scheduled voices; reenabling starts one arrangement, avoiding overlapping sequencers.

Effects have their own envelopes and materials: a strike combines a low impact with irregular metal partials; lantern shutters click before a rising flare and glass chime; the inspector's projector gives a descending signal alarm; steam uses swept hiss and low pressure; mend uses staggered bells; a bandage uses cloth noise; crows have wing noise and a sharp peck. Defend sets a short metal brace. Footsteps change between station stone, yard gravel, and tunnel stone, alternate, and are rate-limited. Menus use a quiet short tick; victory has a longer bell-and-string cadence.

No external samples or audio downloads are required. Sound starts only after the player enables it. Browser regression tests render the real instruments with `OfflineAudioContext`, checking non-silent output, distinct arrangements and effects, and headroom. The tests verify output numerically; subjective listening and composition can continue to evolve with future disks.
