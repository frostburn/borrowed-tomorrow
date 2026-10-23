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
| Petra's crossing | `petra-battle` · The last crossing | Petra's F-minor C–Db–C–G refusal cell at 116 BPM, constrained to triplet ticks in the string lead and pitched support; straight eighth-note hats, kick on one/three and snare on two/four, with straight sixteenth-note fills. This replaces her former Cinderbank-derived B–E theme |

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


## Chapter Five — character themes

The chapter's former rising calls, triadic answers and repeated root–fifth backing have been replaced. These are new character identities, with locations and battles developing them; a shared instrument or faster tempo does not constitute a new composition. The earlier Chapter Four melodies remain location music, rather than binding future character motifs. The flagship's accepted two-bar intro and 10/8 loop remain unchanged.

| Character / representative cue | Melodic identity | Harmony, phrase and texture |
| --- | --- | --- |
| Nell · Above the Railway (`airship`, 86) | E–D–B–C–A: fall, hesitate, try again | A Dorian with borrowed F and an E7 leading tone. A twelve-bar first sentence delays the high point; a lower answer and wider climb precede the return. Am9, D6/9 over A, Fmaj9 over C and inverted Em9 support the reed with held strings, quiet piano replies and changing bass entrances. No drums. |
| Orrin · The Next Shift (`hammerplain`, 102) | D, D, Eb, D, A: two taps, a neighbour, a downward release | G minor, C9 and an inverted D7b9. A repeated bass work riff carries short piano gestures; the low middle drops the lead and drums for whole bars. A broader reply and varied return keep the taps recognizable without arpeggiating a triad. |
| Petra · The Open Gate (`dawnwatch`, 92) | C–Db–C–G: resistance before a decision | F minor, Db-major inversions, Bbm and a Gb turn; C7 uses E natural. Three-bar calls answer in three, with two bars for resolution. Firm strings and a quiet straight march yield to a low middle without drums. Her Chapter Two crossing now establishes this identity on triplet ticks over the retained straight backbeat. |
| Celia · The Garden Walk (`windmere`, 76, 3/4) | Ab–Gb–F–Eb, then Db–C–Ab–Bb: a long exhale | Db major with Bbm9, Gb6, borrowed Cbmaj7 and Ab7sus/Ab7. A ten-bar opening sustains across two bar lines; its six-bar answer precedes a low eight-bar middle and compressed return. The reed sings above held bass and inner strings rather than three identical piano hits every bar. |

The new motifs describe people: Nell's uncertainty without surrender, Orrin's patient work, Petra's stubborn refusal, and Celia's care continuing after the miracle. They are compositional anchors, not literal notes to force into every scene. Prefer new answers, register changes, silence, different phrase lengths and bass movement to another rising triad followed by a higher copy. Preserve independent counter-lines and the distinction between tension and a falsely triumphant cadence.

### Flight and Hammerplain

`score-flight.ts` owns Nell's three different 32-bar melodies. The Western Mooring (`airfield`, 96) is a shorter rhythmic exploration line. The Empty Cabin (`observation`, 60) remembers a sparse three-bar piano fragment, leaves a bar empty, then moves into lower answers; it is no longer a slow alias of the travel cue. The projection's first shot still silences it. Sustained support releases before a changed harmony, while matching two-bar chords may carry across the bar line.

`score-five.ts` owns five G-minor compositions. The Cooling Race (`coolingworks`, 102) has its own descending counter-melody and different bass entrances. Under the Gantry (`anchorforge`, 84) breaks the work cell into low fragments with whole-bar rests and sustained low strings. Hold the Floor (`five-battle`, 132) compresses the taps into a fighting question and writes a separate broad reply and low break. The Pouring Lane (`five-furnace`, 120) begins with low brass weight, opens into that higher answer, drops back to the lower machinery and returns. Restrained timpani/cymbals mark large entries rather than every four bars. All remain 4/4, with clear kick/snare pulses in combat.

### Dawnwatch and the crossing retcon

`score-dawnwatch.ts` owns five 32-bar F-minor compositions plus the sixteen-bar Chapter Two crossing. The Gun Terraces (`watchbarracks`, 106) use a shorter brass call and a stronger straight pulse; The Town Wheel (`signalwall`, 80) spreads bell fragments around entire silent bars, with low held support and no drums. Across the Terraces (`dawn-battle`, 132) uses a triplet opening, a broad high answer, a lower middle and a varied return. Orders Worth Refusing (`dawn-commander`, 124) begins with Aurel's brass G–Ab–G–Db command; the tritone demand gives way to Petra's string answer in the middle. The command returns before settling onto her F-minor ground. Do not turn the marching drums into triplets.

The last crossing (`petra-battle`, 116) now introduces the same C–Db–C–G cell and F-minor harmony, replacing its old B–E/Cinderbank derivation. Pitched onsets and lengths remain multiples of one-third of a quarter; the kick stays on beats one/three, snare on two/four and hats on straight eighths, including the middle and cadences. The region's Iron Coast opening, accepted Bm7b5/D voicing, Cinderbank and Railway Ward are unchanged. In F minor, write Db/Gb/Ab/Bb and the E-natural C7 leading tone, not their sharp enharmonic alternatives.

### Windmere

`score-windmere.ts` owns five separate 32-bar compositions. Beds beside the Water Lift (`dispensary`, 88, 3/4) is a working piano tune whose turn remembers Celia's song. The Mirrored Ward (`mirrorward`, 66, 4/4) spaces that descent across cold high bells and whole-bar rests, with quiet piano answers and held inversions. Keep the Ward Open (`wind-battle`, 128) enters in Bb minor with a fast descending question, broad string answer and lower contrasting middle; it returns through Celia's Db-major territory. The Light We Keep (`wind-engine`, 118) reverses the cell in its bell opening, uses an insistent repeated bass, then yields to strings in the low middle before the descent returns. Straight drums drive both battles; sparse timpani marks the engine's larger entries.

Cb in the borrowed Cbmaj7 is deliberate: it differs from B in 31-EDO. Likewise keep Db, Gb and Ab spellings throughout the Db/Bb-minor family, and use C natural in Ab7. Quiet inversion notes stay in the bass register rather than jumping into the melodic register. Foreground, accompaniment and percussion have separate levels and intentional rests.

### Review and validation

Open `/?dev=music` and choose **Themes** to compare Nell, Orrin, Petra and Celia without playing a chapter. Their representative campaign cues have short intent notes; **Ch 5** exposes all eighteen rewritten regional cues and the unchanged flagship. **Ch 2** includes Petra's retconned crossing. Play/Restart, seek and the existing instrument filters use the actual campaign score and synth; review settings never change saves or builds.

Unit checks cover single foreground voices across bar lines, finite 31-EDO pitches, loop wrapping, written rests, complete scores and distinct interval/rhythm identities after normalizing key and initial onset. Browser audio checks render the nineteen changed cues through the production rack, including loop seams, for finite samples, adequate level, clipping and sample discontinuities. Desktop and fractional-DPR phone checks exercise theme selection, transport, audition and storage isolation. These detailed browser/audio checks stay outside default CI. Rendered QA audio is never a shipped asset; no new dependencies or recorded samples are required.


### Performing Nell and Celia

Above the Railway (`airship`) and The Garden Walk (`windmere`) have authored phrase dynamics, within-note swells, delayed vibrato and restrained rubato. Nell's connecting notes stay clear; her held questions gradually develop a narrow vibrato. Celia's longer breaths start softly, bloom more broadly and taper into the next rest. The quieter middle and return have their own dynamics, rather than repeating the same envelope at a fixed level.

`Note.expression` carries normalized gain and vibrato-depth curves from `expression.ts` into the shared synth. Gain multiples shape the breath inside the existing click-free attack/release. Vibrato starts straight, builds over the held note and narrows again; depth is in cents and stays below one 31-EDO step. A single LFO bends every harmonic equally in cents around the exact spelled pitch. Source and envelope cleanup must also cancel future swells and scheduled notes when stopping, seeking or changing cues. Notes without expression retain their existing instrument behaviour.

`score-performance.ts` owns the beat-to-seconds conversion and inverse playback clock. Its two authored tempo curves ease into phrase endings and recover time between them. The whole ensemble shares the curve; note lengths span any intervening tempo changes, including Celia's holds across 3/4 bar lines. Each loop retains its nominal duration, and its clock repeats without drift. The other cues keep their authored constant pulse, including the flagship's one-shot introduction and 10/8 loop. Use `performanceBar` for live and offline note timing, and pass the note's expression to `Synth.note`; multiplying these two scores by a single BPM loses the performance.

Music → Themes → Nell or Celia offers independent **Swell/vibrato** and **Rubato** comparisons. Both default on. They are temporary dev audition settings; the campaign always plays the authored performance. The note inspector retains score beats and the live cursor follows performed time. Solo pitch auditions remain unbent references for 31-EDO spelling. Validate rendered gain/pitch movement, full loops, held-note cancellation, seeking, transitions and the ordinary constant-pulse cues outside the default CI gate.
