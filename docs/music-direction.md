# Music direction

Compose original melodies with deliberate phrases and Japanese game/anime influence through harmony and pacing. These are compositional references, not requests for borrowed recordings or copied tunes.

## Tuning and spelling

All scores and pitched healing/victory cues use **31-EDO**, anchored to **A4 = 440 Hz**. Scores store explicit pitches such as `Bb4`, `F#4`, `D#5` and `Ab5`. `src/game/tuning.ts` calculates frequencies directly from spelling and constructs diatonic intervals. The semitone-coordinate helper exists only to verify the transcription; it never determines sound.

| Pitch or interval | 31-EDO steps |
| --- | --- |
| C D E F G A B | 0 5 10 13 18 23 28 |
| Sharp / flat | +2 / -2 |
| Diatonic semitone | 3 |
| Minor / major third | 8 / 10 |
| Perfect fifth / octave | 18 / 31 |

Keep the diatonic spelling through the fifth chain: `Bb -> F -> C -> G -> D -> A -> E -> B -> F# -> C#`. C# and Db differ by one 31-EDO step; so do A# and Bb. Do not merge them at a twelve-fifth boundary. The full pitch-class circle closes after 31 fifths. The Music tab displays all 31 classes with balanced sharp/flat spellings, including double accidentals.

Raised leading tones use F# in D-major dominants, D# in B-major dominants, and G# in E-major dominants. Borrowed Gm7/C7 uses Bb; F-minor and Db-major sections use Ab and Db. The Iron Coast's descending F–Eb–D passing figure uses Eb, independently of D# in E-minor material. Chord-generated fifths and thirds retain their letter relationships under transposition.

Non-musical steam, impacts, footsteps and the lantern's beating resonance retain their material sound design rather than being quantized. The spelling convention follows [31et.com's notation reference](https://31et.com/page/notation).

## Retained Evangelion reference

The existing `score-d.ts` uses **F – Em – Am – Dm – G – Gm7 – C7 – F**, each chord one four-beat bar. The B-flat in Gm7 and C7 turns the G-major arrival toward F. Keep that audible in the bass and voicings.

Its 32-bar opening, answer, lifted bridge and varied return remain available for future locations. The historical internal arrangement names `northglass`, `relayhall` and `switching` describe retained arrangements. Chapter Three now uses the capital, gallery and combat arrangements in the reboot.

## References for new themes

The user supplied these alternatives and asked us to remember them:

- **Nichijou:** C – Bm7b5 – Em7 – Am – Gm7 – C7 – F – Em – Dm – G – C. Keep the half-diminished chord and Gm7/C7 turn while developing an original theme.
- **Chrono Trigger:** non-functional chord vamps. Shared tones, bass placement, register and texture can carry a location without forcing each phrase through dominant–tonic harmony. The god's domain or another suspended location may suit this approach.

Use a reference when a new location calls for it. Retain melodic identity, variation across a complete loop, written rests and clear accompaniment levels. Verify live and offline audio without clipping.

## Chapter Two — regional themes and battles

Iron Coast keeps the Nichijou harmony at 88 BPM, with the original first two bars restored in both melody and accompaniment. The sixteen-bar form uses a recurring call, contrasting answers, held phrase endings and a broader middle. Bass and piano share a steady half-note pulse, with a held chord at each phrase ending; light percussion reinforces the quarter-note beat. The opening retains its short passing notes; later phrases use straightforward eighth-note divisions. Preserve the round bass's sine fundamental and quiet octave. Bar 2 remains Bm7b5/D: D replaces the low B, with B retained in the piano, keeping the accepted C–D–E bass ascent and half-diminished harmony.

Railway Ward is a C-major piano waltz in **3/4 at 78 BPM**. Its sixteen bars are rewritten around three quarter-note beats: a bass downbeat, gentle left-hand chords on two and three, and clear right-hand phrases. Cadences omit the third accompaniment beat; strings enter only in the middle. The scheduler, bar-boundary changes, playback position and Music inspector all use the cue's authored meter.

| Encounter | Cue | Source and treatment |
| --- | --- | --- |
| Signal walk / loading gate | `coast-battle` · Iron Coast — train raid | Harbor harmony and E–G call at 124 BPM; four-bar call/answer, its borrowed-chord response, a broader high-register middle with a half-time backbeat, then a rhythmic return and tonic cadence. Steady quarter-note bass and a full backbeat frame the middle |
| Collector / boarding defense | `shunting` · Cinderbank — loading walk | Cinderbank's E-minor melody at 126 BPM; shorter articulation, moving round bass, chord replies and a broader middle |
| Petra's crossing | `petra-battle` · The last crossing | Cinderbank's B–E call at 116 BPM, expanded into a firm string lead, triplet-based answers over straight eighth-note hats, kick on one/three and snare on two/four, with straight sixteenth-note fills; D# and F# retain the B-major dominant's spelling |

Each encounter declares its music cue in content. Future chapters must choose their own regional battle arrangement explicitly; they cannot silently inherit Chapter One's score. Chapter Three keeps its related switching arrangement, and Chapter Four keeps its existing battle and warden themes. All six Chapter Two cues are grouped together in the Music workshop with their tempo and meter. Petra’s melody and pitched accompaniment are authored in three ticks per quarter note. Percussion uses straight divisions and keeps its kick/snare backbone through phrase endings and the middle. The inspector writes third-beat positions as `2+1/3` or `3+2/3` to keep the rhythm readable. Rendered QA audio is never a runtime asset.

## Beneath the Palace

The capital and control gallery use the retained 32-bar Evangelion-inspired original melodies; chapter battles use the related switching arrangement. The new extraction chamber uses a restrained non-functional Dm9 / B♭maj9 / Fm7 / A♭maj7 vamp at 68 BPM, one sparse bell call, low sustained support and an octave-lowered answer. No competing arpeggio or percussion obscures the line. This applies the remembered suspended-harmony reference without copying a melody.


## A Light on the Water

`score-four.ts` now contains five distinct 32-bar compositions. They share small rising-third motifs, rather than replaying the same melody at different speeds.

| Cue | Tempo | Form and arrangement |
| --- | --- | --- |
| Refuge — A Place to Return | 78 BPM | A reed call in A minor, a higher answer, an F-major middle coloured by F minor, and a quieter return into C. Piano replies fill phrase-ending rests; strings enter for the middle. |
| Breakwater — The Sea Gate | 104 BPM | Syncopated piano in E Dorian, moving bass and light drums. The middle opens into longer notes and drops the percussion before the return. |
| Sanctuary — Under the Hollow Sun | 66 BPM | Low bell calls over two-bar D-minor pedals, whole bars without a lead, and an F-minor/Db-major middle. Sparse piano replies; no drums. |
| Ordinary battles — Hold the Line | 138 BPM | A separate A-minor theme, syncopated bass, short chord stabs, restrained fills, a broader middle and a pickup back into the loop. |
| Sanctuary Warden — The Emperor's Order | 120 BPM | The sanctuary motif becomes a forceful D-minor lead with a lifted answer. The F-minor middle uses half-time drums, then returns to the opening. Only the warden encounter uses this cue. |

The shared keys instrument has a struck attack and a two-stage decay, with quieter upper partials; sustained notes should no longer resemble an organ. Accompaniment and percussion change with musical sections and phrase endings. Verify all five full loops through the actual Web Audio rack, including transitions and live Sound controls. Keep these compositions procedural; rendered QA recordings are not runtime assets.


## Chapter Five flagship — Iron Above the Clouds

`score-flagship.ts` writes a short two-bar fanfare followed by a 32-bar battle loop at **quarter = 132, 10/8**. The pulse is **2+2+3+3 eighths**: two crisp marching steps open the bar, then two longer groups let the ship float. Bass attacks at quarter positions 0, 1, 2 and 3.5; kick at 0/2 and snare at 1/3.5 keep the same grouping. Reserve short sixteenth-note rolls for the eight-bar cadences.

A D-minor brass call opens into an answering eight bars, a broader string-led middle through F major, Db major and Eb, and a varied brass return. A7 keeps its C# spelling; the Db/Ab middle retains its flats. The last A7 pickup returns to D minor. Sustained inner voices and rests support the line without constant arpeggios. Newly synthesized brass uses paired saws, a quiet lower triangle and an opening/closing filter. Tuned timpani combines decaying membrane partials with a short settling attack; cymbals use a decaying high-passed wash and quiet inharmonic metal. None requires sampled audio or new dependencies.

The intro plays once per explicit cue/battle start, never when the loop wraps. `ARRANGEMENTS.flagship` declares five quarter-note beats, the displayed 10/8 signature and two intro bars. `scorePosition` maps absolute playback after bar 34 back to bar 3. Music → Ch 5 exposes the complete form, loop markers and separate Brass/Timpani audition. Other chapter cues retain their existing transitions and 31-EDO tuning. Validate the full score through the actual Web Audio rack, including the intro/loop seam, release of queued new instruments and desktop/phone transport. Rendered QA audio remains outside runtime assets.
