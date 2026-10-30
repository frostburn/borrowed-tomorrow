import {IMPROVEMENTS,improved} from '../rules/improvements';
import {interactChapter,resumeChapter} from '../content/story';
import {nextChapter} from '../content/chapters';
import {MAPS,visibleObjects,walkable,worldPath} from '../content/maps';
import {ENCOUNTERS} from '../content/encounters';
import type {Dialogue} from '../content/dialogue';
import type {StoryHost} from '../content/story-host';
import {level,remember,setActive,type GameState} from '../rules/state';
import {decodeSave} from '../rules/save';
import {awardVictory,createBattle,type Battle} from '../rules/combat';
import {equipItem,ITEMS,type ItemId} from '../rules/inventory';
import {buySupply,canBuy,shopStock,type ShopId,type SupplyId} from '../rules/supplies';
import type {CompanionId} from '../rules/party';
import {playBattle} from './battle';

/** Build selects formations; skill growth is automatic for every policy. */
export interface AgentOptions {tactics:'legacy'|'defensive'|'cooperative';build:'offense'|'support';spending:'baseline'|'frugal'|'prepared'}
export const baselineAgent:AgentOptions={tactics:'legacy',build:'offense',spending:'baseline'};
export const defaultAgent:AgentOptions={tactics:'defensive',build:'offense',spending:'prepared'};

export const resources=(s:GameState)=>structuredClone({chapter:s.chapter,location:s.location,level:level(s),xp:s.xp,coins:s.coins,bandages:s.bandages,party:s.party,activeParty:s.activeParty,inventory:s.inventory,skills:s.skills,improvements:IMPROVEMENTS.filter(i=>improved(s,i.id)).map(i=>i.id)});
export class CampaignSession{
 readonly state:GameState;
 readonly events:Record<string,unknown>[]=[];
 readonly checkpoints:Record<string,GameState>={};
 /** Exact earned inputs for controlled encounter comparisons; not save data. */
 readonly battleStarts=new Map<string,Battle>();
 readonly battleSaves=new Map<string,GameState>();
 private dialogue?:Dialogue;
 private pendingBattle?:string;
 private pendingCheckpoint?:{name:string;resolve:(accepted:boolean)=>void};
 private shop?:ShopId;
 private readonly host:StoryHost;
 constructor(state:GameState,readonly agent:AgentOptions=baselineAgent){
  this.state=decodeSave(JSON.stringify(state));
  this.host={state:this.state,talk:d=>{if(this.dialogue)throw Error('Overlapping dialogue');this.dialogue=d;this.events.push({event:'dialogue',scene:d.scene?.id,lines:d.lines.map(l=>({who:l.who,text:l.text}))});},commit:(f,j)=>{this.state.flags[f]=true;if(j)remember(this.state,j);},refresh(){},save(){},checkpoint:name=>new Promise<boolean>(resolve=>{
   this.world();this.pendingCheckpoint={name,resolve};this.events.push({event:'checkpoint-prompt',name});
  }),travel:(map,x,y)=>{this.state.location={map,x,y};resumeChapter(this.host);},battle:id=>{if(this.pendingBattle)throw Error('Overlapping battles');this.pendingBattle=id;},shop:id=>{this.shop=id??'station';},boundary(){},toast:message=>this.events.push({event:'message',message}),endingMusic(){}};
 }
 private world(){if(this.dialogue||this.pendingBattle||this.shop||this.pendingCheckpoint)throw Error('Finish the pending dialogue, battle, shop or checkpoint first');}
 private observed(event:string,detail:Record<string,unknown>,action:()=>void){const before=resources(this.state);action();this.events.push({event,...detail,before,after:resources(this.state)});}
 /** Complete linear scenes and real battles, stopping at an explicit choice. */
 settle(){
  for(let n=0;n<50;n++){
   if(this.dialogue){if(this.dialogue.choices)return;const d=this.dialogue;this.dialogue=undefined;this.observed('scene-complete',{scene:d.scene?.id},()=>d.done?.());continue;}
   if(this.pendingBattle){const id=this.pendingBattle;this.pendingBattle=undefined;this.fight(id);continue;}
   return;
  }
  throw Error('Story continuation loop');
 }
 choose(label:string){
  const choice=this.dialogue?.choices?.find(c=>c.label===label&&!c.disabled);if(!choice)throw Error(`Unavailable choice: ${label}`);
  this.dialogue=undefined;this.observed(label.startsWith('Rest')?'rest':'choice',{label},choice.action);this.settle();
 }
 visit(id:string,choice?:string){
  this.world();const s=this.state,map=MAPS[s.location.map],object=visibleObjects(map,s).find(o=>o.id===id);
  if(!object||object.accessFlag&&!s.flags[object.accessFlag])throw Error(`Unavailable interaction: ${map.id}:${id}`);
  const near=Math.abs(object.x-s.location.x)+Math.abs(object.y-s.location.y)<=3;
  const destinations=[object,{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
  const paths=near?[[]]:destinations.filter(p=>walkable(map,p.x,p.y,s)).map(p=>worldPath(map,s.location,p,s)).filter(p=>p.length).sort((a,z)=>a.length-z.length);
  if(!paths.length)throw Error(`Unreachable interaction: ${map.id}:${id}`);
  this.observed('visit',{id,path:paths[0]},()=>{for(const p of paths[0])s.location={map:map.id,...p};interactChapter(this.host,id);});
  this.settle();if(choice)this.choose(choice);
 }
 beginNext(){
  this.world();this.observed('chapter-entry',{},()=>{if(!nextChapter(this.state)?.entry?.begin(this.state))throw Error('No chapter departure available');resumeChapter(this.host);});this.settle();
 }
 /** Re-enter the normal story dispatcher when loading an earned checkpoint. */
 resume(){this.world();resumeChapter(this.host);this.settle();}
 checkpoint(name:string){this.world();this.checkpoints[name]=decodeSave(JSON.stringify(this.state));}
 /** Resolve the player's explicit save confirmation before its async story continuation. */
 async answerCheckpoint(name:string,accepted:boolean){
  const pending=this.pendingCheckpoint;if(!pending||pending.name!==name)throw Error(`No pending checkpoint: ${name}`);
  this.pendingCheckpoint=undefined;
  if(accepted)this.checkpoint(name);
  this.events.push({event:'checkpoint-answer',name,accepted});pending.resolve(accepted);
  await Promise.resolve();this.settle();
 }
 formation(ids:CompanionId[]){
  this.world();const before=structuredClone(this.state.activeParty);
  // Validate on a copy so a rejected formation cannot partially remove fighters.
  const trial=structuredClone(this.state);
  for(const id of before.filter(id=>!ids.includes(id)))if(!setActive(trial,id,false))throw Error(`Cannot remove ${id}`);
  for(const id of ids.filter(id=>!trial.activeParty.includes(id)))if(!setActive(trial,id,true))throw Error(`Cannot add ${id}`);
  if(trial.activeParty.length!==ids.length||!ids.every(id=>trial.activeParty.includes(id)))throw Error('Invalid formation');
  for(const id of before.filter(id=>!ids.includes(id)))setActive(this.state,id,false);
  for(const id of ids.filter(id=>!this.state.activeParty.includes(id)))setActive(this.state,id,true);
  this.events.push({event:'formation',before,after:[...this.state.activeParty]});
 }
 prepare(){
  this.world();const s=this.state;
  // Prefer better bag items without taking gear away from another fighter.
  const rating=(id:ItemId|null)=>id?ITEMS[id].bonuses.attack*3+ITEMS[id].bonuses.armor*2+ITEMS[id].bonuses.speed:0;
  const heroes=[...s.activeParty,...s.party.map(p=>p.id).filter(id=>!s.activeParty.includes(id))];
  for(const hero of heroes)for(const item of (Object.keys(ITEMS)as ItemId[]).sort((a,z)=>rating(z)-rating(a))){
   const old=s.inventory.characters[hero][ITEMS[item].slot];
   if((s.inventory.bag[item]??0)>0&&rating(item)>rating(old)&&equipItem(s.inventory,hero,item))this.events.push({event:'equip',hero,item,previous:old});
  }
 }
 buy(item:SupplyId,count:number){
  if(!this.shop||!Number.isInteger(count)||count<1)throw Error('Open a shop before buying');
  for(let n=0;n<count;n++)this.observed('purchase',{shop:this.shop,item},()=>{if(!buySupply(this.state,item,this.shop))throw Error(`Cannot buy ${item}`);});
 }
 stockUp(){
  if(!this.shop)throw Error('Open a shop before stocking up');
  const prepared=this.agent.spending==='prepared';
  for(const [item,wanted] of [['bandage',prepared?3:2],['field-bandage',prepared?2:1],['focus-tonic',prepared?1:0]]as const){
   const count=()=>item==='bandage'?this.state.bandages:this.state.inventory.bag[item]??0;
   const price=shopStock(this.shop).find(s=>s.id===item)?.cost??Infinity;
   while(count()<wanted&&this.state.coins-price>=32&&canBuy(this.state,item,this.shop))this.buy(item,1);
  }
  if(!prepared)return;
  // Buy only strict improvements for recruited companions, with an emergency
  // purse left over. Equipment remains an ordinary manual inventory action.
  for(const hero of [...this.state.activeParty,...this.state.party.map(p=>p.id).filter(id=>!this.state.activeParty.includes(id))]){
   const rating=(id:ItemId|null)=>id?ITEMS[id].bonuses.attack*3+ITEMS[id].bonuses.armor*5+ITEMS[id].bonuses.speed:0;
   const choices=shopStock(this.shop).filter(s=>s.id in ITEMS).map(s=>({...s,id:s.id as ItemId})).filter(s=>(ITEMS[s.id].heroes as readonly string[]).includes(hero)).sort((a,b)=>rating(b.id)-rating(a.id));
   for(const choice of choices){
    const old=this.state.inventory.characters[hero][ITEMS[choice.id].slot];
    if(rating(choice.id)<=rating(old)||this.state.coins-choice.cost<80||!canBuy(this.state,choice.id,this.shop))continue;
    this.buy(choice.id,1);if(!equipItem(this.state.inventory,hero,choice.id))throw Error('Purchased gear could not be equipped');
    this.events.push({event:'equip',hero,item:choice.id,previous:old});
   }
  }
 }
 closeShop(){if(!this.shop)throw Error('No shop is open');this.shop=undefined;}
 private fight(id:string){
  const definition=ENCOUNTERS[id];if(this.state.flags[definition.flag])throw Error(`Already won: ${id}`);
  if(definition.grounding&&this.state.activeParty.length<2)throw Error('Sealed intake needs two active companions');
  const before=resources(this.state),b=createBattle(id,this.state),turns:Record<string,unknown>[]=[];
  const entry={event:'battle',id,before,turns,result:'running',rounds:0,after:before,groundingOpened:false};this.events.push(entry);
  this.battleStarts.set(id,structuredClone(b));
  this.battleSaves.set(id,structuredClone(this.state));
  // Retain completed turns even if a later planning action throws.
  playBattle(b,this.agent,turn=>turns.push(turn));
  entry.result=b.result??'stalled';entry.rounds=b.round;entry.groundingOpened=b.grounding?.open??false;
  this.events.push({event:'battle-supplies',id,bandagesUsed:this.state.bandages-b.bandages,suppliesLeft:{...b.supplies}});
  if(b.result!=='victory')throw Error(`${id}: ${entry.result}`);
  awardVictory(b,this.state);if(definition.journal)remember(this.state,definition.journal);entry.after=resources(this.state);
  decodeSave(JSON.stringify(this.state));resumeChapter(this.host);
 }
}
