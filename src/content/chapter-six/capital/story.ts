import type { GameState } from '../../../rules/state';
export const JOURNAL={
 capitalStreetSeen:{title:'The procession',text:'A handcart and a baker repeat the same work beneath the palace arch. The street return is keeping the residents inside the Emperor’s remembered morning. The allied quay remains open behind us.'},
 capitalProcessionWon:{title:'The avenue machines',text:'The procession machines are stopped. The bronze street return is no longer guarded. A lined ceremonial coat is in the bag.'},
 capitalStreetFreed:{title:'The street moves on',text:'The woman stopped to retrieve her cloth. The baker left the burnt loaf behind. Namar’s crews and Skeld’s pilots are taking the residents down to the allied boats.'},
 capitalPalaceSeen:{title:'The private household',text:'The Emperor’s remembered family repeat conversations while living patients go unattended. His private rooms have taken the service ward’s water. A remaining cordon bars the patient stair.'},
 capitalCommandWon:{title:'The last cordon',text:'The commandant lowered his weapon. The palace attendants can open the patient stair. A pressure-crown nozzle for Orrin is in the bag.'},
 capitalHallOpened:{title:'The attendants leave',text:'The commandant helped carry the patients down. Celia made her last checks at the boats while the companions rested at the service shelter.'},
 capitalHuntersWon:{title:'The eastern cloister',text:'The divine hunters have been driven from the eastern passage. A cloister range sight is in the bag for Kit.'},
 capitalFocusTaken:{title:'A lens left behind',text:'Celia found a palace treatment lens in the service locker. It is in the bag for manual fitting.'},
 capitalAudienceSeen:{title:'A room kept ready',text:'A familiar train whistle turned Nell’s head. The palace gallery gave way to the Larkspur morning before she could step back.'},
 capitalMorningSeen:{title:'Before the sea train',text:'Ansel kept the chipped side of his cup for himself. Tomas had two window seats for the sea train and a picnic packed.'},
 capitalMorningQuestion:{title:'The days outside',text:'Nell and Tomas reached a quiet beach. She wanted to stay, but remembered the people still losing their days to collection. She forced herself awake.'},
 capitalMorningLeft:{title:'Refusing the morning',text:'Nell woke in the palace and refused the Emperor’s offer. The remembered coast could not give the people outside their days back. Ansel remains dead, and the real Tomas remains safe at the refuge.'},
 capitalWarningSeen:{title:'Before the crown stair',text:'The last stair closes during the assault. Celia examined Nell before the climb. If her binding is untreated, breaking the vessel may let its current reach her. Iria is still reachable before climbing.'},
 capitalAssaultCommitted:{title:'The crown stair',text:'The companions climbed the crown stair. The vessel closed it behind them; its supports stand ahead.'},
 emperorSeen:{title:'The imperial vessel',text:'The Emperor sits inside the crowned vessel. Its two supports shield the core. Broken mountings may rebuild during a later coronation; watch the announced pattern.'},
 emperorWon:{title:'The Emperor falls',text:'The vessel is defeated. An unbroken crown guard is in the bag for Petra. The evacuation crews are lowering the capital onto its old foundations.'},
 emperorFallen:{title:'The broken crown',text:'The Emperor lay dead inside the broken vessel. Its sun went dark, his remembered rooms faded and the conduit opened above the city.'},
 capitalReleased:{title:'The capital wakes',text:'The preservation field has broken. The city’s clocks are running again. Nell’s treated binding did not take the broken conduit’s current. The fragment remains intact.'},
 capitalLandingSeen:{title:'Beyond the empire',text:'The last patients reached the boats. Collection has begun beyond the imperial roads. The broken vessel and hospice diagram mark a route through the hollow sun; Alda will keep the ship while the companions prepare.'},
 sixDeparture:{title:'The final crossing',text:'The companions have chosen to prepare the journey through the hollow sun. The capital, supplies and foreign landings remain available before Chapter Seven.'},
 lightbearerSeen:{title:'The Lightbearer',text:'The untreated binding drew Nell from her berth into the broken crown. The Benefactor formed a mantle around her. Her hand sometimes closes the lantern shutter, interrupting its light.'},
 lightbearerWon:{title:'The mantle breaks',text:'The companions broke the Lightbearer’s mantle. The lantern went dark.'},
 nellLost:{title:'The last light',text:'Celia could not bring Nell back. The fragment crumbled against the lantern glass. The capital survived, but the route through the hollow sun was lost.'},
 emptySeatSeen:{title:'The empty seat',text:'Tomas waited at Larkspur with tickets for the sea train. Kit brought Nell’s coat and the wrapped lantern. Collection continues beyond Namar.'},
 lightbearerEnding:{title:'An unfinished tomorrow',text:'The Emperor’s rule has ended. The Benefactor still takes days from the world. Nell’s place on the train is empty.'},
};
export function objective(s:GameState):string|undefined{
 const f=s.flags,m=s.location.map;
 if(m==='laststation')return 'Visit Tomas and Kit, then go to the waiting train.';
 if(m==='lastmorning')return 'Join Tomas at the clock, or take the sea train beneath the eastern lamp.';
 if(m==='lastshore')return 'Walk beside Tomas at the water’s edge.';
 if(m==='crown')return !f.emperorWon?'Break the crown supports and defeat the Emperor.':f.capitalRiskAccepted&&!f.lightbearerWon?'Face the Lightbearer above the broken crown.':'Descend to the allied landing.';
 if(m==='stillcity')return !f.capitalProcessionWon?'Clear the procession machines from the avenue.':!f.capitalStreetFreed?'The bronze street return is within reach.':'Take the northern palace stair, or return to the allied quay.';
 if(m==='lastpalace')return !f.capitalCommandWon?'Confront the commandant at the patient stair.':'Rest and fit equipment, then review final preparations at the crown stair. Iria remains reachable.';
 if(f.capitalReleased)return 'Review the final crossing with Alda at the allied landing, or revisit the foreign harbors.';
 if(m==='capitalquay')return 'Enter Stillwater Avenue through the northern arch.';
 return;
}
