import type { Encounter } from '../../rules/combat';
export const ENCOUNTERS:Record<string,Encounter>={
  'capital-arrest':{id:'capital-arrest', music:'switching',name:'The medical siding · refuse the arrest',flag:'capitalGateWon',xp:85,coins:48,backdrop:{map:'northglass',y:-300},
    enemies:[{kind:'guardian',name:'Custody guardian',col:7,row:3,hp:115},{kind:'hound',name:'Custody hound',col:6,row:1,hp:43},{kind:'crow',name:'Warrant crow',col:8,row:5,hp:36}],rocks:[[4,2],[5,4],[8,2]],
    victory:'The custody machines are down. The patients stay on the medical train.'},
  'works-warden':{id:'works-warden', music:'switching',name:'Engine works · interrupt the execution',flag:'worksWardenWon',xp:100,coins:58,journal:'warden',item:'silver-reflector',backdrop:{map:'relayhall',y:-280},
    enemies:[{kind:'guardian',name:'The Engine Warden',appearance:'relay-keeper',col:7,row:3,hp:145,bonus:3},{kind:'crow',name:'Surgical crow',col:8,row:1,hp:39},{kind:'hound',name:'Clamp hound',col:6,row:5,hp:48}],rocks:[[4,1],[4,5],[8,4]],
    victory:'The shears stop. A silver reflector goes into the bag for Nell. Open Tomas’s restraints at the back of the gallery.'},
  'palace-stores':{id:'palace-stores', music:'switching',name:'Sealed stores · the lock patrol',flag:'palaceStoresWon',xp:65,coins:36,item:'ratchet-sight',backdrop:{map:'relayhall',y:-280},
    enemies:[{kind:'inspector',name:'Stores sentinel',col:8,row:3,hp:105},{kind:'hound',name:'Stores hound',col:6,row:1,hp:44}],rocks:[[4,2],[5,4],[7,5]],
    victory:'The stores open. A ratchet sight goes into the bag for Kit.'},
  'heart-feeds':{id:'heart-feeds', music:'switching',name:'The extraction heart · break the regulator seal',flag:'conduitGuardWon',xp:135,coins:80,journal:'heartGuard',item:'insulated-coat',backdrop:{map:'conduit',y:-300},
    enemies:[{kind:'guardian',name:'Heart regulator',appearance:'boiler-keeper',col:8,row:3,hp:170,bonus:4,sealed:true},{kind:'hound',name:'Feed hound',col:6,row:3,hp:52}],grounding:[[4,1],[4,5]],rocks:[[5,2],[5,4]],
    victory:'The regulator is still. An insulated coat goes into the bag; any companion can wear it. Close the extraction feeds at the console.'},
  'heart-pressure':{id:'heart-pressure', music:'switching',name:'The extraction heart · pressure walk',flag:'conduitGuardWon',xp:135,coins:80,journal:'heartGuard',item:'insulated-coat',backdrop:{map:'conduit',y:-300},
    enemies:[{kind:'guardian',name:'Heart regulator',appearance:'boiler-keeper',col:8,row:3,hp:160,bonus:3},{kind:'crow',name:'Pressure crow',col:7,row:1,hp:43},{kind:'crow',name:'Pressure crow',col:7,row:5,hp:43}],vents:[[5,2],[5,3],[5,4],[7,3]],rocks:[[4,1],[4,5]],
    victory:'The pressure walk is clear. An insulated coat goes into the bag; any companion can wear it. Close the extraction feeds at the console.'},
};
