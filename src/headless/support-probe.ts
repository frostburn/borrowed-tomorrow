import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import {resolve} from 'node:path';
import {ABILITIES,type Battle} from '../rules/combat';
import {CampaignSession,defaultAgent,type AgentOptions} from './campaign';
import {playBattle} from './battle';
import {defaultMiddle,playMiddle,readDeparture} from './middle';

/** Utilities suppressed only on disposable probe copies. Learned ranks,
 * equipment, opponents, initiative, HP, focus and stock stay identical. */
export function probeInput(source:Battle,mode:string){
 const b=structuredClone(source);
 if(mode==='without-utilities'||mode==='without-teams')for(const u of b.units.filter(u=>u.side==='party'))u.abilities=u.abilities.filter(id=>{
  const a=ABILITIES[id];
  return mode==='without-teams'?!a.team:a.item||id!=='daybreak'&&!['weaken','guard','taunt','focus','shove','pin'].includes(a.effect??'');
 });
 return b;
}
export function battleMetrics(b:Battle,turns:ReturnType<typeof playBattle>){
 const ids=new Set(b.units.filter(u=>u.side==='party').map(u=>u.id));
 const abilities:Record<string,number>={},items:Record<string,number>={};
 let hpLost=0,healed=0,knockouts=0,minHp=Math.min(...b.units.filter(u=>ids.has(u.id)).map(u=>u.hp));
 for(const t of turns){
  const id=t.decision.kind==='cast'?t.decision.ability:undefined;
  if(id&&ids.has(t.actor)){abilities[id]=(abilities[id]??0)+1;if(ABILITIES[id]?.item)items[id]=(items[id]??0)+1;}
  for(const p of t.before.filter(u=>ids.has(u.id))){
   const after=t.after.find(u=>u.id===p.id)!;
   hpLost+=Math.max(0,p.hp-after.hp);healed+=Math.max(0,after.hp-p.hp);minHp=Math.min(minHp,after.hp);
   if(p.hp>0&&after.hp===0)knockouts++;
  }
 }
 return {result:b.result??'stalled',rounds:b.round,hpLost,healed,knockouts,minHp,abilities,items,remaining:{bandages:b.bandages,...b.supplies}};
}
export async function run(){
 const {values}=parseArgs({options:{from:{type:'string'},output:{type:'string'}}});
 if(!values.from)throw Error('Pass --from <earned Chapter Two departure report>');
 const from=resolve(values.from),output=resolve(values.output??'/tmp/borrowed-tomorrow-support.json');
 if(from===output)throw Error('Preserve the earned input checkpoint');
 const raw=await readFile(from,'utf8'),state=readDeparture(raw);
 if(state.chapter!=='chapter-two')throw Error('The support probe starts at the Chapter Two departure');
 const agent:AgentOptions={...defaultAgent,tactics:'defensive',build:'support',spending:'prepared'},session=new CampaignSession(state,agent);
 playMiddle(session,defaultMiddle);
 const modes=['defensive','cooperative','without-utilities','without-teams'],comparisons=[];
 const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v,(_k,x)=>x instanceof Set?[...x].sort():x)).digest('hex');
 // Earn every input once; replay identical fight starts instead of comparing
 // different formations or the inventory left by divergent earlier tactics.
 for(const id of ['capital-arrest','works-dry','sanctuary-warden']){
  const initial=session.battleStarts.get(id)!,results=[];
  for(const mode of modes){
   console.log(`Probing ${id}: ${mode}`);
   const b=probeInput(initial,mode),turns=playBattle(b,{...agent,tactics:mode==='defensive'?'defensive':'cooperative'});
   const metrics=battleMetrics(b,turns);results.push({mode,...metrics});
   if(metrics.result!=='victory')process.exitCode=1;
  }
  comparisons.push({id,inputSha256:digest(initial),formation:initial.units.filter(u=>u.side==='party').map(u=>({id:u.id,level:u.level,skills:u.skills,hp:u.hp,focus:u.focus,bonus:u.bonus,armor:u.armor,hex:u.hex})),results});
 }
 const report={policy:'support-probe-v1',source:{sha256:createHash('sha256').update(raw).digest('hex')},route:defaultMiddle,agent,comparisons};
 await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log(`Controlled support comparison: ${output}`);
}
