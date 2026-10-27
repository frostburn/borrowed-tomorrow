import type {Instrument,Note} from './score';
import {octave,type Pitch} from './tuning';
import {phrasing,singing} from './expression';
import {gateBar} from './score-gate';

export type DesertMode='outermooring'|'namar'|'sunpalace'|'skywalk'|'observatory'|'desert-battle'|'sun-serpent';
type Region=Exclude<DesertMode,'outermooring'>;
type Phrase=readonly (readonly [beat:number,degree:number,hold:number])[];

// Seven consecutive nine-step neutral thirds: F–Ad–C–Ed–G–Bd–D.
// In tonic order: 0 5 9 13 18 22 27, or LssLsLs (3L4s, L=5, s=4).
// Every regional voice uses one collection at a time. The fifth-region lift
// and the hunters' brief quotation are authored departures, not chord churn.
export const DESERT_SCALES={
 c:['C4','D4','Ed4','F4','G4','Ad4','Bd4'],
 g:['G4','A4','Bd4','C5','D5','Ed5','Ft5'],
 f:['F4','G4','Ad4','Bb4','C5','Dd5','Ed5'],
 d:['D4','E4','Ft4','G4','A4','Bd4','Ct5'],
}as const satisfies Record<string,readonly Pitch[]>;
type Scale=keyof typeof DESERT_SCALES;
const pitch=(scale:Scale,degree:number)=>octave(DESERT_SCALES[scale][((degree%7)+7)%7],Math.floor(degree/7));

// Degrees, including negative/upper octaves, make the modal sentence visible.
// Turns are written short notes; sustained destinations get breath and vibrato.
const melodies:Record<Region,readonly Phrase[]>={
 namar:[
  [[0,7,.75],[1,8,.5],[1.5,9,1],[3,8,.5],[3.5,9,.25]], [[0,7,2],[2.5,6,.4],[3,7,.7]],
  [[.5,9,.75],[1.5,10,.5],[2.25,9,.25],[2.5,8,.5],[3.25,7,.5]], [[0,8,1],[1.5,9,.5],[2.5,7,1]],
  [[0,10,1.5],[2,9,.5],[2.5,8,.5],[3,9,.6]], [[.5,11,1],[2,10,.5],[2.5,9,.75]],
  [[0,8,.75],[1,9,.5],[1.5,8,.5],[2.5,6,.5]], [[0,7,2.5]],
  [[0,11,1.5],[2,12,.5],[2.5,13,.5],[3,14,.75]], [[.5,13,.5],[1,12,.5],[2,11,1.5]],
  [[0,12,.5],[.75,11,.5],[1.5,10,1],[3,9,.75]], [[0,11,2.75]],
  [[.5,10,.75],[1.5,9,.5],[2.25,8,.25],[2.5,9,.75]], [[0,8,1.5],[2,7,.75],[3,6,.5]],
  [[0,8,.5],[.75,9,.25],[1,8,.75],[2,6,.5]], [[0,7,2.5]],
  [[.5,2,.5],[1,3,.5],[2,4,1.5]], [[0,5,.75],[1,6,.5],[2,7,1.5]],
  [[0,6,.5],[.75,5,.5],[1.5,4,1.5]], [[0,2,1.5],[2,0,1.5]],
  [[.5,3,.75],[1.5,4,1.5]], [[0,5,1],[1.5,4,.5],[2.5,3,.75]],
  [[0,2,1],[1.5,1,.5],[2.5,0,.75]], [],
  [[0,11,1],[1.5,10,.5],[2,9,.75],[3,8,.5]], [[0,7,2],[2.5,9,.5],[3.25,8,.25]],
  [[0,10,1],[1.5,9,.5],[2.5,8,1]], [[0,9,.5],[.75,8,.25],[1,7,2]],
  [[0,10,1.25],[1.5,9,.5],[2.5,8,.75]], [[.5,9,.75],[1.5,8,.5],[2.5,6,.75]],
  [[0,8,.5],[.75,9,.25],[1,8,.5],[2,6,.5],[3,7,.5]], [[0,7,3]],
 ],
 sunpalace:[
  [[0,2,1.25],[1.5,1,.5],[2.25,0,.5]], [[0,0,2.4]],
  [[.5,1,.5],[1,2,1.25]], [[0,1,.5],[.75,2,.25],[1,0,1.5]],
  [[0,3,1],[1.5,4,1]], [[0,5,.75],[1,4,.5],[2,3,.75]],
  [[0,2,.75],[1,1,.5],[2,-1,.5]], [[0,0,2.4]],
  [[0,4,.75],[1,5,.5],[2,6,.5]], [[0,7,1.5],[2,6,.6]],
  [[0,5,.75],[1,4,1.5]], [[0,3,2.25]],
  [[.5,4,.5],[1,3,.5],[2,2,.75]], [[0,1,1],[1.5,2,.5],[2.25,1,.4]],
  [[0,-1,.75],[1,1,.5],[2,2,.6]], [[0,0,2.4]],
  [[0,7,1.5],[2,9,.75]], [[.5,10,.75],[1.5,11,1]],
  [[0,12,.75],[1,11,.5],[2,10,.75]], [[0,9,2.25]],
  [[.5,8,.5],[1,9,1.5]], [[0,10,1],[1.5,9,.5],[2.25,8,.5]],
  [[0,6,.75],[1,8,.5],[2,9,.5]], [[0,7,2.4]],
  [[0,4,1.25],[1.5,2,.5],[2.25,1,.5]], [[0,0,2.4]],
  [[.5,3,.75],[1.5,4,1]], [[0,3,1],[1.5,2,1]],
  [[0,1,.75],[1,2,.5],[2,1,.5]], [[0,-1,1.5],[2,1,.5]],
  [[0,2,.5],[.75,1,.25],[1,0,1.4]], [[0,0,2.5]],
 ],
 skywalk:[
  [[.5,4,.5],[1,4,.25],[1.5,3,.5],[2.5,2,.5],[3.25,1,.5]], [[0,0,1.25],[1.5,1,.5],[2.5,2,.5]],
  [[0,3,.5],[.75,2,.25],[1,1,.5],[2,2,.75],[3,4,.5]], [[0,2,1],[1.5,1,.5],[2.5,0,.75]],
  [[.5,3,.5],[1.25,4,.5],[2,5,.75],[3,4,.5]], [[0,3,.75],[1,2,.5],[2,1,.75]],
  [[0,2,.5],[.75,1,.25],[1,0,.75],[2.5,-1,.5]], [],
  [[0,4,.75],[1,5,.5],[1.75,6,.5],[2.5,7,1]], [[.5,6,.5],[1.5,4,1.5]],
  [[0,5,.5],[.75,4,.25],[1,3,.75],[2.5,2,.75]], [[0,4,2.5]],
  [[0,3,.5],[.75,2,.25],[1,1,.5],[2,2,.75]], [[.5,1,.75],[1.5,0,1]],
  [[0,-1,.5],[.75,0,.25],[1,1,.5],[2,2,.75]], [[0,0,2.5]],
  [[0,0,2],[2.5,2,.75]], [[.5,3,1],[2,4,1.5]],
  [[0,5,1.5],[2,4,1]], [],
  [[.5,3,1.5],[2.5,2,1]], [[0,1,1],[1.5,2,.5],[2.5,0,1]],
  [[0,-1,.75],[1,1,.5],[2,2,.5]], [[0,0,2.5]],
  [[.5,4,.5],[1,4,.25],[1.5,3,.5],[2.5,2,.5]], [[0,0,1.25],[1.5,2,.5],[2.5,4,.75]],
  [[0,5,.75],[1,4,.5],[2,3,.75],[3,2,.5]], [[0,1,.5],[.75,2,.25],[1,0,1.5]],
  [[0,3,1],[1.5,2,.5],[2.5,1,.75]], [[.5,2,.5],[1.25,1,.5],[2,-1,1]],
  [[0,1,.5],[.75,2,.25],[1,1,.5],[2,0,.75]], [[0,0,2.5]],
 ],
 observatory:[
  [[.5,-3,4.5]], [], [[0,-5,2],[2.5,-6,1]], [[.5,-7,2.5]],
  [[.5,-4,3.5]], [], [[0,-5,1.5],[2,-6,1]], [[0,-7,3]],
  [[0,2,2.5]], [], [[.5,3,1.5],[2.5,4,1]], [[0,5,3]],
  [[0,4,1.5],[2,3,1.5]], [], [[.5,2,1.5],[2.5,1,1]], [[0,0,3]],
  [], [], [[.5,4,4.5]], [],
  [[0,3,2],[2.5,2,1]], [[.5,1,2.5]], [[0,0,3]], [],
  [[.5,-4,2.5]], [[0,-3,3]], [[0,-5,1.5],[2,-6,1]], [],
  [[0,-5,2],[2.5,-6,1]], [[0,-7,3]], [[.5,-6,1],[2,-8,1]], [[0,-7,3]],
 ],
 'desert-battle':[
  [[0,7,.5],[.75,8,.5],[1.5,9,.75],[2.5,8,.5],[3.25,9,.5]], [[0,7,1],[1.5,6,.5],[2,7,1],[3.5,8,.3]],
  [[0,9,.5],[.75,10,.25],[1,9,.5],[2,8,.5],[3,7,.65]], [[0,8,.75],[1,9,.5],[2,7,1.5]],
  [[0,10,.75],[1,9,.5],[2,8,.5],[3,9,.65]], [[0,11,1],[1.5,10,.5],[2.5,9,1]],
  [[0,8,.5],[.75,9,.25],[1,8,.5],[2,6,.5],[3,8,.5]], [[0,7,2.5],[3,7,.5]],
  [[0,11,.75],[1,12,.5],[2,13,.5],[3,14,.75]], [[0,13,.5],[.75,12,.25],[1,11,1],[2.5,12,.5]],
  [[0,12,.5],[1,11,.5],[2,10,.75],[3,9,.5]], [[0,11,2],[2.5,10,.5],[3.25,11,.5]],
  [[0,10,.5],[1,9,.5],[2,8,.5],[3,9,.5]], [[0,8,1],[1.5,7,.5],[2.5,6,.75]],
  [[0,8,.5],[.75,9,.25],[1,8,.5],[2,6,.75]], [[0,7,2.5]],
  [[0,2,1.5],[2,3,.5],[3,4,.75]], [[0,5,1.5],[2,6,.5],[3,7,.75]],
  [[0,6,.75],[1,5,.5],[2,4,1.5]], [[0,2,1.5],[2,0,1.5]],
  [[0,3,1],[1.5,4,1.5]], [[0,5,1],[1.5,4,.5],[2.5,3,1]],
  [[0,2,.75],[1,1,.5],[2,0,1.5]], [[0,-1,.75],[1,1,.5],[2,0,1.5]],
  [[0,11,.75],[1,10,.5],[2,9,.5],[3,8,.5]], [[0,7,1],[1.5,9,.5],[2.5,11,1]],
  [[0,12,.75],[1,11,.5],[2,10,.5],[3,9,.5]], [[0,8,.5],[.75,9,.25],[1,7,2]],
  [[0,10,.75],[1,9,.5],[2,8,.5],[3,9,.5]], [[0,8,.5],[1,7,.75],[2,6,.5],[3,8,.5]],
  [[0,9,.5],[.75,8,.25],[1,7,.75],[2,6,.5],[3,8,.5]], [[0,7,2.5],[3.5,6,.3]],
 ],
 'sun-serpent':[
  [[0,4,.65],[1,2,.4],[1.5,1,.4],[2,0,.75]], [[0,0,1.25],[1.5,1,.4],[2,2,.75]],
  [[0,3,.75],[1,2,.4],[1.5,1,.5]], [[0,2,.4],[.5,1,.4],[1.5,0,1]],
  [[0,3,1],[1.5,4,1]], [[0,5,.65],[1,4,.4],[1.5,3,1]],
  [[0,2,.65],[1,1,.4],[1.5,-1,.5]], [[0,0,2.4]],
  [[0,7,1],[1.5,9,.5],[2.25,10,.5]], [[0,11,1.25],[1.5,10,.4],[2,9,.65]],
  [[0,10,.65],[1,9,.4],[1.5,8,1]], [[0,9,.4],[.5,8,.4],[1.5,7,1]],
  [[0,10,1],[1.5,11,.75]], [[0,12,.65],[1,11,.4],[1.5,10,1]],
  [[0,9,.5],[.75,8,.25],[1,7,.5],[2,6,.75]], [[0,7,2.4]],
  [], [],
  [[0,3,1.25],[1.5,2,1]], [[0,1,2.4]],
  [[0,3,1],[1.5,4,1]], [[0,5,.75],[1,4,.5],[2,3,.75]],
  [[0,2,1.25],[1.5,1,1]], [[0,0,2.4]],
  [[0,4,.65],[1,2,.4],[1.5,1,.4],[2,0,.75]], [[0,2,.65],[1,3,.4],[1.5,4,1]],
  [[0,5,.75],[1,4,.5],[2,3,.75]], [[0,2,.4],[.5,1,.4],[1.5,0,1]],
  [[0,3,1],[1.5,2,.75]], [[0,1,.65],[1,2,.4],[1.5,1,.5]],
  [[0,-1,.5],[.75,1,.25],[1,2,.5],[2,1,.5]], [[0,0,2.5]],
 ],
};
const leads:Record<Region,readonly Instrument[]>={
 namar:['reed','reed','lute','reed'],sunpalace:['reed','lute','reed','reed'],
 skywalk:['lute','lute','reed','lute'],observatory:['reed','bell','strings','reed'],
 'desert-battle':['reed','reed','strings','reed'],'sun-serpent':['brass','reed','strings','brass'],
};
const replies:Partial<Record<Region,Readonly<Record<number,Phrase>>>>={
 namar:{7:[[2.75,2,.35],[3.25,1,.35]],15:[[3,2,.35],[3.5,0,.35]],23:[[.5,2,1],[2,1,.5],[3,0,.65]]},
 sunpalace:{3:[[2.5,2,.35]],7:[[2.5,1,.35]],15:[[2.5,2,.35]],23:[[2.5,6,.35]]},
 skywalk:{7:[[.5,2,1],[2,1,.5],[3,0,.65]],19:[[.5,5,1],[2,4,1.5]],31:[[2.75,2,.35],[3.25,0,.5]]},
 observatory:{3:[[3,4,2]],7:[[3,2,2]],15:[[3,4,1.5]],23:[[1,2,2]],27:[[1,1,2]]},
 'desert-battle':{15:[[3,2,.65]],23:[[3.5,2,.35]]},
 'sun-serpent':{7:[[2.5,2,.4]],15:[[2.5,9,.4]],23:[[2.5,2,.4]]},
};
const dynamics=[.85,.78,.9,.76,.94,.87,.8,.64,.96,.88,1,.84,.93,.82,.76,.62,.68,.76,.84,.72,.91,.98,.82,.68,1,.9,.96,.82,.91,.83,.74,.6];
// Bass/inner voices dwell on the tonic, fourth and fifth. The lead explores
// and returns to these centres, rather than receiving a new chord every bar.
const roots=[0,0,0,0,3,3,0,0,4,4,4,4,3,3,0,0,0,0,0,0,3,3,0,0,0,0,3,3,4,4,0,0];
// Maqsum's skeleton is D T . T D . T .; Darij stays three quarter beats;
// Malfuf's two-beat D..T..T. cycle runs twice in each rooftop measure.
const rhythms={
 maqsum:[[0,'C2',1],[.5,'G2',.7],[1.5,'G2',.8],[2,'C2',.9],[3,'G2',.8]],
 malfuf:[[0,'C2',1],[.75,'G2',.75],[1.5,'G2',.7],[2,'C2',.9],[2.75,'G2',.75],[3.5,'G2',.7]],
 darij:[[0,'C2',1],[1,'G2',.65],[2,'G2',.75]],
 compound:[[0,'C2',1],[.5,'G2',.65],[1,'G2',.75],[1.5,'C2',.9],[2,'G2',.65],[2.5,'G2',.75]],
}as const;

export function desertBar(mode:DesertMode,bar:number):Note[]{
 if(mode==='outermooring')return gateBar(bar);
 const boss=mode==='sun-serpent',court=mode==='sunpalace',quiet=court||mode==='observatory',fight=boss||mode==='desert-battle';
 const beats=boss||court?3:4,i=((bar-(boss?2:0))%32+32)%32,section=Math.floor(i/8),strength=dynamics[i],out:Note[]=[];
 const scale:Scale=mode==='observatory'?'d':court?(section===2?'c':'f'):section===2?(boss?'d':'g'):'c';
 const tone=(degree:number)=>pitch(scale,degree);
 const add=(instrument:Instrument,p:Pitch,beat:number,duration:number,velocity:number,pan=0)=>{
  const note:Note={instrument,pitch:p,beat,duration,velocity,pan,expression:phrasing(strength,instrument==='strings')};out.push(note);return note;
 };
 if(boss&&bar<2){
  add('timpani',bar?'G2':'C2',0,1.2,.12);
  for(const [k,p]of ['C4','Ed4','G4'].entries())add('strings',p as Pitch,0,2.8,.018,k%2?.3:-.3);
  for(const [beat,degree,hold]of bar?[[0,4,.7],[1,3,.4],[1.5,2,.4],[2,1,.75]]:[[0,4,1],[1.5,2,1]]as Phrase){
   add('brass',pitch('c',degree),beat,hold,.18,-.15).expression=singing('clear',.9,hold);
  }
  for(const beat of [0,1.5])add('hand-drum','C2',beat,.18,.09);
  if(bar)for(const beat of [2,2.5])add('hand-drum','G2',beat,.1,.075,.2);
  return out;
 }
 const lead=leads[mode][section];
 for(const [beat,degree,hold]of melodies[mode][i]){
  const n=add(lead,tone(degree),beat,hold,quiet?.145:lead==='lute'?.205:boss?.2:.19,-.18);
  n.expression=lead==='lute'?phrasing(strength):singing(quiet?'warm':'clear',strength,hold,i%8===7);
  if(lead==='bell')n.expression.release=.8;
  // A few held destinations lean in, settle early, then finish at exact pitch.
  if(lead==='reed'&&hold>=1.5&&[1,11,25].includes(i))n.expression.bend=[[0,-1200/31],[.12,0],[1,0]];
 }
 const answer:Instrument=mode==='skywalk'?'reed':mode==='observatory'?'bell':boss?'reed':'lute';
 for(const [beat,degree,hold]of replies[mode]?.[i]??[]){
  const n=add(answer,tone(degree),beat,hold,quiet?.08:.1,.3);
  n.expression=answer==='lute'?phrasing(strength):singing('clear',strength*.85,hold);
  if(answer==='bell')n.expression.release=.8;
 }
 const root=roots[i],bass=octave(tone(root),-2),fifth=octave(tone(root+4),-2);
 if(quiet){
  if(i%2===0){
   const hold=beats*2-.4;add('round-bass',bass,0,hold,.1);
   if(!(mode==='observatory'&&section===1))for(const [k,d]of [root,root+4].entries())add('strings',octave(tone(d),-1),0,hold,.023,k?.4:-.4);
  }
 }else{
  // Six dry eighths keep the coils moving under the two compound accents.
  // The hunters' bell incursion still has room in the low middle.
  const pattern=boss?section===2?[[0,1.1],[1.5,1.1]]:[[0,.32],[.5,.32],[1,.32],[1.5,.32],[2,.32],[2.5,.32]]:fight?[[0,.8],[1.5,.35],[2,.8],[3.5,.35]]:i%4===3?[[0,3.3]]:[[0,1.65],[2.5,1]];
  for(const [k,[beat,hold]]of pattern.entries())add(boss?'square-bass':'round-bass',boss?(k%3===2?fifth:bass):k%2?fifth:bass,beat,hold,boss?(beat===0||beat===1.5?.17:.1):fight?.15:.12);
  if(section===2||i%4===0)for(const [k,d]of [root,root+4].entries())add('strings',octave(tone(d),-1),0,beats-.3,.02,k?.4:-.4);
 }
 // Single-note oud-like punctuation answers the singer, without block strums.
 if(i%4!==3&&!(mode==='observatory'&&section===1)){
  const positions=quiet?[.5]:boss?[.5,2]:section===2?[1.5]:[1,3];
  for(const [k,beat]of positions.entries())add('lute',tone(root+(k?2:4)),beat,quiet?.9:.45,quiet?.065:.058,.32);
 }
 // The only chromatic quotation: the hunters already heard at the flagship.
 // Leave the local melody silent here so the incursion is unambiguous.
 if((mode==='observatory'||boss)&&i===16){
  add('bell','E5',0,boss?1:1.4,.08,.25).expression!.release=.9;
  add('bell','Eb5',boss?1.5:2,1,.08,.25).expression!.release=.9;
 }
 if((mode==='observatory'||boss)&&i===17)add('bell','A4',boss?.5:1,boss?2:2.5,.08,.25).expression!.release=.9;
 const rhythm=court?rhythms.darij:boss?rhythms.compound:mode==='skywalk'?rhythms.malfuf:rhythms.maqsum;
 const level=mode==='observatory'?.016:court?.035:boss?.155:fight?.11:.07;
 for(const [beat,p,accent]of rhythm){
  // Observatory has only distant cycle markers; cadences shed decoration.
  if(mode==='observatory'&&!(i%2===0&&beat===0)||i%8===7&&p==='G2'&&beat%1!==0)continue;
  add('hand-drum',p,beat,.16,level*accent,p==='G2'?.2:-.1);
 }
 if(!quiet){
  for(let beat=.5;beat<beats;beat+=.5)add('shaker','F#2',beat,.065,boss?.028:fight?.014:.009,.4);
  // Keep the battle's large pulse; the hand drum carries the regional pattern.
  if(fight)for(const beat of boss?[0,1.5]:[0,2])add('kick','C2',beat,.14,boss?.12:.07);
  if(fight&&[0,8,24].includes(i)){add('timpani',bass,0,1,boss?.11:.065);add('cymbal','C2',0,1,boss?.04:.02,.3);}
  if(i%8===6)for(const beat of boss?[2.25,2.5]:[3.25,3.5])add('hand-drum','G2',beat,.08,level*.45,.2);
  if(boss&&i%8===7)for(const beat of [2.25,2.5,2.75])add('hand-drum','G2',beat,.08,level*.55,.2);
 }
 return out;
}
