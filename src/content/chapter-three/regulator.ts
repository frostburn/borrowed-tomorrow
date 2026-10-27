import type { Encounter } from '../../rules/combat';
import type { Hex } from '../../rules/hex';

export type ConduitRoute='feeds'|'pressure';
export const REGULATOR_ID='conduit-regulator';
export const REGULATOR_FOOTPRINT:Hex[]=[{q:0,r:0},{q:-1,r:1},{q:0,r:1}];
export const REGULATOR_ENCOUNTERS:Record<string,Encounter>={
 // Cutting the feeds trades the plate setup for a weaker, still-shielded core.
 'heart-feeds':{id:'heart-feeds',boss:'conduit',music:'switching',name:'The extraction heart · break the regulator seal',flag:'conduitGuardWon',xp:135,coins:80,journal:'heartGuard',item:'insulated-coat',backdrop:{map:'conduit',y:-300},
  enemies:[{kind:'guardian',name:'Heart regulator',col:5,row:2,hp:155,bonus:3,sealed:true},{kind:'hound',variant:'hound-gilded',col:8,row:4}],grounding:[[3,5],[7,5]],rocks:[[1,3],[9,3]],
  victory:'The regulator is still. An insulated coat goes into the bag; any companion can wear it. Close the extraction feeds at the console.'},
 'heart-pressure':{id:'heart-pressure',boss:'conduit',music:'switching',name:'The extraction heart · pressure walk',flag:'conduitGuardWon',xp:135,coins:80,journal:'heartGuard',item:'insulated-coat',backdrop:{map:'conduit',y:-300},
  enemies:[{kind:'guardian',name:'Heart regulator',col:5,row:2,hp:190,bonus:2},{kind:'crow',variant:'crow-gilded',col:2,row:3},{kind:'crow',variant:'crow-gilded',col:8,row:3}],vents:[[3,4],[5,4],[7,4],[5,5]],rocks:[[1,2],[9,2]],
  victory:'The pressure walk is clear. An insulated coat goes into the bag; any companion can wear it. Close the extraction feeds at the console.'},
};
