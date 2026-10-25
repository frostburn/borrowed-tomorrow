# Map rooms

Issue #88: exploration and battles share the room of their actual campaign location. Music changes, victory cues, cutscenes and menu effects do not choose a new room. The title uses Larkspur's open air; isolated battle previews use the canonical room for their battle theme.

`src/content/rooms.ts` assigns every map and every track a room. Open air, timber cabins, wards, courtyards, engine halls, marble halls, caverns and the hollow domain have distinct sizes, return levels and damping. Dry is the comparison option. Changing these authored presets changes future room instances, without changing scores or saves.

The complete music/effects bus enters one shared dry/room mixer before the compressor and master volume. Each room has six fixed Schroeder all-pass stages per stereo side and a damped return. There are no downloaded impulses, convolution, per-note room effects, delay modulation or changes to 31-EDO pitches. The former music-only convolution is removed.

Changing rooms crossfades the old sends/returns over 280 ms. Feedback gains and delay lengths remain fixed for the life of each graph. At most two rooms coexist; faster requests retain only the latest destination. A silent scheduled source retires the outgoing graph on the audio clock, so suspension cannot run a wall-clock cleanup early. Pause fades the room to Dry under the master mute; resume selects the current map again.

Music workshop → Room starts at the selected track's canonical room. Choose any other room, including Dry, without restarting the cue or changing its bar. A new cue restores Canonical. Single-pitch and circle-of-fifths auditions use the same room effect. These comparisons are session-only and never write campaign or workshop storage.

Validation uses native `OfflineAudioContext` impulse/tone renders at 44.1/48 kHz, stereo tails and decay, rapid transitions, graph retirement, actual campaign entry/battle routing and desktop/phone review controls. Detailed audio/browser checks remain outside the small default CI browser gate.
