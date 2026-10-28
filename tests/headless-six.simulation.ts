import {beforeAll,it,expect} from 'vitest';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {defaultSix,playSix,readSixDeparture,type SixOptions} from '../src/headless/six';
import {decodeSave} from '../src/rules/save';
import {ENCOUNTERS} from '../src/content/encounters';
import {improved} from '../src/rules/improvements';

const earned=readSixDeparture(readFileSync('docs/headless/chapter-five-earned.json','utf8'));
/** Optional audit artifacts reuse these tested journeys instead of running them twice. */
function record(name:string,s:CampaignSession,options:SixOptions=defaultSix){
 const dir=process.env.BT_HEADLESS_SIX_REPORTS;if(!dir)return;
 mkdirSync(dir,{recursive:true});const input='docs/headless/chapter-five-earned.json';
 writeFileSync(`${dir}/${name}.json`,JSON.stringify({status:'complete',source:{path:input,sha256:createHash('sha256').update(readFileSync(input)).digest('hex')},agent:s.agent,options,state:s.state,checkpoints:s.checkpoints,events:s.events},null,2)+'\n');
}
let completed:CampaignSession;
beforeAll(async()=>{completed=new CampaignSession(earned,defaultAgent);await playSix(completed);},120000);

function verified(s:CampaignSession,count:number,recovered=true){
 expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
 const battles=s.events.filter(e=>e.event==='battle');expect(battles).toHaveLength(count);expect(new Set(battles.map(e=>e.id)).size).toBe(count);
 for(const b of battles){
  expect(b.result).toBe('victory');
  for(const t of b.turns as {after:{id:string;hp:number}[]}[])expect(t.after.filter(u=>s.state.party.some(p=>p.id===u.id)).every(u=>u.hp>0)).toBe(true);
 }
 const spent=s.events.reduce((sum,e)=>{const a=e.before as {coins?:number}|undefined,b=e.after as {coins?:number}|undefined;return sum+(a?.coins!==undefined&&b?.coins!==undefined?Math.max(0,a.coins-b.coins):0);},0);
 expect(s.state.coins).toBe(earned.coins+battles.reduce((sum,e)=>sum+ENCOUNTERS[e.id as string].coins,0)-spent);
 expect(s.state.flags).toMatchObject({desertSealBroken:true,northSealBroken:true,capitalOpened:true,emperorWon:true,emperorFallen:true});
 expect(s.checkpoints['capital-return'].flags.capitalAssaultCommitted).toBeFalsy();
 if(recovered){
  expect(s.state.boundary).toBe('chapter-seven:hollow-sun');
  expect(s.state.flags).toMatchObject({nellRecovered:true,riverReported:true,capitalMorningLeft:true,capitalReleased:true,chapterSixComplete:true});
  expect(s.state.flags.lightbearerSeen).toBeFalsy();expect(s.state.flags.nellLost).toBeFalsy();
 }else{
  expect(s.state.boundary).toBeNull();expect(s.state.flags).toMatchObject({nellLost:true,lightbearerEnding:true});expect(s.state.party.find(p=>p.id==='nell')!.hp).toBe(0);
  for(const f of ['nellRecovered','capitalAudienceSeen','capitalMorningSeen','capitalMorningLeft','capitalReleased','chapterSixComplete'])expect(s.state.flags[f]).toBeFalsy();
 }
}
it('earns all optional loot, recovers Nell before the desert, and reaches Chapter Seven',()=>{
 verified(completed,14);expect(completed.state.xp).toBe(7005);
 expect(completed.state.flags).toMatchObject({riverCacheWon:true,desertMailSent:true,desertFocusTaken:true,northCacheWon:true,capitalHuntersWon:true,capitalFocusTaken:true});
 const treatment=completed.events.findIndex(e=>e.event==='scene-complete'&&e.scene==='six-river-treatment');
 const desert=completed.events.findIndex(e=>e.event==='battle'&&e.id==='palace-gallery');
 expect(treatment).toBeGreaterThan(-1);expect(treatment).toBeLessThan(desert);
 expect(completed.events.some(e=>e.event==='equip'&&e.item==='palace-focus')).toBe(true);
 const cache=completed.events.find(e=>e.event==='battle'&&e.id==='river-cache')!;expect(cache.rounds).toBeGreaterThan(1);
 record('early-cure',completed);
});
it('resumes earned jungle and pre-capital checkpoints without replaying rewards',async()=>{
 for(const name of ['six-jungle','six-regions']){
  const input=readSixDeparture(JSON.stringify(completed.checkpoints[name])),s=new CampaignSession(input,defaultAgent);await playSix(s);
  expect(s.state).toEqual(completed.state);
  expect(s.events.filter(e=>e.event==='battle')).toHaveLength(name==='six-jungle'?11:4);
 }
},120000);
it('keeps Nell ill through north and desert, then cures her before the recovered capital route',async()=>{
 const s=new CampaignSession(earned,{...defaultAgent,build:'support',spending:'frugal'});
 await playSix(s,{...defaultSix,order:['north','desert','jungle'],palace:'channel',optional:false});verified(s,11);
 for(const name of ['six-north','six-desert']){expect(s.checkpoints[name].flags.nellRecovered).toBeFalsy();expect(s.checkpoints[name].party.find(p=>p.id==='nell')).toMatchObject({hp:1,focus:0});}
 expect(s.state.flags.palaceWaterRoute).toBe(true);expect(s.state.flags.riverCacheWon).toBeFalsy();expect(s.state.flags.northCacheWon).toBeFalsy();expect(s.state.flags.capitalHuntersWon).toBeFalsy();
 record('late-cure',s,{...defaultSix,order:['north','desert','jungle'],palace:'channel',optional:false});
},120000);
it('reaches the terminal uncured ending without a vision, resurrection or Chapter Seven departure',async()=>{
 const s=new CampaignSession(earned,defaultAgent);await playSix(s,{...defaultSix,order:['desert','north'],optional:false});verified(s,10,false);
 expect(s.state.location.map).toBe('laststation');expect(s.state.activeParty).not.toContain('nell');
 record('uncured',s,{...defaultSix,order:['desert','north'],optional:false});
},120000);
it('buys useful permanent improvements through real clerk confirmations with earned money',async()=>{
 const s=new CampaignSession(earned,defaultAgent);await playSix(s,{...defaultSix,improvements:true});verified(s,14);
 for(const id of ['hp-celia','focus-celia','orrin-counterbalance','kit-footing','nell-housing'])expect(improved(s.state,id)).toBe(true);
 const confirmations=s.events.filter(e=>e.event==='choice'&&String(e.label).startsWith('Confirm ·'));
 expect(confirmations).toHaveLength(5);expect(s.state.coins).toBeGreaterThanOrEqual(80);
 expect(s.events.some(e=>e.event==='choice'&&e.label==='Bring Nell and begin the treatment'&&(e.before as {coins:number}).coins===(e.after as {coins:number}).coins)).toBe(true);
 record('trained',s,{...defaultSix,improvements:true});
},120000);
