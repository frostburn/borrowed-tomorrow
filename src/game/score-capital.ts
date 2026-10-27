import type { Instrument,Note } from './score';
import { octave,type Pitch } from './tuning';
import { phrasing,singing } from './expression';
export type CapitalMode='stillcity'|'lastpalace'|'crown'|'capital-battle'|'emperor'|'lightbearer'|'laststation'|'capital-return';
type Phrase=readonly (readonly [number,Pitch,number])[];
// The street's descending answer catches on a repeated note, then finally continues.
const street:readonly Phrase[]=[
 [[0,'A4',2],[3,'G4',.75],[4,'F4',2],[7,'E4',.75],[8,'E4',1],[10,'D4',2],[14,'A4',1]],
 [[0,'Bb4',2],[3,'A4',.75],[4,'G4',2],[8,'F4',2],[11,'E4',1],[13,'D4',2]],
 [[0,'C5',2],[3,'Bb4',1],[5,'A4',2],[8,'G4',2.5],[12,'F4',2]],
 [[0,'E4',2],[4,'G4',2],[7,'F4',1],[9,'E4',2],[13,'A4',2]],
 [[0,'D5',2.5],[4,'C5',1],[6,'A4',1.5],[9,'Bb4',2],[13,'G4',2]],
 [[0,'F5',2],[3,'E5',1],[5,'D5',2],[8,'A4',2],[12,'G4',1],[14,'F4',1]],
 [[0,'Bb4',3],[4,'G4',2],[8,'A4',1],[10,'E5',2],[14,'D5',1]],
 [[0,'C5',2],[3,'A4',1],[5,'G4',2],[9,'F4',2],[12,'E4',3]],
];
// Four-bar sentences in three beats. The crown's falling fifth never resolves to its opening note.
const imperial:readonly Phrase[]=[
 [[0,'C5',1.5],[2,'F4',.75],[3,'Ab4',1.5],[5,'G4',.75],[6,'E4',2],[9,'F4',2]],
 [[0,'Db5',2],[3,'C5',1],[5,'Ab4',1],[6,'G4',1.5],[8,'F4',1],[10,'E4',1.5]],
 [[0,'Eb5',1.5],[2,'Db5',.75],[3,'C5',2],[6,'Ab4',2],[9,'G4',2]],
 [[0,'B4',1],[2,'C5',.75],[3,'G4',2],[6,'E4',2],[9,'F4',2]],
 [[0,'F5',2],[3,'Eb5',1],[5,'Db5',.75],[6,'C5',2],[9,'Ab4',2]],
 [[0,'G5',1.5],[2,'F5',.75],[3,'E5',2],[6,'Db5',1.5],[8,'C5',.75],[9,'Ab4',2]],
 [[0,'Db5',2],[3,'G4',2],[6,'C5',1],[8,'B4',.75],[9,'E5',2]],
 [[0,'C5',2],[3,'Ab4',1],[5,'G4',.75],[6,'E4',2],[9,'F4',2.5]],
];
// Nell's actual festival opening, kept recognizable, then developed rather than randomly reharmonized every bar.
const lantern:readonly Phrase[]=[
 [[0,'D5',1.5],[2,'F5',.75],[3,'E5',.75],[4,'D5',2],[7,'A4',.75],[8,'C5',1.5],[10,'D5',.75],[11,'F5',1],[12,'E5',2.5]],
 [[0,'D5',2],[3,'F5',1],[5,'E5',2],[8,'D5',3],[12,'A4',2]],
 [[0,'C6',2],[3,'Bb5',1],[5,'A5',2],[8,'F5',2],[12,'E5',3]],
 [[0,'D5',2],[4,'C5',1],[6,'A4',2],[9,'C5',1],[12,'E5',3]],
 [[0,'D6',2.5],[4,'F6',1],[6,'E6',2],[9,'D6',2],[13,'C6',2]],
 [[0,'Bb5',2],[3,'A5',1],[5,'G5',2],[9,'F5',2],[13,'E5',2]],
 [[0,'D5',3],[5,'F5',2],[9,'E5',3],[14,'D5',1]],
 [[0,'C5',2],[4,'A4',2],[8,'E5',2.5],[12,'D5',3]],
];
const home:readonly Phrase[]=[
 [[0,'F4',3],[4,'E4',1],[6,'D4',2],[10,'C4',3]],
 [[0,'A4',2],[3,'G4',1],[5,'F4',2],[9,'D4',2],[13,'E4',2]],
 [[0,'C5',3],[4,'Bb4',2],[8,'A4',2],[12,'F4',3]],
 [[0,'G4',2],[4,'E4',2],[8,'C4',2],[12,'D4',3]],
 [[0,'F5',3],[5,'E5',2],[9,'C5',2],[13,'A4',2]],
 [[0,'Bb4',3],[5,'A4',2],[9,'G4',2],[13,'F4',2]],
 [[0,'D5',2],[4,'C5',2],[8,'A4',3],[13,'G4',2]],
 [[0,'F4',3],[5,'E4',2],[9,'D4',2],[13,'C4',3]],
];
const roots:readonly Pitch[]=['D2','Bb1','F2','A1','G2','Bb1','E2','A1'];
const thirds:readonly Pitch[]=['F3','D3','A3','C#3','Bb3','Db3','G3','C#3'];
const dyn=[.78,.87,.93,.72,.83,.9,.96,.71,.85,.92,.98,.78,.89,.97,.85,.69,.91,.98,1,.84,.94,1,.9,.75,.88,.96,.89,.73,.82,.9,.78,.58];
export function capitalBar(mode:CapitalMode,bar:number):Note[]{
 const emperor=mode==='emperor',light=mode==='lightbearer',battle=emperor||light||mode==='capital-battle',palace=mode==='lastpalace'||mode==='crown'||emperor,empty=mode==='laststation',returning=mode==='capital-return',beats=palace?3:4,intro=emperor||light?2:0;
 const out:Note[]=[],add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{const n:Note={instrument,pitch,beat,duration,velocity,pan};out.push(n);return n;};
 if(bar<intro){
  if(light){add('bell',bar?'E5':'D5',0,3.7,.14,-.15).expression={...phrasing(.75),release:1.3};add('tritaver',bar?'Ft3':'C3',1,2.5,.065,.25).expression=singing('clear',.8,2.5);}
  else{for(const [j,p]of (bar?['Db4','C4','Ab3']:['C4','F3','Ab3']).entries())add('brass',p as Pitch,j,.9,.14,-.2+j*.2).expression=phrasing(.85);add('timpani','F2',0,1.3,.14);}
  add('round-bass',light?'C2':'F2',0,beats-.1,.14).expression=phrasing(.8,true);
  if(emperor&&bar===1)for(const [j,at]of [2,2.5,2.75].entries())add('snare','D2',at,.09,.055+j*.02,.08);
  return out;
 }
 const i=((bar-intro)%32+32)%32,phrase=Math.floor(i/4),within=i%4,section=Math.floor(i/8),strength=dyn[i];
 const form=light||empty?lantern:returning?home:palace?imperial:street;
 let lead:Instrument=light?section===1?'strings':'bell':empty?'keys':returning?'reed':palace?emperor?section===2?'strings':'brass':'strings':battle?'brass':'keys';
 const melody=form[phrase];
 // The street battle uses additional answering figures, keeping its main cell on a firm pulse.
 for(const [at,p,hold]of melody)if(at>=within*beats&&at<(within+1)*beats){
  const pitch=empty?octave(p,-1):p,n=add(lead,pitch,at-within*beats,hold*(battle&&!emperor&&!light?.8:1),empty?.12:light?.16:battle?.2:.16,-.15);
  n.expression=lead==='bell'?{...phrasing(strength),release:1.2}:lead==='keys'?phrasing(strength):singing(empty||returning?'warm':'clear',strength,hold,within===3);
 }
 const root=light?(['C2','A#1','Ft2','D2','E2','Ad1','B1','G1']as const)[phrase]:palace?(['F2','Db2','Ab1','C2','F2','Db2','G1','C2']as const)[phrase]:roots[phrase];
 const third=light?(['E3','B3','A#3','Ft3','G3','D3','Ad3','E3']as const)[phrase]:palace?(['Ab3','F3','C3','E3','Ab3','F3','B2','E3']as const)[phrase]:thirds[phrase];
 if(battle){
  // The emperor drives six eighths through the waltz. Nell's bell keeps its
  // exposed long line over a nervous bass and a heavy half-time snare.
  const pulses=emperor?[0,.5,1,1.5,2,2.5]:light?[0,.5,1.5,2,2.5,3.5]:[0,1.5,2,3];
  for(const at of pulses)add(emperor||light?'square-bass':'bass',root,at,emperor||light?.32:at===0?.9:.45,(emperor||light?(at%1?.105:.17):.14)*strength,-.08);
  for(const at of emperor?[0,1.5]:light?[0,1.5,3]:[0])add('kick','C2',at,.18,emperor||light?.15:.1);
  for(const at of palace?[1,2]:light?[2]:[1,3])add('snare','D2',at,emperor||light?.16:.18,emperor||light?.11:.065,.08);
  for(let at=.5;at<beats;at+=emperor||light?.5:1)add('hat','F#2',at,emperor||light?.08:.09,emperor||light?(at%1?.028:.018):.022,.4);
  if(within===3){add('timpani',root,beats-1,.5,.095,-.25);add('timpani',octave(root,1),beats-.5,.4,.075,.25);}
  if((emperor||light)&&within===3)for(const at of [beats-.75,beats-.25])add('snare','D2',at,.09,.055,.08);
  if((emperor||light)&&within===0)add('timpani',root,0,.8,.12,-.25);
  if(i%8===0)add('cymbal','C3',0,1.6,emperor||light?.05:.035,.3);
 }else if(within%2===0)add('round-bass',root,0,beats*2-.15,empty?.095:.12,-.1).expression=phrasing(strength,true);
 if(within===0)for(const [j,p]of [octave(root,1),third].entries())add('strings',p,0,beats*4-.2,empty?.018:.028,j?-.4:.4).expression=singing('warm',strength,beats*4-.2);
 if(light&&within===2)add('tritaver',third,1,2.5,.055,.3).expression=singing('clear',strength,2.5);
 if(!empty&&(within===1||within===3))add('bell',octave(third,1),beats-1,2.5,light?.035:.05,.4).expression={...phrasing(strength),release:1.25};
 if(mode==='capital-battle'&&within%2===1)for(const at of [0,2.5])add('strings',octave(third,1),at,.45,.075*strength,.3).expression=phrasing(strength);
 if((returning||mode==='stillcity')&&within===3)add('lute',octave(root,2),0,.7,.07,.3).expression=phrasing(strength);
 return out;
}
