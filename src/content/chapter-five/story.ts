import { WINDMERE_JOURNAL } from './windmere-journal';
import { completedAnchors } from './progress';
import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
 ...WINDMERE_JOURNAL,
 flagshipApproachSeen:{title:'Under the flagship',text:'Dawnwatch’s signals brought us through the cordon. Hammerplain’s spare drive holds the survey ship steady. Alban’s marines have boarded. Disable both batteries, then the bridge.'},
 flagshipFallen:{title:'The guns fall silent',text:'Both batteries and the command bridge are disabled. The marines have returned to their own ship. The command deck lies open. A fleet range sight goes into the bag for Kit.'},
 benefactorClaimSeen:{title:'The Benefactor answers',text:'The Benefactor spoke from a seam of light above the flagship. It named the broken anchors and destroyed Alban, his ship and every man aboard. Kit and Celia brought Nell across the gangway before the hull vanished. The shard’s pulse made her collapse; she is too ill to fight and is resting aboard. Her companions must hold the forward rail.'},
 retaliationSeen:{title:'Hunters on the rail',text:'Glass-winged creatures and a pale herald came out of the same light and landed aboard. They are heading for the hatch where Nell is resting. Prepare the remaining companions in Equipment, then meet them at the forward rail.'},
 retaliationFallen:{title:'Beside the berth',text:'The Benefactor’s hunters have been driven off. Nell’s illness persists; ordinary rest cannot break her connection to the shard. Kit and Celia are beside her berth.'},
 fiveDeparture:{title:'The outer mooring',text:'Alban and his men are dead. The Benefactor is attacking directly after the anchors were disconnected. Nell remains too ill to fight. Kit will take Celia’s notes to Sera, while the others prepare to reach the Emperor. The survey ship is holding for the capital’s outer mooring.'},
 airfieldSeen:{title:'The survey ship',text:'Superintendent Durn has seized Alda’s survey ship for Hammerplain. Bram’s ferry stores are being unloaded. Clear the confiscation detail at the gangway.'},
 airfieldClear:{title:'A flight out',text:'The airfield guards have withdrawn. Meet Alda at the gangway to board the survey ship.'},
 firstFlightSeen:{title:'Three landings',text:'Alda will fly us between the anchor stations. Hammerplain powers its anchor from a foundry; Petra knows Dawnwatch’s garrison, and Celia knows Windmere’s medicine works. Choose a landing on the flight chart. Tomas keeps our railway messages at the refuge.'},
 hammerplainSeen:{title:'Engines for the street',text:'Hammerplain’s residential street has stopped while the foundry feeds the anchor. Durn is seizing the ordinary engines Hester’s crew built for the houses. Hester can change the works over if we reopen the manual cooling race. Reach it by the eastern walkway.'},
 coolingSeen:{title:'The red wheel',text:'The cooling gate is locked behind the foundry guards. Choose the freight lift past ranged crows, or the shallow race walk past hounds. Then turn the red wheel on the eastern walkway.'},
 coolingClear:{title:'The manual gate',text:'The approach is clear. Hester will hold the pawl while Orrin turns the red cooling wheel. The crew is waiting to bring the starters through.'},
 coolingOpened:{title:'The anchor gantry',text:'The cooling race is open. Hester’s crew is bringing the replacement engines online. Take the upper gantry to disconnect the anchor.'},
 forgeGantrySeen:{title:'The pouring lane',text:'Durn has ordered the furnace carrier to melt the finished engines. Hold it off while Hester’s crew takes the load. Its red warnings mark the next pour; its tracks leave hot metal behind.'},
 furnaceFallen:{title:'The breaker',text:'The carrier is stopped. Its balanced expansion valve is in the bag for Orrin. The anchor breaker above the gantry is exposed.'},
 hammerplainFreed:{title:'The street wakes',text:'The anchor cable is disconnected. Hester’s crew holds Durn in the shift office. Return to the casting floor to check the engines and the street.'},
 hammerplainComplete:{title:'Hammerplain · a working engine',text:'People in the street are moving again. Hester started the engine without Orrin’s help; the crew can run the houses on its own. They are sending railway engines, two fitters and a spare drive for the survey ship. Return aboard when ready.'},
 dawnwatchSeen:{title:'The lower gate',text:'Aurel has ordered Dawnwatch’s lower town abandoned and its shelter filled with ammunition. Petra will open the locking lever above the street. Enna remembers the medical coaches, but many soldiers have only heard the official account.'},
 shelterOpened:{title:'Behind the wall',text:'Petra and Enna opened the shelter. Residents are inside with water and bedding. Enna keeps the door; take the eastern barracks stair and silence both gun positions before reaching the anchor.'},
 watchGunsSeen:{title:'The gun terraces',text:'Choose the western mortar or eastern repeater first. The other position’s spotter will announce support fire: a seven-hex mortar blast or a straight repeater lane. Defeat the spotter to stop it. Both gun positions must be cleared to open the northern signal-wall stair.'},
 watchGunClear:{title:'A gun falls silent',text:'One position is clear. Check the gun terraces: clear the remaining position, then take the northern stair to the command platform. Supplies and the survey ship remain available in the lower town.'},
 aurelSeen:{title:'Orders at the signal wall',text:'Aurel ordered fire through the lower gate; Enna refused. Petra admitted enforcing similar orders herself. Face Aurel and his shield formation on the command platform.'},
 aurelFallen:{title:'The town wheel',text:'Aurel is disarmed. A Dawnwatch shield brace goes into the bag for Petra to fit manually. Enna can reach the anchor wheel above the command platform; the shelter watch can keep the town’s signal lamps working.'},
 dawnwatchFreed:{title:'The watch refuses',text:'The soldiers refused Aurel’s renewed order to fire through the shelter. Enna released the anchor under town control. Petra offered Aurel water, a bed and protection in the same shelter. Return to the lower gate.'},
 dawnwatchComplete:{title:'Dawnwatch · an open shelter',text:'The watch stays with the town. Enna sends three volunteer pilots, two escort launches, approach charts and fleet recognition signals to Alda. Petra has earned their help without regaining her commission. The anchor wheel stays by the shelter.'},
 watchCoatTaken:{title:'A coat from the field locker',text:'An officers’ field coat goes into the shared bag. It offers protection and a little extra speed; anyone can fit it from Equipment.'},
 emperorOfferSeen:{title:'The morning in the glass',text:'The Emperor projected Larkspur before the raid into the observation glass. Ansel kept turning the same chipped cup. He offered Nell a place in that day if she brought the fragment to the capital. She left the cabin. It was a projection; Tomas remains safe at the refuge, and Ansel has not returned.'},
 emperorOfferTold:{title:'Back on deck',text:'Nell told the others about the offer and asked Kit to read Tomas’s ordinary railway message. Alda keeps the anchor landings open while the fleet tightens its inland cordon. The remaining regional landings stay open.'},
 fleetSighted:{title:'The imperial fleet',text:'Alban’s fleet has appeared above the inland line. Alda can fly clear of it. The freed region’s anchor stays disconnected. The remaining landings are open; our new crews are aboard.'},
};
export function objective(s:GameState):string{
 const f=s.flags;
 if(f.chapterFiveComplete)return 'Chapter Five complete · Nell is resting aboard. The next course is at the flight chart.';
 if(f.nellIll&&!f.retaliationWon)return 'Prepare the remaining companions, then defend the forward rail.';
 if(s.location.map==='flagship')return 'Petra is on the command deck.';
 if(f.retaliationWon)return 'Kit and Celia are beside Nell’s berth.';
 if(f.flagshipWon)return 'The flagship’s command deck lies open.';
 if(!f.airfieldGuardWon)return 'Clear the guards at the survey gangway.';
 if(!f.airshipOwned)return 'Meet Alda at the gangway and board the survey ship.';
 if(!f.firstFlightSeen)return 'Join Alda at the flight chart.';
 const map=s.location.map;
 if(map==='windmere'||map==='dispensary'||map==='mirrorward'){
  if(!f.dispensarySeen)return 'Take the eastern walkway to Windmere’s lower dispensary.';
  if(!f.windLiftWon)return 'Clear the machines at the water-lift brake.';
  if(!f.waterLiftOpened)return 'Turn the water-lift wheel on the eastern walk.';
  if(!f.patientsTransferred)return 'Return to the ordinary ward and work its bypass valve.';
  if(!f.mirrorWardSeen)return 'Follow Iven up the hospital’s eastern treatment-gallery stair.';
  if(!f.windGalleryWon)return 'Clear the gallery bridge before approaching the mirrored engine.';
  if(!f.wardEngineWon)return 'Break the lit projections and stop the mirrored ward engine.';
  if(!f.windmereFreed)return 'The engine’s support-release controls are exposed.';
  if(!f.windmereComplete)return 'Return to the ordinary ward for the first night shift.';
  return 'Windmere is free · return to the survey ship or visit the morning clinic.';
 }

 if(map==='dawnwatch'||map==='watchbarracks'||map==='signalwall'){
  if(!f.shelterOpened)return 'Open the shelter gate above Dawnwatch’s lower street.';
  if(!f.watchGunsSeen)return 'Take the eastern barracks stair to the gun terraces.';
  if(!f.mortarWon||!f.repeaterWon)return !f.mortarWon&&!f.repeaterWon?'Choose which gun position to clear first.':!f.mortarWon?'Clear the western mortar position.':'Clear the eastern repeater position.';
  if(!f.aurelWon)return 'Climb the northern signal-wall stair and face Commander Aurel.';
  if(!f.dawnwatchFreed)return 'Enna can reach the Dawnwatch anchor wheel.';
  if(!f.dawnwatchComplete)return 'Return to the lower shelter and speak with the watch.';
  return 'Dawnwatch is free · return to the survey ship or visit the shelter.';
 }
 if(map==='hammerplain'||map==='coolingworks'||map==='anchorforge'){
  if(!f.coolingSeen)return 'Follow the eastern walkway to Hammerplain’s cooling race.';
  if(!f.forgeApproachWon)return 'Choose the freight lift or the shallow race walk at the cooling junction.';
  if(!f.coolingOpened)return 'Turn the red cooling wheel on the eastern walkway.';
  if(!f.furnaceWon)return 'Take the upper gantry and stop the furnace carrier.';
  if(!f.hammerplainFreed)return 'Hester’s crew can reach the anchor breaker.';
  if(!f.hammerplainComplete)return 'Return to the casting floor and check the replacement engines.';
  return 'Hammerplain is free · return to the survey ship or visit the crew.';
 }
 if(completedAnchors(s)>=2&&!f.emperorOfferSeen)return 'Look into the light in the observation cabin · aft hatch.';
 if(f.emperorOfferSeen&&!f.emperorOfferTold)return 'Return to the flight deck and tell the others.';
 if(completedAnchors(s)===3)return 'Choose the capital approach at the flight chart when you’re ready. Rest and Equipment are available aboard.';
 const remaining=[!f.hammerplainComplete&&'Hammerplain',!f.dawnwatchComplete&&'Dawnwatch',!f.windmereComplete&&'Windmere'].filter(Boolean).join(' or ');
 return `Choose ${remaining} at the forward flight chart.`;
}
