import {newGame,remember,level,type GameState} from '../rules/state';
import {MAPS,visibleObjects,worldPath} from '../content/maps';
import {resumeChapter,interactChapter} from '../content/story';
import {nextChapter} from '../content/chapters';
import type {StoryHost} from '../content/story-host';
import type {Dialogue} from '../content/dialogue';
import {active,createBattle,awardVictory,cast,damage,legalAim,move,movement,targets,defend,enemyTurn} from '../rules/combat';
import {cells,distance,equal} from '../rules/hex';
import {abilityFor} from '../rules/skills';
import {equipItem,ITEMS} from '../rules/inventory';
import {decodeSave} from '../rules/save';
import {writeFile} from 'node:fs/promises';

export function playEarly(state:GameState,report:unknown[]=[]){
 let dialogue:Dialogue|undefined,battleId:string|undefined;
 const host:StoryHost={state,talk:d=>{dialogue=d;},commit:(f,j)=>{state.flags[f]=true;if(j)remember(state,j);},refresh(){},save(){},checkpoint:async()=>true,travel:(map,x,y)=>{state.location={map,x,y};resumeChapter(host);},battle:id=>{battleId=id;},shop(){throw Error('No purchases in this baseline route');},boundary(){},toast:message=>report.push({message}),endingMusic(){}};
 const settle=()=>{for(let n=0;dialogue&&!dialogue.choices;n++){if(n>30)throw Error('Dialogue loop');const d=dialogue;dialogue=undefined;d.done?.();}};
 const fight=()=>{
  if(!battleId)return;const id=battleId;battleId=undefined;const b=createBattle(id,state),start=structuredClone(state.party);let actions=0;
  while(!b.result&&actions++<600){
   const u=active(b)!;if(u.side==='enemy'){enemyTurn(b);continue;}
   let best:{id:typeof u.abilities[number];aim:typeof u.hex;pos:typeof u.hex;score:number}|undefined;
   const original=u.hex;
   for(const visit of movement(b,u).values()){
    u.hex=visit.hex;
    for(const id of u.abilities)for(const aim of cells()){
     if(!legalAim(b,u,id,aim))continue;const a=abilityFor(u,id);
     const score=targets(b,u,id,aim).reduce((sum,v)=>sum+(a.heal?(v.side===u.side?Math.min(v.maxHp-v.hp,damage(u,v,id))*.85:0):(v.side===u.side?-4:1)*(Math.min(v.hp,damage(u,v,id))+(v.hp<=damage(u,v,id)?10:0))),0)-visit.path.length*.1;
     if(score>0&&(!best||score>best.score))best={id,aim,pos:visit.hex,score};
    }
   }
   u.hex=original;
   if(best){if(!equal(best.pos,original))move(b,u,best.pos);if(!cast(b,u,best.id,best.aim))throw Error('Rejected attack');}
   else{const enemies=b.units.filter(v=>v.side!==u.side&&v.hp>0);const nearest=(h:typeof u.hex)=>Math.min(...enemies.map(v=>distance(h,v.hex)));const step=[...movement(b,u).values()].sort((a,z)=>nearest(a.hex)-nearest(z.hex)||a.cost-z.cost)[0];if(step&&nearest(step.hex)<nearest(u.hex))move(b,u,step.hex);defend(b);}
  }
  report.push({battle:id,result:b.result??'stalled',rounds:b.round,actions,start,end:b.units.filter(u=>u.side==='party').map(u=>({id:u.id,hp:u.hp})),bandagesUsed:state.bandages-b.bandages});
  if(b.result!=='victory')throw Error(`Failed ${id}: ${b.result??'stalled'}`);
  awardVictory(b,state);decodeSave(JSON.stringify(state));
  for(const p of state.party){
   for(const item of Object.keys(ITEMS)as (keyof typeof ITEMS)[])if(state.inventory.bag[item])equipItem(state.inventory,p.id,item);
  }
  resumeChapter(host);settle();
 };
 const visit=(id:string,choice?:string)=>{
  if(dialogue)throw Error('Unresolved choice');const map=MAPS[state.location.map],o=visibleObjects(map,state).find(o=>o.id===id);if(!o)throw Error(`Missing ${id}`);
  const destinations=[o,{x:o.x-1,y:o.y},{x:o.x+1,y:o.y},{x:o.x,y:o.y-1},{x:o.x,y:o.y+1}];
  const paths=destinations.map(to=>({to,path:worldPath(map,state.location,to,state)})).filter(v=>v.path.length||v.to.x===state.location.x&&v.to.y===state.location.y).sort((a,b)=>a.path.length-b.path.length);
  if(!paths.length)throw Error(`Unreachable ${map.id}:${id}`);const path=paths[0];for(const p of path.path)state.location={map:map.id,...p};report.push({visit:id,steps:path.path.length,coins:state.coins,level:level(state)});
  interactChapter(host,id);settle();if(choice){const c=(dialogue as Dialogue|undefined)?.choices?.find(c=>c.label===choice&&!c.disabled);if(!c)throw Error(`Missing choice ${choice}`);dialogue=undefined;c.action();settle();}fight();
 };
 resumeChapter(host);settle();visit('tomas');visit('pursuit');visit('west-yard');visit('orrin');visit('workshop-cache','Clear the shed');visit('branch');visit('collector');visit('release');visit('east-pass');visit('shelter','Rest · restore HP and focus');visit('captain');visit('departure');
 if(!nextChapter(state)?.entry?.begin(state))throw Error('Chapter transition rejected');resumeChapter(host);settle();
 visit('kit-contact');visit('coast-engine','Rest · restore everyone’s HP and focus');visit('loading-gate','Breach the loading gate');visit('prison-coach');visit('coast-ward');visit('ward-siding');visit('siding-collector');visit('siding-release');visit('siding-captain');visit('capital-engine');
 if(!state.flags.chapterTwoComplete)throw Error('Chapter two incomplete');decodeSave(JSON.stringify(state));
}

export async function run(){
 const state=newGame(),report:unknown[]=[];
 try{playEarly(state,report);console.log(JSON.stringify({complete:true,coins:state.coins,level:level(state),bandages:state.bandages,report},null,2));}
 finally{await writeFile(process.env.BT_HEADLESS_REPORT??'/tmp/borrowed-tomorrow-headless.json',JSON.stringify({state,report},null,2));}
}
