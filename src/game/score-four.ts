import type { Note } from './score';

export type ReturnMode = 'refuge' | 'breakwater' | 'sanctuary' | 'four-battle' | 'four-warden';
type Line = [beat: number, midi: number, duration: number][];
type Tune = Line[];
type Chord = { root: number; notes: number[] };
const chords = {
  am: { root: 45, notes: [55, 59, 60, 64] }, f: { root: 41, notes: [57, 60, 64, 67] },
  ce: { root: 40, notes: [55, 60, 62, 67] }, g: { root: 43, notes: [53, 57, 59, 62] },
  dm: { root: 38, notes: [53, 57, 60, 64] }, em: { root: 40, notes: [55, 59, 62, 66] },
  c: { root: 36, notes: [55, 59, 62, 64] }, d: { root: 38, notes: [54, 57, 60, 64] },
  fm: { root: 41, notes: [56, 60, 62, 65] }, e: { root: 40, notes: [56, 59, 62, 64] },
  b: { root: 35, notes: [57, 59, 63, 66] }, bb: { root: 34, notes: [53, 57, 60, 65] },
  fa: { root: 45, notes: [53, 55, 60, 64] }, cs: { root: 36, notes: [55, 60, 62, 65] },
  db: { root: 37, notes: [53, 56, 60, 63] }, ab: { root: 36, notes: [55, 58, 60, 63] },
  eb: { root: 39, notes: [55, 58, 60, 65] }, gm: { root: 43, notes: [53, 57, 58, 62] },
} satisfies Record<string, Chord>;
type Harmony = (keyof typeof chords)[];

// A Place to Return: the E–G–A call ends with space for the answer. The third
// phrase opens into F major, then F minor colours the return to the ward.
const homeA: Tune = [
  [[.5,76,1],[2,79,.5],[3,81,.75]], [[0,79,1.5],[2,76,.75],[3,74,.5]],
  [[0,76,1.5],[2,72,.75],[3,74,.5]], [[0,71,2],[2.5,74,.75]],
  [[.5,77,1],[2,76,.5],[3,74,.75]], [[0,76,1.5],[2,71,1]],
  [[0,72,1],[1.5,69,.75],[2.5,67,.5]], [[0,71,2.25]],
];
const homeAnswer: Tune = [
  [[.5,76,1],[2,79,.5],[3,81,.75]], [[0,84,1.5],[2,81,.75],[3,79,.5]],
  [[0,79,1],[1.5,76,.5],[2.5,74,1]], [[0,74,2],[2.5,71,.75]],
  [[0,77,1.5],[2,81,.75]], [[0,79,1],[1.5,76,.5],[2.5,71,.75]],
  [[0,72,2],[2.5,69,.75]], [[0,72,2.5]],
];
const homeBridge: Tune = [
  [[0,81,1.5],[2,84,1]], [[0,83,1.5],[2,79,.5],[3,78,.5]],
  [[0,81,2],[2.5,76,1]], [[0,78,1],[1.5,76,.5],[2.5,74,.75]],
  [[0,77,1.5],[2,80,1]], [[0,79,1.5],[2,76,1]],
  [[.5,77,1],[2,74,1]], [[0,71,2],[3,74,.5]],
];
const homeReturn: Tune = [
  ...homeA.slice(0,4), [[0,77,1.5],[2,76,.5],[3,74,.5]],
  [[0,76,1],[1.5,74,.5],[2.5,71,.75]], [[0,72,1.5],[2,74,.75]], [[0,72,2.75]],
];
const homeHarmony: Harmony = [
  'am','f','ce','g','dm','em','f','g', 'am','f','ce','g','dm','em','f','c',
  'f','em','am','d','fm','ce','dm','g', 'am','f','ce','g','dm','em','g','c',
];

// Nineteen Out: syncopated, lower piano writing in E Dorian. The bass moves
// towards each new chord; the eight-bar middle drops the drums and opens out.
const worksA: Tune = [
  [[0,71,.75],[1,74,.5],[2,76,.75],[3.25,74,.5]], [[.5,71,.75],[2,69,.5],[3,66,.75]],
  [[0,67,1],[1.5,71,.5],[2.5,74,.75]], [[0,69,1.5],[2.5,66,1]],
  [[0,69,.75],[1,72,.5],[2,76,.75],[3.25,74,.5]], [[.5,71,1],[2,67,.5],[3,64,.75]],
  [[0,66,1],[1.5,69,.5],[2.5,72,.75]], [[0,75,1.5],[2.5,71,.75]],
];
const worksAnswer: Tune = [
  ...worksA.slice(0,4), [[0,76,1],[1.5,79,.5],[2.5,76,.75]],
  [[0,74,1.5],[2,71,.5],[3,67,.75]], [[0,69,1],[1.5,66,.5],[2.5,63,.75]], [[0,64,2.5]],
];
const worksBridge: Tune = [
  [[0,79,2],[2.5,76,.75]], [[0,78,1.5],[2,74,1]],
  [[0,77,1],[1.5,76,.5],[2.5,72,1]], [[0,74,2.5]],
  [[0,72,1.5],[2,69,1]], [[.5,71,1.5],[2.5,74,.75]],
  [[0,72,1],[1.5,69,.5],[2.5,66,.75]], [[0,75,1.5],[2.5,71,.5],[3.25,74,.5]],
];
const worksHarmony: Harmony = [
  'em','d','c','d','am','em','d','b', 'em','d','c','d','am','em','b','em',
  'c','d','f','g','am','em','d','b', 'em','d','c','d','am','em','b','em',
];

// Under the Hollow Sun: two-bar calls, whole bars of silence in the lead, and
// a distant F-minor middle. The final D-minor colour reconnects to the first.
const templeA: Tune = [
  [[.5,69,1.5],[2.5,72,.75]], [], [[1,69,1],[2.5,65,1]], [],
  [[0,67,2],[2.5,64,.75]], [[1,65,1.5]], [[.5,62,2]], [[1,60,1.75]],
];
const templeAnswer: Tune = [
  [[.5,69,1.5],[2.5,72,.75]], [[2,76,1.5]], [[0,77,2],[2.5,72,.75]], [],
  [[.5,72,1.5],[2.5,69,.75]], [[0,67,2]], [[1,65,1.5]], [[1,62,1.75]],
];
const templeBridge: Tune = [
  [[.5,68,1.5],[2.5,72,.75]], [], [[1,68,1.5],[3,65,.75]], [],
  [[0,67,2],[2.5,63,.75]], [[1,65,1.5]], [[.5,67,1.5],[2.5,65,.75]], [[1,63,1.75]],
];
const templeReturn: Tune = [
  ...templeA.slice(0,4), [[.5,72,1.5],[2.5,69,.75]], [[1,67,1.5]],
  [[0,65,1.5],[2,64,.75]], [[0,62,2.75]],
];
const templeHarmony: Harmony = [
  'dm','dm','bb','bb','fa','fa','cs','cs', 'dm','dm','bb','bb','fa','fa','cs','cs',
  'fm','fm','db','db','ab','ab','eb','eb', 'dm','dm','bb','bb','fa','cs','gm','dm',
];

// Hold the Line: a short pickup into an A-minor call, not the refuge tune
// played faster. Bass, comping and drums leave room at each phrase boundary.
const fightA: Tune = [
  [[.5,76,.5],[1.25,79,.5],[2,81,1],[3.25,79,.5]], [[0,77,.75],[1,76,.5],[2,72,.75],[3,69,.5]],
  [[0,72,.75],[1,76,.5],[2,79,.75],[3.25,76,.5]], [[0,74,1],[1.5,71,.5],[2.5,67,.75]],
  [[.5,77,.5],[1.25,81,.5],[2,84,1],[3.25,81,.5]], [[0,79,.75],[1,76,.5],[2,71,.75],[3,67,.5]],
  [[0,76,1],[1.5,74,.5],[2.5,72,.75]], [[0,71,1],[1.5,68,.5],[2.5,71,.75]],
];
const fightAnswer: Tune = [
  ...fightA.slice(0,4), [[0,81,.75],[1,84,.5],[2,86,.75],[3.25,84,.5]],
  [[0,83,1],[1.5,79,.5],[2.5,76,.75]], [[0,80,1],[1.5,77,.5],[2.5,74,.75]], [[0,81,2.5]],
];
const fightBridge: Tune = [
  [[0,84,1.5],[2,81,1]], [[0,83,1],[1.5,79,.5],[2.5,76,.75]],
  [[0,81,1.5],[2,79,1]], [[0,78,1],[1.5,76,.5],[2.5,74,.75]],
  [[0,80,1.5],[2,77,1]], [[0,79,1],[1.5,76,.5],[2.5,72,.75]],
  [[0,77,.75],[1,76,.5],[2,74,.75],[3,72,.5]], [[0,71,1],[1.5,68,.5],[3,71,.5]],
];
const fightReturn: Tune = [
  ...fightA.slice(0,6), [[0,77,.75],[1,76,.5],[2,74,.75]], [[0,71,1],[1.5,68,.5],[3.5,74,.25]],
];
const fightHarmony: Harmony = [
  'am','f','c','g','dm','em','f','e', 'am','f','c','g','dm','em','e','am',
  'f','em','am','d','fm','c','dm','e', 'am','f','c','g','dm','em','dm','e',
];

// The Emperor's Order: the sanctuary call becomes a forceful D-minor theme.
// Its borrowed F-minor middle has its own contour and slower half-time beat.
const wardenA: Tune = [
  [[0,69,1],[1.5,72,.5],[2.5,74,1]], [[.5,72,.75],[1.5,69,.5],[2.5,65,.75]],
  [[0,69,1],[1.5,72,.5],[2.5,77,1]], [[0,76,1.5],[2,72,1]],
  [[.5,74,.75],[1.5,77,.5],[2.5,81,1]], [[0,79,1],[1.5,77,.5],[2.5,74,.75]],
  [[0,76,1],[1.5,72,.5],[2.5,67,.75]], [[0,69,1.5],[2,68,.5],[3,69,.75]],
];
const wardenAnswer: Tune = [
  [[0,77,1],[1.5,81,.5],[2.5,86,1]], [[.5,81,.75],[1.5,77,.5],[2.5,74,.75]],
  [[0,81,1],[1.5,84,.5],[2.5,79,1]], [[0,79,1.5],[2,77,1]],
  [[.5,77,.75],[1.5,81,.5],[2.5,82,1]], [[0,81,1],[1.5,77,.5],[2.5,74,.75]],
  [[0,76,1],[1.5,72,.5],[2.5,69,.75]], [[0,77,1.5],[2,74,.5],[3,69,.75]],
];
const wardenBridge: Tune = [
  [[0,77,1.5],[2,80,1]], [[0,77,1],[1.5,75,.5],[2.5,72,.75]],
  [[0,77,1.5],[2,80,1]], [[0,79,1.5],[2,75,1]],
  [[0,77,1],[1.5,75,.5],[2.5,72,.75]], [[0,75,1.5],[2,72,1]],
  [[0,74,1],[1.5,71,.5],[2.5,68,.75]], [[0,73,2],[3,76,.5]],
];
const wardenHarmony: Harmony = [
  'dm','bb','fa','cs','gm','bb','cs','am', 'dm','bb','fa','cs','gm','bb','am','dm',
  'fm','db','fm','ab','db','ab','e','e', 'dm','bb','fa','cs','gm','bb','e','am',
];
const tunes: Record<ReturnMode, Tune> = {
  refuge: [...homeA, ...homeAnswer, ...homeBridge, ...homeReturn],
  breakwater: [...worksA, ...worksAnswer, ...worksBridge, ...worksAnswer],
  sanctuary: [...templeA, ...templeAnswer, ...templeBridge, ...templeReturn],
  'four-battle': [...fightA, ...fightAnswer, ...fightBridge, ...fightReturn],
  'four-warden': [...wardenA, ...wardenAnswer, ...wardenBridge, ...wardenA],
};
const harmonies = { refuge: homeHarmony, breakwater: worksHarmony, sanctuary: templeHarmony, 'four-battle': fightHarmony, 'four-warden': wardenHarmony };

/** Thirty-two bars, with an opening, answer, contrasting middle and return. */
export function returnBar(mode: ReturnMode, bar: number): Note[] {
  const i = ((bar % 32) + 32) % 32, phrase = Math.floor(i / 8), end = i % 8 === 7;
  const { root, notes: chord } = chords[harmonies[mode][i]], out: Note[] = [];
  const home = mode === 'refuge', works = mode === 'breakwater', sacred = mode === 'sanctuary';
  const boss = mode === 'four-warden', combat = mode === 'four-battle' || boss, middle = phrase === 2;
  const add = (instrument: Note['instrument'], midi: number, beat: number, duration: number, velocity: number, pan = 0) => out.push({ instrument, midi, beat, duration, velocity, pan });
  const lead = sacred ? 'bell' : works ? 'keys' : 'reed';
  const gain = sacred ? .12 : works ? .23 : combat ? .24 : .2;
  for (const [n, [beat, pitch, duration]] of tunes[mode][i].entries()) {
    add(lead, pitch, beat, duration, gain * (middle ? 1.04 : end ? .85 : 1) * (n === 0 ? 1 : .91), -.12);
  }
  if (sacred) {
    // Pedal changes last two bars; no re-struck pad on the intervening bar.
    if (i % 2 === 0 || i >= 29) {
      const hold = i < 31 && harmonies[mode][i] === harmonies[mode][i + 1] ? 7.3 : 3.3;
      add('bass', root, 0, hold, .1);
      for (const [n, pitch] of chord.entries()) add('strings', pitch, .08, hold, .023, n % 2 ? .35 : -.35);
    }
    if (!tunes[mode][i].length) {
      add('keys', chord[0], 1.5, 1.4, .06, .28);
      if (phrase === 1) add('keys', chord[2], 3, .7, .045, .28);
    }
    return out;
  }
  // Chords breathe at phrase endings; full pads enter only at the lifted middle.
  const hits = home ? end ? [0] : [0, 2.5] : combat ? end ? [0, 1.5] : [0, 1.5, 3] : middle ? [0] : end ? [0, 2] : [.5, 2.5];
  for (const [h, beat] of hits.entries()) for (const pitch of chord.slice(0, middle || boss ? 4 : 3)) {
    add('keys', pitch, beat, home ? 1.35 : middle && works ? 2.5 : .42, (home ? .042 : combat ? .05 : .036) * (h ? .72 : 1), .3);
  }
  if (middle || (boss && phrase !== 0)) for (const [n, pitch] of chord.entries()) {
    add('strings', pitch, 0, end ? 2.4 : 3.6, boss ? .022 : .017, n % 2 ? .4 : -.4);
  }
  if (home || (works && middle)) {
    add('bass', root, 0, end ? 3.3 : 2.5, .13);
    if (!end) add('bass', root + 7, 3, .65, .08);
  } else {
    const pattern: [number, number, number][] = end ? [[0, 0, 1.2], [2, 7, .65]]
      : boss && middle ? [[0, 0, 1.5], [2, 7, 1.4]]
      : works ? [[0, 0, .8], [1.5, 7, .4], [2.5, 0, .6], [3.5, 7, .35]]
      : [[0, 0, .6], [.75, 0, .4], [1.5, 7, .4], [2.5, 0, .6], [3.5, 7, .35]];
    for (const [beat, interval, duration] of pattern) add('bass', root + interval, beat, duration, combat ? .17 : .12);
    if (!end && i % 4 === 2) {
      const next = chords[harmonies[mode][i + 1]].root;
      add('bass', next + (next > root ? -1 : 1), 3.875, .1, .075);
    }
  }
  // Occasional replies occupy a rest in the tune, rather than shadowing it.
  if (home && [7, 15, 23].includes(i)) {
    add('keys', chord[1] + 12, 2.75, .45, .075, .32);
    add('keys', chord[2] + 12, 3.5, .35, .06, .32);
  }
  if (home) return out;
  if (works && middle) return out;
  const drum = combat ? .12 : .042, halfTime = boss && middle;
  add('kick', 36, 0, .15, drum);
  if (!end) add('kick', 36, halfTime ? 2.75 : 2.5, .13, drum * .7);
  if (combat && !end && i % 4 === 1) add('kick', 36, 3.25, .12, drum * .55);
  for (const beat of halfTime ? [2] : [1, 3]) if (!(end && beat === 3)) add('snare', 38, beat, .13, drum * .6, -.17);
  for (const beat of end ? [.5, 1.5] : halfTime ? [.5, 1.5, 2.5, 3.5] : [0, .5, 1, 1.5, 2, 2.5, 3, 3.5]) {
    add('hat', 42, beat, .07, drum * (beat % 1 ? .16 : .1), .4);
  }
  if (combat && [6, 22, 30].includes(i)) for (const [n, beat] of [3.25, 3.5, 3.75].entries()) {
    add('snare', 38, beat, .09, drum * (.22 + n * .09), -.17);
  }
  return out;
}
