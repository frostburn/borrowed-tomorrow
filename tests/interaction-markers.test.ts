import {expect,it} from 'vitest';
import {MAPS} from '../src/content/maps';
import {INTERACTION_MARKERS,interactionKind,interactionMarker} from '../src/content/interaction-markers';
import {newGame} from '../src/rules/state';

it('gives every authored interaction an explicit purpose with a distinct supported shape',()=>{
 for(const map of Object.values(MAPS))for(const object of map.objects){
  expect(Object.keys(INTERACTION_MARKERS),`${map.id}:${object.id}`).toContain(object.kind);
  if(object.storyUntil)expect(object.kind).toBe('story');
 }
 expect(new Set(Object.values(INTERACTION_MARKERS).map(m=>m.glyph)).size).toBe(4);
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
 s.flags.wardSeen=true;expect(interactionKind(supplies,s)).toBe('optional');expect(interactionMarker(supplies,s)).toBeDefined();
});
