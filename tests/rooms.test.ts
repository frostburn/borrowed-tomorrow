import {expect,it} from 'vitest';
import {ROOMS,MAP_ROOMS,TRACK_ROOMS} from '../src/content/rooms';
import {MAPS} from '../src/content/maps';
import {ARRANGEMENTS} from '../src/game/score';

it('assigns every exploration map and score an explicit, valid acoustic space',()=>{
 expect(Object.keys(MAP_ROOMS).sort()).toEqual(Object.keys(MAPS).sort());
 for(const id of Object.values(MAP_ROOMS))expect(ROOMS[id]).toBeDefined();
 for(const mode of Object.keys(ARRANGEMENTS)as (keyof typeof ARRANGEMENTS)[])expect(ROOMS[TRACK_ROOMS[mode]],mode).toBeDefined();
 // The same battle cue can play outdoors and inside the palace.
 expect(MAP_ROOMS.stillcity).not.toBe(MAP_ROOMS.lastpalace);
 expect(MAP_ROOMS.station).not.toBe(MAP_ROOMS.tunnel);
 expect(TRACK_ROOMS.emperor).toBe(MAP_ROOMS.crown);
});
