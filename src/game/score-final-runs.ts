import type {Instrument,Note} from './score';
import type {Pitch} from './tuning';
import {phrasing} from './expression';

type PhraseNote=readonly [beat:number,pitch:Pitch,hold:number];
interface Phrase {bar:number;notes:readonly PhraseNote[]}
const phrase=(bar:number,...notes:PhraseNote[]):Phrase=>({bar,notes});
// Short, shaped answers in each form's existing octatonic. Silence separates
// the gestures; no exhaustive chromatic scales or constant-rate octave sweeps.
const mantle:readonly Phrase[]=[
 phrase(3, [1,'C5',.75],[2.25,'A#4',.5],[3,'G4',.75]),
 phrase(7, [1,'E5',.75],[2.25,'C5',.5],[3,'B4',.75]),
 phrase(11,[2,'B4',.5],[3,'A#4',.75]),
 phrase(19,[1,'Ad4',.75],[2.5,'G4',.375],[3.25,'B4',.5]),
 phrase(27,[2.5,'A#4',.5],[3.25,'Ad4',.5]),
 phrase(31,[1,'G4',.75],[2.25,'Ft4',.5],[3,'D4',.75]),
];
const sun:readonly Phrase[]=[
 phrase(3, [3,'Ed5',.5],[4,'Db5',.375],[4.5,'A#t4',.375]),
 phrase(7, [2,'Ab4',.75],[3,'A#t4',.5],[4,'Gd4',.75]),
 phrase(11,[3,'Db5',.625],[4,'Ab4',.375],[4.5,'F4',.375]),
 phrase(15,[2,'Dt5',.75],[3.5,'Ab4',.5],[4.5,'A#t4',.375]),
 phrase(23,[3,'F5',.5],[4,'Db5',.25],[4.5,'A#t4',.375]),
 phrase(31,[2,'C5',.75],[3.5,'F4',.5],[4.5,'Gd4',.375]),
];
const heart:readonly Phrase[]=[
 phrase(3, [1,'A#4',.5],[2,'G4',.75],[3,'Ad4',.75]),
 phrase(7, [2.5,'D5',.375],[3,'C5',.375],[3.5,'A#4',.375]),
 phrase(11,[2,'E5',.5],[2.75,'B4',.5],[3.5,'A#4',.375]),
 // Leave space before the original high C5 and the quieter string sentence.
 phrase(15,[1,'Ad4',.75],[3,'B4',.75]),
 phrase(19,[1,'B4',.75],[2.5,'G4',.375],[3,'C5',.75]),
 phrase(23,[1,'E5',.5],[2,'D5',.5],[3,'A#4',.75]),
 phrase(27,[2.5,'G4',.375],[3.25,'A#4',.5]),
 phrase(31,[1,'C5',.75],[2.5,'Ad4',.375],[3.25,'Ft4',.5]),
];
const plan=(mode:string):readonly Phrase[]=>mode==='benefactor'?mantle:mode==='hollow-sun'?sun:mode==='unborrowed'?heart:[];
const beats=(mode:string)=>mode==='hollow-sun'?5:4;
/** Hand the lead to the whole answer, including its rests. Truncate held
 * arrivals from the previous bar so the voices never talk over each other. */
export function finalLeadHold(mode:string,bar:number,beat:number,hold:number):number{
 const start=bar*beats(mode)+beat;
 for(const p of plan(mode)){
  const last=p.notes.at(-1)!,at=p.bar*beats(mode)+p.notes[0][0],end=p.bar*beats(mode)+last[0]+last[2];
  if(start>=at&&start<end)return 0;
  if(start<at&&start+hold>at)hold=at-start;
 }
 return hold;
}
export function finalPhraseNotes(mode:string,bar:number,gain:number,strength:number):Note[]{
 const instrument:Instrument=mode==='benefactor'?'tritaver':mode==='hollow-sun'?'organ':'keys';
 return plan(mode).filter(p=>p.bar===bar).flatMap(p=>p.notes.map(([beat,pitch,duration],j)=>({
  instrument,pitch,beat,duration,velocity:gain*.88,pan:-.12,
  expression:{...phrasing(strength*(j===0?1:j===p.notes.length-1?.9:.75)),release:mode==='unborrowed'?.06:.08},
 })));
}
