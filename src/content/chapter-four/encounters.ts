import type { Encounter } from '../../rules/combat';
export const ENCOUNTERS:Record<string,Encounter>={
 'works-dry':{id:'works-dry', music:'four-battle',name:'The sea gate · the dry chain walk',flag:'worksGateWon',xp:130,coins:68,item:'return-valve',journal:'worksClear',backdrop:{map:'breakwater',y:-300},
  enemies:[{kind:'guardian',variant:'guardian-dusk',col:7,row:3},{kind:'crow',variant:'crow-dusk',col:8,row:1},{kind:'crow',variant:'crow-dusk',col:7,row:5}],rocks:[[4,2],[5,4],[7,2]],
  victory:'The service walk is clear. A counterweighted return valve goes into the bag for Orrin. Turn the winding wheel on the middle pier.'},
 'works-wet':{id:'works-wet', music:'four-battle',name:'The sea gate · the shallow pump floor',flag:'worksGateWon',xp:130,coins:68,item:'return-valve',journal:'worksClear',backdrop:{map:'breakwater',y:-300},
  enemies:[{kind:'guardian',variant:'guardian-dusk',col:7,row:3},{kind:'hound',variant:'hound-dusk',col:6,row:1},{kind:'hound',variant:'hound-dusk',col:6,row:5}],rocks:[[4,1],[4,5]],shallow:[[4,2],[4,3],[4,4],[5,2],[5,3],[5,4]],
  victory:'The pump floor is clear. A counterweighted return valve goes into the bag for Orrin. Turn the winding wheel on the middle pier.'},
 'works-survey':{id:'works-survey', music:'four-battle',name:'Breakwater · the survey cart',flag:'worksStoresWon',xp:65,coins:38,item:'folding-sight',backdrop:{map:'breakwater',y:-300},
  enemies:[{kind:'crow',variant:'crow-dusk',col:9,row:1},{kind:'hound',variant:'hound-dusk',col:8,row:5}],rocks:[[4,2],[6,3],[6,5],[8,3]],victory:'The survey cart is open. A folding range sight goes into the bag for Kit.'},
 'sanctuary-road':{id:'sanctuary-road', music:'four-battle',name:'The sanctuary · the return-line bridge',flag:'roadGuardWon',xp:145,coins:72,item:'rescue-coat',journal:'roadClear',backdrop:{map:'sanctuary',y:-350},
  enemies:[{kind:'guardian',variant:'guardian-dusk',col:7,row:3},{kind:'hound',variant:'hound-dusk',col:6,row:1},{kind:'hound',variant:'hound-dusk',col:7,row:5}],rocks:[[4,1],[5,3],[4,5]],
  victory:'The bridge is clear. A braced rescue coat goes into the bag. Disconnect the return cable at the copper clamp.'},
 'sanctuary-warden':{id:'sanctuary-warden', music:'four-warden',name:'The bronze ring · the Sanctuary Warden',flag:'sanctuaryWardenWon',xp:210,coins:108,item:'sun-prism',journal:'wardenFallen',backdrop:{map:'sanctuary',y:-350},
  // Lead the crow screen from the central lane, within an opening Steam approach.
  enemies:[{kind:'guardian',name:'The Sanctuary Warden',appearance:'sluice-keeper',col:5,row:3,hp:245,bonus:9},{kind:'crow',variant:'crow-dusk',col:7,row:1},{kind:'crow',variant:'crow-dusk',col:7,row:5}],rocks:[[4,2],[4,4],[7,3]],shallow:[[5,1],[5,5]],
  victory:'The coastal arrest ends. A guardian prism goes into the bag for Nell. Examine the covered chart beneath the bronze ring.'},
};
