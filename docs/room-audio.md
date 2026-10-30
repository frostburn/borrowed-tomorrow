# Map rooms

Issue #88: exploration and battles share the room of their actual campaign location. Music changes, victory cues, cutscenes and menu effects do not choose a new room. The title uses Larkspur's open air; isolated battle previews use the canonical room for their battle theme.

`src/content/rooms.ts` assigns every map and every track a room. Open air, timber cabins, wards, courtyards, engine halls, marble halls, caverns and the hollow domain have distinct sizes, return levels and damping. Dry is the comparison option. Changing these authored presets changes future room instances, without changing scores or saves.

The complete music/effects bus passes through the shared compressor **before** entering the dry/room mixer, then reaches master volume. This controls the incoming excitation without compressing the room return: a new loud sound cannot duck an already ringing tail or swell it back as the compressor releases. Each settled room remains a fixed linear time-invariant system. Room crossfades and explicit master fades on pause/volume changes still apply. Each room has six fixed Schroeder diffusion stages per stereo side and a damped return. Each delayed branch also passes through a unity-DC, nonresonant two-pole absorption filter before both the output and feedback. Its two real poles use the profile
cutoff capped at 1.8 kHz; the separate return filter retains the profile
setting. This makes high frequencies lose energy on every reflection rather than circulating at full strength behind the return filter. The lossless all-pass form is recovered when that filter is unity. There are no downloaded impulses, convolution, per-note room effects, delay modulation or changes to 31-EDO pitches. The former music-only convolution is removed.

Changing rooms crossfades the old sends/returns over 280 ms. Feedback gains and delay lengths remain fixed for the life of each graph. At most two rooms coexist; faster requests retain only the latest destination. A silent scheduled source retires the outgoing graph on the audio clock, so suspension cannot run a wall-clock cleanup early. Pause fades the room to Dry under the master mute; resume selects the current map again.

Music workshop → Room starts at the selected track's canonical room. Choose any other room, including Dry, without restarting the cue or changing its bar. A new cue restores Canonical. Single-pitch and circle-of-fifths auditions use the same room effect. These comparisons are session-only and never write campaign or workshop storage.

Validation uses native `OfflineAudioContext` impulse/tone renders at 44.1/48 kHz, stereo tails and decay, rapid transitions, graph retirement, actual campaign entry/battle routing and desktop/phone review controls. Detailed audio/browser checks remain outside the small default CI browser gate.

`tests/e2e/room-mix.spec.ts` initializes the actual production mixer offline and inspects its connections. Incoming music must pass through compression, while both dry and wet room paths must reach master volume without encountering it. This checks all reachable paths through the feedback graph rather than comparing independently constructed native feedback networks sample for sample. Loud boss passages with overlapping combat effects also render through the full mixer to check output headroom.

Large rooms use restrained delay lengths, feedback and return levels to keep held strings and bells from accumulating a long resonance. Regression limits require Captain Alban's canonical Cavern to shed 99.9% of its impulse-tail energy within 1.15 seconds and the longer Hollow domain within 1.9 seconds. `tests/e2e/room-decay.spec.ts` checks normalized tail decay independently of return volume at both device rates, plus the actual Captain Alban phrase after its sources stop. Run it with `npx playwright test room-decay room-reverb` to review decay alongside transition and routing regressions. Scores, instrument releases and tuning are unchanged.

The courtyard used by Letters on the Water has a restrained return (0.1125 after #192, previously 0.09), less feedback (0.46) and a 3.2 kHz return setting. Other room profiles keep their distinct levels and geometry while sharing the stronger reflection absorption. The uniform wet-level increase is described below. `tests/e2e/room-absorption.spec.ts` compares 400 Hz and 4 kHz burst tails at 44.1/48 kHz; it requires audible low-frequency room energy and substantially weaker treble tails. Run `npx playwright test room-absorption room-decay room-reverb` for spectral decay, tail duration, dry reference, transition/cleanup and campaign/workshop routing checks.

Isolated treble needs its own decay check: a broadband impulse or a comparison
with loud bass can hide ringing. `room-absorption.spec.ts` now probes 1.6, 2.5,
4 and 6.5 kHz bursts in the courtyard, hall and domain at both sample rates.
It measures normalized tail duration and late-energy fraction, so reducing
return volume alone cannot pass. A 400 Hz domain reference must retain more
than a second of room tail. In the 48 kHz 4 kHz probe, 99.9% of the remaining
tail clears in about 0.35 seconds after the note, versus about 1.01 seconds
before the stronger absorption. The direct signal, instrument releases,
score and room delay geometry are unchanged; the wet-level adjustment below
only scales these tails.

## Wet-level adjustment (#192)

With compression confined to the room input, the non-dry profiles now return
25% more wet signal (about +1.94 dB). Open air remains subtle; enclosed rooms
retain their relative strengths. Dry gain, delay geometry, feedback, damping
and transition timing are unchanged, so the adjustment increases space without
lengthening or brightening the impulse responses. The Dry reference remains
fully dry. Both campaign and workshop use the same profile values.

## Engine hall resonance

Engine hall uses a shorter room scale (0.8), lower feedback (0.4) and a
3 kHz return cutoff. Its wet level stays at 0.225. This reduces repeated bass
and midrange reflections while retaining an audible early room response.
Relay Hall, the conduit works and Hammerplain use the same profile in the
campaign and Music workshop. Scores, instrument envelopes,
input compression and room crossfades retain their settings. Each settled
room remains linear and time-invariant.

At 48 kHz, the normalized 700 Hz burst tail clears 99.9% of its energy in
about 0.44 seconds, down from 0.74 seconds. The fraction left after half a
second drops from 3.74% to 0.012%; this is a decay-shape change, independent
of return volume. The impulse clears in about 0.54 seconds instead of 0.83.
`room-absorption.spec.ts` now checks isolated 82–1600 Hz notes at 44.1/48 kHz,
requiring an audible return, 99.9% decay within 0.65 seconds and less than
0.5% of the tail energy after half a second. `room-decay.spec.ts` also applies
the 0.65-second limit to Engine hall's broadband impulse. These remain opt-in
audio checks outside the normal CI browser gate.

## Ward adjustment

Ward takes a smaller step: feedback drops from 0.57 to 0.5 and the return
cutoff from 5.2 to 4.2 kHz. Its 0.8 room scale and 0.2125 wet level stay in
place, keeping the infirmary and Windmere dispensary spacious with a softer,
less persistent return. Engine hall keeps its stronger shortening above.
The shared bass/midrange probes now cover Ward too, including a return-energy
limit that catches its former excessive 220 Hz buildup. Its impulse and
isolated-note tails must clear 99.9% of their energy within 0.75 seconds.
