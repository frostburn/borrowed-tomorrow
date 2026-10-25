import type { GameState } from '../../../rules/state';
export const JOURNAL={
 riverSeen:{title:'Iria’s treatment boat',text:'Ines has read Celia’s notes and recognizes Nell’s condition. The old patrol blocks the medical waterway to the rain house. Tavi will bring the equipment upriver once the passage is clear; Nell stays safely aboard.'},
 riverCrossingSeen:{title:'The closed waterway',text:'Patrol machines hold the canopy bridge. Clear them, then wind the boat chain onto its peg. The western shelter has water and supplies.'},
 riverPatrolWon:{title:'The lower crossing',text:'The old patrol is stopped. A reedweave travel coat goes into the bag. Open the chain at the capstan so the treatment boat can pass.'},
 riverChainOpen:{title:'The treatment boat',text:'The boat chain is lifted. Ines’s equipment and the village patients can reach the rain house. Check the upper landing before bringing Nell across.'},
 rainhouseSeen:{title:'Wings on the landing',text:'Divine hunters have occupied the treatment terrace. Tavi is keeping the patients below the bend. Clear the deck before ringing for the launch.'},
 rainhouseWon:{title:'The treatment terrace',text:'The rain house is clear. A rainhouse field focus goes into the bag for Celia. Ring the treatment bell to bring Nell and the healers across.'},
 nellRecovered:{title:'The quiet pulse',text:'Ines and Celia interrupted the binding without destroying the shard. Nell has recovered and can be selected in Equipment; the chosen formation and her equipped items are unchanged. A riverglass reflector is in the bag for her.'},
 riverRestSeen:{title:'A little farther',text:'Nell and Kit had a quiet moment together by the river. She is well enough to walk and wants to travel onward. Tavi’s launch will return to Iria when the party is ready.'},
 riverThanksSeen:{title:'The open passage',text:'Iria’s patients can use the rain house again. Celia and Ines are sending the treatment record to Sera. The village, clinic and launch remain available.'},
 riverReported:{title:'Back at the flight chart',text:'Nell is back with the crew. The shard is intact and she can travel again. The remaining pact seals still determine access to the capital.'},
 riverCacheWon:{title:'The survey locker',text:'The old survey patrol is stopped. A river range sight is in the bag for Kit to fit by hand.'},
};
export function objective(s:GameState):string|undefined{
 const f=s.flags,m=s.location.map;
 if(m==='riverhaven')return f.nellRecovered?'Return to the survey ship, or visit the rain house.':'Follow Tavi to the lower crossing on the eastern path.';
 if(m==='canopy')return !f.riverPatrolWon?'Clear the old patrol from the lower crossing.':!f.riverChainOpen?'Wind the boat chain at the capstan.':'Rest at the shelter, then climb the eastern stair to the rain house.';
 if(m==='rainhouse')return !f.rainhouseWon?'Clear the divine hunters from the treatment terrace.':!f.nellRecovered?'Ring the treatment bell to bring Nell and the healers across.':!f.riverRestSeen?'Spend a little time by the river with Kit.':'Take Tavi’s launch back to Iria, or rest at the rain house.';
}
