import type { GameState } from '../../../rules/state';
export const JOURNAL={
 northSeen:{title:'Skeld’s winter expedition',text:'King Edric already ordered his pact withdrawn. An imperial patrol closed the mountain passage. Signe carries his commission to the northern sanctuary; Egil knows the glacier route.'},
 northWatchSeen:{title:'Frostwatch',text:'The imperial signal post keeps the covered road shut. Clear its winter patrol, then lift the gate at the windlass. The expedition waits under cover.'},
 northWatchWon:{title:'The signal post',text:'The patrol is stopped. A storm-lined expedition coat goes into the bag. Lift the gate at the windlass to reopen the mountain road.'},
 northPassOpened:{title:'The expedition road',text:'The mountain gate is open. The expedition can reach the glacier wrecks. Shelters and supplies remain available along the return road.'},
 northLogRead:{title:'The relief fleet',text:'Egil recognized his father’s ship outside the old protected harbor. Imperial dispatches ordered the refugee tows cut; Skeld’s memorial claimed a rescue. Signe is carrying the orders home. Egil has the ship’s nameplate.'},
 northHuntersWon:{title:'The upper ice shelf',text:'The divine hunters are cleared from the sanctuary path. A cold-weather expansion valve goes into the bag for Orrin. The expedition camp is sheltered before the dragon.'},
 winterShrineSeen:{title:'The winter dragon',text:'An enormous dragon holds the pact bell. Its inhaling breath draws people toward its claws; its wings shatter the side shelves. The expedition waits in the southern shelter.'},
 winterDragonWon:{title:'The sanctuary walk',text:'The winter dragon is down. A sanctuary saber guard goes into the bag for Petra. Signe can now release the northern pact at the bell mounting.'},
 northSealBroken:{title:'The northern seal',text:'Signe released Skeld’s pact under Edric’s commission. Egil rang the sanctuary bell and the harbor answered. The northern return is dark; Skeld’s launches can join the capital approach.'},
 northReturned:{title:'The harbor record',text:'Edric opened the harbor records beside the fleet’s surviving orders and nameplate. The families can read both the loss and the old official account. Skeld is sending pilots, launches and winter stores.'},
 northReported:{title:'News from Skeld',text:'The northern expedition is home and its pilots have joined Alda. The state of both foreign seals determines whether the capital landing is open.'},
 northCacheWon:{title:'The relief stores',text:'The perched patrol is stopped. A winter range sight is in the bag for Kit to fit by hand.'},
 capitalOpened:{title:'The allied landing',text:'Both pact returns are released. The barrier has fallen and the bridge is level. Namar’s barges and Skeld’s launches can reach the royal white quay. Iria and both foreign capitals remain accessible.'},
 capitalQuaySeen:{title:'Behind the wall',text:'The allied landing is safe, but people inside the capital repeat the same ordinary work. The inner capital and the Emperor’s confrontation continue in the next adventure.'},
};
export function objective(s:GameState):string|undefined{
 const f=s.flags,m=s.location.map;
 if(m==='bellharbor')return !f.northSeen?'Meet the king at the northern bell.':f.northSealBroken?!f.northReturned?'Bring the fleet’s dispatches to the harbor bell.':'Return to Alda with Skeld’s pilots, or revisit the expedition route.':'Take the eastern covered road to Frostwatch.';
 if(m==='frostwatch')return !f.northWatchWon?'Clear the imperial winter patrol from the signal post.':!f.northPassOpened?'Lift the passage gate at the windlass.':'Follow the covered passage to the glacier wrecks.';
 if(m==='glacier')return !f.northLogRead?'Open the dispatch cabin beside the lower ice walk.':!f.northHuntersWon?'Clear the divine hunters from the upper ice shelf.':'Climb to the winter sanctuary. Its camp has rest and supplies.';
 if(m==='wintershrine')return !f.winterDragonWon?'Rest at the expedition camp, then face the winter dragon.':!f.northSealBroken?'Signe can reach the northern pact’s release.':'Return with Signe and bring the fleet’s records to Skeld.';
 if(m==='capitalquay')return 'The allied landing is open. The inner capital continues in the next adventure.';
}
