import type { Encounter } from '../../rules/combat';
export const DISK_B_ENCOUNTERS:Record<string,Encounter>={
  'b-overflow':{id:'b-overflow',name:'Timber in the overflow',flag:'bOverflowCleared',xp:45,coins:24,terrain:'sluice',
    enemies:[{kind:'hound',col:6,row:1,hp:34,bonus:0},{kind:'hound',col:7,row:3,hp:34,bonus:0},{kind:'hound',col:7,row:5,hp:34,bonus:0},{kind:'crow',col:9,row:3,hp:27,bonus:1}],
    rocks:[[5,1],[5,5],[8,2]],shallow:[[3,1],[3,2],[3,3],[4,3],[4,4],[4,5],[6,4]],
    victory:'With the machines stopped, the current pulls the loose timber clear. The damaged gauge is exposed.'},
  'b-trolley':{id:'b-trolley',name:'The trolley’s charging rail',flag:'bTrolleyFreed',xp:45,coins:24,terrain:'sluice',journal:'b-trolley',
    enemies:[{kind:'hound',col:5,row:2,hp:38,bonus:1},{kind:'hound',col:6,row:4,hp:38,bonus:1},{kind:'crow',col:8,row:1,hp:29,bonus:1},{kind:'crow',col:9,row:5,hp:29,bonus:1}],
    rocks:[[4,0],[4,1],[4,5],[4,6],[7,3]],shallow:[[3,2],[3,3],[3,4],[5,2],[5,3],[5,4]],
    victory:'Orrin cuts the chain, fits the brake shoes, and brings the trolley down to the schoolhouse.'},
  'b-keeper':{id:'b-keeper',name:'The sluice keeper',flag:'bKeeperStopped',xp:85,coins:48,terrain:'sluice',journal:'b-crossing',
    enemies:[{kind:'guardian',name:'Sluice keeper',appearance:'sluice-keeper',col:8,row:3,hp:108,bonus:0},{kind:'hound',col:6,row:2,hp:39,bonus:1},{kind:'hound',col:7,row:4,hp:39,bonus:1},{kind:'crow',col:9,row:0,hp:29,bonus:2}],
    rocks:[[5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[8,5]],shallow:[[3,1],[3,2],[3,3],[3,4],[3,5],[4,2],[4,3],[4,4],[5,3],[6,2],[6,3],[6,4],[7,3]],
    victory:'The keeper’s control rods go slack. Orrin lowers the maintenance crossing and pins the outfall wheel. Go back for the residents.'},
};
