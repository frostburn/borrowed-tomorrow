import {CHARACTERS} from './characters';
import {SAY} from './dialogue';
import type {StoryHost} from './story-host';
import {BASE_STATS} from '../rules/progression';
import {maxHp,type GameState,type HeroId} from '../rules/state';
import {abilityFor} from '../rules/skills';
import {IMPROVEMENTS,buyImprovement,improved,improvementProblem,improvementUnlocked,maxFocus,serviceAvailable,type Improvement,type ImprovementService} from '../rules/improvements';

export function improvementEffect(s:GameState,i:Improvement):string {
 const owned=improved(s,i.id);
 switch(i.effect){
  case 'hp':{const before=maxHp(i.hero,s)-(owned?12:0);return `Max HP ${before} → ${before+12}`;}
  case 'focus':return 'Max focus 6 → 7';
  case 'movement':return `Combat movement ${BASE_STATS.orrin.movement} → ${BASE_STATS.orrin.movement+1}`;
  case 'bash':return 'Shield bash also grants Petra 4 Guard. Keeps a stronger existing barrier; does not stack.';
  case 'heal':{const range=abilityFor({kind:'celia',skills:s.skills.celia},'heal').range;return `Heal range ${range} → ${range+1}. Does not change team attacks.`;}
  case 'terrain':return 'Shallow water and broken ice cost Kit 1 movement instead of 2. Hazard damage still applies.';
  case 'barrier':return 'Nell starts each battle with 8 Guard. Does not regenerate during battle.';
 }
}
const hosts:Record<ImprovementService,string>={training:'Alda',hammerplain:'Hester',dawnwatch:'Enna',windmere:'Sera',iria:'Tavi',capital:'Orrin'};
const offers:Record<ImprovementService,string>={
 training:'The crew runs endurance and concentration drills on the survey deck. Each course is a single payment for one person.',
 hammerplain:'The street engines are running. I can spare the bench to counterbalance that lance now.',
 dawnwatch:'Stay for a drill, Petra. I can help you bring the shield back into guard after a shove.',
 windmere:'We can calibrate your focus on the long ward. You’ll be able to reach a patient farther away.',
 iria:'Nell’s in good hands. Come on, Kit. I’ll show you how the river couriers keep their footing on those crossings.',
 capital:'There’s enough brass here to reinforce your lantern housing. I can fit a shutter that catches the first blow.',
};
/** Shared dialogue UI: short lists, exact effects, a separate confirmation. */
export function offerImprovements(h:StoryHost,service:ImprovementService,hero?:HeroId):void {
 const s=h.state,who=hosts[service];
 if(!serviceAvailable(s,service))return;
 if(service==='training'&&!hero){
  h.talk({lines:[SAY(who,`${offers[service]} You have ${s.coins} marks.`)],choices:[
   ...s.party.filter(p=>p.id!=='nell'||!s.flags.nellLost).map(p=>({label:`Train ${CHARACTERS[p.id].name}`,disabled:improved(s,`hp-${p.id}`)&&improved(s,`focus-${p.id}`)||p.id==='nell'&&!!s.flags.nellIll&&!s.flags.nellRecovered,action:()=>offerImprovements(h,service,p.id)})),
   {label:'Leave training',action:()=>{}},
  ]});return;
 }
 const choices=IMPROVEMENTS.filter(i=>i.service===service&&(!hero||i.hero===hero)&&improvementUnlocked(s,i));
 h.talk({lines:[SAY(who,offers[service]),SAY('Permanent improvements',`${s.coins} marks. Improvements stay with the character. Training does not restore HP or focus.`),...choices.map(i=>SAY('Permanent improvement',`${CHARACTERS[i.hero].name} · ${i.name}: ${improvementEffect(s,i)}`))],choices:[
  ...choices.map(i=>{const problem=improvementProblem(s,i);return {label:`${i.name} · ${problem==='Completed'?'Completed':`${i.cost} marks${problem?` · ${problem}`:''}`}`,disabled:!!problem,action:()=>h.talk({lines:[SAY('Confirm improvement',`${CHARACTERS[i.hero].name} — ${improvementEffect(s,i)} Pay ${i.cost} marks? ${s.coins} → ${s.coins-i.cost} marks.`)],choices:[
   {label:`Confirm · ${i.cost} marks`,action:()=>{if(buyImprovement(s,i.id)){h.refresh();h.save();h.toast(`${i.name} completed for ${CHARACTERS[i.hero].name}.`);}offerImprovements(h,service,hero);}},
   {label:'Cancel improvement',action:()=>offerImprovements(h,service,hero)},
  ]})};}),
  {label:service==='training'?'Choose another character':'Leave',action:()=>{if(service==='training')offerImprovements(h,service);}},
 ]});
}
export const trainingChoice=(h:StoryHost)=>({label:'Training · permanent improvements',action:()=>offerImprovements(h,'training')});
export const lanternChoice=(h:StoryHost)=>({label:'Reinforce Nell’s lantern · 400 marks',action:()=>offerImprovements(h,'capital')});
export function improvementSummary(s:GameState,hero:HeroId):string[] {
 return IMPROVEMENTS.filter(i=>i.hero===hero&&improved(s,i.id)).map(i=>`${i.name}: ${improvementEffect(s,i)}`);
}
export {maxFocus};
