import type {Instrument,Note} from './score';
import type {Pitch} from './tuning';
import {phrasing,singing} from './expression';

// The accepted Two Seals at the Gate arrangement is independent of Namar's
// regional rewrite. Keep its notes, voices, dynamics and shared rubato intact.
type Phrase=readonly (readonly [number,Pitch,number])[];
const melody:readonly Phrase[]=[
    [[0,'G3',3]], [[.5,'Ed3',1.5],[2.5,'D3',1]],
    [[0,'C3',4.5]], [],
    [[.5,'F3',2],[3,'Ad3',.75]], [[0,'G3',2.5]],
    [[0,'Ft3',1.5],[2,'D3',1]], [],
    [[0,'E4',2.5]], [[.5,'Ct4',1.5],[2.5,'B3',1]],
    [[0,'A3',4.5]], [],
    [[.5,'D4',1.5],[2.5,'Bd3',1]], [[0,'A3',1.5],[2,'G3',1.5]],
    [[0,'Ft3',2.5]], [[1,'G3',2]],
    [[.5,'D4',3]], [[0,'Ft4',2.5]],
    [[0,'E4',1.5],[2,'Ct4',1.5]], [[0,'A3',4.5]],
    [], [[.5,'Ad3',2.5]],
    [[0,'G3',1.5],[2,'F3',1]], [[.5,'D3',2.5]],
    [[0,'A3',2],[2.5,'Ft3',1]], [[0,'D3',2.5]],
    [[.5,'Bd3',1.5],[2.5,'A3',1]], [[0,'G3',3]],
    [[0,'Ed3',1.5],[2,'D3',1]], [],
    [[.5,'D3',1.5],[2.5,'G3',.75]], [[0,'C3',2.5]],

];
const chords={
  C: {bass:'C2', tones:['G3','C4','Ed4']},
  G: {bass:'G2', tones:['G3','Bd3','D4']},
  F: {bass:'F2', tones:['F3','Ad3','C4']},
  D: {bass:'D2', tones:['A3','D4','Ft4']},
  A: {bass:'A2', tones:['A3','Ct4','E4']},
  B: {bass:'Bd2', tones:['Ft3','Bd3','D4']},
} as const satisfies Record<string, {bass:Pitch; tones:readonly Pitch[]}>;
type Chord=keyof typeof chords;
const harmony:readonly Chord[]=(['C','C','F','D','A','A','G','D','B','A','F','F','D','G','C','C']as const).flatMap(id=>[id,id]);
const replies:Readonly<Record<number,Phrase>>={3:[[1,'G4',1.5]],7:[[1,'A4',1.5]],11:[[.5,'E4',1.5],[2.5,'Ct4',1]],20:[[1,'C4',2]],29:[[1,'G4',1.5]]};
const dynamics=[.83,.76,.9,.82,.73,.88,.8,.65,.94,.84,.91,.78,.96,.86,.83,.62,.67,.75,.83,.71,.94,1,.86,.76,1,.94,.88,.83,.97,.86,.78,.62];

export function gateBar(bar:number):Note[]{
 const i=((bar%32)+32)%32,section=Math.floor(i/8),out:Note[]=[],strength=dynamics[i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity,pan,expression:phrasing(strength,instrument==='strings')};
  out.push(note);return note;
 };
 const lead=section===2?'strings':'reed';
 for(const [beat,pitch,hold]of melody[i]){
  const n=add(lead,pitch,beat,hold,.14,-.18);
  n.expression=singing('warm',strength,hold,i%8===7);
  if(lead==='reed'&&hold>=2.5&&[2,11,25].includes(i))n.expression.bend=[[0,-1200/31],[.1,0],[1,0]];
 }
 for(const [beat,pitch,hold]of replies[i]??[]){
  const n=add('lute',pitch,beat,hold,.09,.3);n.expression=phrasing(strength);
 }
 if(i%2===0){
  const chord=chords[harmony[i]],hold=7.6;
  add('round-bass',chord.bass,0,hold,.1);
  for(const [k,p]of chord.tones.entries())add('strings',p,0,hold,section===2?.024:.018,k%2?.4:-.4);
 }
 return out;
}
