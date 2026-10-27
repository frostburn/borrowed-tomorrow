import {it,expect} from 'vitest';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {defaultFive,playFive,readFiveDeparture} from '../src/headless/five';
import {anchorCheckpoint,anchorDeparture} from './support/anchors';
import {arrival} from '../src/content/maps';
import {newGame} from '../src/rules/state';

it('accepts earned Chapter Four departures without replacing their resources',()=>{
 const s=anchorDeparture();s.coins=41;s.bandages=1;s.party[0].hp=18;
 for(const input of [s,{state:s,status:'complete'}])expect(readFiveDeparture(JSON.stringify(input))).toEqual(s);
});
it('accepts between-region ship checkpoints and rejects failed or unsupported inputs',()=>{
 const s=anchorCheckpoint('fleetSighted');
 expect(readFiveDeparture(JSON.stringify({status:'complete',state:s}))).toEqual(s);
 const partial=anchorCheckpoint('coolingSeen');partial.location=arrival('airship','hammerplain');
 for(const bad of [null,{},newGame(),partial,{status:'failed',state:s}])expect(()=>readFiveDeparture(JSON.stringify(bad))).toThrow();
});
it('rejects a repeated or missing regional order before changing the campaign',()=>{
 const s=new CampaignSession(anchorDeparture(),defaultAgent),before=structuredClone(s.state);
 expect(()=>playFive(s,{...defaultFive,order:['hammerplain','hammerplain','windmere']})).toThrow('exactly once');
 expect(s.state).toEqual(before);expect(s.events).toEqual([]);
});
