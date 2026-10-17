import type { Encounter } from '../../rules/combat';

export const DISK_C_ENCOUNTERS:Record<string,Encounter>={
  'c-coupling':{id:'c-coupling',name:'The supply-cart lanes',flag:'cCouplingRecovered',xp:45,coins:24,terrain:'cinderbank',journal:'c-coupling',
    enemies:[{kind:'hound',col:6,row:2,hp:43,bonus:1},{kind:'hound',col:7,row:4,hp:43,bonus:1},{kind:'crow',col:8,row:3,hp:30,bonus:1}],
    rocks:[[4,1],[4,2],[4,4],[4,5],[7,1],[8,5]],
    victory:'Orrin frees the spare coupling and cleans its threads. Choose its destination at the steam bypass.'},
  'c-boiler':{id:'c-boiler',name:'The boiler’s relief gear',flag:'cBoilerStopped',xp:70,coins:32,terrain:'cinderbank',journal:'c-steam',
    enemies:[{kind:'guardian',col:7,row:3,hp:100,bonus:-1,name:'Boiler keeper',appearance:'boiler-keeper'},{kind:'crow',col:8,row:1,hp:32,bonus:1},{kind:'hound',col:8,row:5,hp:43,bonus:1}],
    rocks:[[4,0],[5,2],[5,4],[4,6],[9,3]],vents:[[3,3],[4,3],[5,3],[6,3],[7,3]],
    victory:'Orrin closes the relief gear, thaws the brake hose, and signs the pressure test. File the copy in the dispatch office.'},
};
