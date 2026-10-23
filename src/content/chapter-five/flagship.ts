import type { Encounter } from '../../rules/combat';

export const FLAGSHIP_ENCOUNTER:Encounter={
  id:'alban-flagship',boss:'flagship',name:'The capital crossing · Alban’s flagship',music:'flagship',flag:'flagshipWon',xp:360,coins:240,item:'fleet-sight',journal:'flagshipFallen',backdrop:{map:'airship',y:0},rocks:[],
  victory:'Both batteries and the bridge are disabled. The marines have lowered their weapons. Board the command deck from the flight chart; Alban is still aboard.',
  enemies:[
    {kind:'guardian',col:2,row:2,hp:100,bonus:0,name:'Port battery'},
    {kind:'guardian',col:8,row:2,hp:100,bonus:0,name:'Starboard battery'},
    {kind:'guardian',col:5,row:1,hp:240,bonus:0,name:'Command bridge',sealed:true},
    {kind:'knight',col:2,row:4,hp:58,bonus:5,name:'Boarding marine'},
    {kind:'knight',col:8,row:4,hp:58,bonus:5,name:'Boarding marine'},
  ],
};
