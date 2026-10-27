import {describe,it,expect} from 'vitest';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {readDeparture} from '../src/headless/middle';
import {decideBattle} from '../src/headless/tactics';
import {newGame} from '../src/rules/state';
import {createBattle,cast,active,move,endTurn} from '../src/rules/combat';
import {characterProfiles,defaultBuild,newCharacterSettings} from '../src/rules/characters';
import {offset} from '../src/rules/hex';
import {coastCheckpoint,palaceCheckpoint,brokenCheckpoint} from './support/progress';

describe('headless continuation boundaries',()=>{
 it('preserves every resource and choice in either a report or an exported departure',()=>{
  const original=coastCheckpoint('chapterTwoComplete');original.coins=27;original.bandages=1;original.party[0].hp=17;
  for(const raw of [original,{state:original,report:[]},{status:'complete',state:original}])expect(readDeparture(JSON.stringify(raw))).toEqual(original);
  expect(readDeparture(JSON.stringify(palaceCheckpoint('chapterThreeComplete'))).chapter).toBe('chapter-three');
 });
 it('rejects failed reports, unfinished chapters and malformed saves',()=>{
  for(const raw of [null,{},newGame(),coastCheckpoint('kitJoined'),{status:'failed',state:coastCheckpoint('chapterTwoComplete')}])expect(()=>readDeparture(JSON.stringify(raw))).toThrow();
 });
 it('rejects inaccessible or absent interactions without moving or granting progress',()=>{
  const session=new CampaignSession(coastCheckpoint('chapterTwoComplete'));session.beginNext();const before=structuredClone(session.state);
  expect(()=>session.visit('capital-works')).toThrow('Unavailable interaction');expect(()=>session.visit('works-plan')).toThrow('Unavailable interaction');expect(session.state).toEqual(before);
 });
 it('never partially applies a rejected formation or buys without an open shop',()=>{
  const session=new CampaignSession(coastCheckpoint('chapterTwoComplete')),before=structuredClone(session.state);
  expect(()=>session.formation(['nell','celia'])).toThrow();expect(()=>session.buy('bandage',1)).toThrow();expect(session.state).toEqual(before);
 });
 it('does not move or spend anything while choosing a tactic',()=>{
  const state=coastCheckpoint('chapterTwoComplete'),b=createBattle('capital-arrest',state),before=structuredClone(b);
  expect(decideBattle(b).kind).toMatch(/move|cast|defend/);expect(b).toEqual(before);
 });
 it('ends or moves a team helper without trying another attack or defending',()=>{
  const settings=newCharacterSettings();settings.party=['nell','orrin'];for(const id of settings.party)settings.characters[id]=defaultBuild(id,10);
  const b=createBattle('captain',newGame(),undefined,characterProfiles(settings),settings.party),nell=b.units.find(u=>u.id==='nell')!,orrin=b.units.find(u=>u.id==='orrin')!;
  b.queue=['nell','orrin',...b.units.filter(u=>u.side==='enemy').map(u=>u.id)];
  expect(cast(b,nell,'prism',offset(8,3))).toBe(true);expect(active(b)).toBe(orrin);
  const focus=orrin.focus,decision=decideBattle(b);expect(['move','end']).toContain(decision.kind);
  if(decision.kind==='move')expect(move(b,orrin,decision.hex)).not.toBeNull();else expect(endTurn(b)).toBe(true);
  expect(b.queue).not.toContain('orrin');expect(orrin.focus).toBe(focus);
 });
});

it('keeps the medical budget reserve and cannot buy for an unrecruited companion',()=>{
 const state=brokenCheckpoint('refugeSeen');state.coins=73;
 const session=new CampaignSession(state,defaultAgent);session.visit('refuge-rest','Browse medical supplies and trade gear');
 session.stockUp();session.closeShop();expect(session.state.coins).toBeGreaterThanOrEqual(32);expect(session.state.coins).toBeLessThan(73);
 expect(session.state.inventory.bag['medic-clasp']??0).toBe(0);expect(state.coins).toBe(73);
});
