# Map rooms

Exploration and battles share the room of their actual campaign location.
Music, victory cues, cutscenes and menu effects do not choose a new room.
`src/content/rooms.ts` assigns every map and track a room; both the campaign
and Music workshop use those profiles. Dry remains the comparison option.

## Sparse retro network

The room implementation is rebuilt around two short fixed all-pass diffusers
per stereo side: four delay lines total, down from twelve. The base delays are
29.7 and 43.7 ms, scaled by room size; the right side offsets them by 7.1% and
8% for stereo spread. This deliberately sparse response gives short, audible
reflections rather than a dense modern wash. Each stage has one gentle damping
pole inside its delayed branch, including feedback:

`L(z) = (1-p)/(1-p z^-1)`, with `p = exp(-2*pi*damping/sampleRate)`.

`H(z) = (L(z) z^-m - g)/(1-g L(z) z^-m)`.

The loss has unity DC gain and never boosts a frequency. With unity loss the
stage is all-pass. High damping settings (8–12 kHz) gently absorb repeated
reflections; there is no cutoff cap, second absorption pole, extra return EQ,
resonant biquad, convolution, modulation or downloaded impulse. The cutoff
parameter describes the exponential pole, not an exact digital −3 dB frequency.
Mixing the phase-shifted wet return with dry audio still creates comb filtering.

All profiles have been authored for this smaller network:

| Room | Size | Feedback | Wet | Damping pole (Hz) |
| --- | ---: | ---: | ---: | ---: |
| Open air | 0.35 | 0.25 | 0.075 | 12000 |
| Timber cabin | 0.5 | 0.4 | 0.21 | 8000 |
| Ward | 0.7 | 0.42 | 0.225 | 10000 |
| Stone courtyard | 0.9 | 0.4 | 0.15 | 12000 |
| Engine hall | 0.65 | 0.35 | 0.255 | 9000 |
| Marble hall | 1.25 | 0.55 | 0.285 | 12000 |
| Cavern | 1.35 | 0.5 | 0.255 | 8000 |
| Hollow domain | 1.4 | 0.52 | 0.3 | 10000 |

After listening review, Hollow Domain returns 0.30 wet. All other non-dry
levels are scaled proportionally, preserving the relative room balance. This
is 20% above the preceding 0.25 Domain setting. Dry stays at zero wet.

Size and feedback control decay directly. Wet gain only sets return volume;
lowering it does not count as fixing a lingering tail. This design replaces
the former six-stage presets and their successive absorption/level adjustments.
It is an independent alternative to the Domain-only retune in PR #258.

The complete music/effects bus passes through compression before the unity
dry/room mixer, then master volume. Existing tails cannot be ducked or swelled
by subsequent input compression. Scores, instrument envelopes, tuning, location
routing and save data retain their behavior. Each settled room is linear and
time-invariant. The 280 ms send/return crossfade keeps at most two rooms
(eight delay lines) alive; rapid requests queue only the latest destination.
Cleanup runs on the audio clock, including across suspension. Pause fades to
Dry under the master mute and resume selects the map again.

Music workshop → Room supports Canonical, overrides and Dry without restarting
the score or moving its bar. A new cue restores Canonical. Single-pitch and
circle-of-fifths auditions use the same effect. Review settings are session-only.

## Validation

`python3 scripts/analyze-rooms.py --output /tmp/retro-rooms.json` audits actual
production profiles, delays and one-pole coefficients with NumPy/SciPy. It models
fractional-delay linear interpolation at 44.1/48 kHz. Sixth-octave power averages
show less than 0.6 dB of 200 Hz–2 kHz tilt for every profile. Isolated 82–6500 Hz
200 ms tones (10 ms ramps) clear 99.9% of each channel's remaining tail in at
most 0.47 seconds; Domain is longest. Tail energy is normalized from 20 ms
after note end. These are analytical results, not native recordings or listening
approval. The optional script adds no runtime or CI dependencies.

Unit tests check passive one-pole coefficients, the four-delay graph, direct dry
routing and cleanup. Detailed native `OfflineAudioContext` tests check finite
stereo tails, normalized tone decay, midrange audibility/tilt, full-mixer headroom,
rapid transitions, actual campaign routing and desktop/phone review controls:

`npx playwright test room-absorption room-decay room-reverb room-mix`

Tone checks require an audible return, 99.9% decay within 0.65 seconds and less
than 1% of tail energy after half a second, per channel. Midrange band tilt must
stay below 3 dB. The former requirements for heavily suppressed treble and a
long Domain bass tail no longer describe this design. Detailed audio/browser
checks remain outside the small default `@ci` gate.

## Output level (#263)

The shared output now has 1.5× makeup gain (+3.52 dB) after the room and before
master volume. Music input stays 0.52, effects 0.58, and compressor settings,
room feedback/wet levels and cinematic ducking retain their values. Master
volume still ranges from zero to one and pause/mute still reaches silence.

A 48 kHz audit rendered the production compressed dry bus in Node Web Audio,
then applied the production room coefficients with fractional-delay linear
interpolation. Seven passages covered station, flagship, Emperor, furnace and
all three final forms, including overlapping burst/steam/strike/judgment effects.
The busiest modeled return peaked at 0.620 before makeup and 0.929 after it at
100% master, or 0.697 at the default 75%. This is an analytical room estimate,
not a native-browser full-mixer measurement. The opt-in full-mixer browser test
now checks 100% master; output routing and mute also have unit coverage.
