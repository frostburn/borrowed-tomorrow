import {beforeAll,it,expect} from 'vitest';
import {newGame,type GameState} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {playEarly} from '../src/headless/run';
import {CampaignSession,resources,defaultAgent} from '../src/headless/campaign';
import {defaultMiddle,playMiddle,readDeparture} from '../src/headless/middle';

let earned:GameState;
beforeAll(()=>{
 earned=newGame();playEarly(earned);
 expect(earned).toMatchObject({chapter:'chapter-two',boundary:'chapter-three:capital',coins:250,bandages:1,flags:{chapterTwoComplete:true}});
},30000);

for(const conduit of ['feeds','pressure']as const)for(const harbor of ['dry','wet']as const)it(`earns both middle chapters from the early simulation: ${conduit}/${harbor}`,()=>{
 const before=structuredClone(earned),s=new CampaignSession(earned);playMiddle(s,{...defaultMiddle,conduit,harbor});
 expect(earned).toEqual(before);expect(s.state).toMatchObject({chapter:'chapter-four',boundary:'chapter-five:anchors',flags:{tomasRescued:true,petraJoined:true,celiaJoined:true,extractionStopped:true,harborOpened:true,signalCut:true,anchorsKnown:true,chapterFourComplete:true}});
 expect(s.state.party).toHaveLength(5);expect(s.state.activeParty).toEqual(['nell','celia','petra']);expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
 const battles=s.events.filter(e=>e.event==='battle');expect(battles.map(b=>b.id)).toEqual(['capital-arrest','works-warden','palace-stores',`heart-${conduit}`,'works-survey',`works-${harbor}`,'sanctuary-road','sanctuary-warden']);expect(battles.every(b=>b.result==='victory')).toBe(true);
 if(conduit==='feeds')expect(battles.find(b=>b.id==='heart-feeds')!.groundingOpened).toBe(true);
 expect(s.events.filter(e=>e.event==='rest')).toHaveLength(4);expect(s.events.filter(e=>e.event==='purchase')).toHaveLength(3);
 expect(s.state.coins).toBe(earned.coins+Object.values({arrest:48,warden:58,stores:36,heart:80,survey:38,gate:68,road:72,final:108}).reduce((a,z)=>a+z,0)-16-50);
 for(const b of battles)expect((b.turns as {after:{hp:number}[]}[]).length).toBeLessThan(600);
 expect(s.state.journal).toEqual(expect.arrayContaining(['warden','heartGuard','worksClear','roadClear','wardenFallen']));
},30000);

it('resuming the earned Chapter Three departure gives the same Chapter Four result',()=>{
 const uninterrupted=new CampaignSession(earned);playMiddle(uninterrupted);
 const split=new CampaignSession(earned);playMiddle(split,{...defaultMiddle,through:3});
 const restored=readDeparture(JSON.stringify({status:'complete',state:split.state}));expect(restored).toEqual(uninterrupted.checkpoints['chapter-three']);
 const continued=new CampaignSession(restored);playMiddle(continued);
 expect(continued.state).toEqual(uninterrupted.state);expect(resources(restored)).toEqual(resources(split.state));
},30000);

it('can finish without the optional Chapter Three/Four patrol rewards',()=>{
 const s=new CampaignSession(earned);playMiddle(s,{...defaultMiddle,optional:false,conduit:'pressure',harbor:'wet'});
 expect(s.state.flags.chapterFourComplete).toBe(true);expect(s.state.flags.palaceStoresWon).toBeUndefined();expect(s.state.flags.worksStoresWon).toBeUndefined();
 expect(s.events.filter(e=>e.event==='battle')).toHaveLength(6);
},30000);

for(const build of ['offense','support']as const)it(`defensive ${build} policy earns the departure using its budget and formation`,()=>{
 const s=new CampaignSession(earned,{...defaultAgent,build,spending:build==='support'?'frugal':'prepared'});
 playMiddle(s,{...defaultMiddle,conduit:build==='support'?'pressure':'feeds',harbor:build==='support'?'wet':'dry'});
 expect(s.state.flags.chapterFourComplete).toBe(true);expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
 const battles=s.events.filter(e=>e.event==='battle');expect(battles.every(e=>e.result==='victory')).toBe(true);
 const warden=battles.find(b=>b.id==='sanctuary-warden')!;
 const attacks=(warden.turns as {actor:string;round:number;decision:{ability?:string}}[]).filter(t=>t.actor==='guardian-0'&&t.decision.ability==='steam');
 expect(attacks.length).toBeGreaterThan(0);expect(attacks[0].round).toBeLessThanOrEqual(2);
 const casts=battles.flatMap(e=>(e.turns as {actor:string;decision:{ability?:string}}[]).filter(t=>s.state.party.some(p=>p.id===t.actor)).map(t=>t.decision.ability));
 expect(casts.some(a=>a==='taunt'||a==='daybreak'||a==='guard'||a==='sanctuary')).toBe(true);
 if(build==='offense')expect(s.events.some(e=>e.event==='purchase'&&e.item==='insulated-coat')).toBe(true);
},60000);

it('grounding the feeds earns a safer fight without excessive extra rounds',()=>{
 const summaries=(['feeds','pressure']as const).map(conduit=>{
  const s=new CampaignSession(earned,defaultAgent);playMiddle(s,{...defaultMiddle,through:3,conduit});
  const battle=s.events.find(e=>e.event==='battle'&&e.id===`heart-${conduit}`)!;
  let loss=0,knockouts=0;
  for(const t of battle.turns as {before:{id:string;hp:number}[];after:{id:string;hp:number}[]}[])for(const u of t.before.filter(u=>s.state.party.some(p=>p.id===u.id))){
   const after=t.after.find(v=>v.id===u.id)!;loss+=Math.max(0,u.hp-after.hp);if(u.hp>0&&after.hp===0)knockouts++;
  }
  expect(battle.result).toBe('victory');expect(knockouts).toBe(0);
  return {rounds:battle.rounds as number,loss};
 });
 expect(summaries[0].rounds).toBeLessThanOrEqual(summaries[1].rounds+1);
 expect(summaries[0].loss).toBeLessThan(summaries[1].loss);
},30000);
