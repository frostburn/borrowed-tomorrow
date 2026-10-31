import {describe,it,expect} from 'vitest';
import {active,cast,createBattle,damage,defend,endTurn,enemyTurn,legalAim,move,movement,movementOnly,shape,targets,wait,type Encounter} from '../src/rules/combat';
import {battleAbilities,prepareRelay,teamStatus} from '../src/rules/combat-tactics';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {abilityFor} from '../src/rules/skills';
import {newGame} from '../src/rules/state';
import {add,blast,cells,distance,inside,key,lanternVolley,offset,toPixel} from '../src/rules/hex';
import type {CompanionId} from '../src/rules/party';

const encounter:Encounter={id:'movement-test',name:'Movement',music:'battle',flag:'test',xp:0,coins:0,rocks:[],coordinated:true,enemies:[{kind:'guardian',col:7,row:3,hp:500},{kind:'crow',col:8,row:1,hp:500}]};
function yard(party:CompanionId[]=['nell','orrin','celia']){
 const settings=newCharacterSettings();settings.party=party;for(const id of party)settings.characters[id]=defaultBuild(id,15);
 const b=createBattle(encounter,newGame(),undefined,characterProfiles(settings),party);b.queue=b.units.map(u=>u.id);party.forEach((id,i)=>b.units.find(u=>u.id===id)!.hex=offset(2,[3,4,1][i]));
 return {b,u:b.units[0],partner:b.units[1],third:b.units[2],enemy:b.units.find(u=>u.kind==='guardian')!};
}
describe('remaining movement after a team action',()=>{
 it('keeps the partner at their initiative position without allowing another team attack',()=>{
  const {b,u,partner,third,enemy}=yard();b.queue=[u.id,third.id,partner.id,enemy.id];
  expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.queue).toEqual([third.id,partner.id,enemy.id]);
  expect(teamStatus(b,third,'starline').reason).toBe('Orrin has already used their action this round.');expect(legalAim(b,third,'starline',enemy.hex)).toBe(false);
 });
 it('allows a pinned partner one move after an already-used Bash, with no second attack, Defend, Wait or focus refill',()=>{
  const {b,u,partner,third,enemy}=yard(['kit','petra','celia']);partner.focus=4;partner.bonusUsed=true;partner.pinned=true;partner.retaliated=true;partner.defending=true;
  expect(cast(b,u,'crossfire',enemy.hex)).toBe(true);expect(active(b)).toBe(partner);expect(partner.focus).toBe(1);expect(partner.pinned).toBe(true);expect(partner.retaliated).toBe(true);expect(partner.defending).toBe(false);expect(battleAbilities(b,partner)).toEqual([]);
  for(const id of partner.abilities)expect(legalAim(b,partner,id,enemy.hex),id).toBe(false);
  expect(defend(b)).toBe(false);expect(wait(b)).toBe(false);expect([...movement(b,partner).values()].every(v=>v.cost<=1)).toBe(true);
  const destination=[...movement(b,partner).values()].find(v=>v.path.length)!.hex;
  expect(move(b,partner,destination)).not.toBeNull();expect(partner.hex).toEqual(destination);expect(active(b)).toBe(third);expect(partner.focus).toBe(1);expect(partner.pinned).toBeUndefined();expect(b.queue).not.toContain(partner.id);expect(move(b,partner,u.hex)).toBeNull();
 });
 for(const team of ['crossfire','daybreak']as const)for(const initiates of [false,true])for(const moved of [false,true])for(const rank of [1,2,3])it(`preserves rank ${rank} Bash for ${team} ${initiates?'initiator':'helper'} with movement ${moved?'spent':'unspent'}`,()=>{
  const other=team==='crossfire'?'kit':'celia';
  const {b,enemy}=yard(initiates?['petra',other,'nell']:[other,'petra','nell']);
  const petra=b.units.find(u=>u.kind==='petra')!,caster=active(b)!;
  petra.moved=moved;petra.focus=6;petra.skills!.bash=rank;
  const aim=()=>rank===3?petra.hex:enemy.hex;
  enemy.hex=offset(3,4);petra.hex=offset(2,4);
  expect(cast(b,caster,team,team==='daybreak'?caster.hex:enemy.hex)).toBe(true);
  expect(active(b)).toBe(petra);expect(petra.bonusUsed).toBeFalsy();expect(petra.focus).toBe(3);
  expect(battleAbilities(b,petra)).toEqual(['bash']);
  expect(legalAim(b,petra,'bash',aim())).toBe(true);
  for(const id of petra.abilities.filter(id=>id!=='bash'))expect(legalAim(b,petra,id,enemy.hex),id).toBe(false);
  expect(defend(b)).toBe(false);expect(wait(b)).toBe(false);
  if(!moved){
   const destination=[...movement(b,petra).values()].find(v=>v.path.length===1&&distance(v.hex,enemy.hex)===1)!.hex;
   expect(move(b,petra,destination)).not.toBeNull();expect(active(b)).toBe(petra);
   expect(legalAim(b,petra,'bash',aim())).toBe(true);
  }
  expect(cast(b,petra,'bash',aim())).toBe(true);expect(petra.bonusUsed).toBe(true);expect(petra.focus).toBe(rank===1?2:3);
  expect(active(b)).not.toBe(petra);expect(cast(b,petra,'bash',aim())).toBe(false);
 });
 it('keeps movement after Bash, without refreshing Bash or Daybreak Taunt',()=>{
  const {b,u,partner:petra,enemy}=yard(['celia','petra','nell']);petra.hex=offset(2,4);enemy.hex=offset(3,4);const aim=()=>petra.hex;
  expect(cast(b,u,'daybreak',u.hex)).toBe(true);expect(enemy.tauntedBy).toBe(petra.id);
  expect(cast(b,petra,'bash',aim())).toBe(true);expect(active(b)).toBe(petra);expect(enemy.tauntedBy).toBe(petra.id);
  expect(battleAbilities(b,petra)).toEqual([]);expect(cast(b,petra,'bash',aim())).toBe(false);
  const destination=[...movement(b,petra).values()].find(v=>v.path.length)!.hex;
  expect(move(b,petra,destination)).not.toBeNull();expect(active(b)).not.toBe(petra);expect(enemy.tauntedBy).toBe(petra.id);
 });
 for(const initiates of [false,true])it(`does not restore a used Bash to the ${initiates?'initiator':'helper'}`,()=>{
  const {b,enemy}=yard(initiates?['petra','kit','nell']:['kit','petra','nell']);
  const petra=b.units.find(u=>u.kind==='petra')!;petra.bonusUsed=true;petra.moved=true;
  expect(cast(b,active(b)!,'crossfire',enemy.hex)).toBe(true);expect(b.queue).not.toContain(petra.id);
 });
 it('can skip remaining movement without receiving Defend or focus',()=>{
  const {b,u,partner,third,enemy}=yard();expect(cast(b,u,'prism',enemy.hex)).toBe(true);const hex={...partner.hex},focus=partner.focus;
  expect(endTurn(b)).toBe(true);expect(active(b)).toBe(third);expect(partner.hex).toEqual(hex);expect(partner.focus).toBe(focus);expect(partner.defending).toBe(false);
 });
 for(const state of ['moved','anchored','zero']as const)it(`does not grant another move to a ${state} partner`,()=>{
  const {b,u,partner,enemy}=yard();if(state==='moved')partner.moved=true;if(state==='anchored')partner.anchored=true;if(state==='zero')partner.movement=0;
  expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.queue).not.toContain(partner.id);
 });
 it('refreshes movement across rounds even when the partner has not reached their new main turn',()=>{
  const {b,u,partner,enemy}=yard();u.moved=partner.moved=true;b.queue=[enemy.id];defend(b);expect(active(b)).toBe(u);expect(partner.moved).toBe(false);
  expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.queue).toContain(partner.id);expect(movementOnly(b,partner)).toBe(true);
 });
 it('waits for the last remaining move before round-end hazards, then restores normal actions next round',()=>{
  const {b,u,partner,enemy}=yard();b.queue=[u.id,partner.id];const round=b.round;expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.round).toBe(round);
  const destination=offset(3,4),hp=partner.hp;b.vents.add(key(destination));expect(move(b,partner,destination)).not.toBeNull();expect(b.round).toBe(round+1);expect(partner.hp).toBe(hp-6);expect(movementOnly(b,partner)).toBe(false);expect(partner.moved).toBe(false);expect(teamStatus(b,u,'prism').partner).toBe(partner);
 });
 it('lets an enemy relay partner reposition without firing or defending again',()=>{
  const {b,u,enemy}=yard(),crow=b.units.find(u=>u.kind==='crow')!;b.round=2;b.queue=[crow.id,enemy.id,u.id];prepareRelay(b);expect(cast(b,crow,'relay',crow.hex)).toBe(true);expect(active(b)).toBe(enemy);
  const hp=u.hp,focus=enemy.focus,start=distance(enemy.hex,u.hex),calls:string[]=[];expect(enemyTurn(b,undefined,id=>calls.push(id))).toBeUndefined();
  expect(distance(enemy.hex,u.hex)).toBeLessThan(start);expect(u.hp).toBe(hp);expect(enemy.focus).toBe(focus);expect(enemy.defending).toBe(false);expect(calls).toEqual([]);expect(active(b)).toBe(u);
 });
 it('does not defer victory for unused partner movement',()=>{
  const {b,u,partner,enemy}=yard();b.units=b.units.filter(v=>v.side==='party'||v===enemy);enemy.hp=1;expect(cast(b,u,'prism',enemy.hex)).toBe(true);expect(b.result).toBe('victory');expect(move(b,partner,offset(3,4))).toBeNull();
 });
});
describe('Lantern volley stencil',()=>{
 for(const first of ['nell','kit']as const)for(const rank of [1,2,3])it(`uses Pinning shot rank ${rank} for preview, hits and fixtures when ${first} initiates`,()=>{
  const {b,u,partner,third,enemy}=yard([first,first==='nell'?'kit':'nell','celia']),aim=offset(5,3),crow=b.units.find(u=>u.kind==='crow')!;
  const kit=b.units.find(u=>u.kind==='kit')!,nell=b.units.find(u=>u.kind==='nell')!;kit.skills!.pin=rank;u.hex=offset(3,3);partner.hex=offset(0,6);enemy.hex=aim;crow.hex=add(aim,{q:2,r:-1});third.hex=add(aim,{q:-1,r:0});
  b.fixtures=[{id:'valve',name:'Valve',kind:'valve',hex:add(aim,{q:0,r:2}),hp:999,maxHp:999,vents:[offset(0,0)]}];b.vents.add(key(offset(0,0)));
  const area=shape(b,u,'lanternvolley',aim);expect(area).toHaveLength([7,10,12][rank-1]);
  if(rank===1)expect(area).toEqual(blast(aim));
  for(const burst of [1,3]){nell.skills!.burst=burst;expect(shape(b,u,'lanternvolley',aim)).toEqual(area);}
  expect(abilityFor(u,'lanternvolley',partner).description).toContain(`${area.length} hexes`);
  expect(targets(b,u,'lanternvolley',aim)).toEqual(rank===1?[enemy]:[enemy,crow]);
  const hp=[enemy.hp,crow.hp,third.hp],predicted=damage(u,enemy,'lanternvolley',partner);
  expect(cast(b,u,'lanternvolley',aim)).toBe(true);expect(hp[0]-enemy.hp).toBe(predicted);expect(third.hp).toBe(hp[2]);expect(crow.hp<hp[1]).toBe(rank>=2);expect(crow.pinned).toBeUndefined();
  expect(b.fixtures[0].bursts??0).toBe(rank===3?1:0);expect(b.vents.has(key(offset(0,0)))).toBe(true);
  expect(teamStatus(b,u,'lanternvolley').partner).toBeUndefined();expect(shape(b,u,'lanternvolley',aim)).toEqual(area);
 });
 it('matches the supplied 3/4/3/2 rows relative to the cursor on either row parity',()=>{
  for(const aim of [offset(4,2),offset(4,3)]){
   const origin=toPixel(aim),area=lanternVolley(aim,3);expect(area).toHaveLength(12);
   const rows=[-1,0,1,2].map(dy=>area.map(toPixel).filter(p=>(p.y-origin.y)/54===dy).map(p=>(p.x-origin.x)/60).sort((a,z)=>a-z));
   expect(rows).toEqual([[-.5,.5,1.5],[-1,0,1,2],[-.5,.5,1.5],[0,1]]);expect(area).toContainEqual(aim);
  }
 });
 it('clips at the board edges without duplicating contacts or changing its anchor',()=>{
  for(const aim of cells())for(const rank of [1,2,3]){const area=lanternVolley(aim,rank);expect(area.every(inside)).toBe(true);expect(new Set(area.map(key)).size).toBe(area.length);expect(area).toContainEqual(aim);expect(area.length).toBeLessThanOrEqual([7,10,12][rank-1]);if(rank>1)expect(area).toEqual(expect.arrayContaining(lanternVolley(aim,rank-1)));}
 });
 it('hits the newly covered outer hexes and multi-contact enemies once, while leaving allies unharmed',()=>{
  const {b,u,partner,third,enemy}=yard(['nell','kit','celia']),aim=offset(5,3),crow=b.units.find(u=>u.kind==='crow')!;enemy.hex=aim;enemy.footprint=[{q:0,r:0},{q:1,r:0}];crow.hex=add(aim,{q:0,r:2});third.hex=add(aim,{q:2,r:0});
  b.fixtures=[{id:'valve',name:'Valve',kind:'valve',hex:add(aim,{q:2,r:-1}),hp:999,maxHp:999,vents:[offset(0,0)]}];b.vents.add(key(offset(0,0)));
  const hits=targets(b,u,'lanternvolley',aim),hp=[enemy.hp,crow.hp,third.hp],predicted=[damage(u,enemy,'lanternvolley',partner),damage(u,crow,'lanternvolley',partner)];
  expect(shape(b,u,'lanternvolley',aim)).toEqual(lanternVolley(aim,3));expect(hits).toEqual([enemy,crow]);expect(cast(b,u,'lanternvolley',aim)).toBe(true);
  expect([hp[0]-enemy.hp,hp[1]-crow.hp]).toEqual(predicted);expect(third.hp).toBe(hp[2]);expect(b.fixtures[0].bursts).toBe(1);expect(b.vents.has(key(offset(0,0)))).toBe(true);
 });
});
