# Music direction

Compose original melodies with deliberate phrases and Japanese game/anime influence through harmony and pacing. These are compositional references, not requests for borrowed recordings or copied tunes.

## Tuning and spelling

All scores and pitched healing/victory cues use **31-EDO**, anchored to **A4 = 440 Hz**. Scores store explicit pitches such as `Bb4`, `F#4`, `Ed4` and `At5`. ASCII `t`/`d` raise/lower a natural by one 31-EDO step; `#`/`b` raise/lower by two. Compound alterations such as `C#t4` (+3) and `Bbd4` (−3) keep their spelling through octave shifts and transposition. `src/game/tuning.ts` calculates frequencies directly from spelling and constructs diatonic intervals. The semitone-coordinate helper exists only to verify the transcription; it never determines sound.

| Pitch or interval | 31-EDO steps |
| --- | --- |
| C D E F G A B | 0 5 10 13 18 23 28 |
| Sharp / flat | +2 / -2 |
| Half-sharp `t` / half-flat `d` | +1 / -1 |
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
| Signal walk / loading gate | `coast-battle` · Iron Coast — train raid | C-major coastal identity at 124 BPM, trading the user-authored E–E–E–F–G / F–E–D opening with the old lower replies, borrowed Gm7–C7 passage, and broad F5–A5–G5 lift. The C–D–E bass ascent through Bm7b5/D remains. Bar 5 develops the repeated call as D–D–D–Eb–F before the old E–D–Bb answer; bar 11 reprises the opening call before the old C–E–G response. C and F support use open fifths plus added seconds, omitting their major thirds; G7 and minor sevenths add tension. Four phrases: C(add9, no3)–Bm7b5/D–Em7–Am7; Gm7–C7–F(add9, no3)–Em7; Dm7–G7–C(add9, no3)–Am7; F(add9, no3)–Dm7–G7–C(add9, no3). Bars 15–16 use D–D–D–E–F followed by the opening's F–E–D answer over a straightforward G–C bass return. The final F resolves to E, then falls to an open D ninth, ready for the next E, without a held tonic. The half-time middle keeps its broad accompaniment as the repeated call returns; steady quarter-note bass and the full backbeat frame it. Exploration Iron Coast is unchanged |
| Collector / boarding defense | `shunting` · Cinderbank — loading walk | Cinderbank's E-minor melody at 126 BPM; shorter articulation, moving round bass, chord replies and a broader middle |
| Petra's crossing | `petra-battle` · The last crossing | Petra's F-minor C–Db–C–G refusal cell at 132 BPM, grounded by quarter-note landings and clear half-bar answers, with one brief triplet pickup; straight eighth-note hats, kick on one/three and snare on two/four, with straight sixteenth-note fills. This replaces her former Cinderbank-derived B–E theme |

Each encounter declares its music cue in content. Future chapters must choose their own regional battle arrangement explicitly; they cannot silently inherit Chapter One's score. Chapter Three keeps its related switching arrangement, and Chapter Four keeps its existing battle and warden themes. All six Chapter Two cues are grouped together in the Music workshop with their tempo and meter. Petra’s melody now lands predominantly on quarter-note beats, with the long answer returning on beat three. A single triplet pickup in bar 5 runs into the next downbeat; pitched accompaniment retains its triplet-length articulation. Percussion keeps straight divisions and its kick/snare backbone through phrase endings and the middle. The inspector still displays the occasional third-beat position as a fraction. Rendered QA audio is never a runtime asset.

## Beneath the Palace

The capital and control gallery use the retained 32-bar Evangelion-inspired original melodies; chapter battles use the related switching arrangement. The new extraction chamber uses a restrained non-functional Dm9 / B♭maj9 / Fm7 / A♭maj7 vamp at 68 BPM, one sparse bell call, low sustained support and an octave-lowered answer. Audible bell rolls anticipate the even-bar bells by half a beat; their four ascending attacks lead into the main call. Roll velocities rise from .045 to .06. All four notes stay held to beat 3.5 and release together over 1.8 seconds, so the chord supports the call instead of dropping away after its attack. Bell releases last 1.8 seconds after the written hold. The rolls remain an anticipation rather than a continuous arpeggio, and there is no percussion. This applies the remembered suspended-harmony reference without copying a melody.


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

`score-flagship.ts` writes a short two-bar fanfare followed by a 32-bar battle loop at **quarter = 132, 10/8**. The pulse is **2+2+3+3 eighths**: two crisp marching steps open the bar, then two longer groups let the ship float. Bass attacks at quarter positions 0, 1, 2 and 3.5; kick at 0/2 and snare at 1/3.5 keep the original grouping. Reserve short sixteenth-note rolls for the eight-bar cadences.

A D-minor brass call opens into an answering eight bars, a broader string-led middle through F major, Db major and Eb, and a varied brass return. A7 keeps its C# spelling; the Db/Ab middle retains its flats. The last A7 pickup returns to D minor. Sustained inner voices and rests support the line without constant arpeggios. Newly synthesized brass uses paired saws, a quiet lower triangle and an opening/closing filter. Tuned timpani combines decaying membrane partials with a short settling attack; cymbals use a decaying high-passed wash and quiet inharmonic metal. None requires sampled audio or new dependencies.

The intro plays once per explicit cue/battle start, never when the loop wraps. `ARRANGEMENTS.flagship` declares five quarter-note beats, the displayed 10/8 signature and two intro bars. `scorePosition` maps absolute playback after bar 34 back to bar 3. Music → Ch 5 exposes the complete form, loop markers and separate Brass/Timpani audition. Other chapter cues retain their existing transitions and 31-EDO tuning. The established march is a compositional baseline, not a permanent freeze on note pitches, onsets or lengths. Local melodic and rhythmic refinements are allowed within the 10/8 meter and intro/loop form. Bar 12 now adds a Bb5 passing note between the high B5 and G5. Phrase dynamics and the Alban theme assignment remain. Validate the full score through the actual Web Audio rack, including the intro/loop seam, release of queued new instruments and desktop/phone transport. Rendered QA audio remains outside runtime assets.


## Character themes and Chapter Five development

The chapter's former rising calls, triadic answers and repeated root–fifth backing have been replaced. The character assignments below guide their development in locations and battles; a shared instrument or faster tempo does not constitute a new composition. The earlier Chapter Four melodies remain location music, rather than binding future character motifs. The flagship keeps its two-bar intro, 10/8 march character and 32-bar loop, while allowing local melodic and rhythmic refinements. Dynamics shape four large arcs.

| Character / representative cue | Melodic identity | Harmony, phrase and texture |
| --- | --- | --- |
| Nell · Larkspur festival (`station`, 82) | D–F–E–D: the familiar home song | D minor, four four-bar sentences: call, answer, lifted middle and resolving return. The festival composition is retained. This is Nell’s theme; Above the Railway is general airship travel music. |
| Orrin · The Next Shift (`hammerplain`, 102) | D, D, Eb, D, A: two taps, a neighbour, a downward release | G minor, C9 and an inverted D7b9. A repeated bass work riff carries short piano gestures; the low middle drops the lead and drums for whole bars. A broader reply and varied return keep the taps recognizable without arpeggiating a triad. |
| Kit · Iron Coast (`coast`, 88) | The coastal E–G call and its moving answers | The accepted sixteen-bar courier journey: steady half-note support, a broader middle and the Bm7b5/D inversion in bar 2. The train-raid variation develops the same identity. No new melody replaces the accepted Iron Coast. |
| Petra · The Open Gate (`dawnwatch`, 92) | C–Db–C–G: resistance before a decision | F minor, Db-major inversions, Bbm and a Gb turn; C7 uses E natural. Three-bar calls answer in three, with two bars for resolution. Firm strings and a quiet straight march yield to a low middle without drums. Her Chapter Two crossing establishes this identity with firm beat landings over the retained straight backbeat. |
| Celia · The Garden Walk (`windmere`, 76, 3/4) | Ab–Gb–F–Eb, then Db–C–Ab–Bb: a long exhale | Db major with Bbm9, Gb6, borrowed Cbmaj7 and Ab7sus/Ab7. A ten-bar opening sustains across two bar lines; its six-bar answer precedes a low eight-bar middle and compressed return. The reed sings above held bass and inner strings rather than three identical piano hits every bar. |
| Alban · Iron Above the Clouds (`flagship`, 132, 10/8) | D–A–D–F: a plunging fourth, a return and a rising third | The brass command expands into four eight-bar arcs. Captain Alban (`inspector`, 136, 4/4) preserves its opening, then adds an eight-bar flagship-contour extension after the original sixteen bars without importing its meter. |

The motifs describe people: Nell’s remembered home, Orrin’s patient work, Kit’s determination to keep moving, Petra’s stubborn refusal, Celia’s care continuing after the miracle, and Alban’s command. They are compositional anchors, not literal notes to force into every scene. Prefer new answers, register changes, silence, different phrase lengths and bass movement to another rising triad followed by a higher copy. Preserve independent counter-lines and the distinction between tension and a falsely triumphant cadence.

### Flight and Hammerplain

`score-flight.ts` owns three different 32-bar airship melodies. Above the Railway (`airship`, 86) keeps the E–D–B–C–A falling question, its twelve-bar opening, A-Dorian harmony, borrowed F and E7 leading tone; it is travel music rather than Nell’s character assignment. The Western Mooring (`airfield`, 96) is a shorter rhythmic exploration line. The Empty Cabin (`observation`, 60) remembers a sparse three-bar piano fragment, leaves a bar empty, then moves into lower answers; it is no longer a slow alias of the travel cue. The projection's first shot still silences it. Sustained support releases before a changed harmony, while matching two-bar chords may carry across the bar line.

Orrin’s workshop (`yard`, 94) trades four-bar sentences: his hammer cell, transposed into D minor, occupies bars 1–4 and 9–12; Nell’s actual festival opening answers in bars 5–8, and her resolving sentence closes bars 13–16. The quieter backing leaves the piano foreground audible. Bars 3, 9 and 10 keep the tap rhythm on repeated chord tones rather than chromatic neighbours, so this early scene stays lighter.

`score-five.ts` owns five G-minor compositions. The Cooling Race (`coolingworks`, 102) has its own descending counter-melody and different bass entrances. Under the Gantry (`anchorforge`, 84) breaks the work cell into low fragments with whole-bar rests and sustained low strings. Hold the Floor (`five-battle`, 132) compresses the taps into a fighting question and writes a separate broad reply and low break. The Pouring Lane (`five-furnace`, 136) attacks with low brass hammer taps, opens into that higher answer, drops back to the lower machinery and returns. Its accompaniment uses straight square-bass eighths and clipped brass chords in place of the syncopated bass/piano riff; quarter-note kick/snare weight and phrase-entry timpani supply the industrial drive. Strings appear only in the broader answer and return, with no bell ornaments. Restrained timpani/cymbals mark large entries rather than every four bars. All remain 4/4, with clear kick/snare pulses in combat.

### Dawnwatch and the crossing retcon

`score-dawnwatch.ts` owns five 32-bar F-minor compositions plus the sixteen-bar Chapter Two crossing. The Gun Terraces (`watchbarracks`, 106) use a shorter brass call and a stronger straight pulse; The Town Wheel (`signalwall`, 80) spreads bell fragments around entire silent bars, with low held support and no drums. The bass carries into every following empty melodic bar without reattacking. Across the Terraces (`dawn-battle`, 132) uses a triplet opening, a broad high answer, a lower middle and a varied return. Orders Worth Refusing (`dawn-commander`, 140) begins with Aurel's brass G–Ab–G–Db command; the tritone demand gives way to Petra's string answer in the middle. The command returns before settling onto her F-minor ground. Do not turn the marching drums into triplets.

The last crossing (`petra-battle`, 132) now introduces the same C–Db–C–G cell and F-minor harmony, replacing its old B–E/Cinderbank derivation. The lead anchors every bar on beat one, usually moving again on beats two, three or four. Shorter attacks, articulated cadences, straight eighth-note bass, quarter-note piano strikes and low brass accents on the refusal cell give the crossing more forward pressure. One short triplet pickup preserves a trace of resistance without displacing the main sentence. The kick stays on beats one/three, snare on two/four and hats on straight eighths, including the middle and cadences. The region's Iron Coast opening, accepted Bm7b5/D voicing, Cinderbank and Railway Ward are unchanged. In F minor, write Db/Gb/Ab/Bb and the E-natural C7 leading tone, not their sharp enharmonic alternatives.

### Windmere

`score-windmere.ts` owns five separate 32-bar compositions. Beds beside the Water Lift (`dispensary`, 88, 3/4) is a working piano tune whose turn remembers Celia's song. The Mirrored Ward (`mirrorward`, 66, 4/4) spaces that descent across cold high bells and whole-bar rests, with quiet piano answers and held inversions. Bell phrases carry through the following empty bar without another attack. Keep the Ward Open (`wind-battle`, 128) enters in Bb minor with a fast descending question, broad string answer and lower contrasting middle; it returns through Celia's Db-major territory. The Light We Keep (`wind-engine`, 136) reverses the cell in its bell opening, uses an insistent repeated bass, then yields to strings in the low middle before the descent returns. The engine uses straight square-bass eighths and stronger kick/snare attacks, opening to quarter-note bass and half-time snare in its low middle; timpani and metal crashes mark its larger entries.

Cb in the borrowed Cbmaj7 is deliberate: it differs from B in 31-EDO. Likewise keep Db, Gb and Ab spellings throughout the Db/Bb-minor family, and use C natural in Ab7. Quiet inversion notes stay in the bass register rather than jumping into the melodic register. Foreground, accompaniment and percussion have separate levels and intentional rests.

### Review and validation

Open `/?dev=music` and choose **Themes** to compare Nell, Orrin, Kit, Petra, Celia and Alban without playing a chapter. Their representative campaign cues have short intent notes; **Ch 5** exposes the eighteen regional cues and the flagship. **Ch 2** includes Petra's retconned crossing. Play/Restart, seek and the existing instrument filters use the actual campaign score and synth; review settings never change saves or builds.

Unit checks cover single foreground voices across bar lines, finite 31-EDO pitches, loop wrapping, written rests, complete scores and distinct interval/rhythm identities after normalizing key and initial onset. Browser audio checks render complete changed cues through the production rack, including loop seams, for finite samples, adequate level, clipping and sample discontinuities. Desktop and fractional-DPR phone checks exercise theme selection, transport, audition and storage isolation. These detailed browser/audio checks stay outside default CI. Rendered QA audio is never a shipped asset; no new dependencies or recorded samples are required.


### Expression and review

| Cue | Authored performance | Useful review point (bars start at 1) |
| --- | --- | --- |
| Vessel chamber (`conduit`) | ascending bell rolls held together to beat 3.5 under each main call; 1.8-second release | Bar 1, Bell; compare Expression on/off |
| A Place to Return (`refuge`) | Phrase dynamics throughout the ensemble, warm delayed reed vibrato, rubato and a quieter final return | Bars 1, 10, 18 and 32; Reed or All |
| Under the Hollow Sun (`sanctuary`) | one ascending bell roll per four-bar sentence, held together to beat 3.5; 1.9-second release | Bars 1, 5, 9 and 17; later calls stay unprepared |
| The Mirrored Ward (`mirrorward`) | Wide bass slides with controlled vibrato and a straight finish; the bell line carries into its empty bars | Bar 5, Bass; compare Expression on/off |
| The Western Mooring (`airfield`) | Reed swells and delayed, controlled vibrato; phrase dynamics in bass and piano | Bars 8 and 21, Reed; steady 4/4 remains |
| Under the Gantry (`anchorforge`) | Quiet phrase arcs, bass approaches, small scoops into longer piano fragments and ensemble rubato | Bars 5, 13 and 17; Piano/Bass/All |
| The Town Wheel (`signalwall`) | Ensemble dynamics and rubato; wide bass slides finish straight, with bass pedals carried into the empty bars | Bars 3, 17 and 25; Bass then All |
| The Empty Cabin (`observation`) | Earlier piano arrivals, narrower approaches in bars 3/11/17/19/23/27, straight notes in 15/21; bass settles first | Bars 3, 11, 15, 17, 19, 21, 23 and 27; Piano/All |
| Iron Above the Clouds (`flagship`) | March accompaniment, a Bb5 passing turn in bar 12, four dynamic arcs and the softer string middle | Bars 3, 12, 19 and 31; All, then Brass/Strings |
| Above the Railway / The Garden Walk (`airship` / `windmere`) | Retained clear/warm reed performances, phrase dynamics, delayed vibrato and rubato | Travel remains general airship music; Windmere remains Celia’s theme |

`Note.expression` carries normalized gain, vibrato-depth and pitch-bend curves, plus an optional release time in seconds. Pitched curves use cents around the exact spelled 31-EDO centre. The additive bend bus preserves instrument unison detunes and moves every partial together, including the bell’s FM modulator. Ward/Wheel basses now slide for 1.25 score beats through five to eighteen 31-EDO steps (about 194–697 cents), roughly twice as loud as before. A narrow 4.4 Hz vibrato blooms only after arrival and reaches zero for the final 14% of the hold. Gantry retains its short eight-step-limited approaches. Cabin bass settles in 0.3 beats without later scoops; its piano arrives within 0.55–0.6 beats. Bars 3, 11, 17, 19, 23 and 27 approach through only three steps (about 116 cents); bars 15 and 21 are straight. Other retained bends span five or eight steps. The two parts never bend simultaneously. Vibrato begins straight, blooms on held notes and narrows before the rest; short connecting notes have none. The piano remains struck, with phrase dynamics carried principally by its attack.

The existing true-zero attack and release remain outside the expression gain. Stopping, seeking and changing cues therefore cancel future bends, swells, held pedals and extended bell tails together. Unpitched drums take the dynamic accent at their attack; they keep their existing short material decay. No samples or production dependencies are added.

`score-performance.ts` owns a single forward/inverse ensemble clock for each rubato cue: `airship`, `windmere`, `refuge`, `anchorforge`, `signalwall` and `observation`. Notes that cross a bar line include every intervening tempo change. Each loop returns time borrowed at cadences and retains its nominal total duration, with no accumulated drift. Every other cue keeps its constant pulse, including Alban’s 4/4 battle and the flagship’s one-shot fanfare / 10/8 loop. Live playback and offline review both use `performanceBar` and forward the expression to `Synth.note`.

The workshop exposes **Expression** for every expressive cue, including bends-only and release-only arrangements. It disables dynamics, vibrato, bends and extended release together for comparison; **Rubato** appears independently where authored. Both default on and are session-only; campaign playback always uses the authored performance. Solo pitch auditions remain straight 31-EDO references. Detailed browser checks measure the rendered bass approach and settled pitch, bell release/tail discontinuities, cancellation, complete forms and loop seams. Desktop/phone checks cover the six theme assignments and performance controls. These checks stay outside the default CI gate; rendered QA audio stays outside the game.


## The Sky Answers — divine hunters

`claim` / `score-claim.ts`: 16 bars, 4/4 at quarter = 124, used by the campaign’s post-flagship minion encounter. Exposed bell E–Eb calls fall into A, with string answers in the second half. Dm9, Ebmaj7#11 and suspended Bb harmony deny the military cadence. Leave gaps after the calls, thin bass/percussion every fourth bar and use phrase dynamics/string vibrato. This cue keeps a steady clock and offers the Expression comparison. It uses existing procedural bell, strings, round bass and percussion; no new samples or instruments. Alban’s accepted 10/8 march remains unchanged. The intervention itself silences music under the bodiless voice; the berth uses The Empty Cabin.


## Approved future regions — all in 31-EDO

These collections guide Chapters Six–Seven. Namar, Iria and Skeld scores are implemented below; domain scores remain plans. The shared parser supports their half accidentals. The desert, northern kingdom, jungle and Benefactor's domain all retain 31 equal divisions of the octave and A4 = 440 Hz. Each scale below is a collection inside that tuning; modal transposition adds an integer number of 31-EDO steps. Use the exact grid for melody, harmony, bass and pitched percussion.

### Desert — neutral intervals and score spelling

Use a stable seven-note collection generated by nine-step neutral thirds for the actual desert expedition, following issue #89. Preserve phrase dynamics, controlled vibrato, expressive timing and related battle variations. Two Seals at the Gate keeps its accepted, more unsettled harmony.

Parse ASCII `t` as half-sharp (+1 step), `d` as half-flat (−1 step), `#` as sharp (+2 steps) and `b` as flat (−2 steps). Thus `Ct4` is one step above C4; `Cd4` one below; `Ed4` lies between Eb4 and E4. C–Ed is nine steps, approximately 348.39 cents. Preserve written letters and accidentals through octave shifts and transposition; retain the existing 18-step fifth and coherent circle of fifths. The shared runtime parser and pitch type support these spellings, including `#t` and `bd` compounds; malformed or mixed-direction accidentals are rejected. Do not round the new notes to semitones or retune existing cues.

### Scale collections

Degrees are integer steps above a chosen tonic, reduced modulo 31. Zero is the tonic and 31 the octave; the octave is omitted from the degree lists. L and s describe adjacent large and small steps, including the closing step to the octave. These are specific modes; other modes/transpositions can serve related cues.

| Location | Scale | Degrees | Step sequence | Construction |
| --- | --- | --- | --- | --- |
| Northern capital and expedition | Orwell[9] | `0 4 7 11 14 18 21 25 28` | `4 3 4 3 4 3 4 3 3` | 4L5s MOS; L=4, s=3; generator 7, nine notes |
| Glacier ruins, optional contrasting palette | Myna[7] | `0 7 8 15 16 23 24` | `7 1 7 1 7 1 7` | 4L3s MOS; L=7, s=1; generator 8, chain −3…3 |
| Jungle river, village and sanctuary | Slendric[5] | `0 6 12 18 24` | `6 6 6 6 7` | 1L4s MOS; L=7, s=6; generator 6, five notes |
| Deeper forest and jungle combat | Slendric[6] | `0 6 12 18 24 30` | `6 6 6 6 6 1` | 5L1s MOS; L=6, s=1; adds degree 30 |
| Benefactor's domain | Overtone-derived octatonic | `0 5 10 14 18 22 25 28` | `5 5 4 4 4 3 3 3` | Nearest 31-EDO steps to harmonics 8–15, relative to harmonic 8 |
| Domain's reflected collection | Inversion of the overtone-derived scale | `0 3 6 9 13 17 21 26` | `3 3 3 4 4 4 5 5` | Exact pitch-class inversion: x → −x modulo 31 |

### Northern kingdom — Orwell and Myna

Orwell[9] supplies a spacious, bittersweet identity, with broad melodic phrases and relatively similar adjacent steps. The chosen mode contains subminor `[0,7,18]` and supermajor `[0,11,18]` triads sharing one fifth. Make their contrasting thirds an important gesture in the capital's hymn. Bowed strings and expressive sine lines establish human warmth; bright struck tones and wide registers evoke the frozen surroundings. The battle variation can foreground the Orwell tetrad `[0,7,14,21]`.

Reserve Myna[7]'s wide gaps and tiny paired dieses for the glacier's exposed ice, creaking structures and dangerous discoveries. The scale choice alone does not produce a cold atmosphere; melody, voicing, timbre and pacing must carry it.

### Jungle — Slendric

Slendric[5]'s nearly even pentatonic spacing supports a buoyant river journey. Use interlocking plucked or wooden sounds, a substantial melodic bass and a sustained reed voice across the percussion's exchanges. Five pitches do not prescribe a five-beat meter. Write harmonic movement for this collection rather than importing familiar chord progressions unchanged.

Expanding to Slendric[6] adds degree 30, a diesis below the tonic, and a clearer point of tension for deeper forest and combat. During Nell's treatment, the music can settle from this six-note material into the five-note sanctuary collection as her pulse steadies. Keep regional arrangements and battle variations distinct compositions, with shared material that can be heard.

### Benefactor — radiance and reflection

The overtone-derived collection contains near-harmonic `[0,10,18,25]` and extensions at 14 and 22. Begin with radiant sustained harmony: the player should hear why people once trusted this being. For places where stolen days accumulate, use the inverted collection. Build corresponding phrases and harmonies in the two collections so the same architecture can suggest generosity or oppression through its treatment. The Benefactor's established descending call threads through both and develops into its final battle theme. Its full visual form remains reserved for the domain.

### References and reproducibility

[31edo Scales](https://www.31edo.com/scales) describes the six-, seven- and eight-step generator families, Orwell[9]'s harmony and Slendric's pentatonic structure. The specific degree sets above were calculated from their generator chains modulo 31 and checked against their cyclic step patterns. The overtone collection is calculated as `round(31 * log2(h / 8))` for h=8…15; reflect each degree modulo 31 for its inversion. This keeps all frequencies on the game's tuning grid. No external tuning files or new dependencies are needed.


## Chapter Six — Namar: neutral thirds and melodic course

Issue [#89](https://github.com/frostburn/borrowed-tomorrow/issues/89) asks for a stable **3L4s** collection generated by stacked neutral thirds. `score-desert.ts` now gives every regional voice the same seven-note home at a given time. The chain F–Ad–C–Ed–G–Bd–D advances by nine 31-EDO steps at each third. In C tonic order this is **C D Ed F G Ad Bd** = `0 5 9 13 18 22 27`, with cyclic steps `5 4 4 5 4 5 4`. L=5 and s=4. Octaves, ornament notes, bass and tuned timpani stay on this exact grid.

These are original Arabic-informed game compositions in Namar's own neutral mode. The lower phrases dwell on and return to the tonic; the upper answer explores the fourth/fifth region before returning through the neutral third. Short repeated notes, neighbor turns, appoggiaturas and cadential descents shape the melody. Held destinations have controlled vibrato and swells, with only a few early one-step approaches. Bass and open inner voices sustain modal centers across phrases. The lute supplies single-note answers and punctuation; full block-chord strums and a new neutral chord in every measure no longer drive the region.

A contrasting eight-bar region is deliberate: city/rooftops/postal battle visit G **G A Bd C D Ed Ft** in bars 17–24, then return to C. The court begins on F **F G Ad Bb C Dd Ed**, visits C for its lifted middle and returns to F. The observatory stays on D **D E Ft G A Bd Ct**. The serpent leaves C for D in loop bars 17–24 and returns. Each is a transposition of the same 3L4s pattern, with its own stable tonic and written cadences. The hunters' established E–Eb–A bell call is a brief foreign incursion in the observatory and serpent middle; the main melody rests for that quotation.

| Cue | Title | Form and character |
| --- | --- | --- |
| `outermooring` | Two Seals at the Gate | **Unchanged** 32-bar 4/4 at 72, including every note, voice, dynamic, bend, hold and ensemble rubato. Its accepted arrangement is isolated in `score-gate.ts`. |
| `namar` | Letters on the Water | 32 bars, 4/4 at 96; reed sentences circle C/Ed, an upper answer reaches the octave, the G-region lute middle opens the register, and a varied descending return closes on C. Maqsum-derived hand drum. |
| `sunpalace` | The Queen’s Half of the Pact | 32 bars, 3/4 at 76; dignified F-neutral appeal, a lute response, lifted C-region middle and lower return. Quiet Darij-derived dum/tak pulse, cross-bar bass, phrase swells and the existing ensemble rubato. |
| `skywalk` | Above the Awnings | 32 bars, 4/4 at 104; nimble repeated lute notes and written turns, two Malfuf cycles per measure, a longer G-region reed middle and clipped descending cadences. |
| `observatory` | The Bronze Sky | 32 bars, 4/4 at 70; low D-neutral reed, exposed upper bells, real rests, held open inner voices and distant low drum markers; the hunters interrupt its middle before the lower line returns home. |
| `desert-battle` | The Postal Stair | 32 bars, 4/4 at 136; develops the city's melodic turns in more urgent sentences, a broad G-region string middle and higher reed return. Strong Maqsum-derived strokes over a steady two-beat kick. |
| `sun-serpent` | Coils around the Sun | Two-bar one-shot opening, then 32 bars in 6/8 at quarter=120. Low brass/upper reed exchanges, a D-neutral middle and firm C return; compound hand-drum strokes retain both large downbeats, with selective timpani and cymbal punctuation. |

The hand drum's low **dum** and high **tak** sounds come from the existing procedural instrument. Maqsum's skeleton is `D T . T D . T .` on eight eighths. Rooftop Malfuf uses `D..T..T.` on eight sixteenths, twice per 4/4 bar. The court's three-beat cycle and serpent's compound cycle retain their authored meters. Ghost strokes and cadence thinning vary the texture without losing the low/high skeleton. The percussion pulses do not inherit melodic pitch bends; battle clocks stay steady.

The composition approach draws on Maqam World's description of [melodic course and ajnas](https://www.maqamworld.com/en/maqam.php), [Rast's lower and upper regions](https://www.maqamworld.com/en/maqam/rast.php), and the documented [Maqsum](https://www.maqamworld.com/en/iqaa/maqsum.php), [Malfuf](https://www.maqamworld.com/en/iqaa/malfuf.php), [Sama‘i Darij](https://www.maqamworld.com/en/iqaa/samai_darij.php) and [Yuruk Semai](https://www.maqamworld.com/en/iqaa/yuruk_semai.php) patterns. The notes and melodies are newly composed for the game's 31-EDO collection.

Review in **Music → Ch 6**. Compare city bars 1/9/17/25, court 1/9/17/25, rooftops 1/17, observatory 9/17/25 and serpent 1/3/11/19/27 (including its two intro bars). Solo Hand drum, Lute or Bass to hear the rhythmic and modal foundations. `tests/desert-music.test.ts` verifies the third chain, all pitched parts against each declared region, the bounded quotation and the protected mooring's performed-event fingerprint. Detailed browser renders cover every complete form and loop seam through the real synth and remain outside default CI. No synth, room, tuning, sampling or dependency changes are needed.


## Iria — Slendric and the treatment boat

`score-jungle.ts` contains six distinct 32-bar 4/4 forms with phrase dynamics and reed/brass vibrato; the percussion keeps a steady clock. All pitched voices, bass and wood stay exactly on C-rooted Slendric: C / Dt / Fd / G / At = `0 6 12 18 24`. Canopy, waiting and battle cues add Cd = `30`, a diesis below the next tonic. `t`/`d` retain the ordinary 31-EDO parser’s spelling and octave behavior. No imported major/minor triads or MIDI rounding.

| Cue | Quarter BPM | Function |
| --- | --- | --- |
| `riverhaven` · Iria / The Next Launch | 104 | Falling reed calls over moving bass; five-note warmth and wood replies. |
| `canopy` · Under the Green Signal | 108 | Sixth-tone tension; longer forest calls and a contrasting upper register. |
| `rainhouse` · The Waiting Basin | 78 | Held bass and reed across real rests, with a restrained but audible drum pulse. |
| `rainhouse-rest` · A Seat by the River | 80 | Five-note answer to the waiting tune after recovery; its own second half and long final landing. |
| `river-battle` · Iria / Open the Waterway | 132 | Develops the river contour in pitched wood over stronger drums and mobile bass. |
| `rain-warden` · Wings on the Landing | 140 | Sixth-tone brass calls, a sustained middle reed answer and a developed final phrase. |

Hand drums alternate low open strokes with dry upper rim strokes. A shaker holds eighths; the pitched wood interlocks in 3+3+2 divisions without changing the four-beat meter. Cadences thin the accompaniment and the middle sections change the bass/wood texture. The melody is written in four-bar sentences, not repeated rising triads. The clinic holds bass/strings across empty bars. Recovery switches to the five-note cue after the completed treatment, without making the music an in-story cure mechanism.

The rack adds procedural `wood` (an exact harmonic struck sine body), `hand-drum` (short membrane/body and skin noise) and `shaker` (dry filtered noise). Shared smooth envelopes, tails and cancellation apply. Hand drum/shaker are unpitched; wood and timpani are tuned. Solo each new instrument, or the full Drums group, in Music → Ch 6. No samples, dependencies or alternate tuning system are added.


## Skeld — Orwell hymn, Myna wrecks and winter wings

`score-north.ts` authors six separate 32-bar forms in 31-EDO, A4 = 440 Hz. C-rooted Orwell[9] is spelled `C Dd D# Et Ft G Ab A# B` (steps `0 4 7 11 14 18 21 25 28`); its `C–D#–G` subminor and `C–Et–G` supermajor thirds answer one another in the harbor hymn. C-rooted Myna[7] is `C D# Eb F# F#t A At` (steps `0 7 8 15 16 23 24`). Neighboring dieses answer across wide registers at the wrecks rather than sounding as a continuously loud cluster. The existing ASCII accidental parser and circle of fifths are unchanged.

| Cue / workshop title | Meter / BPM | Form and sound |
| --- | --- | --- |
| `bellharbor` · Skeld / Answering Bells | 4/4 · 78 | Descending sine hymn, held strings, answering bell and occasional second sine voice; modest ensemble rubato. |
| `frostwatch` · The Covered Road | 4/4 · 94 | A sine-voiced walking answer to the hymn with restrained timpani and wood. |
| `glacier` · The Fleet beneath the Ice | 4/4 · 68 | Myna struck bells, wide registers, paired dieses, held bass and quiet string planes. |
| `wintershrine` · A Bell for the Outer Marker | 4/4 · 72 | Sparse Orwell hymn; long string/bass holds fill quiet bars, controlled sine vibrato and small cadence breaths. |
| `north-battle` · Skeld / Open the Mountain | 4/4 · 128 | Regional melody developed in the sparse tritaver voice over firm kick/snare/timpani, string beds and mobile bass. |
| `winter-dragon` · Wings over the Winter Bell | 5/4 · 132 | Two-bar one-shot tritaver/timpani introduction, then 32-bar loop. Three-beat weight and two-beat lift; Orwell tetrad `0 7 14 21`, expressive tritaver lead over quiet strings. |

All cues have phrase dynamics, controlled long-note vibrato and softer bell releases. Full melody phrases are authored across four bars, with independent second-half development rather than an endlessly rising triad. Battle timing stays steady. Music → Ch 6 reviews the exact notes, meter, parts, expression and harbor/shrine rubato; no recordings or production dependencies are added. `north-music.spec.ts` renders every bar and the loop transition through the actual synthesis rack, in bounded windows with earlier held notes and exact performed timing.

Northern exploration uses a pure sine oscillator in place of reed (including the harbor answer); the glacier retains its struck-bell lead. Both battle melodies, including the dragon introduction, use a cached Web Audio PeriodicWave called **tritaver**. Its six partials are the powers of three: harmonics 1, 3, 9, 27, 81 and 243, with amplitudes `1 / (i*i*i + 1)` for `i = 0…5` in 244-element real/imaginary coefficient arrays. All other upper coefficients and DC are zero. No sub-oscillator, unison detune or pitch division is added. Cubic partial falloff softens the upper color at the original voice gain. A 7 kHz low-pass preserves the upper color; the normal smooth envelope, phrase dynamics, bends, controlled vibrato and cancellation apply to both new voices. Music’s Sine and Tritaver part filters isolate them. Offline spectral checks verify the audible pitch, present/absent partials and release silence through the real rack.


## The capital and its two outcomes

`score-capital.ts` authors 32-bar forms in exact 31-EDO, keeping diatonic spelling and all existing sine/tritaver definitions. The remembered morning uses the actual Larkspur festival score, available only to recovered Nell. No recordings or new dependencies.

| Cue | Meter / tempo | Form and instrumentation |
| --- | --- | --- |
| `stillcity` · The Procession Never Ends | 4/4, 88 | A descending piano sentence catches on repeated E, opens into higher replies, then returns without its final tonic. Held bass/strings and occasional lute replies leave real gaps. |
| `lastpalace` / `crown` · A Place at the Table | 3/4, 86 | A falling fifth and an unsettled return in F minor, with Db/Ab rooms and a C/E dominant. Expressive strings span four-bar sentences. |
| `capital-battle` · Open the Patient Stair | 4/4, 140 | Develops the avenue’s cell in brass with string answers, mobile bass, straight drums and phrase-ending timpani. |
| `emperor` · The Emperor’s Last Day | 3/4, 144 | Two-bar one-shot brass/timpani opening into a 32-bar battle waltz. The palace tune grows upward, moves to a string middle and returns lower; firm three-beat pulse. |
| `lightbearer` · The Hand on the Shutter | 4/4, 124 | Two-bar opening, then 32 bars. Nell’s literal D–F–E–D festival phrase remains recognizable in bells, with a string answer and widening registers against overtone-colored bass/inner harmony. Quiet tritaver replies use the exact powers-of-three rack. The full god theme remains for Chapter Seven. |
| `capital-return` · The City Comes Down | 4/4, 82 | Warm descending reed answers, held strings/bass, modest ensemble rubato and a quieter unfinished return toward the next journey. |
| `laststation` · The Empty Seat | 4/4, 60 | A lower, sparse piano recollection of Nell’s phrase, soft strings, long bass and ensemble breaths; no percussion or triumphant cadence. |

All held melodic voices receive dynamics/controlled vibrato; bell tails release softly. Battle clocks stay steady. Full forms and loop seams render through the same Synth/performance clock as live playback, with finite-level and click checks outside the default CI gate. The Lightbearer reveal starts its own cue; the mantle’s fall gives way to The Empty Seat.

## Chapter Seven — the stolen days and three final forms

`score-seven.ts` supplies sixteen complete 32-bar arrangements. The three final battle cues each have a two-bar one-shot introduction. Pitched domain parts remain on the approved radiant octatonic `C D E Ft G Ad A# B` = `0 5 10 14 18 22 25 28`, or its exact reflection `C Db Dt Ed F Gd Ab A#t` = `0 3 6 9 13 17 21 26`. In particular, `Ad` is degree 22; `At` would be 24, and a single `Db`, not `Dbb`, supplies degree 3. All notes use the shared spelled pitch parser and 31-EDO rack.

| Cues | Musical direction |
| --- | --- |
| `hollowsill`, `sunthrone` | Slow harmonic organ, sustained radiant inner voices and a long descending call. The approach develops the final figure's contour. |
| `takenwater` | Reflected bell calls, repeated notes caught in a different answer, long low pedal and soft bell tails. |
| `firstfield` | Radiant lute in 3/4; wide opening turns and a contrasting upper-register middle over wood taps. |
| `quietward` | Reflected sine melody in 3/4, a long descending breath and sustained organ harmony. Ensemble rubato. |
| `seasonstreet` | Reflected pitched wood, displaced replies and a mobile four-beat phrase, distinct from the earlier regional pentatonics. |
| `lastrefuge` | Human D-minor piano sentences over held strings and a round bass. Phrase dynamics and ensemble rubato leave space between answers. |
| `domain-battle`, `harvest-battle`, `hospice-battle`, `seasons-battle` | Independent battle variations of the local domain themes; brass, organ and tritaver leads, moving bass, straight driving percussion, 4/4, 3/4 or 5/4 as authored. Familiar bosses retain their tactical identities while their music belongs to the revealed source. |
| `benefactor` | Radiant harmonic organ and brass answers; 4/4, quarter=120. Its descending opening expands through eight authored four-bar sentences. |
| `hollow-sun` | Reflected brass in 5/4, quarter=128, falling exchanges across registers and a bass that changes its role at phrase turns. |
| `unborrowed` | Radiant strings, answering brass and a clear 4/4 at quarter=148. The shorter exposed-heart fight gets the most forward theme. |
| `homecoming`, `seaholiday` | Human D-minor material, a warmer reed return and a three-beat lute holiday; no alien harmony at the real coast. |

Every form has an opening, answers, a lifted contrasting middle and a changed return. Held bass/pads cross quiet bars without repeated attacks; controlled vibrato and swells belong to sustained voices, while plucked voices retain their attacks. The procedural organ uses exact harmonic sine partials at 1/2/3/4 times the shared tuned fundamental, with normal smooth envelopes and cancellation. No samples or production dependencies. Music → Ch 7 exposes every cue and an Organ solo part. Full-form/loop renders and device review stay outside normal CI.

## Sustained bell colour and furnace bass

The shared bell loses upper colour after the strike on an absolute clock, independently of its written hold length. FM depth approaches its quiet floor with a 0.35-second time constant; the octave partial decays with 0.45 seconds; the low-pass gradually settles toward 1.8 times the fundamental (bounded 700–7000 Hz) with 0.8 seconds. Held fundamentals, authored dynamics, quiet-bar holds and soft releases remain audible. This applies to the Mirrored Ward and other bell cues, including held chamber arpeggios, without replacing their scores. Offline checks compare normalized high-frequency energy at different note ages and hold lengths, as well as release silence/cancellation.

The `square-bass` voice is a band-limited Web Audio square at the exact written 31-EDO fundamental, with no sub-octave, detune or pitch rounding. An eight-millisecond attack and initially 1.1 kHz low-pass retain coarse odd harmonics. After 20 ms the cutoff approaches max(180 Hz, 1.4 times the fundamental) with a 0.22-second time constant, gradually softening held notes independently of their written duration. The workshop's Bass group includes it and **Square bass** isolates it. This voice is used by the later boss arrangements; the accepted Iron Coast round bass keeps its existing sound.


## Boss impact from Chapter Five onward

Boss arrangements have their own rhythm-section weight and phrase turns. Short square-bass attacks, stronger kicks and snare/rim accents create impact at the existing music level; there is no global gain boost, synth change or new audio asset. Melodies, 31-EDO spellings, meters, one-shot introductions and theme identities remain. Exploration, ordinary battles and the accepted Two Seals at the Gate are unchanged.

| Boss cue | Quarter BPM | Rhythm-section character |
| --- | --- | --- |
| The Pouring Lane (`five-furnace`) | 136 | Retain the recently revised straight mechanical eighths, square bass, brass and driving backbeat. |
| Orders Worth Refusing (`dawn-commander`) | 140 | Clipped square-bass answers between the march beats, heavier kicks, firmer snare and four-bar rolls; round bass at a lower level softens the entire second half, starting with Petra's middle answer. |
| The Light We Keep (`wind-engine`) | 136 | Relentless repeated square-bass eighths under the reversed bell cell; quarter-note middle and half-time snare, then a full return. |
| Iron Above the Clouds (`flagship`) | 132 | Restored in full to its earlier round bass, drum levels and cadence rolls; unchanged 10/8 march. |
| Coils around the Sun (`sun-serpent`) | 132 | Six dry bass eighths under the 6/8 hand-drum cycle, with low kick on the two compound accents; held bass leaves the hunters' bell incursion exposed. No rock snare. |
| Wings on the Landing (`rain-warden`) | 140 | Square bass interlocks with the 3+3+2 wood layer, larger low hand-drum strokes and kicks, and sparse metal crashes. The reed middle stays broad; no rock snare. |
| Wings over the Winter Bell (`winter-dragon`) | 132 | Square-bass tread, doubled kicks within the heavy 3+2 gait, snare on beats three/five and a short octave bass pickup. Preserve the softened tritaver and Orwell tetrad. |
| The Emperor's Last Day (`emperor`) | 144 | Six driving bass eighths per waltz bar, strong kick, snare on beats two/three and short cadence rolls. |
| The Hand on the Shutter (`lightbearer`) | 124 | Nervous offbeat square bass and heavy half-time snare under Nell's exposed bell lament. Deliberately broader than the emperor, without making the bad ending triumphant. |
| The Uncut Row (`harvest-battle`) | 144 | Straight square-bass drive and double kick accents. |
| Discharge the Patient (`hospice-battle`) | 144 | Six bass eighths in a three-beat tread, accented low drums and organ. |
| The Winter Kept Here (`seasons-battle`) | 132 | Unequal bass/kick groups over five beats, with three separate snare accents. |
| The God Who Lent Tomorrow (`benefactor`) | 132 | Weighty square-bass march, low brass punctuations under the organ, timpani entries and cadence rolls. |
| The Broken Meridian (`hollow-sun`) | 144 | Ten square-bass eighths and displaced kick/snare groups across 5/4. |
| Tomorrow (`unborrowed`) | 160 | Fast square-bass eighths and double kicks; four bars of quarter-note bass leave space for the high string sentence before the final surge. |

The final introductions now build into their loops with a short snare crescendo. Fills and crashes mark phrases rather than saturating every bar. Full-form browser renders check every boss, including its introduction, low middle, final return and loop seam, through the actual Synth and performance clock. These audio checks remain outside default CI. Unit checks compare percussion attack weight per beat with regional ordinary battles and protect the distinct regional drum languages; those are structural checks, not a claim that a numeric metric proves musical quality.


### Imperial battle counterlines

`score-imperial.ts` adds independent counterlines to Open the Patient Stair (`capital-battle`) and The Emperor's Last Day (`emperor`). Their lower register sits about an octave below the first version's treble voice. Short eighth-note runs, neighbour notes and descending sequences move against the broad lead, with gaps between figures and held cadence notes. Each four-bar sentence follows the existing harmony. Strings sit to the right of the main melody; the Emperor's string-led middle hands the counterline to reed. The waltz stays in three with its two-bar one-shot opening left exposed. Accented arrivals account for both the melody and sustained harmony; close seconds, cross-relations and sharper passing tensions sit on lighter offbeat eighths. Cadence holds settle onto supporting tones rather than sustaining a semitone against the lead. These are authored note choices, not an automatic harmony filter. In The Emperor's Last Day, displayed bars 27–34 relax into mostly held counter-notes aligned with the melody's entrances and rests. F supports the opening Db over G as an altered dominant, and the last sentence descends to a C pedal under the lead's final F. The preceding running eighths stay intact.

The Emperor's Order is restored to its original arrangement. Captain Alban and Iron Above the Clouds are unchanged. Quiet imperial exploration, the Lightbearer and the Benefactor keep their existing arrangements. Music → Ch 6 uses the campaign score; Strings and Reed auditions isolate the relevant instruments. No new samples, tempo changes, room responses or synth patches are involved.
