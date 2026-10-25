import {expect,it} from 'vitest';
import {MAPS,visibleObjects} from '../src/content/maps';
import {BLOCKED_MARKER_COLOR,INTERACTION_MARKERS,interactionKind,interactionMarker} from '../src/content/interaction-markers';
import {newGame} from '../src/rules/state';
import {MAP_REVIEWS,reviewFlags} from '../src/dev/map-catalog';

it('turns the sent report and the completed capital entrance into conversations',()=>{
 const s=newGame();
 for(const [map,x,y,flag]of [['namar',19,28,'desertMailSent'],['capitalquay',32,19,'emperorWon']]as const){
  const at=()=>visibleObjects(MAPS[map],s).filter(o=>o.x===x&&o.y===y);
  expect(at()).toHaveLength(1);expect(interactionKind(at()[0],s)).toBe(map==='namar'?'optional':'exit');
  s.flags[flag]=true;expect(at()).toHaveLength(1);expect(interactionMarker(at()[0],s)?.glyph).toBe(INTERACTION_MARKERS.talk.glyph);
 }
});

it('gives every authored interaction an explicit purpose with a distinct supported shape',()=>{
 for(const map of Object.values(MAPS))for(const object of map.objects){
  expect(Object.keys(INTERACTION_MARKERS),`${map.id}:${object.id}`).toContain(object.kind);
  if(object.storyUntil)expect(object.kind).toBe('story');
 }
 expect(new Set(Object.values(INTERACTION_MARKERS).map(m=>m.glyph)).size).toBe(5);
 const station=MAPS.station.objects;
 for(const [id,kind]of [['tomas','story'],['iona','optional'],['ansel','talk'],['west-yard','exit']])expect(station.find(o=>o.id===id)?.kind).toBe(kind);
 // A train is a resting place on the coast and an exit at Cinderbank: visual
 // purpose comes from the authored interaction, not an engine/sprite heuristic.
 expect(MAPS.coast.objects.find(o=>o.id==='coast-engine')!.kind).toBe('optional');
 expect(MAPS.cinderbank.objects.find(o=>o.id==='capital-engine')!.kind).toBe('exit');
});
it('changes a finished mechanism to conversation and keeps closed exits distinct',()=>{
 const s=newGame(),wheel=MAPS.coolingworks.objects.find(o=>o.id==='cooling-wheel')!,exit=MAPS.coolingworks.objects.find(o=>o.id==='cooling-forge')!;
 expect(interactionKind(wheel,s)).toBe('story');
 const locked=interactionMarker(exit,s)!;expect(locked.glyph).toBe(INTERACTION_MARKERS.exit.glyph);
 s.flags.coolingOpened=true;
 expect(interactionKind(wheel,s)).toBe('talk');expect(interactionMarker(wheel,s)!.glyph).toBe(INTERACTION_MARKERS.talk.glyph);
 expect(interactionMarker(exit,s)!.color).not.toBe(locked.color);
 const carrier=MAPS.anchorforge.objects.find(o=>o.id==='forge-carrier')!;
 s.flags.furnaceWon=true;expect(interactionMarker(carrier,s)).toBeUndefined();expect(interactionKind(carrier,s)).toBe('talk');
});
it('keeps the ward supplies marked after its arrival scene and rest becomes repeatable',()=>{
 const s=newGame(),supplies=MAPS.infirmary.objects.find(o=>o.id==='ward-rest')!;
 s.flags.wardSeen=true;expect(interactionKind(supplies,s)).toBe('rest');expect(interactionMarker(supplies,s)).toBeDefined();
});

it('shows one cue for Petra and Alban, and distinguishes the blocked mirrored engine',()=>{
 const s=newGame();s.flags.evacuationReady=true;
 const alban=MAPS.cinderbank.objects.find(o=>o.id==='siding-captain')!,petra=MAPS.cinderbank.objects.find(o=>o.id==='siding-alban')!;
 expect(interactionMarker(alban,s)).toBeUndefined();expect(alban.sprite).toBe('alban');
 expect(interactionMarker(petra,s)?.glyph).toBe('!');
 const engine=MAPS.mirrorward.objects.find(o=>o.id==='wind-engine')!,guard=MAPS.mirrorward.objects.find(o=>o.id==='wind-gallery-guard')!;
 expect(interactionMarker(engine,s)).toMatchObject({glyph:'!',color:BLOCKED_MARKER_COLOR});expect(interactionMarker(guard,s)?.glyph).toBe('!');
 s.flags.windGalleryWon=true;expect(interactionMarker(engine,s)?.glyph).toBe('!');expect(interactionMarker(guard,s)).toBeUndefined();
});

it('dims Chapter Two story gates and exits until their actual prerequisites are met',()=>{
 const s=newGame();
 for(const [map,id,flag]of [['coast','loading-gate','kitJoined'],['coast','signal-walk','kitJoined'],['coast','prison-coach','trainRaidWon'],['coast','coast-ward','prisonersFreed'],['cinderbank','capital-engine','recaptureWon']]as const){
  const object=MAPS[map].objects.find(o=>o.id===id)!;
  delete s.flags[flag];const blocked=interactionMarker(object,s)!;
  expect(blocked.color).toBe(BLOCKED_MARKER_COLOR);
  s.flags[flag]=true;const open=interactionMarker(object,s)!;
  expect(open.glyph).toBe(blocked.glyph);expect(open.color).toBe(INTERACTION_MARKERS[object.kind].color);
 }
 s.flags.trainRaidWon=false;s.flags.raidPlanned=true;
 for(const diversion of [false,true]){
  s.flags.raidDiversion=diversion;
  for(const id of ['loading-gate','signal-walk']){
   const marker=interactionMarker(MAPS.coast.objects.find(o=>o.id===id)!,s)!;
   expect(marker.color).toBe((id==='signal-walk')===diversion?INTERACTION_MARKERS.story.color:BLOCKED_MARKER_COLOR);
  }
 }
});

it('dims Chapter Six mechanisms, supplies and exits while their guards or route gates remain',()=>{
 const s=newGame();
 for(const [map,id,flag]of [
  ['skywalk','roof-chest','desertAscentWon'],['canopy','river-chain','riverPatrolWon'],
  ['rainhouse','river-treatment','rainhouseWon'],['frostwatch','north-windlass','northWatchWon'],
  ['glacier','north-hunters','northLogRead'],['canopy','canopy-rainhouse','riverChainOpen'],
  ['frostwatch','watch-glacier','northPassOpened'],['stillcity','city-palace','capitalStreetFreed'],
 ]as const){
  const object=MAPS[map].objects.find(o=>o.id===id)!;s.flags[flag]=false;
  expect(interactionMarker(object,s)?.color,`${map}:${id}`).toBe(BLOCKED_MARKER_COLOR);
  s.flags[flag]=true;expect(interactionMarker(object,s)?.color,`${map}:${id}`).toBe(INTERACTION_MARKERS[object.kind].color);
 }
});

it('shows just the procession marker on Stillwater Avenue, with no stacked release cue',()=>{
 const s=newGame();s.location={map:'stillcity',x:32,y:31};
 const storyCues=()=>visibleObjects(MAPS.stillcity,s).filter(o=>interactionMarker(o,s)?.glyph==='!').map(o=>o.id);
 expect(storyCues()).toEqual(['city-procession']);
 s.flags.capitalProcessionWon=true;expect(storyCues()).toEqual([]);
 s.flags.capitalStreetFreed=true;expect(storyCues()).toEqual([]);
});

it('dims the sealed sanctuary fight and leaves Chapter Four mechanisms to their automatic aftermaths',()=>{
 const s=newGame();
 const warden=MAPS.sanctuary.objects.find(o=>o.id==='sanctuary-warden')!;
 expect(interactionMarker(warden,s)).toMatchObject({glyph:'!',color:BLOCKED_MARKER_COLOR});
 s.flags.signalCut=true;expect(interactionMarker(warden,s)?.color).toBe(INTERACTION_MARKERS.story.color);
 for(const [map,id]of [['breakwater','works-wheel'],['sanctuary','sanctuary-cable']]as const){
  const object=MAPS[map].objects.find(o=>o.id===id)!;
  expect(interactionMarker(object,s)).toBeUndefined();
 }
});

it('greys Chapter Five routes and mechanisms until all their real prerequisites are met',()=>{
 const s=newGame();
 for(const [map,id,flag]of [['airfield','airfield-board','airfieldGuardWon'],['coolingworks','cooling-wheel','forgeApproachWon'],['windmere','wind-transfer','waterLiftOpened'],['windmere','wind-mirrorward','patientsTransferred'],['dispensary','wind-lift-wheel','windLiftWon'],['dispensary','wind-reflector','waterLiftOpened']]as const){
  const s=newGame(),object=MAPS[map].objects.find(o=>o.id===id)!;
  delete s.flags[flag];expect(interactionMarker(object,s)?.color,`${id} closed`).toBe(BLOCKED_MARKER_COLOR);
  s.flags[flag]=true;expect(interactionMarker(object,s)?.color,`${id} open`).toBe(INTERACTION_MARKERS[object.kind].color);
 }
 for(const mortar of [false,true])for(const repeater of [false,true]){
  s.flags.mortarWon=mortar;s.flags.repeaterWon=repeater;
  for(const id of ['watch-wall','watch-coat']){
   const object=MAPS.watchbarracks.objects.find(o=>o.id===id)!;
   expect(interactionMarker(object,s)?.color,id).toBe(mortar&&repeater?INTERACTION_MARKERS[object.kind].color:BLOCKED_MARKER_COLOR);
  }
 }
 const cabin=MAPS.airship.objects.find(o=>o.id==='ship-cabin')!;
 expect(interactionMarker(cabin,s)?.color).toBe(BLOCKED_MARKER_COLOR);
 s.flags.hammerplainComplete=true;expect(interactionMarker(cabin,s)?.color).toBe(BLOCKED_MARKER_COLOR);
 s.flags.windmereComplete=true;expect(interactionMarker(cabin,s)?.color).toBe(INTERACTION_MARKERS.exit.color);
});

it('offers individual marker prerequisites in Maps even when no scenery layer uses them',()=>{
 expect(reviewFlags(MAP_REVIEWS.find(m=>m.id==='windmere')!)).toContain('waterLiftOpened');
 const flags=reviewFlags(MAP_REVIEWS.find(m=>m.id==='watchbarracks')!);
 expect(flags).toContain('mortarWon');expect(flags).toContain('repeaterWon');expect(flags).not.toContain('mortarWon,repeaterWon');
});

it('keeps rest markers persistent while the report diamond becomes a conversation',()=>{
 const s=newGame(),rest=MAPS.namar.objects.find(o=>o.id==='namar-supply')!;
 expect(interactionMarker(rest,s)?.glyph).toBe('⌂');
 expect(interactionKind(rest,s)).toBe('rest');s.flags.desertMailSent=true;
 expect(interactionMarker(rest,s)?.glyph).toBe('⌂');
 expect(visibleObjects(MAPS.namar,s).filter(o=>o.x===19&&o.y===28).map(o=>interactionMarker(o,s)?.glyph)).toEqual(['…']);
});
