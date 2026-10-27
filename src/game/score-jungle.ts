import type { Instrument,Note } from './score';
import { octave,type Pitch } from './tuning';
import { phrasing,singing } from './expression';

export type JungleMode='riverhaven'|'canopy'|'rainhouse'|'rainhouse-rest'|'river-battle'|'rain-warden';
type Phrase=readonly (readonly [beat:number,pitch:Pitch,hold:number])[];
// Exact 31-EDO Slendric, rooted on C. The sixth tone is a diesis below C5.
export const SLENDRIC_FIVE:readonly Pitch[]=['C4','Dt4','Fd4','G4','At4'];
export const SLENDRIC_SIX:readonly Pitch[]=[...SLENDRIC_FIVE,'Cd5'];

// Four-bar sentences. Falling calls, held neighbours and offbeat replies avoid
// the former rising-triad template. The second half develops each first half.
const river:readonly Phrase[]=[
 [[0,'G4',1],[1.5,'Dt4',.5],[3,'C4',1],[5,'Dt4',1.5],[7,'Fd4',.5],[8.5,'G4',2],[12,'Fd4',1],[14,'Dt4',1]],
 [[0,'At4',2],[3,'G4',.75],[5,'Fd4',1.5],[7,'Dt4',.5],[8,'C4',2.5],[12.5,'Dt4',.5],[14,'G4',1]],
 [[.5,'Fd4',1.5],[3,'C5',1],[4.5,'At4',1.5],[7,'G4',.5],[8,'Fd4',2],[11,'Dt4',1],[13,'C4',2]],
 [[0,'G4',2],[3,'Dt4',.5],[4.5,'Fd4',1],[6,'Dt4',1.5],[9,'C4',2],[13,'G4',1],[14.5,'At4',.75]],
 [[0,'C5',2.5],[3.5,'At4',.5],[5,'G4',1],[7,'Fd4',.5],[8.5,'Dt4',2],[12,'Fd4',1.5],[14,'G4',1]],
 [[0,'At4',1],[2,'G4',1.5],[4,'Fd4',2],[7,'G4',.75],[9,'Dt4',2],[12.5,'C4',2]],
 [[0,'Dt5',2],[3,'C5',.75],[4.5,'At4',1.5],[7,'Fd4',.5],[8,'G4',2.5],[12,'Dt4',1],[14,'Fd4',1]],
 [[.5,'G4',1.5],[3,'Fd4',.75],[5,'Dt4',1.5],[7.5,'C4',3],[12,'Dt4',1],[14,'C4',1.5]],
];
const forest:readonly Phrase[]=[
 [[0,'Cd5',2],[3,'At4',.5],[4.5,'G4',1.5],[7,'Fd4',.5],[9,'Dt4',2],[13,'G4',1.5]],
 [[1,'Fd4',1],[3,'Dt4',.5],[4,'C4',2],[7,'Dt4',.75],[9,'Cd5',2],[13,'At4',1]],
 [[0,'At4',2.5],[3.5,'Cd5',.5],[5,'C5',1],[7,'G4',.75],[8.5,'Fd4',2],[12,'Dt4',2]],
 [[.5,'G4',1.5],[3,'Cd5',1],[5,'At4',2],[9,'G4',1.5],[12,'Fd4',1],[14,'Dt4',1]],
 [[0,'Cd5',1],[2,'C5',2],[5,'At4',1.5],[7,'G4',.5],[8.5,'Dt5',2],[12,'C5',2.5]],
 [[1,'At4',1],[3,'G4',.75],[4.5,'Fd4',2],[7.5,'Dt4',1],[10,'Cd4',2],[14,'C4',1]],
 [[0,'Fd5',2.5],[3,'Dt5',.75],[5,'Cd5',2],[8,'At4',1.5],[10.5,'G4',1],[13,'Dt4',2]],
 [[0,'Cd5',2],[3,'At4',.75],[5,'G4',2],[8,'Fd4',1.5],[11,'Dt4',1],[13,'C4',2]],
];
const waiting:readonly Phrase[]=[
 [[0,'Fd4',3],[5,'Dt4',2],[10,'Cd4',3]],
 [[1,'G4',3],[7,'Fd4',2],[12,'Dt4',2.5]],
 [[0,'At4',3.5],[6,'G4',2.5],[11,'Cd5',3]],
 [[0,'C5',2],[4,'At4',3],[10,'Fd4',2],[13,'Dt4',2]],
 [[0,'Cd5',3.5],[6,'At4',2],[10,'G4',3.5]],
 [[1,'Fd4',2.5],[6,'Dt4',2],[11,'C4',3]],
 [[0,'G4',3],[5,'At4',2.5],[10,'Cd5',3.5]],
 [[0,'C5',3],[5,'G4',2],[10,'Dt4',2],[13,'C4',2]],
];
const settled:readonly Phrase[]=[
 [[0,'Fd4',3],[5,'Dt4',2],[10,'C4',3]],
 [[1,'G4',3],[6,'Fd4',2],[10,'Dt4',2],[13,'C4',2]],
 [[0,'At4',3],[5,'G4',2.5],[10,'Fd4',3]],
 [[0,'G4',2],[4,'Dt4',2],[8,'C4',3],[13,'Dt4',1.5]],
 [[0,'C5',3.5],[5,'At4',2],[9,'G4',3],[13,'Fd4',1.5]],
 [[1,'G4',2.5],[6,'Fd4',2],[10,'Dt4',3]],
 [[0,'Dt5',3],[5,'C5',2],[9,'At4',2],[12,'G4',2.5]],
 [[0,'Fd4',2.5],[4,'Dt4',2],[8,'C4',5]],
];
const battle:readonly Phrase[]=[
 [[0,'G4',.75],[1.5,'Dt4',.5],[3,'C4',.5],[4,'Dt4',1],[5.5,'Fd4',.5],[7,'G4',.5],[8,'Cd5',1.5],[10,'At4',.75],[12,'Fd4',1],[14,'Dt4',1]],
 [[0,'At4',1],[2,'G4',.5],[3,'Cd5',.75],[4.5,'C5',1],[6,'At4',.75],[8,'G4',1.5],[11,'Dt4',.5],[12,'C4',2]],
 [[0,'Fd5',1.5],[2,'Dt5',.5],[3.5,'Cd5',.5],[5,'At4',1],[7,'G4',.75],[8.5,'Fd4',1.5],[11,'G4',.5],[13,'Dt4',1.5]],
 [[0,'Cd5',1],[1.5,'At4',.5],[3,'G4',1],[5,'Fd4',.75],[6.5,'Dt4',1],[9,'C4',2],[12,'G4',1],[14,'At4',1]],
 [[0,'Dt5',1.5],[2,'C5',.5],[3.5,'Cd5',.5],[5,'At4',1.5],[7,'G4',.5],[8.5,'Fd4',1],[10,'Dt4',1.5],[13,'G4',2]],
 [[0,'C5',1],[2,'At4',.75],[3.5,'G4',.5],[5,'Fd4',1],[7,'Cd5',.75],[8,'Dt5',1.5],[11,'C5',.5],[12.5,'At4',2]],
 [[0,'Fd5',2],[3,'Dt5',.5],[4,'Cd5',1],[6,'At4',.75],[7.5,'G4',.5],[9,'Dt5',2],[12,'C5',1],[14,'G4',1]],
 [[0,'At4',1.5],[2,'G4',.5],[3.5,'Fd4',1],[5,'Dt4',.75],[7,'Cd4',.5],[8,'C4',2.5],[12,'G4',1],[14,'C5',1]],
];
const claimant:readonly Phrase[]=[
 [[0,'Cd5',1.5],[2,'Cd5',.5],[3,'At4',.75],[5,'G4',2],[8,'Cd5',1.5],[11,'C5',.75],[13,'Fd4',2]],
 [[0,'G4',1],[1.5,'Fd4',.5],[3,'Cd5',.75],[4.5,'At4',1.5],[7,'G4',.5],[9,'Dt4',2],[13,'Cd4',1.5]],
 [[0,'Fd5',2],[3,'Cd5',.75],[5,'At4',1.5],[8,'G4',2],[11,'Dt5',1],[13,'C5',2]],
 [[0,'At4',1],[2,'G4',1],[4.5,'Fd4',1],[6,'Cd5',1.5],[9,'C5',1],[11,'At4',1],[13,'G4',2]],
 [[0,'Cd5',3],[4,'Dt5',2],[7,'C5',.5],[8.5,'At4',2.5],[12,'G4',2]],
 [[0,'Fd4',2],[3,'Cd4',1],[5,'C4',2],[8,'G4',1.5],[11,'At4',1],[13,'Cd5',2]],
 [[0,'Fd5',1.5],[2,'Dt5',.5],[4,'Cd5',2],[7,'At4',.75],[8.5,'G4',1.5],[11,'Fd4',1],[13,'Dt4',2]],
 [[0,'Cd5',1.5],[2,'At4',.75],[4,'G4',2],[7,'Fd4',.75],[9,'Dt4',2],[12,'Cd4',1],[14,'C4',1.5]],
];
const forms:Record<JungleMode,readonly Phrase[]>={riverhaven:river,canopy:forest,rainhouse:waiting,'rainhouse-rest':settled,'river-battle':battle,'rain-warden':claimant};
const foundations:Record<JungleMode,readonly Pitch[]>={
 riverhaven:['C3','G2','Dt3','At2','Fd3','C3','At2','C3'],
 canopy:['C3','Cd3','G2','Dt3','At2','Fd3','Cd3','C3'],
 rainhouse:['C3','Fd3','At2','Dt3','Cd3','G2','Fd3','C3'],
 'rainhouse-rest':['C3','Fd3','At2','C3','G2','Dt3','At2','C3'],
 'river-battle':['C3','Dt3','At2','G2','Fd3','Cd3','G2','C3'],
 'rain-warden':['Cd3','G2','Fd3','At2','Cd3','C3','G2','C3'],
};
const contours=[.82,.88,.94,.7,.78,.91,.86,.65,.95,.87,1,.76,.85,.94,.8,.62,.7,.79,.9,.77,.88,1,.92,.78,1,.93,.88,.8,.95,.84,.75,.6];

export function jungleBar(mode:JungleMode,bar:number):Note[]{
 const i=((bar%32)+32)%32,phrase=Math.floor(i/4),within=i%4,section=Math.floor(i/8);
 const quiet=mode==='rainhouse'||mode==='rainhouse-rest',fight=mode==='river-battle'||mode==='rain-warden',boss=mode==='rain-warden';
 const out:Note[]=[],strength=contours[i];
 const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const n:Note={instrument,pitch,beat,duration,velocity,pan,expression:phrasing(strength,instrument==='strings')};out.push(n);return n;
 };
 // A reed sentence rides over the interlocking wood, rather than doubling it.
 const lead=mode==='river-battle'?'wood':boss&&section!==2?'brass':'reed';
 for(const [beat,pitch,hold]of forms[mode][phrase])if(beat>=within*4&&beat<(within+1)*4){
  const n=add(lead,pitch,beat-within*4,hold,quiet?.16:fight?.22:.18,-.18);
  n.expression=lead==='wood'?phrasing(strength):singing(quiet?'warm':'clear',strength,hold,within===3);
 }
 const root=foundations[mode][phrase],next=foundations[mode][(phrase+1)%8];
 const degrees=mode==='riverhaven'||mode==='rainhouse-rest'?SLENDRIC_FIVE:SLENDRIC_SIX;
 if(quiet){
  // Hold through the unoccupied bars of the treatment. Drums stay measured.
  if(within%2===0){add('round-bass',octave(root,-1),0,7.5,.13);add('strings',octave(root,1),0,7.4,.023,.4);}
  if(within===1||within===3)add('wood',degrees[(phrase+2)%5],1.5,1.8,.075,.28);
  if(mode==='rainhouse'&&i%8===6)add('wood','Cd5',3,1.2,.075,.3);
 }else{
  // A substantial bass with its own movement, leaving the last bar to breathe.
  const rhythm=within===3?[[0,2.7],[3.5,.35]]:section===2?[[0,1.75],[2.5,1]]:[[0,.8],[1.5,.4],[2.5,.8]];
  for(const [k,[beat,hold]]of rhythm.entries()){
   const pitch=beat===3.5?next:k===1?octave(degrees[(phrase+3)%5],-1):root;
   add(boss?'square-bass':'round-bass',octave(pitch,-1),beat,boss&&section!==2?Math.min(hold,within===3?1.1:.5):hold,k===0?.17:.13);
  }
  // Short offbeat answers interlock with the wood; keep the reed middle broad.
  if(boss&&section!==2&&within!==3)for(const beat of [.5,2,3])add('square-bass',octave(root,-1),beat,.28,.09);
  if(within!==3){
   // The 3+3+2 eighth-note wood layer answers the steady four-beat hand drums.
   const beats=section===2?[.5,2.5]:i%2?[.5,2,3.5]:[0,1.5,3];
   for(const [k,beat]of beats.entries()){
    const pitch=degrees[(phrase+(i%2?2:0)+k*2)%degrees.length];
    add('wood',octave(pitch,mode==='river-battle'?1:0),beat,.45,lead==='wood'?.065:.105,k%2?.36:.12);
   }
  }else if(i%8===7){
   add('wood',degrees[(phrase+1)%5],2.5,.4,.09,.32);
   add('wood',degrees[(phrase+3)%5],3.5,.4,.075,.32);
  }
  if(section===2&&i%2===0)add('strings',octave(root,1),0,7.5,.026,.4);
 }

 // Low open strokes and higher rim strokes form a conversation, not a rock
 // snare backbeat. Dry shaker eighths keep the pulse audible under the wood.
 const drum=quiet?.073:boss?.2:fight?.17:.13;
 const strokes:readonly (readonly [number,boolean,number])[]=quiet?
  [[0,false,1],[2.5,true,.6]]:within===3?
  [[0,false,1],[1.5,true,.7],[2,false,.8],[3,true,.65]]:
  [[0,false,1],[1,true,.55],[1.5,true,.72],[2,false,.85],[3,true,.85],[3.5,true,.5]];
 for(const [beat,rim,accent]of strokes)add('hand-drum',rim?'G2':'C2',beat,rim?.11:.22,drum*accent,rim?.12:-.18);
 for(let beat=.5;beat<4;beat+=quiet?1:.5){
  if(within===3&&beat===3.5)continue;
  add('shaker','C2',beat,.065,(quiet?.026:fight?.065:.05)*(beat%1?.85:.55),.42);
 }
 if(fight&&within===3&&section!==2)for(const beat of [3.25,3.75])add('hand-drum','G2',beat,.09,drum*.55,.16);
 if(boss){
  for(const beat of [0,2])add('kick','C2',beat,.16,section===2?.085:.12);
  if(within===3&&section!==2)add('hand-drum','C2',3.5,.12,.14,-.18);
  if([0,8,24].includes(i)){add('timpani',octave(root,-1),0,1.5,.13);add('cymbal','C3',0,.9,.03,.3);}
 }
 return out;
}
