import type { Encounter } from '../../rules/combat';
export const DISK_D_ENCOUNTERS:Record<string,Encounter>={
  'd-tram':{id:'d-tram',name:'The workers’ road',flag:'dCrewReturned',xp:55,coins:30,terrain:'northglass',enemies:[
    {kind:'hound',col:6,row:1,hp:34,bonus:0},{kind:'hound',col:8,row:3,hp:34,bonus:0},{kind:'crow',col:8,row:5,hp:28},
  ],rocks:[[5,2],[5,3],[5,4],[7,1],[7,5]],journal:'d-crew',victory:'Esme brings five colleagues down from the tram. All six pass behind Nell’s red lamp. She takes the burnt wire to the relay hall.'},
  'd-relay':{id:'d-relay',name:'The two return contacts',flag:'dRelayStopped',xp:80,coins:40,terrain:'relayhall',grounding:[[3,1],[3,5]],enemies:[
    {kind:'guardian',col:8,row:3,hp:98,bonus:-2,name:'Relay keeper',appearance:'relay-keeper',sealed:true},
    {kind:'crow',col:7,row:1,hp:26},{kind:'crow',col:7,row:5,hp:26},
  ],rocks:[[5,2],[5,4],[8,1],[8,5]],journal:'d-relay',victory:'Orrin opens the earthed return contact. Petra tests red from both ends of the road; the false green lamp stays dark.'},
};
