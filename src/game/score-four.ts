import { octave, transpose, pitchSteps, type Pitch } from './tuning';
import type { Note } from './score';
import { phrasing,singing } from './expression';

export type ReturnMode = 'refuge' | 'breakwater' | 'sanctuary' | 'four-battle' | 'four-warden';
type Line = [beat: number, pitch: Pitch, duration: number][];
type Tune = Line[];
type Chord = { root: Pitch; notes: Pitch[] };
const chords = {
  am: { root: 'A2', notes: ['G3', 'B3', 'C4', 'E4'] }, f: { root: 'F2', notes: ['A3', 'C4', 'E4', 'G4'] },
  ce: { root: 'E2', notes: ['G3', 'C4', 'D4', 'G4'] }, g: { root: 'G2', notes: ['F3', 'A3', 'B3', 'D4'] },
  dm: { root: 'D2', notes: ['F3', 'A3', 'C4', 'E4'] }, em: { root: 'E2', notes: ['G3', 'B3', 'D4', 'F#4'] },
  c: { root: 'C2', notes: ['G3', 'B3', 'D4', 'E4'] }, d: { root: 'D2', notes: ['F#3', 'A3', 'C4', 'E4'] },
  fm: { root: 'F2', notes: ['Ab3', 'C4', 'D4', 'F4'] }, e: { root: 'E2', notes: ['G#3', 'B3', 'D4', 'E4'] },
  b: { root: 'B1', notes: ['A3', 'B3', 'D#4', 'F#4'] }, bb: { root: 'Bb1', notes: ['F3', 'A3', 'C4', 'F4'] },
  fa: { root: 'A2', notes: ['F3', 'G3', 'C4', 'E4'] }, cs: { root: 'C2', notes: ['G3', 'C4', 'D4', 'F4'] },
  db: { root: 'Db2', notes: ['F3', 'Ab3', 'C4', 'Eb4'] }, ab: { root: 'C2', notes: ['G3', 'Bb3', 'C4', 'Eb4'] },
  eb: { root: 'Eb2', notes: ['G3', 'Bb3', 'C4', 'F4'] }, gm: { root: 'G2', notes: ['F3', 'A3', 'Bb3', 'D4'] },
} satisfies Record<string, Chord>;
type Harmony = (keyof typeof chords)[];

// A Place to Return: the E–G–A call ends with space for the answer. The third
// phrase opens into F major, then F minor colours the return to the ward.
const homeA: Tune = [
  [[.5,'E5',1],[2,'G5',.5],[3,'A5',.75]], [[0,'G5',1.5],[2,'E5',.75],[3,'D5',.5]],
  [[0,'E5',1.5],[2,'C5',.75],[3,'D5',.5]], [[0,'B4',2],[2.5,'D5',.75]],
  [[.5,'F5',1],[2,'E5',.5],[3,'D5',.75]], [[0,'E5',1.5],[2,'B4',1]],
  [[0,'C5',1],[1.5,'A4',.75],[2.5,'G4',.5]], [[0,'B4',2.25]],
];
const homeAnswer: Tune = [
  [[.5,'E5',1],[2,'G5',.5],[3,'A5',.75]], [[0,'C6',1.5],[2,'A5',.75],[3,'G5',.5]],
  [[0,'G5',1],[1.5,'E5',.5],[2.5,'D5',1]], [[0,'D5',2],[2.5,'B4',.75]],
  [[0,'F5',1.5],[2,'A5',.75]], [[0,'G5',1],[1.5,'E5',.5],[2.5,'B4',.75]],
  [[0,'C5',2],[2.5,'A4',.75]], [[0,'C5',2.5]],
];
const homeBridge: Tune = [
  [[0,'A5',1.5],[2,'C6',1]], [[0,'B5',1.5],[2,'G5',.5],[3,'F#5',.5]],
  [[0,'A5',2],[2.5,'E5',1]], [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D5',.75]],
  [[0,'F5',1.5],[2,'Ab5',1]], [[0,'G5',1.5],[2,'E5',1]],
  [[.5,'F5',1],[2,'D5',1]], [[0,'B4',2],[3,'D5',.5]],
];
const homeReturn: Tune = [
  ...homeA.slice(0,4), [[0,'F5',1.5],[2,'E5',.5],[3,'D5',.5]],
  [[0,'E5',1],[1.5,'D5',.5],[2.5,'B4',.75]], [[0,'C5',1.5],[2,'D5',.75]], [[0,'C5',2.75]],
];
const homeHarmony: Harmony = [
  'am','f','ce','g','dm','em','f','g', 'am','f','ce','g','dm','em','f','c',
  'f','em','am','d','fm','ce','dm','g', 'am','f','ce','g','dm','em','g','c',
];

// Nineteen Out: syncopated, lower piano writing in E Dorian. The bass moves
// towards each new chord; the eight-bar middle drops the drums and opens out.
const worksA: Tune = [
  [[0,'B4',.75],[1,'D5',.5],[2,'E5',.75],[3.25,'D5',.5]], [[.5,'B4',.75],[2,'A4',.5],[3,'F#4',.75]],
  [[0,'G4',1],[1.5,'B4',.5],[2.5,'D5',.75]], [[0,'A4',1.5],[2.5,'F#4',1]],
  [[0,'A4',.75],[1,'C5',.5],[2,'E5',.75],[3.25,'D5',.5]], [[.5,'B4',1],[2,'G4',.5],[3,'E4',.75]],
  [[0,'F#4',1],[1.5,'A4',.5],[2.5,'C5',.75]], [[0,'D#5',1.5],[2.5,'B4',.75]],
];
const worksAnswer: Tune = [
  ...worksA.slice(0,4), [[0,'E5',1],[1.5,'G5',.5],[2.5,'E5',.75]],
  [[0,'D5',1.5],[2,'B4',.5],[3,'G4',.75]], [[0,'A4',1],[1.5,'F#4',.5],[2.5,'D#4',.75]], [[0,'E4',2.5]],
];
const worksBridge: Tune = [
  [[0,'G5',2],[2.5,'E5',.75]], [[0,'F#5',1.5],[2,'D5',1]],
  [[0,'F5',1],[1.5,'E5',.5],[2.5,'C5',1]], [[0,'D5',2.5]],
  [[0,'C5',1.5],[2,'A4',1]], [[.5,'B4',1.5],[2.5,'D5',.75]],
  [[0,'C5',1],[1.5,'A4',.5],[2.5,'F#4',.75]], [[0,'D#5',1.5],[2.5,'B4',.5],[3.25,'D5',.5]],
];
const worksHarmony: Harmony = [
  'em','d','c','d','am','em','d','b', 'em','d','c','d','am','em','b','em',
  'c','d','f','g','am','em','d','b', 'em','d','c','d','am','em','b','em',
];

// Under the Hollow Sun: two-bar calls, whole bars of silence in the lead, and
// a distant F-minor middle. The final D-minor colour reconnects to the first.
const templeA: Tune = [
  [[.5,'A4',1.5],[2.5,'C5',.75]], [], [[1,'A4',1],[2.5,'F4',1]], [],
  [[0,'G4',2],[2.5,'E4',.75]], [[1,'F4',1.5]], [[.5,'D4',2]], [[1,'C4',1.75]],
];
const templeAnswer: Tune = [
  [[.5,'A4',1.5],[2.5,'C5',.75]], [[2,'E5',1.5]], [[0,'F5',2],[2.5,'C5',.75]], [],
  [[.5,'C5',1.5],[2.5,'A4',.75]], [[0,'G4',2]], [[1,'F4',1.5]], [[1,'D4',1.75]],
];
const templeBridge: Tune = [
  [[.5,'Ab4',1.5],[2.5,'C5',.75]], [], [[1,'Ab4',1.5],[3,'F4',.75]], [],
  [[0,'G4',2],[2.5,'Eb4',.75]], [[1,'F4',1.5]], [[.5,'G4',1.5],[2.5,'F4',.75]], [[1,'Eb4',1.75]],
];
const templeReturn: Tune = [
  ...templeA.slice(0,4), [[.5,'C5',1.5],[2.5,'A4',.75]], [[1,'G4',1.5]],
  [[0,'F4',1.5],[2,'E4',.75]], [[0,'D4',2.75]],
];
const templeHarmony: Harmony = [
  'dm','dm','bb','bb','fa','fa','cs','cs', 'dm','dm','bb','bb','fa','fa','cs','cs',
  'fm','fm','db','db','ab','ab','eb','eb', 'dm','dm','bb','bb','fa','cs','gm','dm',
];

// Hold the Line: a short pickup into an A-minor call, not the refuge tune
// played faster. Bass, comping and drums leave room at each phrase boundary.
const fightA: Tune = [
  [[.5,'E5',.5],[1.25,'G5',.5],[2,'A5',1],[3.25,'G5',.5]], [[0,'F5',.75],[1,'E5',.5],[2,'C5',.75],[3,'A4',.5]],
  [[0,'C5',.75],[1,'E5',.5],[2,'G5',.75],[3.25,'E5',.5]], [[0,'D5',1],[1.5,'B4',.5],[2.5,'G4',.75]],
  [[.5,'F5',.5],[1.25,'A5',.5],[2,'C6',1],[3.25,'A5',.5]], [[0,'G5',.75],[1,'E5',.5],[2,'B4',.75],[3,'G4',.5]],
  [[0,'E5',1],[1.5,'D5',.5],[2.5,'C5',.75]], [[0,'B4',1],[1.5,'G#4',.5],[2.5,'B4',.75]],
];
const fightAnswer: Tune = [
  ...fightA.slice(0,4), [[0,'A5',.75],[1,'C6',.5],[2,'D6',.75],[3.25,'C6',.5]],
  [[0,'B5',1],[1.5,'G5',.5],[2.5,'E5',.75]], [[0,'G#5',1],[1.5,'F5',.5],[2.5,'D5',.75]], [[0,'A5',2.5]],
];
const fightBridge: Tune = [
  [[0,'C6',1.5],[2,'A5',1]], [[0,'B5',1],[1.5,'G5',.5],[2.5,'E5',.75]],
  [[0,'A5',1.5],[2,'G5',1]], [[0,'F#5',1],[1.5,'E5',.5],[2.5,'D5',.75]],
  [[0,'G#5',1.5],[2,'F5',1]], [[0,'G5',1],[1.5,'E5',.5],[2.5,'C5',.75]],
  [[0,'F5',.75],[1,'E5',.5],[2,'D5',.75],[3,'C5',.5]], [[0,'B4',1],[1.5,'G#4',.5],[3,'B4',.5]],
];
const fightReturn: Tune = [
  ...fightA.slice(0,6), [[0,'F5',.75],[1,'E5',.5],[2,'D5',.75]], [[0,'B4',1],[1.5,'G#4',.5],[3.5,'D5',.25]],
];
const fightHarmony: Harmony = [
  'am','f','c','g','dm','em','f','e', 'am','f','c','g','dm','em','e','am',
  'f','em','am','d','fm','c','dm','e', 'am','f','c','g','dm','em','dm','e',
];

// The Emperor's Order: the sanctuary call becomes a forceful D-minor theme.
// Its borrowed F-minor middle has its own contour and slower half-time beat.
const wardenA: Tune = [
  [[0,'A4',1],[1.5,'C5',.5],[2.5,'D5',1]], [[.5,'C5',.75],[1.5,'A4',.5],[2.5,'F4',.75]],
  [[0,'A4',1],[1.5,'C5',.5],[2.5,'F5',1]], [[0,'E5',1.5],[2,'C5',1]],
  [[.5,'D5',.75],[1.5,'F5',.5],[2.5,'A5',1]], [[0,'G5',1],[1.5,'F5',.5],[2.5,'D5',.75]],
  [[0,'E5',1],[1.5,'C5',.5],[2.5,'G4',.75]], [[0,'A4',1.5],[2,'G#4',.5],[3,'A4',.75]],
];
const wardenAnswer: Tune = [
  [[0,'F5',1],[1.5,'A5',.5],[2.5,'D6',1]], [[.5,'A5',.75],[1.5,'F5',.5],[2.5,'D5',.75]],
  [[0,'A5',1],[1.5,'C6',.5],[2.5,'G5',1]], [[0,'G5',1.5],[2,'F5',1]],
  [[.5,'F5',.75],[1.5,'A5',.5],[2.5,'Bb5',1]], [[0,'A5',1],[1.5,'F5',.5],[2.5,'D5',.75]],
  [[0,'E5',1],[1.5,'C5',.5],[2.5,'A4',.75]], [[0,'F5',1.5],[2,'D5',.5],[3,'A4',.75]],
];
const wardenBridge: Tune = [
  [[0,'F5',1.5],[2,'Ab5',1]], [[0,'F5',1],[1.5,'Eb5',.5],[2.5,'C5',.75]],
  [[0,'F5',1.5],[2,'Ab5',1]], [[0,'G5',1.5],[2,'Eb5',1]],
  [[0,'F5',1],[1.5,'Eb5',.5],[2.5,'C5',.75]], [[0,'Eb5',1.5],[2,'C5',1]],
  [[0,'D5',1],[1.5,'B4',.5],[2.5,'G#4',.75]], [[0,'C#5',2],[3,'E5',.5]],
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
// The first return is tentative; the high answer opens up, the borrowed-minor
// middle subsides, and the last sentence comes home more quietly.
const homeDynamics=[.72,.8,.75,.64,.78,.83,.73,.61,.84,.99,.9,.74,.93,.85,.78,.65,.98,1.04,.93,.8,.86,.76,.69,.62,.76,.82,.74,.63,.79,.73,.68,.56];

/** Thirty-two bars, with an opening, answer, contrasting middle and return. */
export function returnBar(mode: ReturnMode, bar: number): Note[] {
  const i = ((bar % 32) + 32) % 32, phrase = Math.floor(i / 8), end = i % 8 === 7;
  const { root, notes: chord } = chords[harmonies[mode][i]], out: Note[] = [];
  const home = mode === 'refuge', works = mode === 'breakwater', sacred = mode === 'sanctuary';
  const boss = mode === 'four-warden', combat = mode === 'four-battle' || boss, middle = phrase === 2;
  const add = (instrument: Note['instrument'], pitch: Pitch, beat: number, duration: number, velocity: number, pan = 0) => {const note:Note={instrument,pitch,beat,duration,velocity,pan};if(home)note.expression=phrasing(homeDynamics[i],instrument==='strings');out.push(note);return note;};
  const lead = sacred ? 'bell' : works ? 'keys' : 'reed';
  const gain = sacred ? .12 : works ? .23 : combat ? .24 : .2;
  // One held roll per four-bar sentence, before its first delayed bell.
  const rollBeat=sacred&&i%4===0?tunes[mode][i].find(([beat])=>beat>=.5)?.[0]:undefined;
  for (const [n, [beat, pitch, duration]] of tunes[mode][i].entries()) {
    const voice=add(lead, pitch, beat, duration, gain * (middle ? 1.04 : end ? .85 : 1) * (n === 0 ? 1 : .91), -.12);
    if(home)voice.expression=singing('warm',homeDynamics[i]*(1-n*.06),duration,end);
    if(sacred){
      voice.expression={release:1.9};
      if(beat===rollBeat)for(const [n,p]of chord.entries()){
        if(tunes[mode][i].some(([,melody])=>pitchSteps(melody)===pitchSteps(p)))continue;
        const onset=beat-.375+n/8;
        add('bell',p,onset,3.5-onset,.045+n*.005,.16+n*.08).expression={release:1.9};
      }
    }
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
    if (!end) add('bass', transpose(root,'P5'), 3, .65, .08);
  } else {
    const pattern: [number, number, number][] = end ? [[0, 0, 1.2], [2, 7, .65]]
      : boss && middle ? [[0, 0, 1.5], [2, 7, 1.4]]
      : works ? [[0, 0, .8], [1.5, 7, .4], [2.5, 0, .6], [3.5, 7, .35]]
      : [[0, 0, .6], [.75, 0, .4], [1.5, 7, .4], [2.5, 0, .6], [3.5, 7, .35]];
    for (const [beat, interval, duration] of pattern) add('bass', transpose(root,interval?'P5':'P1'), beat, duration, combat ? .17 : .12);
    if (!end && i % 4 === 2) {
      const next = chords[harmonies[mode][i + 1]].root;
      add('bass', transpose(next,pitchSteps(next)>pitchSteps(root)?'-m2':'m2'), 3.875, .1, .075);
    }
  }
  // Occasional replies occupy a rest in the tune, rather than shadowing it.
  if (home && [7, 15, 23].includes(i)) {
    add('keys', octave(chord[1],1), 2.75, .45, .075, .32);
    add('keys', octave(chord[2],1), 3.5, .35, .06, .32);
  }
  if (home) return out;
  if (works && middle) return out;
  const drum = combat ? .12 : .042, halfTime = boss && middle;
  add('kick', 'C2', 0, .15, drum);
  if (!end) add('kick', 'C2', halfTime ? 2.75 : 2.5, .13, drum * .7);
  if (combat && !end && i % 4 === 1) add('kick', 'C2', 3.25, .12, drum * .55);
  for (const beat of halfTime ? [2] : [1, 3]) if (!(end && beat === 3)) add('snare', 'D2', beat, .13, drum * .6, -.17);
  for (const beat of end ? [.5, 1.5] : halfTime ? [.5, 1.5, 2.5, 3.5] : [0, .5, 1, 1.5, 2, 2.5, 3, 3.5]) {
    add('hat', 'F#2', beat, .07, drum * (beat % 1 ? .16 : .1), .4);
  }
  if (combat && [6, 22, 30].includes(i)) for (const [n, beat] of [3.25, 3.5, 3.75].entries()) {
    add('snare', 'D2', beat, .09, drum * (.22 + n * .09), -.17);
  }
  return out;
}
