import {beforeAll,it,expect} from 'vitest';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CampaignSession,defaultAgent,resources} from '../src/headless/campaign';
import {defaultSeven,playSeven,readSevenDeparture,type SevenOptions} from '../src/headless/seven';
import {decodeSave} from '../src/rules/save';
import {ENCOUNTERS} from '../src/content/encounters';
import {ownedCopies} from '../src/rules/inventory';
import {improved} from '../src/rules/improvements';
import type {GameState} from '../src/rules/state';

const input='docs/headless/chapter-six-earned.json',trainedInput='docs/headless/chapter-six-trained-earned.json';
const earned=readSevenDeparture(readFileSync(input,'utf8'));
let completed:CampaignSession;
beforeAll(()=>{completed=new CampaignSession(earned,defaultAgent);playSeven(completed);},180000);
function record(name:string,s:CampaignSession,options:SevenOptions=defaultSeven,from=input){
 const dir=process.env.BT_HEADLESS_SEVEN_REPORTS;if(!dir)return;
 mkdirSync(dir,{recursive:true});
 writeFileSync(`${dir}/${name}.json`,JSON.stringify({version:1,policy:'seven-v1',status:'complete',source:{path:from,sha256:createHash('sha256').update(readFileSync(from)).digest('hex')},agent:s.agent,options,initial:resources(readSevenDeparture(readFileSync(from,'utf8'))),state:s.state,checkpoints:s.checkpoints,battleSaves:Object.fromEntries(s.battleSaves),events:s.events},null,2)+'\n');
}
function verified(s:CampaignSession,start:GameState,count:number){
 expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
 const battles=s.events.filter(e=>e.event==='battle');expect(battles).toHaveLength(count);expect(new Set(battles.map(e=>e.id)).size).toBe(count);
 for(const b of battles){
  expect(b.result).toBe('victory');
  for(const t of b.turns as {after:{id:string;hp:number}[]}[])expect(t.after.filter(u=>s.state.party.some(p=>p.id===u.id)).every(u=>u.hp>0)).toBe(true);
 }
 const spent=s.events.reduce((sum,e)=>{const a=e.before as {coins?:number}|undefined,b=e.after as {coins?:number}|undefined;return sum+(a?.coins!==undefined&&b?.coins!==undefined?Math.max(0,a.coins-b.coins):0);},0);
 expect(s.state.coins).toBe(start.coins+battles.reduce((sum,e)=>sum+ENCOUNTERS[e.id as string].coins,0)-spent);
 expect(s.state.xp).toBe(start.xp+battles.reduce((sum,e)=>sum+ENCOUNTERS[e.id as string].xp,0));
 expect(s.state.flags).toMatchObject({nellRecovered:true,emperorFallen:true,takenPeopleFreed:true,harvestFreed:true,wardPeopleFreed:true,seasonsFreed:true,benefactorBodyWon:true,hollowSunSeen:true,benefactorSunWon:true,fragmentReturned:true,benefactorHeartWon:true,daysReturned:true,homecomingSeen:true,realSeaSeen:true,chapterSevenComplete:true});
 expect(s.state.flags.nellLost).toBeFalsy();expect(s.state.location.map).toBe('seaholiday');expect(s.state.boundary).toBeNull();
 expect(()=>readSevenDeparture(JSON.stringify(s.state))).toThrow('Expected');
 for(const id of ['first-valve','first-focus','open-guard','crossing-coat']as const)expect(ownedCopies(s.state.inventory,id)).toBe(1);
}
it('earns all nine victories and optional fittings, keeps the inherited formation and completes the real holiday',()=>{
 verified(completed,earned,9);expect(completed.state.activeParty).toEqual(earned.activeParty);
 expect(completed.state.flags).toMatchObject({domainReflectorTaken:true,domainPatrolWon:true});
 for(const id of ['morning-reflector','farroad-sight']as const)expect(ownedCopies(completed.state.inventory,id)).toBe(1);
 expect(completed.events.some(e=>e.event==='equip'&&e.item==='morning-reflector')).toBe(true);
 record('default',completed);
});
it('resumes the earned refuge and both form breaks without repeating rewards or changing the outcome',()=>{
 for(const [name,count]of [['seven-refuge',3],['seven-mantle',2],['seven-sun',1]]as const){
  const before=readSevenDeparture(JSON.stringify(completed.checkpoints[name])),s=new CampaignSession(before,defaultAgent);playSeven(s);
  verified(s,before,count);expect(s.state).toEqual(completed.state);
 }
},180000);
it('skips the patrol and reflector and chains the final forms with another party and frugal medicine',()=>{
 const s=new CampaignSession(earned,{...defaultAgent,build:'support',spending:'frugal'}),options:SevenOptions={...defaultSeven,optional:false,restBetweenForms:false,party:['kit','celia','petra']};
 playSeven(s,options);verified(s,earned,8);
 expect(s.state.activeParty).not.toContain('nell');expect(s.state.flags.domainPatrolWon).toBeFalsy();expect(s.state.flags.domainReflectorTaken).toBeFalsy();
 expect(s.events.some(e=>e.event==='visit'&&e.id==='season-rest')).toBe(false);
 const first=s.events.findIndex(e=>e.event==='battle'&&e.id==='benefactor-body');expect(s.events.slice(first).some(e=>e.event==='rest')).toBe(false);
 record('lean',s,options);
},180000);
it('continues earned improvements and buys remaining active-party courses and specialties with real marks',()=>{
 const start=readSevenDeparture(readFileSync(trainedInput,'utf8')),s=new CampaignSession(start,defaultAgent),options={...defaultSeven,improvements:true};
 playSeven(s,options);verified(s,start,9);
 for(const id of ['orrin-counterbalance','hp-celia','focus-celia','kit-footing','nell-housing','celia-sight','hp-nell','hp-orrin','focus-nell','focus-orrin'])expect(improved(s.state,id)).toBe(true);
 const confirmations=s.events.filter(e=>e.event==='choice'&&String(e.label).startsWith('Confirm ·'));
 expect(confirmations).toHaveLength(5);expect(s.state.coins).toBeGreaterThanOrEqual(80);
 record('trained',s,options,trainedInput);
},180000);
