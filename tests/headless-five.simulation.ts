import {beforeAll,it,expect} from 'vitest';
import {newGame,SIXTH_CHAPTER,type GameState} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {ownedCopies} from '../src/rules/inventory';
import {playEarly} from '../src/headless/run';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {playMiddle} from '../src/headless/middle';
import {defaultFive,playFive,readFiveDeparture,type Region} from '../src/headless/five';

let earned:GameState;
beforeAll(()=>{
 const start=newGame();playEarly(start);
 const middle=new CampaignSession(start,defaultAgent);playMiddle(middle);earned=middle.state;
 expect(earned).toMatchObject({chapter:'chapter-four',boundary:'chapter-five:anchors',xp:1355,coins:386});
},90000);
function complete(s:CampaignSession,optional=true){
 expect(s.state).toMatchObject({chapter:'chapter-five',boundary:SIXTH_CHAPTER,xp:optional?3475:3400,flags:{hammerplainComplete:true,dawnwatchComplete:true,windmereComplete:true,emperorOfferTold:true,allAnchorsSeen:true,flagshipWon:true,benefactorClaimSeen:true,albanDestroyed:true,flagshipDestroyed:true,nellIll:true,retaliationWon:true,chapterFiveComplete:true}});
 expect(s.state.activeParty).toHaveLength(3);expect(s.state.activeParty).not.toContain('nell');expect(s.state.activeParty).toContain('kit');
 expect(s.state.party.find(u=>u.id==='nell')).toMatchObject({hp:1,focus:0});expect(s.state.party).toHaveLength(5);
 expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
 const battles=s.events.filter(e=>e.event==='battle');expect(battles.every(e=>e.result==='victory')).toBe(true);
 for(const b of battles)for(const t of b.turns as {after:{id:string;hp:number}[]}[])expect(t.after.filter(u=>s.state.party.some(p=>p.id===u.id)).every(u=>u.hp>0)).toBe(true);
}
const orders:Region[][]=[['hammerplain','dawnwatch','windmere'],['hammerplain','windmere','dawnwatch'],['dawnwatch','hammerplain','windmere'],['dawnwatch','windmere','hammerplain'],['windmere','hammerplain','dawnwatch'],['windmere','dawnwatch','hammerplain']];
for(const order of orders)it(`earns Chapter Five in ${order.join(' / ')} order`,()=>{
 const before=structuredClone(earned),s=new CampaignSession(earned,defaultAgent);playFive(s,{...defaultFive,order});
 expect(earned).toEqual(before);complete(s);expect(s.events.filter(e=>e.event==='battle')).toHaveLength(12);
 for(const item of ['forge-valve','shield-brace','ward-focus','opal-reflector','fleet-sight','heat-coat','field-coat']as const)expect(ownedCopies(s.state.inventory,item)).toBe(1);
 expect(s.events.some(e=>e.event==='equip'&&e.item==='fleet-sight')).toBe(true);
},90000);

it('resumes earned regional and pre-finale saves without replaying rewards',()=>{
 const uninterrupted=new CampaignSession(earned,defaultAgent);playFive(uninterrupted);
 for(const name of ['five-hammerplain','five-regions']){
  const input=readFiveDeparture(JSON.stringify({status:'complete',state:uninterrupted.checkpoints[name]}));
  const split=new CampaignSession(input,defaultAgent);playFive(split);
  expect(split.state).toEqual(uninterrupted.state);
  const ids=split.events.filter(e=>e.event==='battle').map(e=>e.id);
  expect(ids).toHaveLength(name==='five-regions'?2:8);
  if(name==='five-regions')expect(ids).toEqual(['alban-flagship','benefactor-retaliation']);
 }
},90000);

it('finishes the race/repeater alternatives without optional loot on a support/frugal policy',()=>{
 const s=new CampaignSession(earned,{...defaultAgent,build:'support',spending:'frugal'});
 playFive(s,{...defaultFive,order:['windmere','dawnwatch','hammerplain'],forge:'race',firstGun:'repeater',optional:false});
 complete(s,false);expect(s.events.filter(e=>e.event==='battle')).toHaveLength(11);
 expect(s.state.flags.forgeStoresWon).toBeUndefined();expect(s.state.flags.watchCoatTaken).toBeUndefined();expect(s.state.flags.windReflectorTaken).toBeUndefined();
 expect(s.state.flags.forgeFlooded).toBe(true);
 const ids=s.events.filter(e=>e.event==='battle').map(e=>e.id);expect(ids).toContain('hammer-race');expect(ids).toContain('dawn-repeater-first');expect(ids).toContain('dawn-mortar-last');
},90000);
