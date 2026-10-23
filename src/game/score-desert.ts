import type { Note,Instrument } from './score';
import { octave,type Pitch } from './tuning';
import { singing,phrasing } from './expression';
export type DesertMode='outermooring'|'namar'|'sunpalace'|'skywalk'|'observatory'|'desert-battle'|'sun-serpent';
type Phrase=readonly (readonly [beat:number,pitch:Pitch,hold:number])[];
// Neutral C/Ed/G and G/Bd/D are resting harmonies, not chromatic approaches.
// The city's falling fourth opens a five-bar sentence; the reply takes three.
const market:readonly Phrase[]=[
 [[0,'G5',1.25],[1.5,'Ed5',.5],[2.5,'D5',.75]],[[.5,'C5',2.5]],
 [[0,'D5',.75],[1,'Ed5',1.5],[3,'F5',.75]],[[.5,'Ed5',1],[2,'D5',.5],[3,'C5',.75]],
 [[0,'G4',2.75]],[[.5,'A4',.5],[1.5,'Bd4',.5],[2.5,'D5',1]],
 [[0,'C5',1.5],[2,'Bd4',.75]],[[.5,'G4',2]],
 [[0,'C6',1.5],[2,'Bd5',.75],[3,'A5',.5]],[[.5,'G5',2.25]],
 [[0,'F5',.75],[1,'G5',.75],[2.5,'Ad5',1]],[[0,'G5',1.5],[2,'F5',.5],[3,'Ed5',.75]],
 [[.5,'D5',1.5],[2.5,'Ed5',.75]],[[0,'F5',1.5],[2,'D5',1]],
 [[0,'Ed5',1],[1.5,'D5',.5],[2.5,'Bd4',1]],[[0,'C5',2.75]],
];
const heights:readonly Phrase[]=[
 [[.5,'G4',1.5],[2.5,'Ed4',1]],[[0,'D4',2.5]],
 [[1,'F4',1],[2.5,'Ed4',.75]],[[0,'G4',2]],
 [[0,'Bd4',1.5],[2,'A4',1]],[[.5,'G4',2.5]],
 [[0,'Ed4',1],[1.5,'D4',.5],[2.5,'C4',1]],[],
 [[.5,'D5',1],[2,'C5',1.5]],[[0,'Bd4',2]],
 [[1,'Ad4',1.5]],[[0,'G4',2.5]],
 [[.5,'F4',1],[2,'Ed4',1.25]],[[0,'D4',1.5],[2.5,'G4',1]],
 [[0,'Bd4',1],[1.5,'Ad4',.5],[2.5,'G4',1]],[[0,'C4',3]],
];
const sun:readonly Phrase[]=[
 [[0,'G4',.5],[.5,'Ed4',.5],[1,'D4',.5],[2,'C4',.75]],[[0,'G4',1],[1.5,'Bd4',1]],
 [[0,'A4',.5],[.5,'G4',.5],[1.5,'Ed4',1]],[[0,'D4',2],[2.5,'Ed4',.4]],
 [[0,'G4',.5],[.5,'Ed4',.5],[1,'F4',.5],[2,'Ad4',.75]],[[0,'G4',1.5],[2,'F4',.75]],
 [[0,'Ed4',.75],[1,'D4',.5],[2,'Bd3',.75]],[[0,'C4',2.5]],
 [[0,'D5',1],[1.5,'C5',1]],[[0,'Bd4',.5],[.5,'A4',.5],[1.5,'G4',1]],
 [[0,'Ad4',1.5],[2,'G4',.75]],[[0,'F4',1],[1.5,'Ed4',1]],
 [[0,'D4',.5],[.5,'Ed4',.5],[1.5,'G4',1]],[[0,'Bd4',1.5],[2,'Ad4',.75]],
 [[0,'G4',.75],[1,'Ed4',.5],[2,'D4',.75]],[[0,'C4',2.5]],
];
const harmony=[
 {bass:'C2',tones:['G3','C4','Ed4']},{bass:'G2',tones:['D4','G4','Bd4']},
 {bass:'F2',tones:['C4','F4','Ad4']},{bass:'D2',tones:['A3','D4','F4']},
] satisfies {bass:Pitch;tones:Pitch[]}[];
const changes=[0,0,0,1,0,1,1,0,2,2,2,1,3,3,1,0,0,0,1,1,2,2,3,1,2,2,0,3,2,1,1,0];
const dynamics=[.77,.7,.86,.82,.65,.83,.75,.61,.89,.8,.94,.86,.79,.88,.83,.57,.62,.59,.7,.73,.9,.96,.84,.77,1,.94,.87,.83,.9,.82,.76,.6];
export function desertBar(mode:DesertMode,bar:number):Note[]{
 const boss=mode==='sun-serpent',court=mode==='sunpalace',quiet=mode==='outermooring'||mode==='observatory',fight=boss||mode==='desert-battle';
 const out:Note[]=[],beats=boss||court?3:4;
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch,beat,duration,velocity,pan,expression:phrasing(dynamics[((bar%32)+32)%32],instrument==='strings')};out.push(note);return note;
 };
 if(boss&&bar<2){
  add('timpani',bar?'G2':'C2',0,1.4,.11);add('brass',bar?'Bd3':'Ed4',0,2.6,.17);
  for(const p of ['C3','Ed3','G3']as Pitch[])add('strings',p,0,2.8,.024);
  if(bar)for(const beat of [1,1.5,2,2.5])add('snare','D2',beat,.14,.055+beat*.015);
  return out;
 }
 const i=((bar-(boss?2:0))%32+32)%32,section=Math.floor(i/8),source=boss?sun:mode==='skywalk'||quiet?heights:market;
 const chord=harmony[changes[i]],tone=source[i%16],lead=boss?'brass':mode==='skywalk'?'lute':'reed';
 for(const [beat,pitch,hold]of tone){
  const time=beat*(court?.75:1),duration=hold*(court?.75:1),p=quiet?octave(pitch,-1):i>=24&&!boss?octave(pitch,0):pitch;
  const n=add(lead,p,time,duration,quiet?.12:boss?.19:.19,-.18);n.expression=singing(court||quiet?'warm':'clear',dynamics[i],duration,i%8===7);
  if(boss&&hold>1.25)add('reed',octave(p,1),time+.25,Math.max(.35,duration-.4),.055,.3).expression=singing('clear',.7,duration);
 }
 // Empty measures hand the melody to the lute instead of filling every gap.
 if(!tone.length||quiet&&i%4===3){
  const p=chord.tones[i%3];add('lute',p,.5,1.6,quiet?.07:.11,.35);if(!quiet)add('lute',octave(p,1),2.5,.8,.065,.35);
 }
 const hold=court?5.6:quiet?7.4:3.5;
 if(court||quiet){
  if(i%2===0){add('round-bass',chord.bass,0,hold,.1);for(const [k,p]of chord.tones.entries())add('strings',p,0,hold,.017,k%2?.4:-.4);}
  if(court)for(const [k,p]of chord.tones.entries())add('lute',p,.06+k*.08,1.6,.055,.3);
  if(mode==='observatory'&&i%4===2)add('bell',octave(chord.tones[1],1),2.5,2.7,.05,.4).expression!.release=.4;
  return out;
 }
 const middle=section===2;
 const rhythm=boss?[[0,1.15],[1.5,.9]]:fight?[[0,.7],[1,.5],[2.5,1]]:middle?[[0,2.75]]:[[0,1.3],[2.5,.8]];
 for(const [beat,d]of rhythm)add('round-bass',chord.bass,beat,d,fight?.16:.12);
 if(i%4===3)add('round-bass',octave(chord.tones[0],-1),boss?2.5:3.5,.4,.1);
 for(const beat of boss?[.5,1,2,2.5]:fight?[.5,1.5,2.5,3.5]:[1,3]){
  const p=chord.tones[(Math.round(beat*2)+i)%3];add('lute',p,beat,boss?.35:.6,fight?.065:.06,.3);
 }
 if(fight||i>=24)for(const [k,p]of chord.tones.entries())add('strings',p,0,beats-.15,.02,k%2?.4:-.4);
 if(mode==='skywalk'&&i%4===2)add('reed',octave(chord.tones[0],1),2,1.5,.075,-.25).expression=singing('clear',.8,1.5);
 if(!boss&&i%8===4)add('lute','G5',3,.6,.09,.4);
 const pulse=fight?.1:.033;
 for(const beat of boss?[0,1.5]:[0,2])add('kick','C2',beat,.14,pulse);
 for(const beat of boss?[1.5]:[1,3])add('snare','D2',beat,.12,pulse*.6,-.15);
 for(let beat=.5;beat<beats;beat+=fight?.5:1)add('hat','F#2',beat,.07,pulse*(beat%1?.23:.16),.4);
 if(boss&&[0,8,24].includes(i)){add('timpani',chord.bass,0,1.3,.085);add('cymbal','C2',0,1.2,.025,.3);}
 if(boss&&i%8===7)for(const beat of [2,2.5])add('snare','D2',beat,.1,.055,-.15);
 return out;
}
